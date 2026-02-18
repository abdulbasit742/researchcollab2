import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Shield, BarChart3, Brain, Users, DollarSign, Activity, Lock, TrendingUp, AlertTriangle, Database, Eye, Globe, Server, Gauge } from "lucide-react";

const HEALTH_METRICS = [
  { label: "API Latency", val: "42ms", target: "<100ms", pct: 95, icon: Gauge },
  { label: "Cache Hit Rate", val: "87%", target: ">85%", pct: 87, icon: Database },
  { label: "DB Load", val: "34%", target: "<60%", pct: 66, icon: Server },
  { label: "Escrow Integrity", val: "100%", target: "100%", pct: 100, icon: Shield },
  { label: "Arbitration Backlog", val: "3", target: "<10", pct: 90, icon: AlertTriangle },
  { label: "Security Alerts", val: "0", target: "0", pct: 100, icon: Lock },
];

export default function SupremacyUpgradePage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Supremacy Upgrade | Platform Hardening</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Supremacy Upgrade Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Full-stack hardening — performance, security, UX, trust, capital, AI, and enterprise readiness.</p>
        </div>

        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full max-w-4xl">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="performance">Perf</TabsTrigger>
            <TabsTrigger value="trust">Trust</TabsTrigger>
            <TabsTrigger value="capital">Capital</TabsTrigger>
            <TabsTrigger value="ai">AI Gov</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="moat">Moat</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {HEALTH_METRICS.map(m => (
                <Card key={m.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <m.icon className="h-5 w-5 text-primary" />
                      <Badge variant={m.pct >= 90 ? "default" : "secondary"}>{m.pct >= 90 ? "Healthy" : "Monitor"}</Badge>
                    </div>
                    <div className="text-2xl font-bold">{m.val}</div>
                    <p className="text-xs text-muted-foreground">Target: {m.target}</p>
                    <Progress value={m.pct} className="h-1.5 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Performance Optimization Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { area: "Query Optimization (N+1 elimination)", pct: 82 },
                  { area: "Composite Index Coverage", pct: 75 },
                  { area: "Dashboard Caching", pct: 68 },
                  { area: "Trust Score Read Cache", pct: 90 },
                  { area: "WebSocket Subscription Optimization", pct: 60 },
                  { area: "AI Endpoint Rate Limiting", pct: 85 },
                ].map(p => (
                  <div key={p.area}>
                    <div className="flex justify-between text-sm mb-1"><span>{p.area}</span><span className="font-semibold">{p.pct}%</span></div>
                    <Progress value={p.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Service Boundary Map</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {["Escrow Engine", "Arbitration Engine", "AI Engine", "Intelligence Engine", "Equity Engine", "Docs Engine"].map(s => (
                    <Card key={s} className="p-3 text-center">
                      <Server className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{s}</p>
                      <Badge variant="outline" className="mt-1 text-xs">Isolated</Badge>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Trust Recalibration Engine</CardTitle>
                <CardDescription>Versioned, adjustable, transparent, bias-tested scoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Verification Weight", val: "30%" },
                    { label: "Projects Weight", val: "20%" },
                    { label: "Delivery Weight", val: "15%" },
                    { label: "Dispute Weight", val: "15%" },
                    { label: "Financial Weight", val: "15%" },
                    { label: "Rating Weight", val: "5%" },
                  ].map(w => (
                    <Card key={w.label} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{w.label}</p>
                      <p className="text-lg font-bold">{w.val}</p>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Fake milestone inflation", "Self-loop collaboration rings", "Artificial bid behavior", "Suspicious escrow cycling"].map(t => (
                    <div key={t} className="flex items-center gap-2 p-2 rounded border">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm">{t}</span>
                      <Badge variant="outline" className="ml-auto text-xs">Monitored</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capital" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Capital Velocity Index</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: "Avg Deal Cycle", val: "12.4d" },
                    { label: "Escrow Hold", val: "48h" },
                    { label: "Dispute Delay", val: "6.2h" },
                    { label: "Capital Idle", val: "8%" },
                    { label: "Release Freq", val: "14/wk" },
                  ].map(v => (
                    <Card key={v.label} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{v.label}</p>
                      <p className="text-lg font-bold">{v.val}</p>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-primary/5 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Composite Velocity Score</p>
                  <p className="text-4xl font-bold text-primary">78</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI Model Governance</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Model Accuracy", val: "91.2%" },
                    { label: "Forecast Error", val: "±4.8%" },
                    { label: "Bias Risk Score", val: "Low" },
                    { label: "Data Drift", val: "None" },
                    { label: "Last Retrain", val: "3d ago" },
                    { label: "Confidence Band", val: "±6.2%" },
                  ].map(m => (
                    <Card key={m.label} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-lg font-semibold">{m.val}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Retention Intelligence</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "User Churn Risk", val: "12%", risk: "low" },
                    { label: "Founder Dropout Risk", val: "8%", risk: "low" },
                    { label: "Sponsor Disengagement", val: "18%", risk: "medium" },
                    { label: "Capital Withdrawal", val: "5%", risk: "low" },
                  ].map(r => (
                    <Card key={r.label} className="p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{r.label}</p>
                        <Badge variant={r.risk === "low" ? "default" : "secondary"}>{r.risk}</Badge>
                      </div>
                      <p className="text-2xl font-bold mt-2">{r.val}</p>
                      <Progress value={parseInt(r.val)} className="h-1.5 mt-2" />
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Data Network Effect — Economic Moat</CardTitle>
                <CardDescription>Compounding data advantage that competitors cannot replicate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: "Unique Projects", val: "12,847" },
                    { label: "Capital Flows", val: "8,234" },
                    { label: "Arbitration Cases", val: "1,423" },
                    { label: "Startup Lifecycles", val: "487" },
                    { label: "Employment Transitions", val: "6,912" },
                  ].map(d => (
                    <Card key={d.label} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                      <p className="text-lg font-bold">{d.val}</p>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-primary/5 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Compounding Moat Score</p>
                  <p className="text-4xl font-bold text-primary">84.6</p>
                  <p className="text-xs text-muted-foreground mt-1">↑ 3.2% from last month</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
