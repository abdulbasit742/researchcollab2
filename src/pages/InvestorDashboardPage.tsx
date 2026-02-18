import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Shield, Target, BarChart3, AlertTriangle, Building2, FileText, Globe, Layers } from "lucide-react";

const metricCategories = [
  { key: "gmv", label: "GMV", value: "PKR 847M", change: "+23%", icon: DollarSign },
  { key: "escrow", label: "Escrow Volume", value: "PKR 312M", change: "+18%", icon: Shield },
  { key: "revenue", label: "Net Revenue", value: "PKR 42M", change: "+31%", icon: TrendingUp },
  { key: "take_rate", label: "Take Rate", value: "7.2%", change: "+0.3%", icon: Target },
  { key: "retention", label: "Retention", value: "89%", change: "+2%", icon: BarChart3 },
  { key: "churn", label: "Churn", value: "4.1%", change: "-0.8%", icon: AlertTriangle },
];

const segments = [
  { name: "Student", revenue: 12400000, cost: 3100000, retention: 82, users: 45200, upsell: 34 },
  { name: "Founder", revenue: 18700000, cost: 4200000, retention: 91, users: 8400, upsell: 52 },
  { name: "Corporate", revenue: 48200000, cost: 8100000, retention: 96, users: 340, upsell: 71 },
  { name: "Capital Pool", revenue: 22100000, cost: 5400000, retention: 94, users: 120, upsell: 45 },
  { name: "Government", revenue: 31500000, cost: 9200000, retention: 98, users: 28, upsell: 38 },
  { name: "Intelligence Sub", revenue: 15800000, cost: 2800000, retention: 88, users: 1200, upsell: 62 },
];

const revenueEngines = [
  { name: "Escrow Commission", pct: 35 },
  { name: "Intelligence Subscriptions", pct: 22 },
  { name: "Enterprise Alliances", pct: 20 },
  { name: "Government Contracts", pct: 15 },
  { name: "Ecosystem Marketplace", pct: 8 },
];

const moatPillars = [
  { name: "Escrow Data Depth", replicability: 15, advantage: 92, switching: 88, months: 48 },
  { name: "Arbitration Precedents", replicability: 10, advantage: 95, switching: 91, months: 60 },
  { name: "Innovation Dataset", replicability: 20, advantage: 85, switching: 78, months: 36 },
  { name: "Trust Scoring History", replicability: 12, advantage: 90, switching: 85, months: 42 },
  { name: "Corporate Alliance Density", replicability: 25, advantage: 75, switching: 82, months: 30 },
  { name: "Government Integration", replicability: 8, advantage: 96, switching: 94, months: 72 },
  { name: "Protocol Certification", replicability: 18, advantage: 82, switching: 76, months: 36 },
  { name: "Developer Ecosystem", replicability: 30, advantage: 68, switching: 65, months: 24 },
];

const risks = [
  { category: "Regulatory", level: "medium", probability: 35, impact: 70, mitigation: "Multi-jurisdiction compliance framework active" },
  { category: "Political", level: "medium", probability: 25, impact: 60, mitigation: "Anti-capture safeguards and foundation governance" },
  { category: "Capital Concentration", level: "low", probability: 15, impact: 50, mitigation: "Diversified revenue across 5 engines" },
  { category: "AI Bias", level: "low", probability: 20, impact: 45, mitigation: "Monthly bias audits and explainability layer" },
  { category: "Security", level: "low", probability: 10, impact: 90, mitigation: "Enterprise-grade encryption and MFA enforcement" },
  { category: "Market Adoption", level: "medium", probability: 30, impact: 65, mitigation: "Multi-stakeholder onboarding and network effects" },
  { category: "Competitive", level: "low", probability: 20, impact: 40, mitigation: "Deep moat across 8 defensibility pillars" },
];

