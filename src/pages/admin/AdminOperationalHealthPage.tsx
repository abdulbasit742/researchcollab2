import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Timer, BarChart3, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

function useOperationalHealth() {
  return useQuery({
    queryKey: ["operational-health"],
    queryFn: async () => {
      const [projectsRes, bidsRes, dealsRes, completedRes, disputesRes, trustRes, cancelledRes] = await Promise.all([
        supabase.from("earning_projects").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("earning_bids").select("id", { count: "exact", head: true }),
        supabase.from("deal_rooms").select("id", { count: "exact", head: true }),
        supabase.from("deal_rooms").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("user_trust_profiles").select("trust_score"),
        supabase.from("deal_rooms").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      ]);

      const totalBids = bidsRes.count || 0;
      const totalDeals = dealsRes.count || 0;
      const completedDeals = completedRes.count || 0;
      const cancelledDeals = cancelledRes.count || 0;
      const openDisputes = disputesRes.count || 0;
      const trustScores = (trustRes.data || []).map((t: any) => t.trust_score || 0);
      const avgTrust = trustScores.length ? trustScores.reduce((s: number, v: number) => s + v, 0) / trustScores.length : 0;
      const trustVol = trustScores.length > 1
        ? Math.sqrt(trustScores.reduce((s: number, v: number) => s + Math.pow(v - avgTrust, 2), 0) / trustScores.length)
        : 0;

      const bidToDealRatio = totalBids > 0 ? ((totalDeals / totalBids) * 100) : 0;
      const dealCompletionRate = totalDeals > 0 ? ((completedDeals / totalDeals) * 100) : 0;
      const abandonmentRate = totalDeals > 0 ? ((cancelledDeals / totalDeals) * 100) : 0;
      const disputeFrequency = totalDeals > 0 ? ((openDisputes / totalDeals) * 100) : 0;

      return {
        openProjects: projectsRes.count || 0,
        totalBids,
        totalDeals,
        completedDeals,
        bidToDealRatio,
        dealCompletionRate,
        abandonmentRate,
        disputeFrequency,
        avgTrust: Math.round(avgTrust),
        trustVolatility: Math.round(trustVol * 10) / 10,
        openDisputes,
      };
    },
    refetchInterval: 60000,
  });
}

export default function AdminOperationalHealthPage() {
  const { data, isLoading, refetch } = useOperationalHealth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        </main>
      </div>
    );
  }

  const metrics = [
    { label: "Open Projects", value: data?.openProjects || 0, icon: BarChart3, color: "text-primary" },
    { label: "Total Bids", value: data?.totalBids || 0, icon: TrendingUp, color: "text-primary" },
    { label: "Total Deals", value: data?.totalDeals || 0, icon: Activity, color: "text-primary" },
    { label: "Completed Deals", value: data?.completedDeals || 0, icon: CheckCircle2, color: "text-emerald-500" },
  ];

  const rates = [
    { label: "Bid→Deal Rate", value: `${(data?.bidToDealRatio || 0).toFixed(1)}%`, status: (data?.bidToDealRatio || 0) > 10 ? "healthy" : "warning" },
    { label: "Deal Completion", value: `${(data?.dealCompletionRate || 0).toFixed(1)}%`, status: (data?.dealCompletionRate || 0) > 50 ? "healthy" : "warning" },
    { label: "Abandonment Rate", value: `${(data?.abandonmentRate || 0).toFixed(1)}%`, status: (data?.abandonmentRate || 0) < 20 ? "healthy" : "critical" },
    { label: "Dispute Frequency", value: `${(data?.disputeFrequency || 0).toFixed(1)}%`, status: (data?.disputeFrequency || 0) < 10 ? "healthy" : "warning" },
  ];

  const barData = [
    { name: "Bids", value: data?.totalBids || 0 },
    { name: "Deals", value: data?.totalDeals || 0 },
    { name: "Completed", value: data?.completedDeals || 0 },
    { name: "Disputes", value: data?.openDisputes || 0 },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Operational Health
            </h1>
            <p className="text-sm text-muted-foreground">Core economic loop performance metrics</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Volume Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(m => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-3xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rates.map(r => (
            <Card key={r.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{r.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{r.value}</span>
                  <Badge variant={r.status === "healthy" ? "outline" : "destructive"} className="text-xs">
                    {r.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust + Pipeline Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trust Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Trust Score</p>
                  <p className="text-3xl font-bold">{data?.avgTrust || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trust Volatility</p>
                  <p className="text-3xl font-bold">{data?.trustVolatility || 0}</p>
                  <p className="text-xs text-muted-foreground">σ (standard deviation)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
