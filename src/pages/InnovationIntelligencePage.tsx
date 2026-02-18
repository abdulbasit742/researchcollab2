import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Shield, Zap, BarChart3, AlertTriangle, Cpu, Lock, Users, Activity } from "lucide-react";

const MODEL_LAYERS = [
  { layer: 1, label: "Descriptive Analytics", description: "Historical data aggregation and pattern recognition", status: "production", accuracy: 94 },
  { layer: 2, label: "Predictive Forecasting", description: "Future trend projection using multi-variable models", status: "production", accuracy: 87 },
  { layer: 3, label: "Allocation Optimization", description: "Capital-to-talent routing with risk balancing", status: "staging", accuracy: 82 },
  { layer: 4, label: "Scenario Simulation", description: "Multi-variable what-if modeling engine", status: "staging", accuracy: 79 },
  { layer: 5, label: "Macro Economic Modeling", description: "National-level innovation ecosystem forecasting", status: "development", accuracy: 71 },
];

const RISK_TYPES = [
  { type: "dispute_trend", label: "Rising Dispute Trends", severity: "medium", count: 3 },
  { type: "capital_concentration", label: "Capital Concentration", severity: "high", count: 1 },
  { type: "ai_bias", label: "AI Bias Emergence", severity: "low", count: 2 },
  { type: "governance_imbalance", label: "Governance Imbalance", severity: "medium", count: 1 },
  { type: "regional_underperformance", label: "Regional Underperformance", severity: "low", count: 4 },
];

const SECTORS = [
  { name: "AI & Machine Learning", signal: "funding_spike", intensity: 92, trend: "+34%" },
  { name: "FinTech", signal: "employment_cluster", intensity: 78, trend: "+21%" },
  { name: "HealthTech", signal: "emerging_hub", intensity: 85, trend: "+28%" },
  { name: "EdTech", signal: "cross_node_momentum", intensity: 67, trend: "+15%" },
  { name: "CleanTech", signal: "funding_spike", intensity: 73, trend: "+19%" },
];

const severityColor = (s: string) =>
  s === "critical" ? "text-red-500" : s === "high" ? "text-orange-500" : s === "medium" ? "text-yellow-500" : "text-green-500";

const statusBadge = (s: string) =>
  s === "production" ? "default" : s === "staging" ? "secondary" : "outline";

