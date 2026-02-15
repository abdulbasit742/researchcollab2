import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminPricingOptimizerPage() {
  const { data: rules } = useQuery({
    queryKey: ["dynamic-fee-rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("dynamic_fee_rules")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: dealMetrics } = useQuery({
    queryKey: ["deal-efficiency"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deal_efficiency_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const { data: disputeRisks } = useQuery({
    queryKey: ["dispute-risk"],
    queryFn: async () => {
      const { data } = await supabase
        .from("dispute_risk_model")
        .select("*")
        .order("risk_score", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const efficiencyChart = (dealMetrics ?? []).map((d: any, i: number) => ({
    deal: `Deal ${i + 1}`,
    delay: Number(d.milestone_delay_ratio) || 0,
    disputeRisk: Number(d.dispute_probability_score) || 0,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pricing Optimizer</h1>
          <p className="text-muted-foreground">Dynamic fee rules, deal efficiency & dispute risk</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Dynamic Fee Rules</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(rules ?? []).map((rule: any) => (
                  <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{rule.condition_label || rule.condition_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {rule.condition_type} · Threshold: {rule.threshold}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={Number(rule.fee_adjustment) < 0 ? "default" : "destructive"}>
                        {Number(rule.fee_adjustment) > 0 ? "+" : ""}{rule.fee_adjustment}%
                      </Badge>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(rules ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No fee rules configured.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Deal Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="deal" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="delay" fill="hsl(var(--chart-3))" name="Delay Ratio" />
                    <Bar dataKey="disputeRisk" fill="hsl(var(--destructive))" name="Dispute Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Top Dispute Risk Users</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(disputeRisks ?? []).map((risk: any) => {
                const factors = risk.contributing_factors as Record<string, any> ?? {};
                return (
                  <div key={risk.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{risk.user_id?.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Factors: {Object.keys(factors).join(", ") || "None recorded"}
                      </p>
                    </div>
                    <Badge variant={Number(risk.risk_score) > 70 ? "destructive" : Number(risk.risk_score) > 40 ? "secondary" : "outline"}>
                      Risk: {Number(risk.risk_score).toFixed(0)}
                    </Badge>
                  </div>
                );
              })}
              {(disputeRisks ?? []).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No dispute risk data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
