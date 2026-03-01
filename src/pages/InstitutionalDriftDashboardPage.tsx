import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInstitutionalDrift } from "@/hooks/useAutonomousIntelligence";
import { Building2, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const DIR_ICON: Record<string, any> = { improving: TrendingUp, declining: TrendingDown, stable: Minus };
const DIR_COLOR: Record<string, string> = { improving: "text-green-600", declining: "text-destructive", stable: "text-muted-foreground" };

export default function InstitutionalDriftDashboardPage() {
  const { data: driftData, isLoading } = useInstitutionalDrift();
  const list = driftData ?? [];

  const declining = list.filter((d: any) => d.drift_direction === "declining").length;
  const improving = list.filter((d: any) => d.drift_direction === "improving").length;
  const avgAnomaly = list.length ? Math.round(list.reduce((s: number, d: any) => s + (d.anomaly_score || 0), 0) / list.length) : 0;

  const radarData = list.length > 0 ? [
    { metric: "Trust Trend", value: Math.round(list.reduce((s: number, d: any) => s + Math.max(0, 50 + (d.trust_score_trend || 0)), 0) / list.length) },
    { metric: "Exec Quality", value: Math.round(list.reduce((s: number, d: any) => s + (d.execution_quality_trend || 0), 0) / list.length) },
    { metric: "Endorsement Int.", value: Math.round(list.reduce((s: number, d: any) => s + (d.endorsement_integrity_trend || 0), 0) / list.length) },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Institutional Drift Monitor
          </h1>
          <p className="text-muted-foreground mt-1">Long-term institutional health trajectory analysis</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Institutions Monitored</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{improving}</p>
            <p className="text-xs text-muted-foreground">Improving</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{declining}</p>
            <p className="text-xs text-muted-foreground">Declining</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold">{avgAnomaly}%</p>
            <p className="text-xs text-muted-foreground">Avg Anomaly</p>
          </CardContent></Card>
        </div>

        {radarData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Institutional Health Dimensions</CardTitle></CardHeader>
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
          {list.map((d: any) => {
            const DirIcon = DIR_ICON[d.drift_direction] || Minus;
            return (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DirIcon className={`h-5 w-5 ${DIR_COLOR[d.drift_direction] || ""}`} />
                      <div>
                        <p className="text-sm font-medium">Institution {d.institution_id?.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">Period: {d.period}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={d.drift_direction === "declining" ? "destructive" : d.drift_direction === "improving" ? "default" : "secondary"}>
                        {d.drift_direction}
                      </Badge>
                      <Badge variant="secondary">Trust: {d.trust_score_trend > 0 ? "+" : ""}{d.trust_score_trend}</Badge>
                      <Badge variant="secondary">Exec: {d.execution_quality_trend}%</Badge>
                      <Badge variant="secondary">Integrity: {d.endorsement_integrity_trend}%</Badge>
                      {d.anomaly_score > 30 && <Badge variant="destructive">Anomaly: {d.anomaly_score}%</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No institutional drift data computed yet</CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
