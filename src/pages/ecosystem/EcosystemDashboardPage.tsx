import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Zap, Users, TrendingUp, Brain, BarChart3, Globe, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getEcosystemDashboard, invokeOrchestrator, getEcosystemEvents } from "@/lib/ecosystem/ecosystemOrchestrator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#8b5cf6"];

export default function EcosystemDashboardPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["eco-dashboard"],
    queryFn: getEcosystemDashboard,
    staleTime: 60_000,
  });

  const orchestrate = useMutation({
    mutationFn: (action: string) => invokeOrchestrator(action, { context: "dashboard_trigger", timestamp: new Date().toISOString() }),
    onSuccess: (data) => {
      toast.success("Orchestration complete");
      qc.invalidateQueries({ queryKey: ["eco-dashboard"] });
    },
    onError: () => toast.error("Orchestration failed"),
  });

  const summary = dashboard?.summary;
  const sourceData = summary ? Object.entries(summary.eventsBySource).map(([name, value]) => ({ name, value })) : [];
  const signalData = summary ? Object.entries(summary.signalsByType).map(([name, value]) => ({ name, value })) : [];

  return (
    <>
      <Helmet><title>Ecosystem Dashboard | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ecosystem Orchestration</h1>
            <p className="text-muted-foreground">Unified coordination across all RCollab systems</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => orchestrate.mutate("analyze_signals")} disabled={orchestrate.isPending}>
              <Zap className="h-4 w-4 mr-2" /> Detect Signals
            </Button>
            <Button onClick={() => orchestrate.mutate("orchestrate")} disabled={orchestrate.isPending}>
              <Brain className="h-4 w-4 mr-2" /> Run Orchestrator
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{dashboard?.recentEvents?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Recent Events</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{dashboard?.activeSignals?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Active Signals</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary?.pendingCollabCount ?? 0}</p>
                <p className="text-sm text-muted-foreground">Collaboration Recs</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary?.latestHealthScore ?? 0}</p>
                <p className="text-sm text-muted-foreground">Health Score</p>
              </div>
            </div>
          </CardContent></Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Event Stream</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="reports">Strategic Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle className="text-lg">Events by Source</CardTitle></CardHeader>
                <CardContent>
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={sourceData}><XAxis dataKey="name" fontSize={12} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-8">No events yet</p>}
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="text-lg">Signal Distribution</CardTitle></CardHeader>
                <CardContent>
                  {signalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={signalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {signalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie><Tooltip /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-8">No signals detected</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card><CardContent className="pt-6">
              <div className="space-y-3">
                {(dashboard?.recentEvents ?? []).map((evt: any) => (
                  <div key={evt.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{evt.source_system}</Badge>
                      <span className="font-medium text-foreground">{evt.event_type}</span>
                      {evt.entity_type && <span className="text-sm text-muted-foreground">{evt.entity_type}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(evt.created_at).toLocaleString()}</span>
                  </div>
                ))}
                {(dashboard?.recentEvents ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No ecosystem events recorded yet</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="signals">
            <Card><CardContent className="pt-6">
              <div className="space-y-3">
                {(dashboard?.activeSignals ?? []).map((sig: any) => (
                  <div key={sig.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{sig.title}</span>
                      </div>
                      <Badge>{sig.priority}</Badge>
                    </div>
                    {sig.description && <p className="text-sm text-muted-foreground">{sig.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Type: {sig.signal_type}</span>
                      <span>Confidence: {Math.round((sig.confidence_score ?? 0) * 100)}%</span>
                    </div>
                  </div>
                ))}
                {(dashboard?.activeSignals ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No active signals — run signal detection</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="collaborations">
            <Card><CardContent className="pt-6">
              <div className="space-y-3">
                {(dashboard?.pendingCollaborations ?? []).map((rec: any) => (
                  <div key={rec.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">{rec.entity_a_type} ↔ {rec.entity_b_type}</span>
                        <Badge variant="outline" className="ml-2">{rec.rec_type}</Badge>
                      </div>
                      <span className="text-sm font-bold text-primary">{Math.round((rec.match_score ?? 0) * 100)}%</span>
                    </div>
                    {rec.reasoning && <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>}
                  </div>
                ))}
                {(dashboard?.pendingCollaborations ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No pending collaboration recommendations</p>}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card><CardContent className="pt-6">
              <div className="space-y-4">
                {(dashboard?.strategicReports ?? []).map((rpt: any) => (
                  <div key={rpt.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{rpt.title}</h3>
                      <Badge variant="outline">{rpt.report_type}</Badge>
                    </div>
                    {rpt.summary && <p className="text-sm text-muted-foreground">{rpt.summary}</p>}
                  </div>
                ))}
                {(dashboard?.strategicReports ?? []).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">No strategic reports yet</p>
                    <Button variant="outline" onClick={() => orchestrate.mutate("generate_strategic_report")} disabled={orchestrate.isPending}>
                      <BarChart3 className="h-4 w-4 mr-2" /> Generate Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
