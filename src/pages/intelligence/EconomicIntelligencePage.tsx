import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Globe, DollarSign, Factory, Users, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

const SECTORS = ["AI", "Fintech", "Healthtech", "Manufacturing", "Energy", "Agriculture", "SaaS"];

const EconomicIntelligencePage = () => {
  const { data: warehouse } = useQuery({
    queryKey: ["economic-warehouse"],
    queryFn: async () => {
      const { data, error } = await supabase.from("economic_warehouse").select("*").order("computed_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sectorGrowth } = useQuery({
    queryKey: ["sector-growth-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sector_growth_metrics").select("*").order("computed_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: signalIndex } = useQuery({
    queryKey: ["national-signal-index"],
    queryFn: async () => {
      const { data, error } = await supabase.from("national_signal_index").select("*").eq("is_public", true).order("computed_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const totalFunding = (warehouse || []).reduce((s, w) => s + Number(w.funding_volume || 0), 0);
  const totalEmployment = (warehouse || []).reduce((s, w) => s + Number(w.employment_count || 0), 0);
  const totalStartups = (warehouse || []).reduce((s, w) => s + Number(w.startup_count || 0), 0);
  const avgDensity = warehouse?.length ? ((warehouse || []).reduce((s, w) => s + Number(w.innovation_density_score || 0), 0) / warehouse.length).toFixed(1) : "0";

  const sectorChartData = SECTORS.map(s => {
    const entries = (sectorGrowth || []).filter(sg => sg.sector === s);
    const avgMomentum = entries.length ? entries.reduce((sum, e) => sum + Number(e.momentum_score || 0), 0) / entries.length : 0;
    return { sector: s, momentum: Number(avgMomentum.toFixed(1)) };
  });

  return (
    <MainLayout>
      <Helmet><title>Economic Intelligence | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Economic Intelligence Platform</h1>
            <p className="text-muted-foreground">Aggregated, anonymized macro-level innovation intelligence.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Funding", value: `PKR ${(totalFunding / 1e6).toFixed(1)}M`, icon: DollarSign },
            { label: "Employment", value: totalEmployment.toLocaleString(), icon: Users },
            { label: "Startups", value: totalStartups.toLocaleString(), icon: Zap },
            { label: "Avg Density", value: avgDensity, icon: Globe },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="sectors">
          <TabsList>
            <TabsTrigger value="sectors">Sector Growth</TabsTrigger>
            <TabsTrigger value="signal">Signal Index</TabsTrigger>
            <TabsTrigger value="warehouse">Data Warehouse</TabsTrigger>
          </TabsList>

          <TabsContent value="sectors">
            <Card>
              <CardHeader><CardTitle>Sector Momentum Scores</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="momentum" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signal">
            <Card>
              <CardHeader><CardTitle>National Innovation Signal Index</CardTitle></CardHeader>
              <CardContent>
                {signalIndex?.length ? (
                  <div className="space-y-3">
                    {signalIndex.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Period: {s.period}</p>
                          <p className="text-sm text-muted-foreground">Signal Score: {Number(s.signal_score).toFixed(1)}</p>
                        </div>
                        <div className="text-right text-sm space-y-1">
                          <p>Funding Velocity: {Number(s.funding_velocity).toFixed(1)}</p>
                          <p>Employment: {Number(s.employment_conversion).toFixed(1)}%</p>
                          <p>Startups: {Number(s.startup_formation).toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No signal data available yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse">
            <Card>
              <CardHeader><CardTitle>Economic Data Warehouse</CardTitle></CardHeader>
              <CardContent>
                {warehouse?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Period</th>
                          <th className="text-left p-2">Sector</th>
                          <th className="text-right p-2">Funding</th>
                          <th className="text-right p-2">Employment</th>
                          <th className="text-right p-2">Startups</th>
                          <th className="text-right p-2">Density</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouse.map(w => (
                          <tr key={w.id} className="border-b">
                            <td className="p-2">{w.period}</td>
                            <td className="p-2">{w.sector || "—"}</td>
                            <td className="p-2 text-right">PKR {Number(w.funding_volume).toLocaleString()}</td>
                            <td className="p-2 text-right">{w.employment_count}</td>
                            <td className="p-2 text-right">{w.startup_count}</td>
                            <td className="p-2 text-right">{Number(w.innovation_density_score).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No warehouse data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EconomicIntelligencePage;
