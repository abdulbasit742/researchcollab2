import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Globe, Building, TrendingUp, Award, Shield, DollarSign, Users } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AdminGlobalTalentAnalyticsPage() {
  // Fetch latest snapshots grouped by institution
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["admin-global-talent-snapshots"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_talent_snapshots" as any)
        .select("*, organizations:institution_id(name)")
        .order("calculated_at", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
  });

  // Aggregate skill demand
  const { data: skillGaps = [] } = useQuery({
    queryKey: ["admin-global-skill-gaps"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_skill_gaps" as any)
        .select("skill_name, demand_index, supply_index, gap_score")
        .order("gap_score", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
  });

  // De-duplicate by institution to get latest per institution
  const latestByInst = new Map<string, any>();
  snapshots.forEach((s: any) => {
    if (!latestByInst.has(s.institution_id)) {
      latestByInst.set(s.institution_id, s);
    }
  });
  const institutions = Array.from(latestByInst.values());

  // Aggregate metrics
  const totalInstitutions = institutions.length;
  const totalMembers = institutions.reduce((sum: number, i: any) => sum + (i.total_members || 0), 0);
  const avgTrust = institutions.length > 0
    ? (institutions.reduce((sum: number, i: any) => sum + (i.avg_trust_score || 0), 0) / institutions.length).toFixed(1)
    : "0";
  const totalIncome = institutions.reduce((sum: number, i: any) => sum + (i.income_generated_last_90_days || 0), 0);

  // Leaderboard
  const leaderboard = [...institutions]
    .sort((a, b) => (b.avg_trust_score || 0) - (a.avg_trust_score || 0))
    .slice(0, 10);

  // Skill demand trends (aggregated)
  const skillMap = new Map<string, { demand: number; supply: number; gap: number; count: number }>();
  skillGaps.forEach((g: any) => {
    const existing = skillMap.get(g.skill_name) || { demand: 0, supply: 0, gap: 0, count: 0 };
    skillMap.set(g.skill_name, {
      demand: existing.demand + g.demand_index,
      supply: existing.supply + g.supply_index,
      gap: existing.gap + g.gap_score,
      count: existing.count + 1,
    });
  });
  const skillTrends = Array.from(skillMap.entries())
    .map(([skill, data]) => ({
      skill,
      avgGap: Math.round((data.gap / data.count) * 10) / 10,
      totalDemand: data.demand,
      totalSupply: data.supply,
    }))
    .sort((a, b) => b.avgGap - a.avgGap)
    .slice(0, 10);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-6 px-4 space-y-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Global Talent Analytics</h1>
            <p className="text-muted-foreground text-sm">Cross-institutional talent intelligence</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard icon={Building} label="Institutions" value={totalInstitutions} />
          <KPICard icon={Users} label="Total Members" value={totalMembers} />
          <KPICard icon={Shield} label="Avg Trust" value={avgTrust} />
          <KPICard icon={DollarSign} label="Total Income (90d)" value={`PKR ${(totalIncome / 1000).toFixed(0)}k`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Top Institutions by Trust
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((inst: any, i: number) => (
                  <div key={inst.institution_id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {inst.organizations?.name || inst.institution_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">{inst.total_members} members</p>
                    </div>
                    <Badge variant="secondary">{inst.avg_trust_score?.toFixed(1)}</Badge>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No institutional data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skill Demand Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Skill Demand Trends
              </CardTitle>
              <CardDescription>Top skill gaps across all institutions</CardDescription>
            </CardHeader>
            <CardContent>
              {skillTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillTrends} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs fill-muted-foreground" />
                    <YAxis dataKey="skill" type="category" width={100} className="text-xs fill-muted-foreground" />
                    <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="totalDemand" name="Demand" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="totalSupply" name="Supply" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">No skill data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

function KPICard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
