import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupervisorIndex } from "@/hooks/useMilestoneRisk";
import { useInstitutionalMetrics } from "@/hooks/useInstitutionalMetrics";
import { Building2, Award, TrendingUp, Users } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-green-600", A: "text-green-600", "B+": "text-blue-600",
  B: "text-blue-600", C: "text-amber-600", D: "text-destructive",
};

export default function InstitutionalIntelligenceDashboardPage() {
  const { data: supervisors, isLoading } = useSupervisorIndex();
  const list = supervisors ?? [];

  const avgComposite = list.length
    ? Math.round(list.reduce((s: number, i: any) => s + (i.composite_score || 0), 0) / list.length)
    : 0;

  const topPerformers = list.filter((s: any) => s.grade === "A+" || s.grade === "A");

  const chartData = list.slice(0, 10).map((s: any) => ({
    name: s.supervisor_id?.slice(0, 6) ?? "—",
    completion: s.completion_score || 0,
    disputes: s.dispute_involvement_score || 0,
    funding: s.funding_success_rate || 0,
    validation: s.validation_score || 0,
  }));

  const radarData = list.length > 0 ? [
    { metric: "Completion", value: Math.round(list.reduce((s: number, i: any) => s + (i.completion_score || 0), 0) / list.length) },
    { metric: "Dispute Res.", value: Math.round(list.reduce((s: number, i: any) => s + (i.dispute_involvement_score || 0), 0) / list.length) },
    { metric: "Funding", value: Math.round(list.reduce((s: number, i: any) => s + (i.funding_success_rate || 0), 0) / list.length) },
    { metric: "Validation", value: Math.round(list.reduce((s: number, i: any) => s + (i.validation_score || 0), 0) / list.length) },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Institutional Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Supervisor performance, institutional scoring, and execution analytics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Supervisors Indexed</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgComposite}</p>
            <p className="text-xs text-muted-foreground">Avg Composite Score</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Award className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{topPerformers.length}</p>
            <p className="text-xs text-muted-foreground">A-Grade Supervisors</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.filter((s: any) => s.grade === "D").length}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Aggregate Performance Radar</CardTitle></CardHeader>
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

          {/* Bar Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Supervisor Scores Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="funding" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Supervisor Cards */}
        <div className="space-y-3">
          {list.map((sup: any) => (
            <Card key={sup.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${GRADE_COLORS[sup.grade] ?? "text-muted-foreground"}`}>
                      {sup.grade}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Supervisor {sup.supervisor_id?.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        Composite: {sup.composite_score} · Period: {sup.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Completion: {Math.round(sup.completion_score)}%</Badge>
                    <Badge variant="secondary">Funding: {Math.round(sup.funding_success_rate)}%</Badge>
                    <Badge variant="secondary">Validation: {Math.round(sup.validation_score)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No supervisor performance data computed yet
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
