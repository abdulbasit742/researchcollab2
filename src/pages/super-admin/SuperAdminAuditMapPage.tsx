import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect, useMemo } from "react";
import { GitBranch, Clock, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--destructive))", "hsl(var(--chart-4))", "hsl(var(--warning))"];

function useGlobalAuditData() {
  return useQuery({
    queryKey: ["sa-audit-map"],
    queryFn: async () => {
      const { data: transitions } = await supabase
        .from("state_transition_logs")
        .select("from_state, to_state, created_at, entity_id")
        .order("created_at", { ascending: false })
        .limit(1000);

      const logs = transitions || [];

      // State distribution
      const stateCounts: Record<string, number> = {};
      logs.forEach(t => {
        stateCounts[t.to_state] = (stateCounts[t.to_state] || 0) + 1;
      });
      const stateDistribution = Object.entries(stateCounts)
        .map(([state, count]) => ({ state: state.replace(/_/g, " "), count }))
        .sort((a, b) => b.count - a.count);

      // Dispute vs completion
      const disputeCount = logs.filter(t => t.to_state === "disputed").length;
      const completedCount = logs.filter(t => t.to_state === "approved" || t.to_state === "released" || t.to_state === "completed").length;
      const submittedCount = logs.filter(t => t.to_state === "submitted").length;

      // Average lifecycle duration per entity (first event to last)
      const entityTimelines: Record<string, { first: string; last: string }> = {};
      logs.forEach(t => {
        if (!entityTimelines[t.entity_id]) {
          entityTimelines[t.entity_id] = { first: t.created_at, last: t.created_at };
        }
        if (t.created_at < entityTimelines[t.entity_id].first) entityTimelines[t.entity_id].first = t.created_at;
        if (t.created_at > entityTimelines[t.entity_id].last) entityTimelines[t.entity_id].last = t.created_at;
      });

      const durations = Object.values(entityTimelines).map(tl =>
        (new Date(tl.last).getTime() - new Date(tl.first).getTime()) / 3600000
      ).filter(d => d > 0);
      const avgDurationHours = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

      // Anomaly: fast approvals (<2 min between submitted->approved)
      let fastApprovals = 0;
      for (let i = 1; i < logs.length; i++) {
        if (logs[i - 1].to_state === "submitted" && logs[i].to_state === "approved" &&
          logs[i - 1].entity_id === logs[i].entity_id) {
          const diff = Math.abs(new Date(logs[i].created_at).getTime() - new Date(logs[i - 1].created_at).getTime());
          if (diff < 120_000) fastApprovals++;
        }
      }

      return {
        totalTransitions: logs.length,
        uniqueEntities: Object.keys(entityTimelines).length,
        stateDistribution,
        disputeCount,
        completedCount,
        submittedCount,
        avgDurationHours,
        fastApprovals,
        flowSummary: [
          { name: "Completed", value: completedCount },
          { name: "Disputed", value: disputeCount },
          { name: "Submitted", value: submittedCount },
        ].filter(f => f.value > 0),
      };
    },
    staleTime: 120_000,
  });
}

export default function SuperAdminAuditMapPage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = useGlobalAuditData();

  useEffect(() => { logAction("view_audit_map"); }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global Audit Map</h1>
            <p className="text-sm text-muted-foreground">Aggregated lifecycle distribution, dispute analysis, and anomaly clustering</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total Transitions", value: data?.totalTransitions, icon: GitBranch, color: "text-primary" },
              { label: "Unique Entities", value: data?.uniqueEntities, icon: BarChart3, color: "text-primary" },
              { label: "Avg Duration", value: data ? `${data.avgDurationHours}h` : undefined, icon: Clock, color: "text-primary" },
              { label: "Disputes", value: data?.disputeCount, icon: AlertTriangle, color: (data?.disputeCount ?? 0) > 0 ? "text-destructive" : "text-success" },
              { label: "Fast Approvals", value: data?.fastApprovals, icon: AlertTriangle, color: (data?.fastApprovals ?? 0) > 0 ? "text-warning" : "text-success" },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
                  {isLoading ? <Skeleton className="h-7 w-12 mx-auto" /> : <p className="text-xl font-bold">{m.value ?? "—"}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">State Distribution</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-56" /> : !data?.stateDistribution.length ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No transition data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.stateDistribution.slice(0, 10)}>
                      <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Transitions" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Flow Outcome Distribution</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-56" /> : !data?.flowSummary.length ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No outcome data</div>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="55%" height={220}>
                      <PieChart>
                        <Pie data={data.flowSummary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={2}>
                          {data.flowSummary.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {data.flowSummary.map((f, i) => (
                        <div key={f.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs">{f.name}</span>
                          <span className="text-xs font-semibold ml-auto">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {data?.fastApprovals && data.fastApprovals > 0 && (
            <Card className="border-warning/30">
              <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium">Fast Approval Advisory</p>
                  <p className="text-[10px] text-muted-foreground">
                    {data.fastApprovals} approval{data.fastApprovals !== 1 ? "s" : ""} completed in under 2 minutes — review thoroughness may be insufficient.
                  </p>
                </div>
                <Badge variant="warning" className="text-[9px] ml-auto">Advisory</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
