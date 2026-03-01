import { useCapitalFlowEfficiency, useCapitalBottlenecks, useFundingAllocationInsights, useCapitalHealth, useCapitalGovernanceFlags } from "@/hooks/useCapitalCoordination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Activity, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function tl(v: number) {
  if (v >= 75) return { color: "bg-emerald-500", label: "Healthy" };
  if (v >= 50) return { color: "bg-amber-500", label: "Moderate" };
  return { color: "bg-destructive", label: "At Risk" };
}

function sevBadge(s: string) {
  if (s === "high" || s === "critical") return "destructive" as const;
  if (s === "medium") return "secondary" as const;
  return "outline" as const;
}

// TODO: Replace with real institution context
const DEMO_INSTITUTION_ID = undefined;

export default function CapitalIntelligencePage() {
  const { data: flow } = useCapitalFlowEfficiency(DEMO_INSTITUTION_ID);
  const { data: bottlenecks = [] } = useCapitalBottlenecks(DEMO_INSTITUTION_ID);
  const { data: allocation } = useFundingAllocationInsights(DEMO_INSTITUTION_ID);
  const { data: health } = useCapitalHealth(DEMO_INSTITUTION_ID);
  const { data: flags = [] } = useCapitalGovernanceFlags(DEMO_INSTITUTION_ID);

  const overallHealth = health?.overall_capital_health ?? 0;
  const hStatus = tl(overallHealth);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" /> Capital Intelligence Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Advisory capital coordination — no automated financial mutations</p>
      </div>

      {/* Capital Health Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Capital Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          {health ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-4 h-4 rounded-full ${hStatus.color}`} />
                <span className={`text-3xl font-bold ${sc(overallHealth)}`}>{overallHealth.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/ 100 — {hStatus.label}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Liquidity Efficiency", value: health.liquidity_efficiency_score },
                  { label: "Dispute Impact", value: health.dispute_impact_score },
                  { label: "Release Consistency", value: health.release_consistency_score },
                  { label: "Capital Velocity", value: health.capital_velocity_score },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className={`text-xl font-bold ${sc(m.value)}`}>{m.value.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No capital health data available. Connect an institution to view metrics.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Capital Flow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Capital Flow Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            {flow ? (
              <div className="space-y-2">
                {[
                  { label: "Avg Release Time", value: `${flow.average_release_time.toFixed(1)} days` },
                  { label: "Avg Lock Duration", value: `${flow.average_lock_duration.toFixed(1)} days` },
                  { label: "Capital Velocity Index", value: flow.capital_velocity_index.toFixed(1), score: flow.capital_velocity_index },
                  { label: "Stagnation Score", value: flow.stagnation_score.toFixed(1), score: 100 - flow.stagnation_score },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className={`font-bold ${m.score !== undefined ? sc(m.score) : "text-foreground"}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No flow data.</p>
            )}
          </CardContent>
        </Card>

        {/* Allocation Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Funding Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocation ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-emerald-600">{allocation.high_efficiency_projects}</p>
                    <p className="text-[10px] text-muted-foreground">High Efficiency</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-destructive">{allocation.low_efficiency_projects}</p>
                    <p className="text-[10px] text-muted-foreground">Low Efficiency</p>
                  </div>
                </div>
                {Array.isArray(allocation.optimization_suggestions) && allocation.optimization_suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                    {(allocation.optimization_suggestions as string[]).slice(0, 3).map((s, i) => (
                      <p key={i} className="text-xs text-foreground">• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No allocation data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Capital Bottlenecks ({bottlenecks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bottlenecks.slice(0, 8).map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/30">
                  <Badge variant="outline" className="text-[10px]">{b.bottleneck_type.replace(/_/g, " ")}</Badge>
                  <span className={`font-bold ${sc(100 - b.bottleneck_score)}`}>{b.bottleneck_score.toFixed(0)}</span>
                  <span className="text-muted-foreground text-xs flex-1 truncate">{b.suggested_resolution ?? "No suggestion"}</span>
                  <span className="text-[10px] text-muted-foreground">{b.estimated_capital_delay.toFixed(0)}d delay</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Governance Flags */}
      {flags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Capital Governance Flags ({flags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flags.slice(0, 8).map((f: any) => (
                <div key={f.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                  <Badge variant={sevBadge(f.severity)} className="text-[10px]">{f.severity}</Badge>
                  <Badge variant="outline" className="text-[10px]">{f.flag_type.replace(/_/g, " ")}</Badge>
                  <span className="text-xs text-foreground flex-1 truncate">{f.description ?? "—"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">All metrics are advisory only. No automated capital mutations. Node-scoped. RLS-protected.</p>
    </div>
  );
}
