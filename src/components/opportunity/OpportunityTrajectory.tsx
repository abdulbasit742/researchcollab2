import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useOpportunityGraph } from "@/hooks/useOpportunityGraph";
import { useMemo } from "react";
import { format, subDays } from "date-fns";

export function OpportunityTrajectory() {
  const { data: opportunities, isLoading } = useOpportunityGraph();

  const chartData = useMemo(() => {
    if (!opportunities?.length) {
      // Generate mock trajectory for empty state
      return Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), "MMM dd"),
        score: Math.round(20 + Math.random() * 15 + i * 3),
      }));
    }

    // Group by day, compute avg composite score
    const byDay = new Map<string, number[]>();
    opportunities.forEach((opp) => {
      const day = format(new Date(opp.created_at), "MMM dd");
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(opp.composite_score);
    });

    return Array.from(byDay.entries()).map(([date, scores]) => ({
      date,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }, [opportunities]);

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Score Trajectory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