export default function InnovationIntelligencePage() {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Innovation Intelligence Engine v2</h1>
          </div>
          <p className="text-muted-foreground">Proprietary AI superiority layer — predictive, optimization & decision-support models</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-6">
            <TabsTrigger value="architecture">AI Stack</TabsTrigger>
            <TabsTrigger value="capital">Capital Optimizer</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="risk">Risk & Signals</TabsTrigger>
            <TabsTrigger value="protection">IP Protection</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" /> Multi-Layer Model Architecture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MODEL_LAYERS.map((m) => (
                    <div key={m.layer} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                        L{m.layer}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{m.label}</span>
                          <Badge variant={statusBadge(m.status) as any}>{m.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{m.description}</p>
                      </div>
                      <div className="text-right w-32">
                        <div className="text-sm font-medium">{m.accuracy}% accuracy</div>
                        <Progress value={m.accuracy} className="h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Data Integration Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Escrow Data", "Milestone Performance", "Trust Scores", "Employment Outcomes", "Startup Data", "Capital Flows", "Arbitration Records", "Node Metrics"].map((s) => (
                      <div key={s} className="flex items-center gap-2 p-3 border rounded-lg text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        {s}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Continuous Learning Loop</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["Outcome Variance", "Allocation Accuracy", "Dispute Results", "Employment Tracking", "Startup Exits"].map((item, i) => (
                      <div key={item} className="flex items-center gap-2">
                        <Badge variant="outline">{item}</Badge>
                        {i < 4 && <span className="text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Models automatically retrain when outcome variance exceeds threshold. All retraining events are logged and auditable.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capital" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Allocation Confidence</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">87<span className="text-lg">/100</span></div>
                  <p className="text-sm text-muted-foreground mt-1">Human approval required</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Portfolio Risk</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-500">Medium</div>
                  <p className="text-sm text-muted-foreground mt-1">Sector correlation: 0.34</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Innovation Saturation</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">23%</div>
                  <p className="text-sm text-muted-foreground mt-1">Room for growth detected</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Capital Efficiency Optimizer v2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { factor: "Portfolio Risk Balancing", score: 82 },
                  { factor: "Sector Correlation Analysis", score: 76 },
                  { factor: "Regional Cost-Adjusted Returns", score: 89 },
                  { factor: "Talent Density Weighting", score: 71 },
                  { factor: "Innovation Saturation Detection", score: 68 },
                ].map((f) => (
                  <div key={f.factor} className="flex items-center gap-4">
                    <span className="w-64 text-sm">{f.factor}</span>
                    <Progress value={f.score} className="flex-1 h-3" />
                    <span className="text-sm font-medium w-12 text-right">{f.score}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Startup Survival Probability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: "TechVenture Alpha", probability: 78, stage: "Series A", factors: ["Strong founder record", "Growing sector"] },
                    { name: "EduInnovate Beta", probability: 62, stage: "Seed", factors: ["FYP origin", "Moderate sector volatility"] },
                    { name: "HealthBridge Gamma", probability: 85, stage: "Series B", factors: ["Clean arbitration", "High equity health"] },
                    { name: "GreenFlow Delta", probability: 54, stage: "Pre-Seed", factors: ["New founder", "Emerging market"] },
                  ].map((s) => (
                    <div key={s.name} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <Badge variant="outline" className="mt-1">{s.stage}</Badge>
                        </div>
                        <div className={`text-2xl font-bold ${s.probability >= 70 ? "text-green-500" : s.probability >= 55 ? "text-yellow-500" : "text-red-500"}`}>
                          {s.probability}%
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {s.factors.map((f) => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Displayed to investors privately. All scores include confidence bands and bias impact assessments.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Employment Conversion Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { metric: "Hiring Likelihood per FYP", value: "67%", trend: "↑ 5%" },
                    { metric: "Sectoral Demand Surge", value: "AI/ML, HealthTech", trend: "Active" },
                    { metric: "Talent Oversupply Risk", value: "Low", trend: "Stable" },
                    { metric: "University Employability", value: "Rising", trend: "↑ 12%" },
                  ].map((m) => (
                    <div key={m.metric} className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">{m.metric}</div>
                      <div className="text-xl font-bold mt-1">{m.value}</div>
                      <div className="text-sm text-green-500">{m.trend}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Sector Acceleration Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SECTORS.map((s) => (
                    <div key={s.name} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{s.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{s.signal.replace(/_/g, " ")}</Badge>
                      </div>
                      <div className="w-32">
                        <Progress value={s.intensity} className="h-2" />
                      </div>
                      <div className="text-sm font-medium text-green-500 w-16 text-right">{s.trend}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scenario Simulation Engine v2</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-3">Example: "If capital increases 20% in AI/ML across South Asia for 24 months…"</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Startup Yield", value: "+18%" },
                      { label: "Employment Gain", value: "+2,400" },
                      { label: "Capital Efficiency", value: "87/100" },
                      { label: "Risk Level", value: "Medium" },
                      { label: "Dispute Likelihood", value: "12%" },
                    ].map((p) => (
                      <div key={p.label} className="text-center p-2 bg-background rounded border">
                        <div className="text-xs text-muted-foreground">{p.label}</div>
                        <div className="font-bold mt-1">{p.value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Available to enterprise and government tiers. Every output includes top contributing factors, confidence bands, and alternative scenarios.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Innovation Risk Early Warning System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RISK_TYPES.map((r) => (
                  <div key={r.type} className="flex items-center gap-4 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 ${severityColor(r.severity)}`} />
                    <div className="flex-1">
                      <div className="font-medium">{r.label}</div>
                      <Badge variant={r.severity === "high" ? "destructive" : "outline"} className="text-xs mt-1">{r.severity}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{r.count} active alert{r.count !== 1 ? "s" : ""}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Explainability & Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Every AI output includes:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { item: "Top Contributing Factors", desc: "Ranked list of variables driving the prediction" },
                      { item: "Confidence Band", desc: "Statistical certainty range (e.g., 72-88%)" },
                      { item: "Historical Comparison", desc: "How current output compares to past predictions" },
                      { item: "Bias Impact Score", desc: "Measured demographic and regional bias impact" },
                      { item: "Alternative Scenario", desc: "What changes if key assumptions shift" },
                      { item: "Audit Trail", desc: "Full decision lineage for regulatory review" },
                    ].map((e) => (
                      <div key={e.item} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{e.item}</div>
                        <div className="text-xs text-muted-foreground mt-1">{e.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Proprietary Model Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { control: "Model Access Control", desc: "Role-based access to model outputs by subscription tier", status: "Active" },
                    { control: "API Rate Restriction", desc: "Tiered API limits prevent bulk data extraction", status: "Active" },
                    { control: "No Raw Model Export", desc: "Model weights and parameters never leave the platform", status: "Enforced" },
                    { control: "Subscription-Gated Access", desc: "Advanced forecasting requires enterprise tier", status: "Active" },
                    { control: "Parameter Encryption", desc: "AES-256-GCM encryption of all model parameters at rest", status: "Enforced" },
                    { control: "Audit Logging", desc: "Every model query logged with user, timestamp, and scope", status: "Active" },
                  ].map((c) => (
                    <div key={c.control} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{c.control}</div>
                        <Badge variant="default">{c.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Governance Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rule: "Human-in-the-Loop", desc: "All allocation decisions require human approval before execution" },
                    { rule: "Explainability Mandate", desc: "No opaque decisions — every output traceable to input factors" },
                    { rule: "Sovereign Compliance", desc: "Models respect data residency and node sovereignty rules" },
                    { rule: "Bias Monitoring", desc: "Continuous fairness auditing across demographic and regional dimensions" },
                  ].map((r) => (
                    <div key={r.rule} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{r.rule}</div>
                        <p className="text-sm text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
