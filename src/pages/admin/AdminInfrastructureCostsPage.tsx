import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/currency";
import { Server, Cpu, Database, HardDrive } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminInfrastructureCostsPage() {
  const { data: metrics } = useQuery({
    queryKey: ["infra-cost-metrics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_profit_metrics")
        .select("date, infrastructure_cost_estimate, active_users, revenue_per_user")
        .order("date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const { data: ltvData } = useQuery({
    queryKey: ["user-ltv-overview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_ltv_metrics")
        .select("*")
        .order("projected_lifetime_value", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const costTrend = (metrics ?? []).slice(0, 12).reverse().map((m: any) => ({
    date: m.date,
    cost: Number(m.infrastructure_cost_estimate) || 0,
    costPerUser: m.active_users > 0 ? Number(m.infrastructure_cost_estimate) / m.active_users : 0,
  }));

  const totalCost = Number(metrics?.[0]?.infrastructure_cost_estimate || 0);
  const activeUsers = metrics?.[0]?.active_users || 1;
  const costPerUser = totalCost / activeUsers;

  const avgLTV = ltvData?.length
    ? (ltvData as any[]).reduce((sum, l) => sum + Number(l.projected_lifetime_value || 0), 0) / ltvData.length
    : 0;

  const highChurnUsers = (ltvData ?? []).filter((l: any) => Number(l.churn_risk_score) > 70);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Infrastructure & LTV</h1>
          <p className="text-muted-foreground">Cost control, lifetime value & performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-sm text-muted-foreground">Infra Cost</p>
                  <p className="text-xl font-bold">{formatPKR(totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Cpu className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-sm text-muted-foreground">Cost/User</p>
                  <p className="text-xl font-bold">{formatPKR(Math.round(costPerUser))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary opacity-50" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg LTV</p>
                  <p className="text-xl font-bold">{formatPKR(Math.round(avgLTV))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-destructive opacity-50" />
                <div>
                  <p className="text-sm text-muted-foreground">High Churn Risk</p>
                  <p className="text-xl font-bold">{highChurnUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>Infrastructure Cost Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} name="Total Cost" />
                    <Area type="monotone" dataKey="costPerUser" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} name="Cost/User" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top LTV Users</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(ltvData ?? []).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{user.user_id?.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Deals: {user.deal_completion_count} · Fees: {formatPKR(Number(user.total_fees_paid))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatPKR(Number(user.projected_lifetime_value))}</span>
                      {Number(user.churn_risk_score) > 70 && (
                        <Badge variant="destructive">Churn Risk</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {(ltvData ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No LTV data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
