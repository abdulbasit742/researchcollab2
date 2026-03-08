import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Shield, Activity, AlertTriangle, Settings, RefreshCw, Search, Terminal } from "lucide-react";
import { toast } from "sonner";
import { getEcosystemEvents, getHealthSnapshots, invokeOrchestrator, logEcosystemEvent } from "@/lib/ecosystem/ecosystemOrchestrator";

export default function OperatorCommandCenterPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("monitor");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: events } = useQuery({
    queryKey: ["eco-events-all"],
    queryFn: () => getEcosystemEvents({ limit: 100 }),
    staleTime: 30_000,
  });

  const { data: health } = useQuery({
    queryKey: ["eco-health"],
    queryFn: () => getHealthSnapshots(14),
    staleTime: 60_000,
  });

  const runHealthCheck = useMutation({
    mutationFn: () => invokeOrchestrator("assess_health", { timestamp: new Date().toISOString(), recentEventCount: events?.length ?? 0 }),
    onSuccess: () => { toast.success("Health assessment complete"); qc.invalidateQueries({ queryKey: ["eco-health"] }); },
    onError: () => toast.error("Health check failed"),
  });

  const runOrchestration = useMutation({
    mutationFn: (action: string) => invokeOrchestrator(action, { operator: true, timestamp: new Date().toISOString() }),
    onSuccess: () => { toast.success("Action completed"); qc.invalidateQueries({ queryKey: ["eco-dashboard"] }); },
  });

  const filteredEvents = (events ?? []).filter((e: any) =>
    !searchTerm || e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) || e.source_system.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const systemSources = [...new Set((events ?? []).map((e: any) => e.source_system))];

  return (
    <>
      <Helmet><title>Operator Command Center | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operator Command Center</h1>
            <p className="text-muted-foreground">Monitor and guide ecosystem activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runHealthCheck.mutate()} disabled={runHealthCheck.isPending}>
              <Shield className="h-4 w-4 mr-2" /> Health Check
            </Button>
            <Button onClick={() => runOrchestration.mutate("orchestrate")} disabled={runOrchestration.isPending}>
              <RefreshCw className="h-4 w-4 mr-2" /> Orchestrate
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemSources.slice(0, 4).map(src => {
            const count = (events ?? []).filter((e: any) => e.source_system === src).length;
            return (
              <Card key={src}><CardContent className="pt-6">
                <p className="font-medium text-foreground">{src}</p>
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-xs text-muted-foreground">events tracked</p>
              </CardContent></Card>
            );
          })}
          {systemSources.length === 0 && (
            <Card className="col-span-4"><CardContent className="pt-6 text-center text-muted-foreground">No systems reporting yet</CardContent></Card>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
            <TabsTrigger value="health">Health History</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor">
            <Card><CardHeader>
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5" />
                <CardTitle>Event Stream</CardTitle>
                <div className="flex-1" />
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredEvents.map((evt: any) => (
                  <div key={evt.id} className="flex items-center gap-3 p-2 rounded border border-border text-sm">
                    <Activity className="h-3 w-3 text-primary shrink-0" />
                    <Badge variant="outline" className="text-xs">{evt.source_system}</Badge>
                    <span className="font-medium text-foreground">{evt.event_type}</span>
                    {evt.entity_type && <span className="text-muted-foreground">→ {evt.entity_type}</span>}
                    <span className="ml-auto text-xs text-muted-foreground">{new Date(evt.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
                {filteredEvents.length === 0 && <p className="text-center text-muted-foreground py-8">No events match filter</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="health">
            <Card><CardContent className="pt-6">
              <div className="space-y-3">
                {(health ?? []).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded border border-border">
                    <div>
                      <span className="font-medium text-foreground">{h.snapshot_date}</span>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Projects: {h.total_active_projects}</span>
                        <span>Institutions: {h.institution_participation}</span>
                        <span>Success: {Math.round((h.project_success_rate ?? 0) * 100)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{h.overall_health_score}</span>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                    </div>
                  </div>
                ))}
                {(health ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No health snapshots — run a health check</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { action: "analyze_signals", label: "Detect Opportunity Signals", desc: "Scan events for high-value signals", icon: AlertTriangle },
                { action: "recommend_collaborations", label: "Generate Collaboration Recs", desc: "Find partnership opportunities", icon: Activity },
                { action: "generate_strategic_report", label: "Strategic Report", desc: "Generate executive insight report", icon: Settings },
                { action: "assess_health", label: "Ecosystem Health Check", desc: "Evaluate platform health metrics", icon: Shield },
              ].map(({ action, label, desc, icon: Icon }) => (
                <Card key={action} className="cursor-pointer hover:border-primary transition-colors" onClick={() => runOrchestration.mutate(action)}>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <Icon className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">{label}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
