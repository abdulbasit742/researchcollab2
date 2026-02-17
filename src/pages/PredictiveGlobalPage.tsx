import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePredictiveRegions, usePredictiveSkills } from "@/hooks/useHumanCapitalIndex";
import { Brain, Globe, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const LIFECYCLE_COLORS: Record<string, string> = {
  emerging: "bg-blue-500", growth: "bg-green-500", peak: "bg-yellow-500", saturation: "bg-orange-500", decline: "bg-red-500",
};

const PredictiveGlobalPage = () => {
  const { data: regions } = usePredictiveRegions();
  const { data: skills } = usePredictiveSkills();

  const regionChart = (regions || []).slice(0, 10).map((r) => ({
    region: r.region_code,
    growth: Number(r.growth_probability || 0),
    stagnation: Number(r.stagnation_risk || 0),
    collapse: Number(r.collapse_risk || 0),
  }));

  return (
    <MainLayout>
      <Helmet><title>Predictive Modeling | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Predictive Civilization Advisory</h1>
            <p className="text-muted-foreground">6–24 month forecasting for regions, skills, and capital stability. Advisory only.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Globe className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Region Forecasts</span></div><p className="text-3xl font-bold">{(regions || []).length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Skill Models</span></div><p className="text-3xl font-bold">{(skills || []).length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">High Collapse Risk</span></div><p className="text-3xl font-bold text-destructive">{(regions || []).filter(r => Number(r.collapse_risk) > 50).length}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Regional Growth vs Risk</CardTitle></CardHeader>
          <CardContent>
            {regionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="growth" fill="#22c55e" radius={[4, 4, 0, 0]} name="Growth %" />
                  <Bar dataKey="stagnation" fill="#eab308" radius={[4, 4, 0, 0]} name="Stagnation %" />
                  <Bar dataKey="collapse" fill="#ef4444" radius={[4, 4, 0, 0]} name="Collapse %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No regional forecast data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skill Lifecycle Models</CardTitle><CardDescription>AI-projected lifecycle stages</CardDescription></CardHeader>
          <CardContent>
            {(skills || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No skill models computed yet.</p>
            ) : (
              <div className="space-y-3">
                {(skills || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{s.skill_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Obsolescence risk: {Number(s.obsolescence_risk || 0).toFixed(0)}% · Wage: {s.wage_trend}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${LIFECYCLE_COLORS[s.lifecycle_stage || ""] || "bg-gray-400"}`} />
                      <Badge variant="outline" className="capitalize">{s.lifecycle_stage || "unknown"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PredictiveGlobalPage;
