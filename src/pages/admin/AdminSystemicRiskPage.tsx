import { useRiskIndex } from "@/hooks/useRiskIndex";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminSystemicRiskPage() {
  const { metrics, alerts, isLoading, computeRisk, isComputing } = useRiskIndex("platform", "global");

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("systemic_alerts")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    if (error) toast.error("Failed to resolve alert");
    else toast.success("Alert resolved");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" /> Systemic Risk
            </h1>
            <p className="text-sm text-muted-foreground">Platform-wide risk monitoring and alert management</p>
          </div>
          <Button onClick={() => computeRisk()} disabled={isComputing} size="sm">
            {isComputing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Recompute
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Composite Score", value: Number(metrics?.composite_risk_score || 0).toFixed(1) },
                { label: "Risk Level", value: metrics?.risk_level || "N/A" },
                { label: "Trust Volatility", value: Number(metrics?.trust_volatility || 0).toFixed(1) },
                { label: "Active Alerts", value: alerts.length },
              ].map((card) => (
                <Card key={card.label}>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground capitalize">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Risk Factor Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Trust Volatility (25%)", value: metrics?.trust_volatility },
                    { label: "Dispute Spike Rate (20%)", value: metrics?.dispute_spike_rate },
                    { label: "Liquidity Distortion (15%)", value: metrics?.liquidity_distortion },
                    { label: "Capital Concentration (15%)", value: metrics?.capital_concentration_index },
                    { label: "Pricing Anomaly (15%)", value: metrics?.pricing_anomaly_score },
                    { label: "Centralization Risk (10%)", value: metrics?.centralization_risk },
                  ].map((f) => (
                    <div key={f.label} className="p-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">{f.label}</p>
                      <p className="text-xl font-semibold text-foreground">{Number(f.value || 0).toFixed(1)}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(Number(f.value || 0), 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alert Management */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Alert Management</CardTitle></CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No active alerts.</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "warning" : "info"}>
                          {alert.severity}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(alert.triggered_at), "MMM d, HH:mm")}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>Resolve</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
