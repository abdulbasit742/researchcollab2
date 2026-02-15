import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Eye, Users, TrendingUp } from "lucide-react";

export default function AdminPowerAuditPage() {
  const { data: metrics } = useQuery({
    queryKey: ["power-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("power_distribution_metrics")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const stats = [
    { label: "Admin Actions", value: metrics?.admin_actions_count ?? 0, icon: Users },
    { label: "Institutional Influence", value: Number(metrics?.institutional_influence_score ?? 0).toFixed(1), icon: TrendingUp },
    { label: "Top 1% Revenue Share", value: `${Number(metrics?.top_1_percent_revenue_share ?? 0).toFixed(1)}%`, icon: Eye },
    { label: "Trust Concentration", value: Number(metrics?.trust_concentration_score ?? 0).toFixed(2), icon: ShieldAlert },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Power Audit</h1>
            <p className="text-muted-foreground">Monitor power distribution & prevent centralization</p>
          </div>
          {metrics?.alert_triggered && <Badge variant="destructive">⚠ Alert Triggered</Badge>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Icon className="h-4 w-4" />{s.label}</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold text-foreground">{s.value}</p></CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle>Decision Authority Spread</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold text-primary">{Number(metrics?.decision_authority_spread ?? 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Higher values indicate healthier distribution</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
