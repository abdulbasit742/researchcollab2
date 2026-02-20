import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRevenueMetrics, useEnterpriseContracts } from "@/hooks/useRevenueMetrics";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, AlertTriangle, Shield, BarChart3, Percent, Activity, ArrowDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function MetricCard({ label, value, sub, icon: Icon, color = "primary" }: { label: string; value: string | number; sub: string; icon: any; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-2xl font-bold font-mono">{value}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FinancialIntelligencePage() {
  const { dailyMetrics, summary, leakageAlerts, forecasts, isLoading } = useRevenueMetrics(30);
  const { data: contracts } = useEnterpriseContracts();

  // Revenue trend data
  const trendData = [...(dailyMetrics ?? [])].reverse().map(d => ({
    date: d.date,
    revenue: d.total_revenue,
    subscription: d.subscription_revenue,
    transaction: d.transaction_revenue,
  }));

  // Forecast data
  const forecastData = (forecasts ?? []).map(f => ({
    date: f.forecast_date,
    mrr: f.projected_mrr,
    churnRisk: f.churn_risk * 100,
    confidence: f.confidence_score * 100,
  }));

  // Platform margin estimate
  const totalGross = dailyMetrics.reduce((s, d) => s + d.total_revenue, 0);
  const avgMargin = totalGross > 0 ? ((totalGross * 0.15) / totalGross * 100) : 0; // estimate

  // Active contracts
  const activeContracts = (contracts ?? []).filter((c: any) => c.status === "active");
  const totalContractValue = activeContracts.reduce((s: number, c: any) => s + Number(c.annual_value || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            Financial Intelligence Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue analytics, forecasting, margin analysis, and leakage detection</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Current MRR" value={`PKR ${(summary.mrr / 1000).toFixed(0)}K`} sub="monthly recurring" icon={DollarSign} />
          <MetricCard label="Revenue/User" value={`PKR ${summary.revenuePerUser.toFixed(0)}`} sub="ARPU" icon={TrendingUp} />
          <MetricCard label="Leakage Alerts" value={leakageAlerts.length} sub="unresolved" icon={AlertTriangle} />
          <MetricCard label="Enterprise ACV" value={`PKR ${(totalContractValue / 1000).toFixed(0)}K`} sub={`${activeContracts.length} contracts`} icon={Shield} />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Subscriptions", value: summary.subscriptionRevenue },
            { label: "Transactions", value: summary.transactionRevenue },
            { label: "Enterprise", value: summary.enterpriseRevenue },
            { label: "AI Credits", value: summary.aiRevenue },
            { label: "Affiliates", value: summary.affiliateRevenue },
            { label: "Boosts", value: summary.boostRevenue },
          ].map((stream, i) => (
            <motion.div key={stream.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stream.label}</p>
                  <p className="text-lg font-bold font-mono mt-1">PKR {(stream.value / 1000).toFixed(0)}K</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        {trendData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Revenue Trend (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="date" className="text-xs" tickFormatter={v => v?.slice(5)} />
                    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                    <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                    <Area type="monotone" dataKey="subscription" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth={1} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Forecast + Leakage */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Forecast */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forecastData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No forecast data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {forecastData.slice(0, 6).map(f => (
                      <div key={f.date} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm font-medium">{f.date}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono">PKR {(f.mrr / 1000).toFixed(0)}K</span>
                          <Badge variant={f.churnRisk > 10 ? "destructive" : "outline"} className="text-[10px]">
                            {f.churnRisk.toFixed(0)}% churn risk
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Leakage Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  Leakage Alerts
                  {leakageAlerts.length > 0 && <Badge variant="destructive" className="text-[10px]">{leakageAlerts.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leakageAlerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No leakage detected. ✓</p>
                ) : (
                  <div className="space-y-2">
                    {leakageAlerts.slice(0, 8).map((alert: any) => (
                      <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg border border-red-500/20 bg-red-500/5">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.detection_type || alert.alert_type || "Anomaly"}</p>
                          <p className="text-xs text-muted-foreground truncate">{alert.description || alert.details || "—"}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{alert.severity || "medium"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
