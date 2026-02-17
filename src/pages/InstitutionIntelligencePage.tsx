import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInstitutionHealth } from "@/hooks/useLIMSE";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600", B: "text-blue-600", C: "text-amber-600",
  D: "text-orange-600", F: "text-destructive",
};

export default function InstitutionIntelligencePage() {
  const { data: institutions, isLoading } = useInstitutionHealth();
  const list = institutions ?? [];

  const avgHealth = list.length
    ? Math.round(list.reduce((s, i) => s + i.health_score, 0) / list.length)
    : 0;
  const atRisk = list.filter(i => i.health_grade === "D" || i.health_grade === "F");

  const chartData = list.slice(0, 15).map(i => ({
    name: i.institution_id?.slice(0, 8) ?? "—",
    score: i.health_score,
    completion: i.deal_completion_rate,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Institutional Economic Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Health monitoring, early warnings, and intervention suggestions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Institutions Monitored</p>
            <p className="text-2xl font-bold">{list.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Health Score</p>
            <p className="text-2xl font-bold">{avgHealth}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">At Risk</p>
            <p className="text-2xl font-bold text-destructive">{atRisk.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Top Grade</p>
            <p className="text-2xl font-bold text-green-600">{list.filter(i => i.health_grade === "A").length} A-rated</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Health Score Distribution</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No institutional health data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Institution Cards */}
        <div className="space-y-4">
          {list.map(inst => (
            <Card key={inst.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${GRADE_COLORS[inst.health_grade] ?? "text-muted-foreground"}`}>
                      {inst.health_grade}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Institution {inst.institution_id?.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">Score: {inst.health_score} · Completion: {inst.deal_completion_rate}%</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Rev/Member: PKR {Math.round(inst.revenue_per_member).toLocaleString()}</Badge>
                    <Badge variant="secondary">Idle: {inst.idle_talent_percent}%</Badge>
                    <Badge variant="secondary">Utilization: {inst.skill_utilization_ratio}%</Badge>
                  </div>
                </div>

                {/* Early Warnings */}
                {(inst.early_warnings as unknown as string[])?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {(inst.early_warnings as unknown as string[]).map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-500/5 p-2 rounded">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> {w}
                      </div>
                    ))}
                  </div>
                )}

                {/* Intervention Suggestions */}
                {(inst.intervention_suggestions as unknown as string[])?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(inst.intervention_suggestions as unknown as string[]).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-blue-700 bg-blue-500/5 p-2 rounded">
                        <ShieldCheck className="h-4 w-4 shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {list.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No institutional health data computed yet
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
