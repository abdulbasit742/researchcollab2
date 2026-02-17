import { Helmet } from "react-helmet-async";
import { MainLayout as AppLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRiskExposure } from "@/hooks/useCapitalEngine";
import { ShieldAlert, TrendingDown, Building2, Coins, Users, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const RISK_COLORS = { low: "#22c55e", moderate: "#eab308", high: "#f97316", critical: "#ef4444" };

const CapitalRiskIntelligencePage = () => {
  const { data: exposures, isLoading } = useRiskExposure();

  const byLevel = (exposures || []).reduce((acc, e) => {
    acc[e.risk_level] = (acc[e.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(byLevel).map(([name, value]) => ({ name, value }));

  const byEntity = (exposures || []).reduce((acc, e) => {
    acc[e.entity_type] = (acc[e.entity_type] || 0) + Number(e.exposure_amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(byEntity).map(([type, amount]) => ({ type, amount }));

  const ENTITY_ICONS: Record<string, any> = {
    user: Users, institution: Building2, pool: Coins, sector: TrendingDown, currency: Coins,
  };

  return (
    <AppLayout>
      <Helmet><title>Capital Risk Intelligence | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Capital Risk Intelligence</h1>
            <p className="text-muted-foreground mt-1">Real-time monitoring of over-leverage, sector downturns, and concentration risk.</p>
          </div>
          <Badge variant="outline" className="text-sm">Admin Only</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Exposures", value: (exposures || []).length, icon: ShieldAlert },
            { label: "Critical", value: byLevel.critical || 0, icon: AlertTriangle, color: "text-red-500" },
            { label: "High", value: byLevel.high || 0, icon: AlertTriangle, color: "text-orange-500" },
            { label: "Low/Moderate", value: (byLevel.low || 0) + (byLevel.moderate || 0), icon: ShieldAlert, color: "text-green-500" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`h-4 w-4 ${s.color || "text-muted-foreground"}`} />
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">No exposure data yet</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Exposure by Entity Type</CardTitle></CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">No exposure data yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Exposures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Risk Entries</CardTitle>
            <CardDescription>Latest {Math.min((exposures || []).length, 20)} logged exposures</CardDescription>
          </CardHeader>
          <CardContent>
            {(exposures || []).length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No risk exposures logged yet.</div>
            ) : (
              <div className="space-y-2">
                {(exposures || []).slice(0, 20).map((exp) => {
                  const Icon = ENTITY_ICONS[exp.entity_type] || ShieldAlert;
                  return (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium capitalize">{exp.entity_type}</span>
                          <span className="text-xs text-muted-foreground ml-2">{exp.entity_id?.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">PKR {Number(exp.exposure_amount || 0).toLocaleString()}</span>
                        <Badge variant={exp.risk_level === "critical" || exp.risk_level === "high" ? "destructive" : "secondary"}>
                          {exp.risk_level}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CapitalRiskIntelligencePage;
