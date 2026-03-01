import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGovernanceAnomalies, useGovernanceHealthIndex } from "@/hooks/useSovereignFederation";
import { ShieldAlert, Activity, TrendingDown, CheckCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600", B: "text-blue-600", C: "text-amber-600", D: "text-destructive",
};

export default function GovernanceHealthDashboardPage() {
  const { data: anomalies, isLoading: loadingAnomalies } = useGovernanceAnomalies();
  const { data: healthIndex, isLoading: loadingHealth } = useGovernanceHealthIndex();

  const anomalyList = anomalies ?? [];
  const healthList = healthIndex ?? [];

  const openAnomalies = anomalyList.filter((a: any) => a.status === "open").length;
  const highSeverity = anomalyList.filter((a: any) => a.severity === "high").length;
  const avgHealth = healthList.length
    ? Math.round(healthList.reduce((s: number, h: any) => s + (h.governance_composite_score || 0), 0) / healthList.length)
    : 0;

  const radarData = healthList.length > 0 ? [
    { metric: "Manipulation Risk", value: 100 - Math.round(healthList.reduce((s: number, h: any) => s + (h.manipulation_risk_score || 0), 0) / healthList.length) },
    { metric: "Endorsement Integrity", value: 100 - Math.round(healthList.reduce((s: number, h: any) => s + (h.endorsement_irregularity_score || 0), 0) / healthList.length) },
    { metric: "Dispute Health", value: 100 - Math.round(healthList.reduce((s: number, h: any) => s + (h.dispute_pattern_score || 0), 0) / healthList.length) },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Governance Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Anomaly detection, manipulation risk analysis, and institutional governance scoring</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{anomalyList.length}</p>
            <p className="text-xs text-muted-foreground">Anomalies Detected</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <ShieldAlert className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{highSeverity}</p>
            <p className="text-xs text-muted-foreground">High Severity</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-amber-600">{openAnomalies}</p>
            <p className="text-xs text-muted-foreground">Open Cases</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{avgHealth}</p>
            <p className="text-xs text-muted-foreground">Avg Health Score</p>
          </CardContent></Card>
        </div>

        {radarData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Governance Integrity Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Health Index */}
        {healthList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Governance Health Index</h2>
            {healthList.map((h: any) => (
              <Card key={h.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${GRADE_COLORS[h.grade] ?? "text-muted-foreground"}`}>{h.grade}</div>
                      <div>
                        <p className="text-sm font-medium">{h.entity_type}: {h.entity_id?.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">Composite: {h.governance_composite_score}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Manip: {Math.round(h.manipulation_risk_score)}%</Badge>
                      <Badge variant="secondary">Dispute: {Math.round(h.dispute_pattern_score)}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Anomalies */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Anomalies</h2>
          {anomalyList.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.severity === "high" ? "destructive" : "secondary"}>{a.severity}</Badge>
                      <span className="text-sm font-medium">{a.anomaly_type}</span>
                    </div>
                    {a.flagged_reason && <p className="text-xs text-muted-foreground mt-1">{a.flagged_reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{a.anomaly_score}%</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {anomalyList.length === 0 && !loadingAnomalies && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No governance anomalies detected
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
