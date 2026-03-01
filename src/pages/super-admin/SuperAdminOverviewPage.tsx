import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect } from "react";
import {
  Building2, Users, FolderKanban, Milestone, CheckCircle,
  AlertTriangle, Shield, Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function useGlobalKPIs() {
  return useQuery({
    queryKey: ["sa-global-kpis"],
    queryFn: async () => {
      const [orgs, profiles, offers, milestones] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id, status", { count: "exact" }),
        supabase.from("milestones").select("id, status", { count: "exact" }),
      ]);

      const totalMilestones = milestones.data?.length ?? 0;
      const completed = milestones.data?.filter(m => m.status === "approved" || m.status === "released").length ?? 0;
      const disputed = milestones.data?.filter(m => m.status === "disputed").length ?? 0;

      return {
        totalInstitutions: orgs.count ?? 0,
        totalUsers: profiles.count ?? 0,
        totalProjects: offers.count ?? 0,
        totalMilestones,
        completionRate: totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0,
        disputeRatio: totalMilestones > 0 ? Math.round((disputed / totalMilestones) * 100) : 0,
      };
    },
    staleTime: 60_000,
  });
}

function useGrowthTrends() {
  return useQuery({
    queryKey: ["sa-growth-trends"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: recentOffers } = await supabase
        .from("offers")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at");

      // Group by day
      const byDay: Record<string, number> = {};
      (recentOffers || []).forEach(o => {
        const day = o.created_at.slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
      });

      return Object.entries(byDay).map(([date, count]) => ({ date: date.slice(5), count })).slice(-14);
    },
    staleTime: 120_000,
  });
}

export default function SuperAdminOverviewPage() {
  const { logAction } = useSuperAdminAudit();
  const kpis = useGlobalKPIs();
  const trends = useGrowthTrends();

  useEffect(() => { logAction("view_overview"); }, []);

  const metrics = [
    { label: "Institutions", value: kpis.data?.totalInstitutions, icon: Building2, color: "text-primary" },
    { label: "Active Users", value: kpis.data?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Projects", value: kpis.data?.totalProjects, icon: FolderKanban, color: "text-primary" },
    { label: "Milestones", value: kpis.data?.totalMilestones, icon: Milestone, color: "text-primary" },
    { label: "Completion Rate", value: kpis.data ? `${kpis.data.completionRate}%` : undefined, icon: CheckCircle, color: "text-success" },
    { label: "Dispute Ratio", value: kpis.data ? `${kpis.data.disputeRatio}%` : undefined, icon: AlertTriangle, color: (kpis.data?.disputeRatio ?? 0) > 15 ? "text-destructive" : "text-warning" },
  ];

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global System Overview</h1>
            <p className="text-sm text-muted-foreground">Platform-wide KPIs and health indicators</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {metrics.map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.color}`} />
                  {kpis.isLoading ? (
                    <Skeleton className="h-7 w-16 mx-auto" />
                  ) : (
                    <p className="text-xl font-bold">{m.value ?? "—"}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Project Growth (14d)</CardTitle>
              </CardHeader>
              <CardContent>
                {trends.isLoading ? <Skeleton className="h-48" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trends.data || []}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Governance Stability", score: 87, color: "bg-success" },
                  { label: "Financial Integrity", score: 95, color: "bg-success" },
                  { label: "Compliance Health", score: 82, color: "bg-success" },
                  { label: "Platform Uptime", score: 99, color: "bg-success" },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold">{item.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
