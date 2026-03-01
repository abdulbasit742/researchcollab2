import { useRevenueMetrics, useRevenueForecast, useEnterpriseSalesIntelligence } from "@/hooks/useMonetization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Users, BarChart3, Target } from "lucide-react";

function fmtPKR(v: number) {
  return `PKR ${v.toLocaleString()}`;
}

export default function RevenueDashboardPage() {
  const { data: metrics = [] } = useRevenueMetrics();
  const { data: forecast } = useRevenueForecast();
  const { data: intel } = useEnterpriseSalesIntelligence();

  const latest = metrics[0] as any | undefined;
  const activeSubs = intel?.subscriptions?.length ?? 0;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Revenue Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide revenue metrics, forecasts, and subscription analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "MRR", value: fmtPKR(latest?.total_mrr ?? 0), icon: DollarSign },
          { label: "ARR Projection", value: fmtPKR(latest?.total_arr ?? 0), icon: TrendingUp },
          { label: "Active Subscriptions", value: latest?.active_subscriptions ?? activeSubs, icon: Users },
          { label: "Churn Rate", value: `${(latest?.churn_rate ?? 0).toFixed(1)}%`, icon: BarChart3 },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecast ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold text-foreground">{fmtPKR(forecast.projected_mrr)}</p>
                    <p className="text-[10px] text-muted-foreground">Projected MRR</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold text-foreground">{fmtPKR(forecast.projected_arr)}</p>
                    <p className="text-[10px] text-muted-foreground">Projected ARR</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Growth: {(forecast.growth_projection ?? 0).toFixed(1)}%</span>
                  <span>Churn: {(forecast.churn_projection ?? 0).toFixed(1)}%</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Period: {forecast.forecast_period}</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No forecast data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intel?.subscriptions && intel.subscriptions.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(
                  (intel.subscriptions as any[]).reduce((acc: Record<string, number>, s: any) => {
                    const name = s.institution_subscription_plans?.plan_name ?? "Unknown";
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm font-medium text-foreground">{plan}</span>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No active subscriptions.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue History */}
      {metrics.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {metrics.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded text-sm hover:bg-muted/30">
                  <span className="text-foreground">MRR: {fmtPKR(m.total_mrr)} · Subs: {m.active_subscriptions}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.snapshot_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
