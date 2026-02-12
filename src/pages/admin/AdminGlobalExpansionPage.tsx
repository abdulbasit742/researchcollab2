import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Building2, Droplets, Trophy, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminGlobalExpansionPage() {
  const { data: liquidityMetrics = [] } = useQuery({
    queryKey: ["admin-global-liquidity"],
    queryFn: async () => {
      const { data } = await supabase.from("global_liquidity_metrics").select("*").order("total_volume", { ascending: false });
      return data ?? [];
    },
  });

  const { data: fedNodes = [] } = useQuery({
    queryKey: ["admin-fed-nodes"],
    queryFn: async () => {
      const { data } = await supabase.from("federated_institution_nodes").select("*, organizations(name)");
      return data ?? [];
    },
  });

  const { data: capitalPartners = [] } = useQuery({
    queryKey: ["admin-capital-partnerships"],
    queryFn: async () => {
      const { data } = await supabase.from("capital_partnerships").select("*, organizations(name)");
      return data ?? [];
    },
  });

  const { data: rankings = [] } = useQuery({
    queryKey: ["admin-global-rankings"],
    queryFn: async () => {
      const { data } = await supabase.from("global_trust_rankings").select("*, profiles(full_name)").order("global_rank", { ascending: true }).limit(20);
      return data ?? [];
    },
  });

  const { data: aiPolicies = [] } = useQuery({
    queryKey: ["admin-ai-policies"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_policy_profiles").select("*, organizations(name)");
      return data ?? [];
    },
  });

  const chartData = liquidityMetrics.map((m: any) => ({
    region: m.region,
    volume: Number(m.total_volume),
    deals: m.active_deals,
    trust: Number(m.avg_trust_score),
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" /> Global Expansion Control
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Regions</p>
            <p className="text-3xl font-bold">{liquidityMetrics.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Federated Nodes</p>
            <p className="text-3xl font-bold">{fedNodes.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Capital Partners</p>
            <p className="text-3xl font-bold">{capitalPartners.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">AI Policies Set</p>
            <p className="text-3xl font-bold">{aiPolicies.length}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="liquidity">
          <TabsList>
            <TabsTrigger value="liquidity">Regional Liquidity</TabsTrigger>
            <TabsTrigger value="federation">Federation</TabsTrigger>
            <TabsTrigger value="capital">Capital</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="ai-policies">AI Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="liquidity" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Volume by Region</CardTitle></CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-8">No regional data</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="federation" className="space-y-3">
            {fedNodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No federated nodes registered</p>
            ) : fedNodes.map((n: any) => (
              <Card key={n.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{n.organizations?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Region: {n.region} · Trust ×{Number(n.trust_multiplier).toFixed(1)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{n.verification_level}</Badge>
                    <Badge>{n.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="capital" className="space-y-3">
            {capitalPartners.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No capital partnerships</p>
            ) : capitalPartners.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.organizations?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Pool: PKR {Number(c.funding_pool_size).toLocaleString()}</p>
                  </div>
                  <Badge>{c.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rankings" className="space-y-2">
            {rankings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No rankings computed yet</p>
            ) : rankings.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">#{r.global_rank}</span>
                  <span>{r.profiles?.full_name ?? "Anonymous"}</span>
                </div>
                <div className="flex gap-2">
                  {r.regional_rank && <Badge variant="outline">Regional #{r.regional_rank}</Badge>}
                  {r.category && <Badge variant="secondary">{r.category}</Badge>}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ai-policies" className="space-y-3">
            {aiPolicies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No AI policies configured</p>
            ) : aiPolicies.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.organizations?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      Usage: {p.allowed_ai_usage?.join(", ")} · Attribution: {p.attribution_requirements}
                    </p>
                  </div>
                  <Badge variant="outline">{p.attribution_requirements}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
