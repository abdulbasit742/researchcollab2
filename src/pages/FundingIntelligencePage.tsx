import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { useHighRiskPredictions } from "@/hooks/useFundingIntelligence";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Shield,
  Activity,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-700 border-red-500/30",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  low: "bg-green-500/10 text-green-700 border-green-500/30",
};

const barColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default function FundingIntelligencePage() {
  const { data: predictions = [], isLoading } = useHighRiskPredictions();

  const byType = predictions.reduce<Record<string, number>>((acc, p) => {
    acc[p.prediction_type] = (acc[p.prediction_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(byType).map(([type, count]) => ({
    type: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
  }));

  const avgRisk = predictions.length > 0
    ? Math.round(predictions.reduce((s, p) => s + p.risk_score, 0) / predictions.length)
    : 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Funding Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Funding Risk Radar — Execution Reliability Forecasting — Synthetic Endorsement Detection
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{predictions.filter(p => p.severity === "critical").length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-orange-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{predictions.length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Active Risks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-amber-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{avgRisk}%</p>
                  )}
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <p className="text-2xl font-bold">{Object.keys(byType).length}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Risk Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={120} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill="hsl(var(--primary))" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No risk data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Risk Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Funding Risk Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                  <p className="text-muted-foreground">No high-risk predictions at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {predictions.map((pred) => (
                    <div key={pred.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={severityColors[pred.severity] || severityColors.low}>
                              {pred.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-sm">
                              {pred.prediction_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pred.entity_type}/{pred.entity_id.slice(0, 8)}... · {new Date(pred.computed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            pred.risk_score >= 70 ? "text-red-500" : pred.risk_score >= 40 ? "text-amber-500" : "text-green-500"
                          }`}>
                            {pred.risk_score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Risk</p>
                        </div>
                      </div>
                      {pred.recommendation && (
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                          💡 {pred.recommendation}
                        </p>
                      )}
                      {pred.factors && pred.factors.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {pred.factors.slice(0, 3).map((f: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {f.factor?.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
