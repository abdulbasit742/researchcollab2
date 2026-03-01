import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, MessageSquare, Upload, CheckCircle2, Clock } from "lucide-react";

function useEngagementHeatmap() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["engagement-heatmap", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // Aggregate activity by day for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: events } = await supabase
        .from("activation_funnel_events")
        .select("event_type, occurred_at")
        .eq("user_id", user.id)
        .gte("occurred_at", thirtyDaysAgo);

      // Group by date
      const grouped: Record<string, number> = {};
      (events ?? []).forEach((e: any) => {
        const day = new Date(e.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        grouped[day] = (grouped[day] || 0) + 1;
      });

      return Object.entries(grouped).map(([day, count]) => ({ day, count })).slice(-14);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}

export default function EngagementAnalyticsPage() {
  const { data: heatmap = [], isLoading } = useEngagementHeatmap();

  const stats = [
    { icon: Activity, label: "Daily Activity", value: heatmap.length > 0 ? `${heatmap[heatmap.length - 1]?.count ?? 0} events` : "—" },
    { icon: CheckCircle2, label: "Completion Trend", value: "Tracked" },
    { icon: MessageSquare, label: "Response Speed", value: "Monitored" },
    { icon: Upload, label: "Upload Frequency", value: "Tracked" },
    { icon: Clock, label: "Review Response", value: "Monitored" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Engagement Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your activity patterns and self-correct behavior</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Over Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : heatmap.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No activity data yet. Start using the platform to see your engagement pattern.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={heatmap}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
