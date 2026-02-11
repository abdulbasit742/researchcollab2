import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Target,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  ArrowRight,
  Repeat,
} from "lucide-react";

function useConversionMetrics() {
  return useQuery({
    queryKey: ["admin-conversion-metrics"],
    queryFn: async () => {
      const [usersRes, bidsRes, dealsRes, milestonesRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact", head: false }).limit(1000),
        supabase.from("earning_bids").select("id, bidder_id, created_at, status, project_id").limit(1000),
        supabase.from("deal_rooms").select("id, status, created_at, buyer_id").limit(500),
        supabase.from("milestones").select("id, status, created_at").limit(500),
        supabase.from("earning_projects").select("id, owner_id, status, created_at").limit(500),
      ]);

      const users = usersRes.data || [];
      const bids = bidsRes.data || [];
      const deals = dealsRes.data || [];
      const milestones = milestonesRes.data || [];
      const projects = projectsRes.data || [];

      const totalUsers = users.length;
      const usersWithBids = new Set(bids.map((b) => b.bidder_id)).size;
      const signupToBid = totalUsers > 0 ? Math.round((usersWithBids / totalUsers) * 100) : 0;

      const totalBids = bids.length;
      const totalDeals = deals.length;
      const bidToDeal = totalBids > 0 ? Math.round((totalDeals / totalBids) * 100) : 0;

      const completedDeals = deals.filter((d) => d.status === "completed").length;
      const dealToCompletion = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;

      const completedMilestones = milestones.filter((m) => m.status === "approved" || m.status === "released").length;

      // Repeat project rate
      const ownerCounts: Record<string, number> = {};
      projects.forEach((p) => {
        if (p.owner_id) ownerCounts[p.owner_id] = (ownerCounts[p.owner_id] || 0) + 1;
      });
      const repeatPosters = Object.values(ownerCounts).filter((c) => c > 1).length;
      const uniquePosters = Object.keys(ownerCounts).length;
      const repeatRate = uniquePosters > 0 ? Math.round((repeatPosters / uniquePosters) * 100) : 0;

      // Funnel data for chart
      const funnelData = [
        { stage: "Signups", count: totalUsers },
        { stage: "First Bid", count: usersWithBids },
        { stage: "Deal Created", count: totalDeals },
        { stage: "Deal Completed", count: completedDeals },
      ];

      return {
        signupToBid,
        bidToDeal,
        dealToCompletion,
        repeatRate,
        totalUsers,
        totalBids,
        totalDeals,
        completedDeals,
        completedMilestones,
        funnelData,
      };
    },
    staleTime: 60_000,
  });
}

const metricCards = [
  { key: "signupToBid", label: "Signup → First Bid", icon: Users, suffix: "%" },
  { key: "bidToDeal", label: "Bid → Deal", icon: Briefcase, suffix: "%" },
  { key: "dealToCompletion", label: "Deal → Completion", icon: Target, suffix: "%" },
  { key: "repeatRate", label: "Repeat Project Rate", icon: Repeat, suffix: "%" },
] as const;

export default function AdminConversionMetricsPage() {
  const { data, isLoading } = useConversionMetrics();

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Conversion Metrics
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Core economic loop: Project → Bid → Deal → Completion
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metricCards.map((card) => {
                const Icon = card.icon;
                const value = data?.[card.key];
                return (
                  <Card key={card.key}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{card.label}</span>
                      </div>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {value}{card.suffix}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Funnel Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data?.funnelData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="stage" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Raw Numbers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Raw Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    {[
                      { label: "Total Users", value: data?.totalUsers },
                      { label: "Total Bids", value: data?.totalBids },
                      { label: "Total Deals", value: data?.totalDeals },
                      { label: "Completed Deals", value: data?.completedDeals },
                      { label: "Milestones Done", value: data?.completedMilestones },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-lg bg-accent/30">
                        <p className="text-2xl font-bold">{item.value ?? 0}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
