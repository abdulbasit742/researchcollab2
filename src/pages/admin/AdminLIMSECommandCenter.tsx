import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLIMSEStats, useInstitutionHealth, useMarketAdjustments, useSkillForecasts } from "@/hooks/useLIMSE";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Gauge, AlertTriangle, Building2, Shield, Flame, TrendingUp } from "lucide-react";

export default function AdminLIMSECommandCenter() {
  const { metrics, avgLiquidity, scarce, oversupplied, totalSkills, topSkill } = useLIMSEStats();
  const { data: institutions } = useInstitutionHealth();
  const { data: adjustments } = useMarketAdjustments();
  const { data: forecasts } = useSkillForecasts();

  const instList = institutions ?? [];
  const adjList = adjustments ?? [];
  const forecastList = forecasts ?? [];

  const atRiskInstitutions = instList.filter(i => i.health_grade === "D" || i.health_grade === "F");
  const risingSkills = forecastList.filter(f => f.signal === "rising");

  const volatilityIndex = scarce.length + oversupplied.length;

  const chartData = metrics.slice(0, 15).map(m => ({
    name: m.skill_name?.length > 8 ? m.skill_name.slice(0, 8) + "…" : m.skill_name,
    liquidity: m.liquidity_score,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Gauge className="h-8 w-8 text-primary" />
            LIMSE Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Global Intelligence — Liquidity, Risk, Institutions, Stabilization
          </p>
        </div>

        {/* Key Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Liquidity</p>
            <p className="text-2xl font-bold">{avgLiquidity}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Volatility Index</p>
            <p className={`text-2xl font-bold ${volatilityIndex > 5 ? "text-destructive" : "text-green-600"}`}>
              {volatilityIndex}
            </p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Skills Monitored</p>
            <p className="text-2xl font-bold">{totalSkills}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">At-Risk Institutions</p>
            <p className="text-2xl font-bold text-destructive">{atRiskInstitutions.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Stabilizations</p>
            <p className="text-2xl font-bold">{adjList.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Rising Skills</p>
            <p className="text-2xl font-bold text-green-600">{risingSkills.length}</p>
          </CardContent></Card>
        </div>

        {/* Liquidity Overview */}
        <Card>
          <CardHeader><CardTitle>Skill Liquidity Distribution</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="liquidity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Alerts */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Active Risk Flags
            </CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {scarce.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                  <span className="text-sm">{m.skill_name}</span>
                  <Badge variant="destructive">Scarce ({m.liquidity_score})</Badge>
                </div>
              ))}
              {oversupplied.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-amber-500/5">
                  <span className="text-sm">{m.skill_name}</span>
                  <Badge className="bg-amber-500/10 text-amber-700">Oversupplied</Badge>
                </div>
              ))}
              {scarce.length === 0 && oversupplied.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No active risk flags</p>
              )}
            </CardContent>
          </Card>

          {/* Institution Risk */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Institutional Risk Clusters
            </CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {atRiskInstitutions.map(i => (
                <div key={i.id} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                  <span className="text-sm">Institution {i.institution_id?.slice(0, 8)}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Grade {i.health_grade}</Badge>
                    <span className="text-xs text-muted-foreground">{i.health_score}/100</span>
                  </div>
                </div>
              ))}
              {atRiskInstitutions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No institutional risks detected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Stabilization Actions */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Recent Stabilization Actions
          </CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {adjList.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <span className="text-sm font-medium">{a.adjustment_type}</span>
                  {a.skill_name && <span className="text-xs text-muted-foreground ml-2">({a.skill_name})</span>}
                  <p className="text-xs text-muted-foreground">{a.action_taken}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {adjList.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No stabilization actions logged</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