const valuationScenarios = [
  { multiple: "SaaS (12x ARR)", low: "PKR 1.8B", mid: "PKR 2.4B", high: "PKR 3.6B" },
  { multiple: "Infra (15x ARR)", low: "PKR 2.2B", mid: "PKR 3.0B", high: "PKR 4.5B" },
  { multiple: "Fintech (18x ARR)", low: "PKR 2.7B", mid: "PKR 3.6B", high: "PKR 5.4B" },
  { multiple: "Intel Platform (22x)", low: "PKR 3.3B", mid: "PKR 4.4B", high: "PKR 6.6B" },
];

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState("kpis");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Dashboard</h1>
          <p className="text-muted-foreground">Institutional-grade metrics & valuation intelligence</p>
        </div>
        <Badge variant="outline" className="text-xs">Series A Ready</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="kpis"><BarChart3 className="h-3.5 w-3.5 mr-1" />KPIs</TabsTrigger>
          <TabsTrigger value="unit-economics"><Layers className="h-3.5 w-3.5 mr-1" />Unit Economics</TabsTrigger>
          <TabsTrigger value="revenue"><DollarSign className="h-3.5 w-3.5 mr-1" />Revenue Model</TabsTrigger>
          <TabsTrigger value="moat"><Shield className="h-3.5 w-3.5 mr-1" />Defensibility</TabsTrigger>
          <TabsTrigger value="valuation"><TrendingUp className="h-3.5 w-3.5 mr-1" />Valuation</TabsTrigger>
          <TabsTrigger value="risk"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Risk Model</TabsTrigger>
          <TabsTrigger value="board"><FileText className="h-3.5 w-3.5 mr-1" />Board Report</TabsTrigger>
          <TabsTrigger value="exit"><Globe className="h-3.5 w-3.5 mr-1" />Exit Pathways</TabsTrigger>
        </TabsList>

        {/* KPIs */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metricCategories.map((m) => (
              <Card key={m.key}>
                <CardContent className="p-4 text-center">
                  <m.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold">{m.value}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{m.change}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Growth Curves</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {["Users", "GMV", "Revenue", "Nodes"].map((item, i) => (
                  <div key={item} className="space-y-1">
                    <div className="flex justify-between text-xs"><span>{item}</span><span>{["+34%", "+23%", "+31%", "+40%"][i]}</span></div>
                    <Progress value={[78, 65, 72, 55][i]} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Retention Cohorts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {["Month 1", "Month 3", "Month 6", "Month 12"].map((item, i) => (
                  <div key={item} className="space-y-1">
                    <div className="flex justify-between text-xs"><span>{item}</span><span>{[95, 89, 82, 76][i]}%</span></div>
                    <Progress value={[95, 89, 82, 76][i]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Unit Economics */}
        <TabsContent value="unit-economics" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((s) => (
              <Card key={s.name}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{s.name}</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Revenue</span><span className="font-medium">PKR {(s.revenue / 1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span>Cost</span><span className="font-medium">PKR {(s.cost / 1e6).toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span>Margin</span><span className="font-bold text-primary">{(((s.revenue - s.cost) / s.revenue) * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Retention</span><span>{s.retention}%</span></div>
                  <div className="flex justify-between"><span>Users</span><span>{s.users.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Upsell Prob</span><span>{s.upsell}%</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Revenue Model */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">5 Core Revenue Engines</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {revenueEngines.map((e) => (
                <div key={e.name} className="space-y-1">
                  <div className="flex justify-between text-xs"><span>{e.name}</span><span>{e.pct}%</span></div>
                  <Progress value={e.pct * 2.5} />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["10K", "100K", "1M", "10M"].map((tier, i) => (
              <Card key={tier}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">{tier} Users</p>
                  <p className="text-lg font-bold mt-1">PKR {[42, 380, 2800, 18500][i]}M</p>
                  <p className="text-xs text-muted-foreground">Projected Revenue</p>
                  <div className="mt-2 text-xs">
                    <span className="text-primary font-medium">{[68, 72, 78, 82][i]}% Gross Margin</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Defensibility / Moat */}
        <TabsContent value="moat" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {moatPillars.map((p) => (
              <Card key={p.name}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{p.name}</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Replicability Risk</span><Badge variant={p.replicability < 20 ? "default" : "secondary"}>{p.replicability}%</Badge></div>
                  <div className="flex justify-between"><span>Data Advantage</span><span className="font-bold">{p.advantage}/100</span></div>
                  <div className="flex justify-between"><span>Switching Cost</span><span>{p.switching}/100</span></div>
                  <div className="flex justify-between"><span>Time to Replicate</span><span>{p.months} months</span></div>
                  <Progress value={p.advantage} className="mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Valuation */}
        <TabsContent value="valuation" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {valuationScenarios.map((v) => (
              <Card key={v.multiple}>
                <CardContent className="p-4 text-center space-y-2">
                  <p className="text-xs font-medium">{v.multiple}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span>Conservative</span><span>{v.low}</span></div>
                    <div className="flex justify-between"><span className="font-bold">Base</span><span className="font-bold text-primary">{v.mid}</span></div>
                    <div className="flex justify-between"><span>Optimistic</span><span>{v.high}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Valuation Drivers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["GMV Growth +23%", "Intelligence ARR +45%", "Node Velocity +40%", "Retention 89%", "Data Moat Score 87/100"].map((d) => (
                <div key={d} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{d}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Model */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {risks.map((r) => (
              <Card key={r.category}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{r.category} Risk</CardTitle>
                    <Badge variant={r.level === "low" ? "default" : r.level === "medium" ? "secondary" : "destructive"}>{r.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Probability</span><span>{r.probability}%</span></div>
                  <div className="flex justify-between"><span>Impact</span><span>{r.impact}/100</span></div>
                  <p className="text-muted-foreground mt-1">{r.mitigation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Board Report */}
        <TabsContent value="board" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Q1 2026 Board Report</CardTitle>
                <Button size="sm" variant="outline">Export PDF</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { section: "KPI Performance", status: "On Track", detail: "All 17 canonical metrics trending positively" },
                { section: "Capital Efficiency", status: "Strong", detail: "7.2% take rate, 68% gross margin" },
                { section: "Node Expansion", status: "Accelerating", detail: "3 new country nodes deployed in Q1" },
                { section: "Alliance Growth", status: "On Track", detail: "12 corporate alliances, 4 government partners" },
                { section: "Intelligence Revenue", status: "Exceeding", detail: "ARR growing 45% QoQ" },
                { section: "Compliance", status: "Clean", detail: "Zero compliance violations" },
                { section: "Arbitration", status: "Healthy", detail: "Dispute rate at 2.1%, resolution < 7 days" },
                { section: "Security", status: "Fortified", detail: "Zero breaches, MFA at 94% adoption" },
              ].map((item) => (
                <div key={item.section} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.section}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exit Pathways */}
        <TabsContent value="exit" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { path: "IPO", timeline: "4-6 years", valuation: "PKR 15-25B", probability: 35 },
              { path: "Strategic Acquisition", timeline: "3-5 years", valuation: "PKR 8-15B", probability: 25 },
              { path: "Infrastructure Fund", timeline: "5-8 years", valuation: "PKR 10-20B", probability: 20 },
              { path: "Sovereign Wealth Hold", timeline: "7-10 years", valuation: "PKR 20-40B", probability: 10 },
              { path: "Foundation Perpetual", timeline: "Indefinite", valuation: "Impact-driven", probability: 10 },
            ].map((e) => (
              <Card key={e.path}>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-sm">{e.path}</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Timeline</span><span>{e.timeline}</span></div>
                    <div className="flex justify-between"><span>Valuation Range</span><span className="font-medium">{e.valuation}</span></div>
                    <div className="flex justify-between"><span>Probability</span><span>{e.probability}%</span></div>
                  </div>
                  <Progress value={e.probability * 2} className="mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Narrative Identity</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-primary">We are a Sovereign Innovation Operating System.</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>❌ Not a marketplace</span>
                  <span>❌ Not a SaaS tool</span>
                  <span>❌ Not a freelance network</span>
                  <span>❌ Not a research archive</span>
                </div>
                <p className="text-xs mt-2">Capital-grade infrastructure for sovereign innovation at planetary scale.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
