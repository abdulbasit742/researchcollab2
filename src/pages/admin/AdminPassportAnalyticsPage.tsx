import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, FileText, ExternalLink, AlertTriangle } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function AdminPassportAnalyticsPage() {
  const { data: passports } = useQuery({
    queryKey: ["admin-passports"],
    queryFn: async () => {
      const { data } = await supabase.from("reputation_passports").select("*").order("issued_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: verifications } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: async () => {
      const { data } = await supabase.from("passport_verifications").select("*").order("verified_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: exports } = useQuery({
    queryKey: ["admin-exports"],
    queryFn: async () => {
      const { data } = await supabase.from("passport_exports").select("*").limit(100);
      return data ?? [];
    },
  });

  const total = passports?.length ?? 0;
  const verified = verifications?.filter((v: any) => v.verification_status === "verified").length ?? 0;
  const failed = verifications?.filter((v: any) => v.verification_status === "failed").length ?? 0;

  const exportTypes = (exports ?? []).reduce((acc: Record<string, number>, e: any) => {
    acc[e.export_type] = (acc[e.export_type] ?? 0) + 1;
    return acc;
  }, {});
  const exportPieData = Object.entries(exportTypes).map(([name, value]) => ({ name, value }));

  const trustDist = [
    { range: "0-25", count: passports?.filter((p: any) => p.trust_score_snapshot < 25).length ?? 0 },
    { range: "25-50", count: passports?.filter((p: any) => p.trust_score_snapshot >= 25 && p.trust_score_snapshot < 50).length ?? 0 },
    { range: "50-75", count: passports?.filter((p: any) => p.trust_score_snapshot >= 50 && p.trust_score_snapshot < 75).length ?? 0 },
    { range: "75-100", count: passports?.filter((p: any) => p.trust_score_snapshot >= 75).length ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Passport Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Issued</p>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-3xl font-bold text-green-600">{verified}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Failed Checks</p>
            <p className="text-3xl font-bold text-destructive">{failed}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Exports</p>
            <p className="text-3xl font-bold">{exports?.length ?? 0}</p>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Trust Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trustDist}>
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Export Types</CardTitle></CardHeader>
            <CardContent>
              {exportPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={exportPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {exportPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">No exports yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
