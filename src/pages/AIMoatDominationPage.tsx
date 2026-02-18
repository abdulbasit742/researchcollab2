import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Database, Shield, TrendingUp, Eye, Layers, Activity, Lock, Target, AlertTriangle, Zap, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from "recharts";

const aiLayers = [
  { layer: 1, name: "Descriptive Engine", items: ["Capital flow metrics", "Escrow velocity", "Trust movement", "Dispute frequency", "Employment conversion"], status: "active" },
  { layer: 2, name: "Diagnostic Engine", items: ["Why disputes occur", "Why milestones fail", "Sector underperformance", "Capital pool stagnation"], status: "active" },
  { layer: 3, name: "Predictive Engine", items: ["Startup survival probability", "Milestone completion likelihood", "Sponsor reliability risk", "Sector growth forecast"], status: "active" },
  { layer: 4, name: "Prescriptive Engine", items: ["Capital allocation recommendations", "Portfolio balancing", "Risk-adjusted guidance", "Dispute prevention alerts"], status: "active" },
  { layer: 5, name: "Macro Simulation Engine", items: ["Multi-country scenario modeling", "Policy impact simulation", "Capital reallocation outcomes", "Sector ripple effects"], status: "beta" },
];

// Mock data for rich visualizations
const mockSurvivalScatter = [
  { name: "TechStart", survival: 82, confidence: 88, capital: 5 },
  { name: "EduPlatform", survival: 65, confidence: 72, capital: 3 },
  { name: "HealthAI", survival: 91, confidence: 94, capital: 8 },
  { name: "AgriTech", survival: 45, confidence: 60, capital: 2 },
  { name: "FinServ", survival: 73, confidence: 80, capital: 6 },
  { name: "CleanEnergy", survival: 88, confidence: 85, capital: 7 },
  { name: "RetailAI", survival: 38, confidence: 55, capital: 1.5 },
  { name: "LogiTech", survival: 70, confidence: 75, capital: 4 },
];

const mockModelAccuracy = [
  { month: "Sep", survival: 72, allocation: 68, dispute: 74 },
  { month: "Oct", survival: 75, allocation: 71, dispute: 76 },
  { month: "Nov", survival: 78, allocation: 74, dispute: 79 },
  { month: "Dec", survival: 80, allocation: 77, dispute: 82 },
  { month: "Jan", survival: 83, allocation: 79, dispute: 84 },
  { month: "Feb", survival: 85, allocation: 82, dispute: 87 },
];

const mockSectorRadar = [
  { sector: "AI/ML", momentum: 92, confidence: 88, volatility: 45 },
  { sector: "FinTech", momentum: 78, confidence: 82, volatility: 35 },
  { sector: "EdTech", momentum: 65, confidence: 70, volatility: 25 },
  { sector: "Health", momentum: 85, confidence: 80, volatility: 30 },
  { sector: "CleanTech", momentum: 70, confidence: 75, volatility: 40 },
  { sector: "AgriTech", momentum: 55, confidence: 60, volatility: 20 },
];

const mockDisputeRisk = [
  { month: "Sep", predicted: 12, actual: 14, prevented: 3 },
  { month: "Oct", predicted: 10, actual: 11, prevented: 5 },
  { month: "Nov", predicted: 8, actual: 9, prevented: 6 },
  { month: "Dec", predicted: 7, actual: 7, prevented: 8 },
  { month: "Jan", predicted: 6, actual: 5, prevented: 9 },
  { month: "Feb", predicted: 5, actual: 4, prevented: 11 },
];

