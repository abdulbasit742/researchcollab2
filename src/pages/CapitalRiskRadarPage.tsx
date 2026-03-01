import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMilestoneRiskForecasts } from "@/hooks/useMilestoneRisk";
import { useHighRiskPredictions } from "@/hooks/useFundingIntelligence";
import { AlertTriangle, Shield, TrendingDown, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RISK_COLORS = { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444" };

function getRiskLevel(score: number) {
  if (score >= 70) return "critical";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}

export default function CapitalRiskRadarPage() {
  const { data: forecasts, isLoading: loadingForecasts } = useMilestoneRiskForecasts();
  const { data: predictions, isLoading: loadingPredictions } = useHighRiskPredictions();

  const allForecasts = forecasts ?? [];
  const allPredictions = predictions ?? [];

  const criticalCount = allForecasts.filter((f: any) => f.risk_score >= 70).length;
  const highCount = allForecasts.filter((f: any) => f.risk_score >= 40 && f.risk_score < 70).length;
  const avgRisk = allForecasts.length
    ? Math.round(allForecasts.reduce((s: number, f: any) => s + f.risk_score, 0) / allForecasts.length)
    : 0;

  const chartData = allForecasts.slice(0, 15).map((f: any) => ({
    name: f.milestone_id?.slice(0, 6) ?? "—",
    risk: f.risk_score,
    failure: f.failure_probability,
    dispute: f.dispute_probability,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Capital Risk Radar
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered milestone risk forecasting and capital threat detection</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{allForecasts.length}</p>
            <p className="text-xs text-muted-foreground">Active Forecasts</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical Risk</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-amber-600">{highCount}</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgRisk}%</p>
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
          </CardContent></Card>
        </div>

        {/* Risk Distribution Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Milestone Risk Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={RISK_COLORS[getRiskLevel(entry.risk)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Forecasts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Milestone Risk Forecasts</h2>
          {allForecasts.map((f: any) => {
            const level = getRiskLevel(f.risk_score);
            return (
              <Card key={f.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={level === "critical" ? "destructive" : "secondary"}>{level.toUpperCase()}</Badge>
                        <span className="text-sm font-medium">Risk: {f.risk_score}%</span>
                        <span className="text-xs text-muted-foreground">Failure: {Math.round(f.failure_probability)}%</span>
                        <span className="text-xs text-muted-foreground">Dispute: {Math.round(f.dispute_probability)}%</span>
                      </div>
                      {f.recommendation && (
                        <p className="text-xs text-muted-foreground mt-1">{f.recommendation}</p>
                      )}
                      {f.predicted_delay_days > 0 && (
                        <p className="text-xs text-amber-600 mt-1">Predicted delay: {f.predicted_delay_days} days</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(f.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Funding Predictions */}
          {allPredictions.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">High-Risk Funding Predictions</h2>
              {allPredictions.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{p.severity}</Badge>
                          <span className="text-sm">{p.prediction_type}</span>
                          <span className="text-xs text-muted-foreground">Risk: {p.risk_score}%</span>
                        </div>
                        {p.recommendation && <p className="text-xs text-muted-foreground mt-1">{p.recommendation}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {allForecasts.length === 0 && allPredictions.length === 0 && !loadingForecasts && !loadingPredictions && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No risk forecasts generated yet. Run predictions on active deals to populate this radar.
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
