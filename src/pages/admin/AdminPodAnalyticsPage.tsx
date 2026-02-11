import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminPodAnalyticsPage() {
  const { data: pods } = useQuery({
    queryKey: ["admin-pods"],
    queryFn: async () => {
      const { data } = await supabase.from("collaboration_pods").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: execMetrics } = useQuery({
    queryKey: ["admin-pod-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("pod_execution_metrics").select("*").limit(100);
      return data ?? [];
    },
  });

  const totalPods = pods?.length ?? 0;
  const avgExecProb = totalPods > 0 ? Math.round(pods!.reduce((s: number, p: any) => s + (p.overall_execution_probability ?? 0), 0) / totalPods * 10) / 10 : 0;
  const successfulPods = execMetrics?.filter((m: any) => m.deal_success).length ?? 0;
  const totalExec = execMetrics?.length ?? 0;

  const probDist = [
    { range: "0-25%", count: pods?.filter((p: any) => p.overall_execution_probability < 25).length ?? 0 },
    { range: "25-50%", count: pods?.filter((p: any) => p.overall_execution_probability >= 25 && p.overall_execution_probability < 50).length ?? 0 },
    { range: "50-75%", count: pods?.filter((p: any) => p.overall_execution_probability >= 50 && p.overall_execution_probability < 75).length ?? 0 },
    { range: "75-100%", count: pods?.filter((p: any) => p.overall_execution_probability >= 75).length ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8 text-primary" /> Pod Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Pods</p>
            <p className="text-3xl font-bold">{totalPods}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Execution Prob</p>
            <p className="text-3xl font-bold">{avgExecProb}%</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Successful</p>
            <p className="text-3xl font-bold text-green-600">{successfulPods}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold">{totalExec > 0 ? Math.round(successfulPods / totalExec * 100) : 0}%</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Execution Probability Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={probDist}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
