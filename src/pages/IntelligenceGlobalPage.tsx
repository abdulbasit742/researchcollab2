import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIndexCalculations } from "@/hooks/useHumanCapitalIndex";
import { BarChart3, Globe, TrendingUp, Shield, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const INDEX_LABELS: Record<string, { label: string; icon: any; description: string }> = {
  RPI: { label: "Regional Productivity Index", icon: Globe, description: "Deal velocity, revenue per professional, completion reliability" },
  IEI: { label: "Institutional Execution Index", icon: Users, description: "Student revenue, trust growth, research commercialization" },
  PIMI: { label: "Professional Income Mobility", icon: TrendingUp, description: "Income acceleration, skill expansion, credit improvement" },
  GSHI: { label: "Global Skill Health Index", icon: Activity, description: "Supply-demand balance, wage growth, liquidity trend" },
  TSI: { label: "Trust Stability Index", icon: Shield, description: "Trust volatility, reputation recovery, dispute frequency" },
};

const IntelligenceGlobalPage = () => {
  const { data: indices } = useIndexCalculations();

  const byIndex = Object.keys(INDEX_LABELS).map((name) => {
    const entries = (indices || []).filter((i) => i.index_name === name);
    const avgScore = entries.length > 0 ? entries.reduce((s, e) => s + Number(e.score), 0) / entries.length : 0;
    return { name, avgScore: Number(avgScore.toFixed(1)), count: entries.length };
  });

  return (
    <MainLayout>
      <Helmet><title>Global Intelligence | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Civilizational Intelligence Dashboard</h1>
            <p className="text-muted-foreground">Trust-backed, execution-verified global productivity indices.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {byIndex.map((idx) => {
            const cfg = INDEX_LABELS[idx.name];
            const Icon = cfg.icon;
            return (
              <Card key={idx.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{idx.name}</span>
                  </div>
                  <p className="text-2xl font-bold">{idx.avgScore}</p>
                  <p className="text-xs text-muted-foreground">{idx.count} entries</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle>Index Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byIndex}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(INDEX_LABELS).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" /> {cfg.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cfg.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default IntelligenceGlobalPage;
