import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Droplets, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Navbar } from "@/components/layout/Navbar";

export default function GlobalLiquidityAnalyticsPage() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["global-liquidity-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_liquidity_metrics")
        .select("*")
        .order("total_volume", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalDeals = metrics.reduce((s: number, m: any) => s + (m.active_deals ?? 0), 0);
  const totalVolume = metrics.reduce((s: number, m: any) => s + Number(m.total_volume ?? 0), 0);

  const chartData = metrics.map((m: any) => ({
    name: m.region,
    deals: m.active_deals,
    volume: Number(m.total_volume),
    velocity: Number(m.deal_velocity),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Global Liquidity</h1>
            <p className="text-muted-foreground">Region-by-region economic activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Regions Active</p>
            <p className="text-3xl font-bold">{metrics.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Active Deals</p>
            <p className="text-3xl font-bold">{totalDeals}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-3xl font-bold">PKR {totalVolume.toLocaleString()}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Deal Volume by Region</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deals" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                {isLoading ? "Loading..." : "No regional data yet"}
              </div>
            )}
          </CardContent>
        </Card>

        {metrics.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Region Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {metrics.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="font-medium">{m.region}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{m.active_deals} deals</Badge>
                    <Badge variant="secondary">Trust {Number(m.avg_trust_score).toFixed(0)}</Badge>
                    <Badge>Velocity {Number(m.deal_velocity).toFixed(1)}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
