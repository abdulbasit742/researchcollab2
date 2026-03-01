import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck, AlertTriangle, Clock, TrendingUp, Plus, Settings,
  CheckCircle, XCircle, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const SLA_TYPES = [
  { value: "review_turnaround", label: "Review Turnaround" },
  { value: "milestone_completion", label: "Milestone Completion" },
  { value: "dispute_resolution", label: "Dispute Resolution" },
  { value: "response_time", label: "Response Time" },
];

function useSLADefinitions(institutionId?: string) {
  return useQuery({
    queryKey: ["sla-definitions", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await (supabase as any)
        .from("institution_sla_definitions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at");
      return (data || []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 60_000,
  });
}

function useSLAMetrics(institutionId?: string) {
  return useQuery({
    queryKey: ["sla-metrics", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await (supabase as any)
        .from("sla_performance_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 60_000,
  });
}

function useSLABreaches(institutionId?: string) {
  return useQuery({
    queryKey: ["sla-breaches", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await (supabase as any)
        .from("sla_breach_events")
        .select("*")
        .eq("institution_id", institutionId)
        .order("detected_at", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 30_000,
  });
}

export default function SLAMonitoringPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSLA, setNewSLA] = useState({ sla_type: "", target_hours: "24", warning_threshold_percent: "80", breach_threshold_percent: "100" });

  // Get user's institution
  const { data: membership } = useQuery({
    queryKey: ["user-org-membership", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const institutionId = membership?.org_id;
  const definitions = useSLADefinitions(institutionId);
  const metrics = useSLAMetrics(institutionId);
  const breaches = useSLABreaches(institutionId);

  const addDefinition = useMutation({
    mutationFn: async () => {
      if (!institutionId) throw new Error("No institution");
      const { error } = await (supabase as any).from("institution_sla_definitions").insert({
        institution_id: institutionId,
        sla_type: newSLA.sla_type,
        target_hours: parseFloat(newSLA.target_hours),
        warning_threshold_percent: parseFloat(newSLA.warning_threshold_percent),
        breach_threshold_percent: parseFloat(newSLA.breach_threshold_percent),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("SLA definition created.");
      qc.invalidateQueries({ queryKey: ["sla-definitions"] });
      setShowAddDialog(false);
      setNewSLA({ sla_type: "", target_hours: "24", warning_threshold_percent: "80", breach_threshold_percent: "100" });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create SLA definition."),
  });

  // Derived compliance score
  const complianceScore = useMemo(() => {
    if (!metrics.data?.length) return 100;
    const rates = metrics.data.map((m: any) => m.compliance_rate_percent ?? 100);
    return Math.round(rates.reduce((s: number, r: number) => s + r, 0) / rates.length);
  }, [metrics.data]);

  const warningCount = breaches.data?.filter((b: any) => b.breach_level === "warning").length ?? 0;
  const breachCount = breaches.data?.filter((b: any) => b.breach_level === "breach").length ?? 0;

  // Chart data from metrics
  const trendData = useMemo(() => {
    if (!metrics.data?.length) return [];
    return metrics.data
      .slice(0, 12)
      .reverse()
      .map((m: any) => ({
        period: m.measured_period?.slice(0, 7) ?? "",
        compliance: m.compliance_rate_percent ?? 100,
        breachRate: m.breach_rate_percent ?? 0,
      }));
  }, [metrics.data]);

  const breachByType = useMemo(() => {
    if (!breaches.data?.length) return [];
    const counts: Record<string, number> = {};
    breaches.data.forEach((b: any) => { counts[b.sla_type] = (counts[b.sla_type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => ({ type: type.replace(/_/g, " "), count }));
  }, [breaches.data]);

  if (!institutionId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState icon={ShieldCheck} title="No institution found" description="You must be a member of an institution to view SLA monitoring." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">SLA Monitoring</h1>
          <p className="text-sm text-muted-foreground">Track service level compliance and breach detection</p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Define SLA
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Compliance Score", value: `${complianceScore}%`, icon: ShieldCheck, color: complianceScore >= 90 ? "text-success" : complianceScore >= 70 ? "text-warning" : "text-destructive" },
          { label: "Active SLAs", value: definitions.data?.length ?? 0, icon: Settings, color: "text-primary" },
          { label: "Warnings", value: warningCount, icon: AlertTriangle, color: warningCount > 0 ? "text-warning" : "text-success" },
          { label: "Breaches", value: breachCount, icon: XCircle, color: breachCount > 0 ? "text-destructive" : "text-success" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
              {definitions.isLoading ? <Skeleton className="h-7 w-12 mx-auto" /> : <p className="text-xl font-bold">{m.value}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="definitions">Definitions</TabsTrigger>
          <TabsTrigger value="breaches">Breaches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Trend</CardTitle></CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No metric data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="compliance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Compliance %" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Breach Frequency by Type</CardTitle></CardHeader>
              <CardContent>
                {breachByType.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No breaches detected</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={breachByType}>
                      <XAxis dataKey="type" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Breaches" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="definitions" className="space-y-2">
          {definitions.isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : !definitions.data?.length ? (
            <EmptyState icon={Settings} title="No SLA definitions" description="Define SLA targets to begin monitoring compliance." />
          ) : (
            definitions.data.map((d: any) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{d.sla_type.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground">Target: {d.target_hours}h · Warning: {d.warning_threshold_percent}% · Breach: {d.breach_threshold_percent}%</p>
                  </div>
                  <Badge variant="default" className="text-[9px]">Active</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="breaches" className="space-y-2">
          {breaches.isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : !breaches.data?.length ? (
            <EmptyState icon={CheckCircle} title="No breaches" description="All SLA targets are being met." />
          ) : (
            breaches.data.map((b: any) => (
              <Card key={b.id} className={b.breach_level === "breach" ? "border-destructive/30" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  {b.breach_level === "breach" ? <XCircle className="h-4 w-4 text-destructive shrink-0" /> : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{b.sla_type.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground">{b.entity_type} · {new Date(b.detected_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={b.breach_level === "breach" ? "destructive" : "warning" as any} className="text-[9px]">
                    {b.breach_level}
                  </Badge>
                  {b.resolved && <Badge variant="default" className="text-[9px]">Resolved</Badge>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add SLA Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Define SLA Target</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>SLA Type</Label>
              <Select value={newSLA.sla_type} onValueChange={v => setNewSLA(p => ({ ...p, sla_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {SLA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Hours</Label>
              <Input type="number" value={newSLA.target_hours} onChange={e => setNewSLA(p => ({ ...p, target_hours: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Warning Threshold %</Label>
                <Input type="number" value={newSLA.warning_threshold_percent} onChange={e => setNewSLA(p => ({ ...p, warning_threshold_percent: e.target.value }))} />
              </div>
              <div>
                <Label>Breach Threshold %</Label>
                <Input type="number" value={newSLA.breach_threshold_percent} onChange={e => setNewSLA(p => ({ ...p, breach_threshold_percent: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => addDefinition.mutate()} disabled={!newSLA.sla_type || addDefinition.isPending}>
              {addDefinition.isPending ? "Creating…" : "Create Definition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
