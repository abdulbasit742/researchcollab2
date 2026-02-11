import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Eye, Users, Award, TrendingUp, BarChart3 } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function AdminVisibilityAnalyticsPage() {
  const { data: allScores = [], isLoading } = useQuery({
    queryKey: ["adminVisibilityScores"],
    queryFn: async () => {
      // Admin fetches all latest scores via service-level access
      const { data, error } = await supabase
        .from("visibility_scores")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Deduplicate: latest per user
  const latestByUser = new Map<string, any>();
  allScores.forEach((s: any) => {
    if (!latestByUser.has(s.user_id)) latestByUser.set(s.user_id, s);
  });
  const uniqueScores = Array.from(latestByUser.values());

  // Distribution buckets
  const distribution = [
    { range: "0-20", count: 0 },
    { range: "21-40", count: 0 },
    { range: "41-60", count: 0 },
    { range: "61-80", count: 0 },
    { range: "81-100", count: 0 },
  ];
  uniqueScores.forEach((s: any) => {
    const v = s.visibility_score;
    if (v <= 20) distribution[0].count++;
    else if (v <= 40) distribution[1].count++;
    else if (v <= 60) distribution[2].count++;
    else if (v <= 80) distribution[3].count++;
    else distribution[4].count++;
  });

  const topTrustedCount = uniqueScores.filter((s: any) => s.visibility_score >= 80).length;
  const avgScore = uniqueScores.length > 0
    ? Math.round(uniqueScores.reduce((a: number, s: any) => a + s.visibility_score, 0) / uniqueScores.length * 10) / 10
    : 0;

  // Dimension averages
  const dimKeys = ["trust_score", "deal_success_rate", "collaboration_consistency", "dispute_score", "institutional_weight", "economic_contribution"];
  const dimLabels = ["Trust", "Deal Success", "Collaboration", "Dispute", "Institution", "Economic"];
  const dimAverages = dimKeys.map((key, i) => {
    const vals = uniqueScores.map((s: any) => s.breakdown?.[key]?.weighted ?? 0);
    const avg = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
    return { name: dimLabels[i], value: Math.round(avg * 10) / 10 };
  });

  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Visibility Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Reputation-Weighted Visibility Engine — Platform Overview
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="h-5 w-5 mx-auto text-muted-foreground/70 mb-1" />
              <p className="text-2xl font-bold">{uniqueScores.length}</p>
              <p className="text-xs text-muted-foreground">Users Scored</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary/80 mb-1" />
              <p className="text-2xl font-bold">{avgScore}</p>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Award className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold">{topTrustedCount}</p>
              <p className="text-xs text-muted-foreground">Top Trusted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <BarChart3 className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{allScores.length}</p>
              <p className="text-xs text-muted-foreground">Total Snapshots</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Dimension Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average Dimension Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dimAverages} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {dimAverages.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Top Visible Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="space-y-2">
                {uniqueScores
                  .sort((a: any, b: any) => b.visibility_score - a.visibility_score)
                  .slice(0, 10)
                  .map((s: any, i: number) => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      <span className="text-sm font-mono text-muted-foreground w-6">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-mono text-muted-foreground truncate">{s.user_id}</p>
                      </div>
                      <Progress value={s.visibility_score} className="w-24 h-2" />
                      <span className="text-sm font-bold w-10 text-right">{s.visibility_score}</span>
                      {s.visibility_score >= 80 && (
                        <Badge variant="success" className="text-[10px]">Top</Badge>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
