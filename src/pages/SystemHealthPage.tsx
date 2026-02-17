import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSystemHealth, useAntifragility, useOptimizationProposals } from "@/hooks/useHumanCapitalIndex";
import { Activity, Shield, Wrench, TrendingUp, Gauge } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SystemHealthPage = () => {
  const { data: snapshots } = useSystemHealth();
  const { data: antifragility } = useAntifragility();
  const { data: proposals } = useOptimizationProposals();

  const latest = snapshots?.[0];
  const afScore = (antifragility || []).reduce((s, a) => s + Number(a.score), 0) / Math.max((antifragility || []).length, 1);

  const trendData = (snapshots || []).slice(0, 20).reverse().map((s, i) => ({
    idx: i + 1,
    health: Number(s.overall_score || 0),
    antifragility: Number(s.antifragility_score || 0),
    complexity: Number(s.complexity_score || 0),
  }));

  return (
    <MainLayout>
      <Helmet><title>System Health | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health & Self-Optimization</h1>
            <p className="text-muted-foreground">Antifragility index, structural friction, and optimization proposals.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Overall Health</p><p className="text-3xl font-bold">{Number(latest?.overall_score || 0).toFixed(0)}/100</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Antifragility</p><p className="text-3xl font-bold">{afScore.toFixed(0)}/100</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Friction Points</p><p className="text-3xl font-bold">{latest?.friction_count || 0}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active Optimizations</p><p className="text-3xl font-bold">{latest?.active_optimizations || 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Health Trend</CardTitle></CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="health" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Health" />
                  <Line type="monotone" dataKey="antifragility" stroke="#22c55e" strokeWidth={2} dot={false} name="Antifragility" />
                  <Line type="monotone" dataKey="complexity" stroke="#eab308" strokeWidth={2} dot={false} name="Complexity" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No health snapshots yet</div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Antifragility Breakdown</CardTitle></CardHeader>
            <CardContent>
              {(antifragility || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No antifragility measurements yet.</p>
              ) : (
                <div className="space-y-3">
                  {(antifragility || []).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm capitalize">{a.metric_type.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{Number(a.score).toFixed(0)}</span>
                        <Badge variant={a.trend === "improving" ? "default" : a.trend === "declining" ? "destructive" : "secondary"}>{a.trend}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Optimization Proposals</CardTitle></CardHeader>
            <CardContent>
              {(proposals || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No optimization proposals yet.</p>
              ) : (
                <div className="space-y-3">
                  {(proposals || []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="text-sm font-medium">{p.title}</span>
                        {p.root_cause && <p className="text-xs text-muted-foreground">{p.root_cause}</p>}
                      </div>
                      <Badge variant={p.status === "activated" ? "default" : "secondary"}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemHealthPage;
