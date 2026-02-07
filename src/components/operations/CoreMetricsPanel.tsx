import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Shield, DollarSign, Users, Eye, EyeOff, BarChart3 } from "lucide-react";
import type { OpsMetrics } from "@/hooks/useOperationsCenter";

interface Props {
  latestMetrics: OpsMetrics | null;
  metrics: OpsMetrics[];
}

export function CoreMetricsPanel({ latestMetrics, metrics }: Props) {
  const coreMetrics = [
    {
      label: "Completed Real Outcomes",
      value: latestMetrics?.completed_outcomes ?? 0,
      icon: CheckCircle2,
      description: "Deals resulting in verified deliverables",
      color: "text-emerald-500",
    },
    {
      label: "Deals Closed Cleanly",
      value: latestMetrics?.deals_closed_cleanly ?? 0,
      icon: TrendingUp,
      description: "No disputes, no refunds, both parties satisfied",
      color: "text-blue-500",
    },
    {
      label: "Trust Stability (Variance)",
      value: latestMetrics?.trust_variance?.toFixed(2) ?? "0.00",
      icon: Shield,
      description: "Low variance = healthy trust. Watch for spikes.",
      color: "text-purple-500",
      isGoodWhenLow: true,
    },
    {
      label: "Money Flow Incidents",
      value: latestMetrics?.money_flow_incidents ?? 0,
      icon: DollarSign,
      description: "Failed escrow locks, releases, or refunds",
      color: "text-amber-500",
      isGoodWhenLow: true,
    },
    {
      label: "Organic Return Rate",
      value: `${((latestMetrics?.organic_return_rate ?? 0) * 100).toFixed(1)}%`,
      icon: Users,
      description: "Users returning without push notifications or emails",
      color: "text-primary",
    },
  ];

  const vanityMetrics = [
    { label: "DAU", value: latestMetrics?.dau ?? 0, why: "Activity ≠ value. 10 power users > 1000 lurkers." },
    { label: "Avg Time Spent", value: `${latestMetrics?.time_spent_avg_minutes?.toFixed(0) ?? 0}m`, why: "Time on platform ≠ outcome quality." },
  ];

  return (
    <div className="space-y-6">
      {/* Core 5 Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">5 Metrics That Matter</h3>
          <Badge variant="outline" className="text-xs">Track ONLY these</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreMetrics.map(m => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
                      <p className="text-3xl font-bold mt-1">{m.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${m.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Vanity Metrics (shown but flagged) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <EyeOff className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">Vanity Metrics (Tracked but IGNORED)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vanityMetrics.map(v => (
            <Card key={v.label} className="bg-muted/20 border-dashed opacity-60">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">{v.label}</p>
                    <p className="text-lg font-mono text-muted-foreground">{v.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-40">{v.why}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Snapshots */}
      {metrics.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Recent Trend (Last {Math.min(metrics.length, 7)} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-right">Outcomes</th>
                    <th className="py-2 text-right">Clean Deals</th>
                    <th className="py-2 text-right">Trust Var.</th>
                    <th className="py-2 text-right">Money Issues</th>
                    <th className="py-2 text-right">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 7).map(m => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-1.5">{m.snapshot_date}</td>
                      <td className="py-1.5 text-right font-mono">{m.completed_outcomes}</td>
                      <td className="py-1.5 text-right font-mono">{m.deals_closed_cleanly}</td>
                      <td className="py-1.5 text-right font-mono">{m.trust_variance.toFixed(2)}</td>
                      <td className={`py-1.5 text-right font-mono ${m.money_flow_incidents > 0 ? "text-destructive" : ""}`}>
                        {m.money_flow_incidents}
                      </td>
                      <td className="py-1.5 text-right font-mono">{(m.organic_return_rate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
