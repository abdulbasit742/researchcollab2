import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect } from "react";
import { DollarSign, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function useRevenueIntelligence() {
  return useQuery({
    queryKey: ["sa-revenue"],
    queryFn: async () => {
      // Get active subscriptions with their tier info
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("id, status, tier_id, billing_cycle")
        .eq("status", "active");

      const active = subs || [];

      // Get all tiers for price lookup
      const { data: tiers } = await supabase
        .from("subscription_tiers")
        .select("id, name, price_monthly");

      const tierMap = new Map((tiers || []).map(t => [t.id, t]));

      const mrr = active.reduce((s, sub) => {
        const tier = tierMap.get(sub.tier_id);
        return s + (tier?.price_monthly ?? 0);
      }, 0);
      const arr = mrr * 12;

      const tierDist = active.reduce((acc, s) => {
        const tierName = tierMap.get(s.tier_id)?.name ?? "Unknown";
        acc[tierName] = (acc[tierName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalActive: active.length,
        mrr,
        arr,
        tierDistribution: Object.entries(tierDist).map(([name, value]) => ({ name, value })),
      };
    },
    staleTime: 120_000,
  });
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function SuperAdminRevenuePage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = useRevenueIntelligence();

  useEffect(() => { logAction("view_revenue"); }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global Revenue Intelligence</h1>
            <p className="text-sm text-muted-foreground">Aggregated subscription metrics — no individual wallet data</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Subscriptions", value: data?.totalActive, icon: Users },
              { label: "MRR", value: data ? `PKR ${data.mrr.toLocaleString()}` : undefined, icon: DollarSign },
              { label: "ARR Projection", value: data ? `PKR ${data.arr.toLocaleString()}` : undefined, icon: TrendingUp },
              { label: "Plan Types", value: data?.tierDistribution.length, icon: ArrowUpRight },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <m.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  {isLoading ? <Skeleton className="h-7 w-20 mx-auto" /> : <p className="text-lg font-bold">{m.value ?? "—"}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Distribution</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48" /> : (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={data?.tierDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={2}>
                        {(data?.tierDistribution || []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {(data?.tierDistribution || []).map((t, i) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs capitalize">{t.name}</span>
                        <span className="text-xs font-semibold ml-auto">{t.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
