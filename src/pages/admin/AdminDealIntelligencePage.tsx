import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDealIntelligencePage() {
  const { data: sessions } = useQuery({
    queryKey: ["admin-deal-sessions"],
    queryFn: async () => {
      const { data } = await supabase.from("negotiation_sessions").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: predictions } = useQuery({
    queryKey: ["admin-dispute-predictions"],
    queryFn: async () => {
      const { data } = await supabase.from("dispute_prediction_logs").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const totalSessions = sessions?.length ?? 0;
  const avgRisk = totalSessions > 0 ? Math.round(sessions!.reduce((s: number, n: any) => s + (n.risk_score ?? 0), 0) / totalSessions * 10) / 10 : 0;
  const avgDispute = totalSessions > 0 ? Math.round(sessions!.reduce((s: number, n: any) => s + (n.dispute_probability ?? 0), 0) / totalSessions * 10) / 10 : 0;
  const highRisk = sessions?.filter((s: any) => s.risk_score > 60).length ?? 0;

  const riskDist = [
    { range: "Low (0-30)", count: sessions?.filter((s: any) => s.risk_score < 30).length ?? 0 },
    { range: "Medium (30-60)", count: sessions?.filter((s: any) => s.risk_score >= 30 && s.risk_score < 60).length ?? 0 },
    { range: "High (60+)", count: sessions?.filter((s: any) => s.risk_score >= 60).length ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Brain className="h-8 w-8 text-primary" /> Deal Intelligence Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-3xl font-bold">{totalSessions}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            <p className="text-3xl font-bold">{avgRisk}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Dispute Prob</p>
            <p className="text-3xl font-bold">{avgDispute}%</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">High Risk Deals</p>
            <p className="text-3xl font-bold text-destructive">{highRisk}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskDist}>
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
