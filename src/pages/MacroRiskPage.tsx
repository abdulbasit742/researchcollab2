import { useRiskIndex } from "@/hooks/useRiskIndex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

const riskColors: Record<string, string> = {
  stable: "hsl(var(--success, 142 76% 36%))",
  elevated: "hsl(var(--warning, 38 92% 50%))",
  high: "hsl(var(--destructive))",
  critical: "hsl(0 84% 40%)",
};

const severityVariant = (level: string) => {
  if (level === "stable") return "success" as const;
  if (level === "elevated") return "warning" as const;
  if (level === "high" || level === "critical") return "destructive" as const;
  return "secondary" as const;
};

export default function MacroRiskPage() {
  const { metrics, trends, alerts, isLoading, computeRisk, isComputing } = useRiskIndex("platform", "global");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const compositeScore = Number(metrics?.composite_risk_score) || 0;
  const riskLevel = metrics?.risk_level || "stable";
  const gaugeData = [{ name: "Risk", value: compositeScore, fill: riskColors[riskLevel] || riskColors.stable }];

  const breakdownData = [
    { name: "Trust Vol.", value: Number(metrics?.trust_volatility) || 0 },
    { name: "Disputes", value: Number(metrics?.dispute_spike_rate) || 0 },
    { name: "Liquidity", value: Number(metrics?.liquidity_distortion) || 0 },
    { name: "Capital", value: Number(metrics?.capital_concentration_index) || 0 },
    { name: "Pricing", value: Number(metrics?.pricing_anomaly_score) || 0 },
    { name: "Central.", value: Number(metrics?.centralization_risk) || 0 },
  ];

  const trendData = trends.map((t: any) => ({
    date: format(new Date(t.recorded_at), "MMM d"),
    score: Number(t.risk_score) || 0,
  }));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Global Talent Risk Index
            </h1>
            <p className="text-muted-foreground mt-1">Ecosystem stability monitoring</p>
          </div>
          <Button onClick={() => computeRisk()} disabled={isComputing}>
            {isComputing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Compute Risk
          </Button>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Composite Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} barSize={14} data={gaugeData}>
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--muted))" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-4">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">{compositeScore.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">/100</span>
              </div>
              <Badge variant={severityVariant(riskLevel)} className="mt-2 uppercase">{riskLevel}</Badge>
            </CardContent>
          </Card>

          {/* Trend Line */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ChartContainer config={{ score: { label: "Risk Score", color: "hsl(var(--primary))" } }} className="h-48">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">No trend data yet. Run a risk computation first.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Risk Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: "Score", color: "hsl(var(--primary))" } }} className="h-56">
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Active Systemic Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No active alerts. Ecosystem stable.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "warning" : "info"}>
                      {alert.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.alert_type}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(alert.triggered_at), "MMM d, HH:mm")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
