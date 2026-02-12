import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/currency";
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function AdminProfitDashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ["profit-metrics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_profit_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const { data: distribution } = useQuery({
    queryKey: ["revenue-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("revenue_distribution_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const { data: complexityItems } = useQuery({
    queryKey: ["complexity-registry"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feature_complexity_registry")
        .select("*")
        .order("complexity_score", { ascending: false });
      return data ?? [];
    },
  });

  const latest = metrics?.[0];
  const prevMonth = metrics?.[1];

  const revenueBreakdown = latest ? [
    { name: "Platform Fees", value: Number(latest.platform_fee_revenue) || 0 },
    { name: "Subscriptions", value: Number(latest.subscription_revenue) || 0 },
    { name: "Intelligence", value: Number(latest.intelligence_revenue) || 0 },
  ] : [];

  const trendData = (metrics ?? []).slice(0, 12).reverse().map((m: any) => ({
    date: m.date,
    revenue: Number(m.gross_revenue) || 0,
    margin: Number(m.net_margin) || 0,
    cost: Number(m.infrastructure_cost_estimate) || 0,
  }));

  const latestDist = distribution?.[0];
  const hasConcentrationRisk = latestDist?.risk_flag;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Profit Dashboard</h1>
          <p className="text-muted-foreground">Financial performance & optimization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-2xl font-bold">{formatPKR(Number(latest?.gross_revenue) || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold">{formatPKR(Number(latest?.net_margin) || 0)}</p>
                </div>
                {Number(latest?.net_margin) >= Number(prevMonth?.net_margin || 0)
                  ? <TrendingUp className="h-8 w-8 text-emerald-500" />
                  : <TrendingDown className="h-8 w-8 text-destructive" />}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue/User</p>
                  <p className="text-2xl font-bold">{formatPKR(Number(latest?.revenue_per_user) || 0)}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue/Institution</p>
                  <p className="text-2xl font-bold">{formatPKR(Number(latest?.revenue_per_institution) || 0)}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="concentration">Concentration Risk</TabsTrigger>
            <TabsTrigger value="complexity">Complexity Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader><CardTitle>Revenue & Margin Trends</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="margin" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Margin" />
                      <Line type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" name="Infra Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <Card>
              <CardHeader><CardTitle>Revenue Sources</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                        {revenueBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concentration">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue Concentration</CardTitle>
                  {hasConcentrationRisk && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> High Concentration Risk
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Top 1% Revenue Share</p>
                    <p className="text-2xl font-bold">{Number(latestDist?.top_1_percent_revenue || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Top 10% Revenue Share</p>
                    <p className="text-2xl font-bold">{Number(latestDist?.top_10_percent_revenue || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Institutional Share</p>
                    <p className="text-2xl font-bold">{Number(latestDist?.institutional_share || 0).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Freelancer Share</p>
                    <p className="text-2xl font-bold">{Number(latestDist?.freelancer_share || 0).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complexity">
            <Card>
              <CardHeader><CardTitle>Feature Complexity Registry</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(complexityItems ?? []).map((item: any) => {
                    const shouldArchive = item.complexity_score > 7 && item.usage_rate < 5;
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${shouldArchive ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                        <div>
                          <p className="font-medium">{item.feature_name}</p>
                          <p className="text-xs text-muted-foreground">Usage: {item.usage_rate}% · Revenue Impact: {formatPKR(Number(item.revenue_impact))}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.complexity_score > 7 ? "destructive" : item.complexity_score > 4 ? "secondary" : "outline"}>
                            Complexity: {item.complexity_score}/10
                          </Badge>
                          {shouldArchive && <Badge variant="destructive">Archive Candidate</Badge>}
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Archived"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {(complexityItems ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No features registered yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
