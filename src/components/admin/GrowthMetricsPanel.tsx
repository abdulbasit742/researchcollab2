import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface DailyMetric {
  date: string;
  users: number;
  projects: number;
  messages: number;
}

export function GrowthMetricsPanel() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthMetrics();
  }, []);

  const fetchGrowthMetrics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 30);

      // Get all days in range
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dateLabels = days.map(d => format(d, "MMM d"));

      // Fetch user signups by day
      const { data: users } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch projects created by day
      const { data: projects } = await supabase
        .from("earning_projects")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch messages by day
      const { data: messages } = await supabase
        .from("messages")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Aggregate by day
      const dailyData = days.map((day, index) => {
        const dayStart = startOfDay(day);
        const dayEnd = startOfDay(subDays(day, -1));

        const userCount = (users || []).filter(u => {
          const d = new Date(u.created_at);
          return d >= dayStart && d < dayEnd;
        }).length;

        const projectCount = (projects || []).filter(p => {
          const d = new Date(p.created_at);
          return d >= dayStart && d < dayEnd;
        }).length;

        const messageCount = (messages || []).filter(m => {
          const d = new Date(m.created_at);
          return d >= dayStart && d < dayEnd;
        }).length;

        return {
          date: dateLabels[index],
          users: userCount,
          projects: projectCount,
          messages: messageCount,
        };
      });

      setMetrics(dailyData);
    } catch (err) {
      console.error("Error fetching growth metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Growth Metrics (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Growth Metrics (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                interval="preserveStartEnd"
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                name="New Users"
              />
              <Area 
                type="monotone" 
                dataKey="projects" 
                stroke="hsl(142, 76%, 36%)" 
                fillOpacity={1} 
                fill="url(#colorProjects)" 
                name="Projects"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">New Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
            <span className="text-sm text-muted-foreground">Projects</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
