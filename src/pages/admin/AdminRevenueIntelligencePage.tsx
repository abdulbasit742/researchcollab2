import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRevenueMetrics, useCommissionRules, useEnterpriseContracts } from "@/hooks/useRevenueMetrics";
import { formatPKR } from "@/lib/currency";
import { DollarSign, TrendingUp, Users, Building2, AlertTriangle, Zap, Shield, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminRevenueIntelligencePage() {
  const { dailyMetrics, summary, forecasts, leakageAlerts, isLoading } = useRevenueMetrics(30);
  const { data: commissionRules } = useCommissionRules();
  const { data: contracts } = useEnterpriseContracts();

  const trendData = [...dailyMetrics].reverse().map((m) => ({
    date: m.date,
    total: Number(m.total_revenue),
    subscription: Number(m.subscription_revenue),
    transaction: Number(m.transaction_revenue),
    enterprise: Number(m.enterprise_revenue),
    ai: Number(m.ai_revenue),
  }));

  const revenueBreakdown = [
    { name: "Subscriptions", value: summary.subscriptionRevenue },
    { name: "Transactions", value: summary.transactionRevenue },
    { name: "Enterprise", value: summary.enterpriseRevenue },
    { name: "AI Credits", value: summary.aiRevenue },
    { name: "Boosts", value: summary.boostRevenue },
  ].filter(r => r.value > 0);

  const forecastData = forecasts.map((f) => ({
    date: f.forecast_date,
    mrr: Number(f.projected_mrr),
    transaction: Number(f.projected_transaction_volume),
    enterprise: Number(f.projected_enterprise_revenue),
    ai: Number(f.projected_ai_revenue),
  }));

  const totalContractValue = (contracts ?? []).reduce((s, c: any) => s + Number(c.contract_value || 0), 0);
  const activeContracts = (contracts ?? []).filter((c: any) => c.status === "active");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Revenue Intelligence</h1>
          <p className="text-muted-foreground">Real-time monetization analytics & forecasting</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Revenue</p>
                  <p className="text-2xl font-bold">{formatPKR(summary.mrr)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue/User</p>
                  <p className="text-2xl font-bold">{formatPKR(summary.revenuePerUser)}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enterprise Pipeline</p>
                  <p className="text-2xl font-bold">{formatPKR(totalContractValue)}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leakage Alerts</p>
                  <p className="text-2xl font-bold">{leakageAlerts.length}</p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${leakageAlerts.length > 0 ? "text-destructive" : "text-muted-foreground"} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Revenue Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="commission">Commission Engine</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="leakage">Anti-Leakage</TabsTrigger>
          </TabsList>

          {/* Revenue Trends */}
          <TabsContent value="overview">
            <Card>
              <CardHeader><CardTitle>Revenue Trends (30d)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="subscription" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Subscriptions" />
                      <Area type="monotone" dataKey="transaction" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} name="Transactions" />
                      <Area type="monotone" dataKey="enterprise" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="Enterprise" />
                      <Area type="monotone" dataKey="ai" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="AI" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Breakdown */}
          <TabsContent value="breakdown">
            <Card>
              <CardHeader><CardTitle>Revenue Sources</CardTitle></CardHeader>
              <CardContent>
                {revenueBreakdown.length > 0 ? (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                          {revenueBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No revenue data yet. Revenue will appear as transactions occur.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Engine */}
          <TabsContent value="commission">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Dynamic Commission Rules</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1"><Zap className="h-3 w-3" /> Trust-Weighted</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(commissionRules ?? []).map((rule: any) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{rule.rule_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Trust: {rule.min_trust_score}–{rule.max_trust_score ?? '100'} · Volume: {formatPKR(Number(rule.min_volume))}+
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={Number(rule.commission_rate) <= 8 ? "default" : "secondary"}>
                          {rule.commission_rate}% commission
                        </Badge>
                        {Number(rule.bonus_multiplier) > 1 && (
                          <Badge variant="outline">{rule.bonus_multiplier}x bonus</Badge>
                        )}
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(commissionRules ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No commission rules configured. Add rules to enable dynamic pricing.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enterprise Contracts */}
          <TabsContent value="enterprise">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enterprise Contracts</CardTitle>
                  <Badge>{activeContracts.length} Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(contracts ?? []).map((contract: any) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{contract.contract_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contract.seats} seats · {contract.pricing_model} · Renewal: {contract.renewal_date ?? 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatPKR(Number(contract.contract_value))}</span>
                        <Badge variant={contract.status === "active" ? "default" : "secondary"}>{contract.status}</Badge>
                        {contract.intelligence_access && <Badge variant="outline"><Zap className="h-3 w-3 mr-1" />AI</Badge>}
                      </div>
                    </div>
                  ))}
                  {(contracts ?? []).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No enterprise contracts yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast */}
          <TabsContent value="forecast">
            <Card>
              <CardHeader><CardTitle>Revenue Forecast</CardTitle></CardHeader>
              <CardContent>
                {forecastData.length > 0 ? (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" strokeWidth={2} name="MRR" />
                        <Line type="monotone" dataKey="transaction" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Transactions" />
                        <Line type="monotone" dataKey="enterprise" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Enterprise" />
                        <Line type="monotone" dataKey="ai" stroke="hsl(var(--chart-4))" strokeWidth={2} name="AI" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No forecast data available. Forecasts will be generated as revenue data accumulates.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leakage */}
          <TabsContent value="leakage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Anti-Leakage Detection</CardTitle>
                  <Badge variant={leakageAlerts.length > 0 ? "destructive" : "outline"}>
                    {leakageAlerts.length} Unresolved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leakageAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="font-medium capitalize">{alert.detection_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          User: {alert.user_id?.slice(0, 8)}… · {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? "destructive" : alert.severity === 'high' ? "destructive" : "secondary"}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  {leakageAlerts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No leakage alerts. System is clean.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
