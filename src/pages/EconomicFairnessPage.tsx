import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function EconomicFairnessPage() {
  const { data: reports } = useQuery({
    queryKey: ["fairness-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("economic_fairness_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      return data || [];
    },
  });

  const chartData = reports?.map((r) => ({
    period: r.period,
    fairness: Number(r.fairness_score) || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Economic Fairness</h1>
          <p className="text-muted-foreground">Ensuring the platform does not bias against lower-tier users</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Fairness Score Trend</CardTitle></CardHeader>
        <CardContent className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="fairness" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No fairness data yet.</div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {reports?.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Period: {r.period}</CardTitle>
                <Badge variant={Number(r.fairness_score) >= 70 ? "default" : "destructive"}>
                  Score: {r.fairness_score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>Revenue Distribution: {JSON.stringify(r.revenue_distribution)}</div>
              <div>Fee Distribution: {JSON.stringify(r.fee_distribution)}</div>
              <div>Trust Tier Split: {JSON.stringify(r.trust_tier_distribution)}</div>
              <div>Dispute by Tier: {JSON.stringify(r.dispute_rate_by_tier)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
