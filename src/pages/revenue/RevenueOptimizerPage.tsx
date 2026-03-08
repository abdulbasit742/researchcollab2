import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Zap, Users, TrendingUp, Bell, Brain, Target, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { getRevenueDashboardData, invokeRevOptimizer } from "@/lib/revenue/revenueOptimizer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function RevenueOptimizerPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["rev-optimizer"],
    queryFn: getRevenueDashboardData,
    staleTime: 60_000,
  });

  const runAction = useMutation({
    mutationFn: (action: string) => invokeRevOptimizer(action, { timestamp: new Date().toISOString() }),
    onSuccess: () => { toast.success("Analysis complete"); qc.invalidateQueries({ queryKey: ["rev-optimizer"] }); },
    onError: () => toast.error("Analysis failed"),
  });

  const s = dashboard?.summary;

  const signalsByType: Record<string, number> = {};
  (dashboard?.signals ?? []).forEach((sig: any) => { signalsByType[sig.signal_type] = (signalsByType[sig.signal_type] ?? 0) + 1; });
  const signalChart = Object.entries(signalsByType).map(([name, value]) => ({ name, value }));

  return (
    <>
      <Helmet><title>Revenue Optimizer | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Optimization Engine</h1>
            <p className="text-muted-foreground">AI-powered revenue opportunity detection</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runAction.mutate("detect_signals")} disabled={runAction.isPending}>
              <Zap className="h-4 w-4 mr-2" /> Detect Signals
            </Button>
            <Button onClick={() => runAction.mutate("find_sponsors")} disabled={runAction.isPending}>
              <Target className="h-4 w-4 mr-2" /> Find Sponsors
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Active Signals", value: s?.activeSignals ?? 0 },
            { icon: Target, label: "Sponsor Leads", value: s?.sponsorLeads ?? 0 },
            { icon: Users, label: "Premium Candidates", value: s?.premiumCandidates ?? 0 },
            { icon: Bell, label: "Pending Alerts", value: s?.pendingAlerts ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}><CardContent className="pt-6 flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
            </CardContent></Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">${(s?.totalRevenuePotential ?? 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Revenue Potential</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">${(s?.totalUpgradeRevenue ?? 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Upgrade Revenue Potential</p></div>
          </CardContent></Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Signals</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {signalChart.length > 0 && (
              <Card><CardHeader><CardTitle className="text-lg">Signal Distribution</CardTitle></CardHeader>
                <CardContent><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={signalChart}><XAxis dataKey="name" fontSize={12} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer></CardContent>
              </Card>
            )}
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.signals ?? []).map((sig: any) => (
                <div key={sig.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2"><Badge variant="outline">{sig.signal_type}</Badge><span className="font-medium text-foreground">{sig.title}</span><Badge>{sig.priority}</Badge></div>
                    {sig.description && <p className="text-sm text-muted-foreground mt-1">{sig.description}</p>}
                  </div>
                  <span className="font-bold text-primary">${(sig.revenue_potential ?? 0).toLocaleString()}</span>
                </div>
              ))}
              {(dashboard?.signals ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No signals — run detection</p>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => runAction.mutate("find_sponsors")} disabled={runAction.isPending}><Target className="h-4 w-4 mr-2" /> Discover Sponsors</Button></div>
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.leads ?? []).map((lead: any) => (
                <div key={lead.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div><span className="font-semibold text-foreground">{lead.company_name}</span><Badge variant="outline" className="ml-2">{lead.industry}</Badge></div>
                    <div className="text-right"><span className="font-bold text-primary">{Math.round((lead.match_score ?? 0) * 100)}%</span><p className="text-xs text-muted-foreground">match</p></div>
                  </div>
                  {lead.match_reason && <p className="text-sm text-muted-foreground mt-1">{lead.match_reason}</p>}
                  <div className="flex gap-2 mt-2">{(lead.target_domains ?? []).map((d: string) => <Badge key={d} variant="secondary">{d}</Badge>)}</div>
                </div>
              ))}
              {(dashboard?.leads ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No sponsor leads — run sponsor discovery</p>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="premium">
            <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => runAction.mutate("detect_premium")} disabled={runAction.isPending}><Users className="h-4 w-4 mr-2" /> Detect Candidates</Button></div>
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.candidates ?? []).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <span className="font-medium text-foreground">{c.entity_name ?? c.entity_id}</span>
                    <div className="flex items-center gap-2 mt-1"><Badge variant="outline">{c.current_tier}</Badge><span className="text-muted-foreground">→</span><Badge>{c.recommended_tier}</Badge></div>
                    {c.upgrade_reason && <p className="text-sm text-muted-foreground mt-1">{c.upgrade_reason}</p>}
                  </div>
                  <span className="font-bold text-primary">${(c.estimated_revenue ?? 0).toLocaleString()}</span>
                </div>
              ))}
              {(dashboard?.candidates ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No premium candidates detected</p>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="experiments">
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.experiments ?? []).map((exp: any) => (
                <div key={exp.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{exp.experiment_name}</span>
                    <Badge variant={exp.status === "running" ? "default" : "outline"}>{exp.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Segment: {exp.target_segment}</p>
                  {exp.hypothesis && <p className="text-sm text-muted-foreground">{exp.hypothesis}</p>}
                </div>
              ))}
              {(dashboard?.experiments ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No pricing experiments created</p>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="forecasts">
            <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => runAction.mutate("forecast")} disabled={runAction.isPending}><TrendingUp className="h-4 w-4 mr-2" /> Generate Forecast</Button></div>
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.forecasts ?? []).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div><span className="font-medium text-foreground">{f.forecast_type}</span><span className="text-sm text-muted-foreground ml-2">{f.forecast_period}</span></div>
                  <div className="text-right">
                    <span className="font-bold text-primary">${(f.projected_revenue ?? 0).toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">{(f.projected_growth_rate ?? 0)}% growth</p>
                  </div>
                </div>
              ))}
              {(dashboard?.forecasts ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No forecasts — generate one</p>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="flex justify-end mb-4"><Button variant="outline" onClick={() => runAction.mutate("generate_alerts")} disabled={runAction.isPending}><Bell className="h-4 w-4 mr-2" /> Scan Alerts</Button></div>
            <Card><CardContent className="pt-6 space-y-3">
              {(dashboard?.alerts ?? []).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2"><Badge variant={a.severity === "critical" ? "destructive" : "outline"}>{a.severity}</Badge><span className="font-medium text-foreground">{a.title}</span></div>
                    {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                  </div>
                  <span className="font-bold text-primary">${(a.revenue_impact ?? 0).toLocaleString()}</span>
                </div>
              ))}
              {(dashboard?.alerts ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No pending alerts</p>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
