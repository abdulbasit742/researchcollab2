import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Target, Lock, TrendingUp, AlertTriangle, Zap, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const displacementPillars = [
  { name: "Escrow-Backed Execution", description: "Milestone-locked capital with atomic financial runtime" },
  { name: "Arbitration-Integrated Disputes", description: "Structured resolution with precedent database" },
  { name: "Trust Score (Capital-Based)", description: "Trust tied to real capital movement, not endorsements" },
  { name: "AI Capital Allocation", description: "Predictive allocation with human-in-the-loop approval" },
  { name: "Equity Lifecycle Tracking", description: "Versioned cap tables with dilution calculations" },
  { name: "Government Reporting", description: "Innovation index and policy simulation integration" },
  { name: "Sovereign Node Model", description: "Data-isolated country nodes with SIP certification" },
  { name: "Intelligence Subscriptions", description: "Monetized sector reports and forecasting" },
];

const threatColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  critical: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100",
};

const CompetitorDisplacementPage = () => {
  const { data: pillars } = useQuery({
    queryKey: ["displacement-pillars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("displacement_pillars" as any).select("*").order("created_at");
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: threats } = useQuery({
    queryKey: ["competitor-threats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("competitor_threat_index" as any).select("*").order("assessed_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: switchingCosts } = useQuery({
    queryKey: ["switching-costs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("switching_cost_index" as any).select("*").order("calculated_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: moatGrowth } = useQuery({
    queryKey: ["data-moat-growth"],
    queryFn: async () => {
      const { data, error } = await supabase.from("data_moat_growth_index" as any).select("*").order("recorded_at", { ascending: false }).limit(12);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const avgSwitchingCost = switchingCosts?.length
    ? (switchingCosts.reduce((s: number, c: any) => s + Number(c.overall_switching_cost || 0), 0) / switchingCosts.length).toFixed(1)
    : "0";

  const highThreats = threats?.filter((t: any) => t.overall_threat_level === "high" || t.overall_threat_level === "critical").length || 0;

  return (
    <MainLayout>
      <Helmet><title>Competitor Displacement Engine | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Competitor Displacement Engine</h1>
            <p className="text-muted-foreground">Strategic superiority tracking, lock-in metrics, and threat monitoring.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Displacement Pillars", value: 8, icon: Shield, color: "text-primary" },
            { label: "Avg Switching Cost", value: avgSwitchingCost, icon: Lock, color: "text-blue-500" },
            { label: "High Threats", value: highThreats, icon: AlertTriangle, color: "text-red-500" },
            { label: "Moat Periods", value: moatGrowth?.length || 0, icon: TrendingUp, color: "text-green-500" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pillars">
          <TabsList>
            <TabsTrigger value="pillars">Displacement Pillars</TabsTrigger>
            <TabsTrigger value="lockin">Lock-In Metrics</TabsTrigger>
            <TabsTrigger value="threats">Threat Monitor</TabsTrigger>
            <TabsTrigger value="moat">Data Moat</TabsTrigger>
            <TabsTrigger value="superiority">Superiority Map</TabsTrigger>
          </TabsList>

          <TabsContent value="pillars">
            <div className="grid md:grid-cols-2 gap-4">
              {displacementPillars.map((p, i) => (
                <Card key={p.name}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {pillars?.length ? (
              <Card className="mt-4">
                <CardHeader><CardTitle>Pillar Scoring</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pillars.map((p: any) => ({
                      name: p.pillar_name?.substring(0, 15),
                      RCollab: Number(p.rcollab_score),
                      Competitors: Number(p.competitor_avg_score),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="RCollab" fill="hsl(var(--primary))" />
                      <Bar dataKey="Competitors" fill="hsl(var(--muted-foreground))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="lockin">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Economic Lock-In Conditions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {["3+ funded projects", "Trust score history", "Arbitration record", "Escrow history", "Startup cap table", "Employment conversion tracked"].map(c => (
                      <div key={c} className="flex items-center gap-2 p-3 rounded-lg border">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm">{c}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Switching Cost Distribution</CardTitle></CardHeader>
                <CardContent>
                  {switchingCosts?.length ? (
                    <div className="space-y-2">
                      {switchingCosts.slice(0, 10).map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded border">
                          <span className="text-sm font-mono">{s.user_id?.substring(0, 8)}...</span>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Capital: {s.capital_history_depth}</span>
                            <span>Trust: {Number(s.trust_compounding_score).toFixed(1)}</span>
                            <span>Equity: {Number(s.startup_equity_dependency).toFixed(1)}</span>
                          </div>
                          <Badge variant={Number(s.overall_switching_cost) > 70 ? "default" : "secondary"}>
                            {Number(s.overall_switching_cost).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No switching cost data yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats">
            <div className="space-y-3">
              {threats?.length ? threats.map((t: any) => (
                <Card key={t.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{t.competitor_name}</p>
                          <Badge variant="outline">{t.category}</Badge>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span>Feature Imitation: {Number(t.feature_imitation_score).toFixed(0)}</span>
                          <span>Enterprise Risk: {Number(t.enterprise_client_risk).toFixed(0)}</span>
                          <span>AI Threat: {Number(t.ai_positioning_threat).toFixed(0)}</span>
                        </div>
                        {t.notes && <p className="text-sm text-muted-foreground mt-1">{t.notes}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${threatColors[t.overall_threat_level] || threatColors.low}`}>
                        {t.overall_threat_level?.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-muted-foreground text-center py-8">No competitor threats tracked yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="moat">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Data Moat Growth</CardTitle></CardHeader>
              <CardContent>
                {moatGrowth?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moatGrowth.map((m: any) => ({
                      period: m.period,
                      score: Number(m.moat_depth_score),
                      escrow: m.total_escrow_transactions,
                      arb: m.total_arbitration_cases,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" name="Moat Score" />
                      <Bar dataKey="escrow" fill="hsl(var(--accent))" name="Escrow Txns" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No moat growth data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="superiority">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Escrow Superiority", rc: "Escrow-locked milestones, atomic capital logs", comp: "Self-reported payments, unverified outcomes" },
                { title: "Trust Superiority", rc: "Capital-tied trust, delivery history, arbitration records", comp: "Endorsements, self-claimed skills" },
                { title: "Intelligence Superiority", rc: "Predictive allocation, survival modeling, risk signals", comp: "Historical dashboards, static reports" },
              ].map(s => (
                <Card key={s.title}>
                  <CardHeader><CardTitle className="text-base">{s.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge className="mb-1">RCollab</Badge>
                      <p className="text-sm text-muted-foreground">{s.rc}</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-1">Competitors</Badge>
                      <p className="text-sm text-muted-foreground">{s.comp}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CompetitorDisplacementPage;
