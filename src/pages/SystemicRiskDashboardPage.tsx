import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSystemicRiskIndex } from "@/hooks/useAutonomousIntelligence";
import { Shield, AlertTriangle, TrendingDown, Activity } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const GRADE_COLORS: Record<string, string> = { A: "text-green-600", B: "text-blue-600", C: "text-amber-600", D: "text-destructive" };

export default function SystemicRiskDashboardPage() {
  const { data: riskData, isLoading } = useSystemicRiskIndex();
  const list = riskData ?? [];

  const highRisk = list.filter((r: any) => r.overall_risk_score >= 60).length;
  const avgRisk = list.length ? Math.round(list.reduce((s: number, r: any) => s + (r.overall_risk_score || 0), 0) / list.length) : 0;

  const radarData = list.length > 0 ? [
    { metric: "Capital Conc.", value: Math.round(list.reduce((s: number, r: any) => s + (r.capital_concentration_risk || 0), 0) / list.length) },
    { metric: "Dispute Cluster", value: Math.round(list.reduce((s: number, r: any) => s + (r.dispute_cluster_risk || 0), 0) / list.length) },
    { metric: "Exec Instability", value: Math.round(list.reduce((s: number, r: any) => s + (r.execution_instability_score || 0), 0) / list.length) },
    { metric: "Gov Pressure", value: Math.round(list.reduce((s: number, r: any) => s + (r.governance_pressure_score || 0), 0) / list.length) },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Systemic Risk Monitor
          </h1>
          <p className="text-muted-foreground mt-1">Macro-level institutional instability detection and risk grading</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Institutions Assessed</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{highRisk}</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgRisk}%</p>
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{list.filter((r: any) => r.risk_grade === "A").length}</p>
            <p className="text-xs text-muted-foreground">A-Grade</p>
          </CardContent></Card>
        </div>

        {radarData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Systemic Risk Radar</CardTitle></CardHeader>
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

        <div className="space-y-3">
          {list.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${GRADE_COLORS[r.risk_grade] ?? "text-muted-foreground"}`}>{r.risk_grade}</div>
                    <div>
                      <p className="text-sm font-medium">Institution {r.institution_id?.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">Overall Risk: {r.overall_risk_score}%</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Capital: {Math.round(r.capital_concentration_risk)}%</Badge>
                    <Badge variant="secondary">Disputes: {Math.round(r.dispute_cluster_risk)}%</Badge>
                    <Badge variant="secondary">Exec: {Math.round(r.execution_instability_score)}%</Badge>
                    <Badge variant="secondary">Gov: {Math.round(r.governance_pressure_score)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No systemic risk assessments computed yet</CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
