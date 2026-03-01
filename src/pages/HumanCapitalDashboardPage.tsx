import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHumanCapitalIndex } from "@/hooks/useSovereignFederation";
import { Users, GraduationCap, TrendingUp, Briefcase } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function HumanCapitalDashboardPage() {
  const { data: hciData, isLoading } = useHumanCapitalIndex();
  const list = hciData ?? [];

  const avgComposite = list.length
    ? Math.round(list.reduce((s: number, h: any) => s + (h.composite_hci || 0), 0) / list.length)
    : 0;

  const topInstitutions = list.filter((h: any) => h.composite_hci >= 70).length;

  const radarData = list.length > 0 ? [
    { metric: "Skill Growth", value: Math.round(list.reduce((s: number, h: any) => s + (h.skill_growth_rate || 0), 0) / list.length) },
    { metric: "Execution Maturity", value: Math.round(list.reduce((s: number, h: any) => s + (h.execution_maturity_score || 0), 0) / list.length) },
    { metric: "Commercialization", value: Math.round(list.reduce((s: number, h: any) => s + (h.research_commercialization_index || 0), 0) / list.length) },
    { metric: "Employability", value: Math.round(list.reduce((s: number, h: any) => s + (h.graduate_employability_index || 0), 0) / list.length) },
    { metric: "Retention", value: Math.round(list.reduce((s: number, h: any) => s + (h.talent_retention_score || 0), 0) / list.length) },
  ] : [];

  const chartData = list.slice(0, 10).map((h: any) => ({
    name: h.institution_id?.slice(0, 6) ?? "—",
    hci: h.composite_hci || 0,
    employability: h.graduate_employability_index || 0,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Human Capital Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Institutional human capital development, employability, and talent analytics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-muted-foreground">Institutions Indexed</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgComposite}</p>
            <p className="text-xs text-muted-foreground">Avg HCI Score</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <GraduationCap className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{topInstitutions}</p>
            <p className="text-xs text-muted-foreground">High-Performing</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Briefcase className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{list.length > 0 ? radarData.find(r => r.metric === "Employability")?.value ?? 0 : 0}%</p>
            <p className="text-xs text-muted-foreground">Avg Employability</p>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {radarData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Human Capital Radar</CardTitle></CardHeader>
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

          {chartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Institution HCI Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hci" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="employability" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          {list.map((h: any) => (
            <Card key={h.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">Institution {h.institution_id?.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">Period: {h.period}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">HCI: {h.composite_hci}</Badge>
                    <Badge variant="secondary">Skills: {Math.round(h.skill_growth_rate)}%</Badge>
                    <Badge variant="secondary">Maturity: {Math.round(h.execution_maturity_score)}</Badge>
                    <Badge variant="secondary">Employability: {Math.round(h.graduate_employability_index)}%</Badge>
                    <Badge variant="outline">Retention: {Math.round(h.talent_retention_score)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No human capital data computed yet
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
