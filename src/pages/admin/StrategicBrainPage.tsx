import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, TrendingUp, AlertTriangle, Shield, BarChart3, Zap, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const StrategicBrainPage = () => {
  const { data: momentum } = useQuery({
    queryKey: ["sector-momentum-index"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sector_momentum_index").select("*").order("computed_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: efficiency } = useQuery({
    queryKey: ["capital-efficiency-index"],
    queryFn: async () => {
      const { data, error } = await supabase.from("capital_efficiency_index").select("*").order("computed_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: risks } = useQuery({
    queryKey: ["systemic-risk-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("systemic_risk_alerts").select("*").eq("is_active", true).order("detected_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: briefings } = useQuery({
    queryKey: ["strategic-briefings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("strategic_briefing_requests").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const sectors = [...new Set((momentum || []).map(m => m.sector))];
  const sectorChart = sectors.map(s => {
    const entries = (momentum || []).filter(m => m.sector === s);
    const avg = entries.length ? entries.reduce((sum, e) => sum + Number(e.momentum_score || 0), 0) / entries.length : 0;
    return { sector: s, score: Number(avg.toFixed(1)) };
  });

  const activeRisks = (risks || []).filter(r => r.is_active);
  const criticalRisks = activeRisks.filter(r => r.severity === "critical" || r.severity === "high");

  return (
    <MainLayout>
      <Helmet><title>Strategic Innovation Brain | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">National Strategic Innovation Brain</h1>
            <p className="text-muted-foreground">Macro-level decision support for national innovation strategy.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Sectors Tracked", value: sectors.length, icon: BarChart3 },
            { label: "Efficiency Entries", value: efficiency?.length || 0, icon: TrendingUp },
            { label: "Active Risks", value: activeRisks.length, icon: AlertTriangle },
            { label: "Critical Alerts", value: criticalRisks.length, icon: Shield },
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

        <Tabs defaultValue="momentum">
          <TabsList>
            <TabsTrigger value="momentum">Sector Momentum</TabsTrigger>
            <TabsTrigger value="efficiency">Capital Efficiency</TabsTrigger>
            <TabsTrigger value="risks">Systemic Risks</TabsTrigger>
            <TabsTrigger value="briefings">Briefings</TabsTrigger>
          </TabsList>

          <TabsContent value="momentum">
            <Card>
              <CardHeader><CardTitle>Sector Momentum Index</CardTitle></CardHeader>
              <CardContent>
                {sectorChart.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectorChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No momentum data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency">
            <div className="space-y-3">
              {(efficiency || []).map(e => (
                <Card key={e.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{e.entity_type} — {e.period}</p>
                        <p className="text-sm text-muted-foreground">
                          Capital: PKR {Number(e.total_capital_deployed).toLocaleString()} | Efficiency: {Number(e.efficiency_score).toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Employment: {e.employment_conversions}</p>
                        <p>Startups: {e.startup_conversions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!efficiency?.length && <p className="text-muted-foreground text-center py-8">No efficiency data yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="space-y-3">
              {activeRisks.map(r => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{r.risk_type}</p>
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                        {r.affected_sector && <Badge variant="outline" className="mt-1">{r.affected_sector}</Badge>}
                      </div>
                      <Badge variant={r.severity === "critical" || r.severity === "high" ? "destructive" : "secondary"}>{r.severity}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!activeRisks.length && <p className="text-muted-foreground text-center py-8">No active risk alerts.</p>}
            </div>
          </TabsContent>

          <TabsContent value="briefings">
            <div className="space-y-3">
              {(briefings || []).map(b => (
                <Card key={b.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{b.topic}</p>
                        <p className="text-sm text-muted-foreground">Scope: {b.data_scope || "—"} | Sensitivity: {b.risk_sensitivity}</p>
                      </div>
                      <Badge variant={b.status === "delivered" ? "default" : "secondary"}>{b.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!briefings?.length && <p className="text-muted-foreground text-center py-8">No briefing requests yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StrategicBrainPage;