const AIMoatDominationPage = () => {
  const { data: dataDepth } = useQuery({
    queryKey: ["ai-data-depth"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_data_depth_index").select("*").order("recorded_at", { ascending: false }).limit(12);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["ai-decision-audits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_decision_audit_logs").select("*").order("decided_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: survivalPredictions } = useQuery({
    queryKey: ["survival-predictions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("survival_predictions").select("*").order("predicted_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: modelAccuracy } = useQuery({
    queryKey: ["model-accuracy"],
    queryFn: async () => {
      const { data, error } = await supabase.from("model_accuracy_index").select("*").order("measured_at", { ascending: false }).limit(12);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: sectorAccel } = useQuery({
    queryKey: ["sector-acceleration-v2"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sector_acceleration").select("*").order("detected_at", { ascending: false }).limit(15);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: disputePreds } = useQuery({
    queryKey: ["dispute-predictions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dispute_predictions").select("*").order("predicted_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const latestDepth = dataDepth?.[0];
  const avgBias = auditLogs?.length
    ? (auditLogs.reduce((s: number, l: any) => s + Number(l.bias_audit_score || 0), 0) / auditLogs.length).toFixed(1)
    : "N/A";
  const latestAccuracy = modelAccuracy?.[0];

  return (
    <MainLayout>
      <Helmet><title>AI Moat Domination | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Moat Domination Architecture</h1>
            <p className="text-muted-foreground">Proprietary intelligence superiority & self-reinforcing data advantage engine.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: "AI Layers Active", value: 5, icon: Layers, color: "text-primary" },
            { label: "Data Depth", value: latestDepth ? Number(latestDepth.overall_depth_score).toFixed(0) : "0", icon: Database, color: "text-blue-500" },
            { label: "Model Accuracy", value: latestAccuracy ? `${Number(latestAccuracy.prediction_accuracy).toFixed(0)}%` : "—", icon: Target, color: "text-emerald-500" },
            { label: "Audit Logs", value: auditLogs?.length || 0, icon: Eye, color: "text-amber-500" },
            { label: "Predictions Made", value: survivalPredictions?.length || 0, icon: TrendingUp, color: "text-purple-500" },
            { label: "Avg Bias Score", value: avgBias, icon: Shield, color: "text-red-500" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="stack" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="stack">5-Layer Stack</TabsTrigger>
            <TabsTrigger value="survival">Survival Engine</TabsTrigger>
            <TabsTrigger value="allocation">Capital Allocation</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Prevention</TabsTrigger>
            <TabsTrigger value="sectors">Sector Acceleration</TabsTrigger>
            <TabsTrigger value="accuracy">Model Accuracy</TabsTrigger>
            <TabsTrigger value="depth">Data Depth</TabsTrigger>
            <TabsTrigger value="audit">Decision Audit</TabsTrigger>
            <TabsTrigger value="protection">Protection</TabsTrigger>
            <TabsTrigger value="marketplace">Intelligence Market</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* 5-LAYER STACK */}
          <TabsContent value="stack">
            <div className="space-y-4">
              {aiLayers.map(l => (
                <Card key={l.layer}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                        L{l.layer}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{l.name}</p>
                          <Badge variant={l.status === "active" ? "default" : "secondary"}>{l.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {l.items.map(item => (
                            <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SURVIVAL ENGINE */}
          <TabsContent value="survival" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Survival Probability vs Confidence</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="survival" name="Survival %" unit="%" type="number" domain={[0, 100]} />
                      <YAxis dataKey="confidence" name="Confidence %" unit="%" type="number" domain={[0, 100]} />
                      <ZAxis dataKey="capital" name="Capital (M)" range={[50, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Startups" data={mockSurvivalScatter} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Prediction Input Weights</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { factor: "Founder Delivery Consistency", weight: 22 },
                      { factor: "Milestone Adherence", weight: 18 },
                      { factor: "Trust Trajectory Slope", weight: 15 },
                      { factor: "Capital Stage Timing", weight: 12 },
                      { factor: "Corporate Sponsor Behavior", weight: 10 },
                      { factor: "Sector Volatility", weight: 9 },
                      { factor: "Equity Dilution Pattern", weight: 8 },
                      { factor: "Arbitration Exposure", weight: 6 },
                    ].map(f => (
                      <div key={f.factor}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{f.factor}</span>
                          <span className="font-medium">{f.weight}%</span>
                        </div>
                        <Progress value={f.weight * 4} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg">Risk Band Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { band: "Low Risk", count: 12, pct: 48, color: "bg-emerald-500" },
                    { band: "Moderate Risk", count: 9, pct: 36, color: "bg-amber-500" },
                    { band: "High Risk", count: 4, pct: 16, color: "bg-red-500" },
                  ].map(b => (
                    <div key={b.band} className="text-center p-4 rounded-lg border border-border">
                      <div className={`h-3 w-3 rounded-full ${b.color} mx-auto mb-2`} />
                      <p className="font-semibold">{b.band}</p>
                      <p className="text-2xl font-bold">{b.count}</p>
                      <p className="text-xs text-muted-foreground">{b.pct}% of portfolio</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAPITAL ALLOCATION */}
          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Sector Allocation Simulation</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { sector: "AI/ML", current: 35, recommended: 28, efficiency: 92 },
                    { sector: "FinTech", current: 25, recommended: 22, efficiency: 85 },
                    { sector: "EdTech", current: 15, recommended: 20, efficiency: 78 },
                    { sector: "Health", current: 10, recommended: 18, efficiency: 88 },
                    { sector: "Clean", current: 10, recommended: 8, efficiency: 70 },
                    { sector: "Agri", current: 5, recommended: 4, efficiency: 65 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="sector" className="text-xs" />
                    <YAxis unit="%" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" name="Current %" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} />
                    <Bar dataKey="recommended" name="AI Recommended %" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Projected Yield", value: "14.2%" },
                { label: "Employment Conv.", value: "37%" },
                { label: "Capital Efficiency", value: "82/100" },
                { label: "Dispute Risk", value: "4.1%" },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-bold mt-1">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* DISPUTE PREVENTION */}
          <TabsContent value="disputes" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Dispute Prevention Effectiveness</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockDisputeRisk}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predicted" name="Predicted Disputes" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} />
                    <Bar dataKey="actual" name="Actual Disputes" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                    <Bar dataKey="prevented" name="Prevented" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Prevention Triggers</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { trigger: "Pre-Milestone Review", count: 23, icon: Eye },
                    { trigger: "Automated Reminders", count: 45, icon: Zap },
                    { trigger: "Risk Mitigation Sent", count: 18, icon: Shield },
                    { trigger: "Burnout Alert", count: 7, icon: AlertTriangle },
                  ].map(t => (
                    <div key={t.trigger} className="p-3 rounded-lg border border-border text-center">
                      <t.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">{t.trigger}</p>
                      <p className="text-2xl font-bold mt-1">{t.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTOR ACCELERATION */}
          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Sector Momentum Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={mockSectorRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="sector" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Momentum" dataKey="momentum" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    <Radar name="Confidence" dataKey="confidence" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {(sectorAccel?.length ? sectorAccel : mockSectorRadar).map((s: any, i: number) => (
                <Card key={s.id || i}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{s.sector_name || s.sector}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>Momentum: {Number(s.momentum_score || s.momentum).toFixed(0)}</span>
                          <span>Confidence: {Number(s.acceleration_confidence || s.confidence).toFixed(0)}%</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {s.funding_velocity_spike && <Badge variant="secondary" className="text-xs">Funding Spike</Badge>}
                          {s.hiring_surge_detected && <Badge variant="secondary" className="text-xs">Hiring Surge</Badge>}
                          {s.founder_clustering && <Badge variant="secondary" className="text-xs">Founder Cluster</Badge>}
                        </div>
                      </div>
                      <Badge variant={(s.volatility_band || "medium") === "high" ? "destructive" : "secondary"}>
                        {s.volatility_band || "medium"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MODEL ACCURACY */}
          <TabsContent value="accuracy" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Model Accuracy Trend (Self-Learning Loop)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockModelAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis unit="%" domain={[60, 100]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="survival" name="Survival Model" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="allocation" name="Allocation Model" stroke="hsl(var(--accent))" strokeWidth={2} />
                    <Line type="monotone" dataKey="dispute" name="Dispute Model" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Forecast Error Band", value: "±4.2%" },
                { label: "Drift Detected", value: "No" },
                { label: "Retraining Due", value: "14 days" },
                { label: "Bias Risk", value: "Low (0.12)" },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold mt-1">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* DATA DEPTH */}
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
                      <Legend />
                      <Line type="monotone" dataKey="depth" stroke="hsl(var(--primary))" name="Depth Score" strokeWidth={2} />
                      <Line type="monotone" dataKey="escrow" stroke="hsl(var(--accent))" name="Escrow Depth" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data depth records yet. Data moat grows with every transaction.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DECISION AUDIT */}
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

          {/* PROTECTION */}
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
                    <div key={r.rule} className="flex items-start gap-2 p-3 rounded-lg border border-border">
                      <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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

          {/* INTELLIGENCE MARKETPLACE */}
          <TabsContent value="marketplace" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Startup Survival Forecasts", type: "Predictive", tier: "Premium", price: 9999 },
                { name: "Sector Acceleration Reports", type: "Analytical", tier: "Standard", price: 4999 },
                { name: "Capital Efficiency Analysis", type: "Diagnostic", tier: "Premium", price: 7999 },
                { name: "Gov Innovation Projections", type: "Macro", tier: "Enterprise", price: 14999 },
                { name: "Corporate Hiring Intelligence", type: "Predictive", tier: "Standard", price: 5999 },
                { name: "Cross-Node Economic Forecast", type: "Simulation", tier: "Enterprise", price: 19999 },
              ].map(p => (
                <Card key={p.name}>
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{p.type}</Badge>
                      <Badge>{p.tier}</Badge>
                    </div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-lg font-bold mt-2">PKR {p.price.toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Subscription only · No raw data</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* GOVERNANCE */}
          <TabsContent value="governance">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Explainability Requirements</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Top 5 weighted features on every decision",
                    "Confidence intervals on all predictions",
                    "Risk factors explicitly listed",
                    "Alternative scenarios always generated",
                    "Historical comparison provided",
                    "Bias audit score on every output",
                    "Human approval before capital allocation",
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
                      <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
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
