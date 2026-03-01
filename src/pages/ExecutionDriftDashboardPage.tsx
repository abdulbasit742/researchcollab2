import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExecutionDriftAnalysis } from "@/hooks/useAutonomousIntelligence";
import { Activity, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SEV_COLORS: Record<string, string> = { normal: "#22c55e", warning: "#eab308", critical: "#ef4444" };

export default function ExecutionDriftDashboardPage() {
  const { data: driftData, isLoading } = useExecutionDriftAnalysis();
  const list = driftData ?? [];

  const anomalies = list.filter((d: any) => d.anomaly_flag).length;
  const critical = list.filter((d: any) => d.drift_severity === "critical").length;
  const avgVelocity = list.length ? Math.round(list.reduce((s: number, d: any) => s + (d.milestone_velocity_score || 0), 0) / list.length) : 0;

  const chartData = list.slice(0, 12).map((d: any) => ({
    name: d.project_id?.slice(0, 6) ?? "—",
    velocity: d.milestone_velocity_score || 0,
    delay: d.delay_trend_score || 0,
    severity: d.drift_severity || "normal",
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Execution Drift Monitor
          </h1>
          <p className="text-muted-foreground mt-1">Detect projects deviating from healthy execution patterns</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Analyses Run</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{critical}</p>
            <p className="text-xs text-muted-foreground">Critical Drift</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-amber-600">{anomalies}</p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgVelocity}%</p>
            <p className="text-xs text-muted-foreground">Avg Velocity</p>
          </CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Execution Velocity vs Delay Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={SEV_COLORS[e.severity] || "#eab308"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {list.map((d: any) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.drift_severity === "critical" ? "destructive" : d.drift_severity === "warning" ? "secondary" : "default"}>
                        {d.drift_severity}
                      </Badge>
                      <span className="text-sm font-medium">Project {d.project_id?.slice(0, 8)}</span>
                      {d.anomaly_flag && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Velocity: {d.milestone_velocity_score}% · Delay: {d.delay_trend_score}% · Variance: {Math.round(d.completion_pattern_variance)}
                    </p>
                    {d.recommendation && <p className="text-xs mt-1 text-muted-foreground">{d.recommendation}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(d.generated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No execution drift analyses yet</CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
