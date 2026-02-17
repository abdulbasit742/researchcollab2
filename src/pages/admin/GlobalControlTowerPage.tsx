import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe, BarChart3, TrendingUp, AlertTriangle, Layers, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GlobalControlTowerPage = () => {
  const { data: globalWarehouse } = useQuery({
    queryKey: ["global-intel-warehouse"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_intelligence_warehouse").select("*").order("computed_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: crossBorderSims } = useQuery({
    queryKey: ["cross-border-sims"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cross_border_simulations").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: nodeProtocols } = useQuery({
    queryKey: ["node-protocols"],
    queryFn: async () => {
      const { data, error } = await supabase.from("innovation_node_protocols").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalFunding = (globalWarehouse || []).reduce((s, g) => s + Number(g.national_funding_total || 0), 0);
  const avgSignal = globalWarehouse?.length
    ? ((globalWarehouse || []).reduce((s, g) => s + Number(g.innovation_signal_score || 0), 0) / globalWarehouse.length).toFixed(1)
    : "0";
  const activeNodes = (nodeProtocols || []).filter(n => n.interop_enabled).length;

  const chartData = (globalWarehouse || []).slice(0, 10).reverse().map(g => ({
    period: g.period,
    signal: Number(g.innovation_signal_score),
    efficiency: Number(g.capital_efficiency_avg),
  }));

  return (
    <MainLayout>
      <Helmet><title>Global Control Tower | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Global Innovation Control Tower</h1>
            <p className="text-muted-foreground">Multi-nation intelligence grid — sovereign data, global insight.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Global Funding", value: `$${(totalFunding / 1e6).toFixed(1)}M`, icon: BarChart3 },
            { label: "Avg Signal", value: avgSignal, icon: TrendingUp },
            { label: "Active Nodes", value: activeNodes, icon: Layers },
            { label: "Simulations", value: crossBorderSims?.length || 0, icon: Zap },
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

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Global Overview</TabsTrigger>
            <TabsTrigger value="simulations">Cross-Border Sims</TabsTrigger>
            <TabsTrigger value="nodes">Country Nodes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle>Global Innovation Signal & Efficiency</CardTitle></CardHeader>
              <CardContent>
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="signal" fill="hsl(var(--primary))" name="Signal Score" />
                      <Bar dataKey="efficiency" fill="hsl(var(--accent))" name="Efficiency" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No global data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulations">
            <div className="space-y-3">
              {(crossBorderSims || []).map(s => (
                <Card key={s.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Capital: ${Number(s.capital_amount).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Sector: {s.sector || "—"}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Employment: {Number(s.projected_employment).toFixed(0)}</p>
                        <p>Completion: {Number(s.projected_completion_rate).toFixed(1)}%</p>
                        <Badge variant={s.regulatory_risk === "high" ? "destructive" : "secondary"}>{s.regulatory_risk} risk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!crossBorderSims?.length && <p className="text-muted-foreground text-center py-8">No simulations yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="nodes">
            <div className="space-y-3">
              {(nodeProtocols || []).map(n => (
                <Card key={n.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Protocol v{n.protocol_version}</p>
                        <p className="text-sm text-muted-foreground">
                          Last sync: {n.last_sync_at ? new Date(n.last_sync_at).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                      <Badge variant={n.interop_enabled ? "default" : "secondary"}>
                        {n.interop_enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!nodeProtocols?.length && <p className="text-muted-foreground text-center py-8">No country nodes configured.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GlobalControlTowerPage;
