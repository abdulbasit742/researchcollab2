import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Database, Shield, TrendingUp, Eye, Layers, Activity, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

const aiLayers = [
  { layer: 1, name: "Descriptive Engine", items: ["Capital flow metrics", "Escrow velocity", "Trust movement", "Dispute frequency", "Employment conversion"] },
  { layer: 2, name: "Diagnostic Engine", items: ["Why disputes occur", "Why milestones fail", "Sector underperformance", "Capital pool stagnation"] },
  { layer: 3, name: "Predictive Engine", items: ["Startup survival probability", "Milestone completion likelihood", "Sponsor reliability risk", "Sector growth forecast"] },
  { layer: 4, name: "Prescriptive Engine", items: ["Capital allocation recommendations", "Portfolio balancing", "Risk-adjusted guidance", "Dispute prevention alerts"] },
  { layer: 5, name: "Macro Simulation Engine", items: ["Multi-country scenario modeling", "Policy impact simulation", "Capital reallocation outcomes", "Sector ripple effects"] },
];

const AIMoatDominationPage = () => {
  const { data: dataDepth } = useQuery({
    queryKey: ["ai-data-depth"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_data_depth_index" as any).select("*").order("recorded_at", { ascending: false }).limit(12);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["ai-decision-audits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_decision_audit_logs" as any).select("*").order("decided_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: sectorSignals } = useQuery({
    queryKey: ["sector-acceleration"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sector_acceleration_signals" as any).select("*").order("detected_at", { ascending: false }).limit(15);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const latestDepth = dataDepth?.[0];
  const avgBias = auditLogs?.length
    ? (auditLogs.reduce((s: number, l: any) => s + Number(l.bias_audit_score || 0), 0) / auditLogs.length).toFixed(1)
    : "N/A";

  return (
    <MainLayout>
      <Helmet><title>AI Moat Domination | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Moat Domination Architecture</h1>
            <p className="text-muted-foreground">Proprietary intelligence superiority & self-reinforcing data advantage.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "AI Layers", value: 5, icon: Layers, color: "text-primary" },
            { label: "Data Depth Score", value: latestDepth ? Number(latestDepth.overall_depth_score).toFixed(0) : "0", icon: Database, color: "text-blue-500" },
            { label: "Audit Logs", value: auditLogs?.length || 0, icon: Eye, color: "text-green-500" },
            { label: "Avg Bias Score", value: avgBias, icon: Shield, color: "text-orange-500" },
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

        <Tabs defaultValue="stack">
          <TabsList>
            <TabsTrigger value="stack">5-Layer Stack</TabsTrigger>
            <TabsTrigger value="depth">Data Depth</TabsTrigger>
            <TabsTrigger value="audit">Decision Audit</TabsTrigger>
            <TabsTrigger value="sectors">Sector Acceleration</TabsTrigger>
            <TabsTrigger value="protection">Model Protection</TabsTrigger>
            <TabsTrigger value="governance">AI Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="stack">
            <div className="space-y-4">
              {aiLayers.map(l => (
                <Card key={l.layer}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                        L{l.layer}
                      </div>
                      <div>
                        <p className="font-semibold">{l.name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {l.items.map(item => (
                            <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="depth">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> AI Data Depth Over Time</CardTitle></CardHeader>
              <CardContent>
                {dataDepth?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[...dataDepth].reverse().map((d: any) => ({
                      period: d.period,
                      depth: Number(d.overall_depth_score),
                      escrow: d.escrow_transaction_depth,
                      milestones: d.milestone_completion_depth,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="depth" stroke="hsl(var(--primary))" name="Depth Score" strokeWidth={2} />
                      <Line type="monotone" dataKey="escrow" stroke="hsl(var(--accent))" name="Escrow Depth" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data depth records yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-3">
              {auditLogs?.length ? auditLogs.map((log: any) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{log.decision_type}</p>
                          {log.model_version && <Badge variant="outline">{log.model_version}</Badge>}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Confidence: {Number(log.confidence_interval).toFixed(0)}%</span>
                          <span>Bias: {Number(log.bias_audit_score).toFixed(1)}</span>
                          <span>{new Date(log.decided_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant={Number(log.bias_audit_score) < 20 ? "default" : "destructive"}>
                        {Number(log.bias_audit_score) < 20 ? "Clean" : "Review"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-muted-foreground text-center py-8">No AI decision audit logs yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <div className="space-y-3">
              {sectorSignals?.length ? sectorSignals.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{s.sector_name}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Momentum: {Number(s.momentum_score).toFixed(0)}</span>
                          <span>Confidence: {Number(s.acceleration_confidence).toFixed(0)}%</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {s.funding_velocity_spike && <Badge variant="secondary" className="text-xs">Funding Spike</Badge>}
                          {s.cross_node_hiring_surge && <Badge variant="secondary" className="text-xs">Hiring Surge</Badge>}
                          {s.founder_clustering && <Badge variant="secondary" className="text-xs">Founder Cluster</Badge>}
                          {s.corporate_density_growth && <Badge variant="secondary" className="text-xs">Corp Growth</Badge>}
                        </div>
                      </div>
                      <Badge variant={s.volatility_band === "high" ? "destructive" : "secondary"}>
                        {s.volatility_band}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-muted-foreground text-center py-8">No sector acceleration signals yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="protection">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Model Protection Strategy</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { rule: "No Raw Model Export", desc: "Models stay on-platform only" },
                    { rule: "API-Level Access Only", desc: "Inference via rate-limited API" },
                    { rule: "Aggregated Results Only", desc: "No individual data point exposure" },
                    { rule: "Rate-Limited Inference", desc: "Tiered access prevents abuse" },
                    { rule: "Parameter Encryption", desc: "Model weights encrypted at rest" },
                    { rule: "Access Tier Segmentation", desc: "Different tiers see different depth" },
                  ].map(r => (
                    <div key={r.rule} className="flex items-start gap-2 p-3 rounded-lg border">
                      <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{r.rule}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Governance Principles</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Every AI decision includes top 5 weighted features",
                    "Confidence intervals on all predictions",
                    "Alternative scenarios always generated",
                    "Bias audit score on every output",
                    "No black box decisions allowed",
                    "Human approval required before capital allocation",
                  ].map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm">
                      <Activity className="h-3 w-3 text-primary shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>5-Year AI Moat Targets</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Survival prediction accuracy materially superior",
                    "Capital allocation error margin shrinking annually",
                    "Arbitration risk prediction reducing disputes",
                    "Intelligence marketplace ARR significant",
                    "Data depth impossible to replicate quickly",
                    "Cross-node economic forecasting unmatched",
                  ].map(t => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AIMoatDominationPage;
