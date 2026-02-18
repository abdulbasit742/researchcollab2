import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Shield, TrendingUp, Layers, Clock, CheckCircle2, AlertTriangle,
  Building, GraduationCap, Briefcase, Rocket, Lock, BarChart3, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const phases = [
  {
    id: 1, year: "Year 1", title: "Traction & Proof", status: "active" as const,
    color: "hsl(var(--primary))",
    focus: "Funded FYP Execution Engine",
    targets: [
      { label: "Funded FYPs", current: 185, target: 500 },
      { label: "Active Sponsors", current: 12, target: 50 },
      { label: "Verified Hires", current: 78, target: 100 },
      { label: "Startup Spin-offs", current: 7, target: 10 },
    ],
    productFocus: [
      "FYP creation", "Sponsor matching", "Escrow flow", "Milestone tracking",
      "Trust scoring", "Completion dashboard", "Case study auto-generation",
    ],
    hide: ["Global node tools", "Macro intelligence", "IPO tools", "Complex governance UI"],
  },
  {
    id: 2, year: "Year 2", title: "Density & Switching Cost", status: "upcoming" as const,
    color: "hsl(var(--chart-2))",
    focus: "Institutional Lock-In",
    targets: [
      { label: "University Dashboards", current: 0, target: 15 },
      { label: "Corporate Re-funding Rate", current: 0, target: 60 },
      { label: "Alumni Tracked", current: 0, target: 500 },
      { label: "Startup Incubations", current: 0, target: 25 },
    ],
    upgrades: [
      "University-level dashboard", "Faculty performance analytics", "Departmental funding leaderboard",
      "Corporate re-funding engine", "Long-term sponsor agreements", "Hiring pipeline integration",
      "Alumni tracking system", "Startup incubation layer",
    ],
    switchingCosts: [
      "Longitudinal trust history", "Escrow transaction archive", "Startup cap table tracking",
      "Sponsor repeat history", "Employment data integration",
    ],
  },
  {
    id: 3, year: "Year 3", title: "Intelligence & Regional Authority", status: "planned" as const,
    color: "hsl(var(--chart-4))",
    focus: "Regional Innovation Authority",
    targets: [
      { label: "Intelligence Subscriptions", current: 0, target: 100 },
      { label: "University Rankings Active", current: 0, target: 1 },
      { label: "Sector Heatmaps", current: 0, target: 8 },
      { label: "Policy Dashboards", current: 0, target: 3 },
    ],
    build: [
      "Regional Innovation Execution Index", "Capital velocity analytics", "Startup survival tracking",
      "Sector performance heatmaps", "Hiring conversion statistics", "University performance ranking",
      "Sponsor impact reports", "Policy-ready aggregated dashboards",
    ],
    monetize: [
      "Corporate intelligence subscriptions", "University enterprise plan",
      "Advanced hiring analytics", "Startup data access (aggregated)",
    ],
  },
];

const gmvProjection = [
  { quarter: "Q1 Y1", gmv: 2.4, sponsors: 8, fyps: 45 },
  { quarter: "Q2 Y1", gmv: 5.8, sponsors: 18, fyps: 110 },
  { quarter: "Q3 Y1", gmv: 12.5, sponsors: 32, fyps: 250 },
  { quarter: "Q4 Y1", gmv: 24, sponsors: 50, fyps: 500 },
  { quarter: "Q1 Y2", gmv: 38, sponsors: 65, fyps: 720 },
  { quarter: "Q2 Y2", gmv: 55, sponsors: 82, fyps: 980 },
  { quarter: "Q3 Y2", gmv: 78, sponsors: 100, fyps: 1300 },
  { quarter: "Q4 Y2", gmv: 105, sponsors: 120, fyps: 1700 },
  { quarter: "Q1 Y3", gmv: 135, sponsors: 140, fyps: 2100 },
  { quarter: "Q2 Y3", gmv: 170, sponsors: 160, fyps: 2600 },
  { quarter: "Q3 Y3", gmv: 210, sponsors: 180, fyps: 3200 },
  { quarter: "Q4 Y3", gmv: 260, sponsors: 200, fyps: 4000 },
];

const defensibilityLayers = [
  { layer: "Escrow Data", strength: 85, description: "Escrow-backed execution data" },
  { layer: "Trust History", strength: 70, description: "Trust score evolution history" },
  { layer: "Sponsor Archive", strength: 55, description: "Sponsor relationship archive" },
  { layer: "Startup Tracking", strength: 40, description: "Startup origin tracking" },
  { layer: "Employment Data", strength: 60, description: "Employment conversion data" },
  { layer: "Arbitration DB", strength: 45, description: "Arbitration precedent database" },
];

const successMetrics = [
  { metric: "Escrow GMV", status: "on_track", value: "PKR 14.2M", trend: "+18% MoM" },
  { metric: "Corporate Retention", status: "at_risk", value: "52%", trend: "Target: 60%" },
  { metric: "University Dependency", status: "on_track", value: "3 integrated", trend: "+1 this month" },
  { metric: "Startup Spin-offs", status: "on_track", value: "7 active", trend: "+2 this quarter" },
  { metric: "Hiring Conversion", status: "on_track", value: "78 hires", trend: "15.6% rate" },
  { metric: "Intel Subscriptions", status: "not_started", value: "0", trend: "Year 3 target" },
  { metric: "Trust as Hiring Filter", status: "emerging", value: "3 sponsors", trend: "Using trust scores" },
  { metric: "Dispute Rate", status: "on_track", value: "4.2%", trend: "↓ from 6.1%" },
];

const radarData = [
  { axis: "FYP Engine", value: 72 },
  { axis: "Escrow Trust", value: 85 },
  { axis: "Sponsor Density", value: 48 },
  { axis: "Uni Integration", value: 55 },
  { axis: "Hiring Pipeline", value: 62 },
  { axis: "Spin-off Track", value: 35 },
];

const complexityBudget = [
  { feature: "FYP Creation & Execution", aligned: true, gmvPath: true },
  { feature: "Escrow & Milestone Flow", aligned: true, gmvPath: true },
  { feature: "Sponsor Matching", aligned: true, gmvPath: true },
  { feature: "Trust Scoring", aligned: true, gmvPath: true },
  { feature: "Case Study Generator", aligned: true, gmvPath: true },
  { feature: "Global Node Tools", aligned: false, gmvPath: false },
  { feature: "Macro Intelligence", aligned: false, gmvPath: false },
  { feature: "IPO Readiness", aligned: false, gmvPath: false },
  { feature: "Complex Governance UI", aligned: false, gmvPath: false },
];

const statusColor = (s: string) =>
  s === "on_track" ? "bg-chart-2/20 text-chart-2" :
  s === "at_risk" ? "bg-destructive/20 text-destructive" :
  s === "emerging" ? "bg-chart-4/20 text-chart-4" :
  "bg-muted text-muted-foreground";

const ThreeYearDominationPage = () => (
  <>
    <Helmet><title>3-Year Domination Architecture | RCollab</title></Helmet>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">INTERNAL STRATEGY</Badge>
            <Badge className="bg-primary/20 text-primary text-xs">36-MONTH PLAN</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            3-Year Core Domination Architecture
          </h1>
          <p className="text-muted-foreground mt-1">
            From ambitious platform to unavoidable regional infrastructure
          </p>
        </div>

        <Tabs defaultValue="phases" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="projection">GMV Projection</TabsTrigger>
            <TabsTrigger value="defense">Defensibility</TabsTrigger>
            <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
            <TabsTrigger value="complexity">Complexity Budget</TabsTrigger>
          </TabsList>

          {/* PHASES TAB */}
          <TabsContent value="phases" className="space-y-6">
            {phases.map((phase) => (
              <Card key={phase.id} className={phase.status === "active" ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {phase.status === "active" ? <Zap className="h-5 w-5 text-primary" /> :
                       phase.status === "upcoming" ? <Clock className="h-5 w-5 text-chart-2" /> :
                       <Layers className="h-5 w-5 text-chart-4" />}
                      {phase.year}: {phase.title}
                    </CardTitle>
                    <Badge variant={phase.status === "active" ? "default" : "secondary"}>
                      {phase.status === "active" ? "CURRENT" : phase.status === "upcoming" ? "NEXT" : "PLANNED"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Primary Focus: <span className="font-semibold text-foreground">{phase.focus}</span></p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Targets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {phase.targets.map((t) => (
                      <div key={t.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.label}</span>
                          <span className="font-medium text-foreground">{t.current}/{t.target}</span>
                        </div>
                        <Progress value={(t.current / t.target) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {/* Phase-specific content */}
                  {phase.id === 1 && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-2" /> Product Focus
                        </h4>
                        <ul className="space-y-1">
                          {phase.productFocus.map((f) => (
                            <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-chart-2" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" /> Hidden (Complexity Control)
                        </h4>
                        <ul className="space-y-1">
                          {phase.hide.map((h) => (
                            <li key={h} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-destructive" /> {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {phase.id === 2 && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Building className="h-4 w-4 text-chart-2" /> Upgrades
                        </h4>
                        <ul className="space-y-1">
                          {phase.upgrades!.map((u) => (
                            <li key={u} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-chart-2" /> {u}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-chart-4" /> Switching Cost Drivers
                        </h4>
                        <ul className="space-y-1">
                          {phase.switchingCosts!.map((s) => (
                            <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-chart-4" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {phase.id === 3 && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-chart-4" /> Build
                        </h4>
                        <ul className="space-y-1">
                          {phase.build!.map((b) => (
                            <li key={b} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-chart-4" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg border border-border">
                        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" /> Monetize
                        </h4>
                        <ul className="space-y-1">
                          {phase.monetize!.map((m) => (
                            <li key={m} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* GMV PROJECTION TAB */}
          <TabsContent value="projection" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Escrow GMV Projection (PKR Millions)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <AreaChart data={gmvProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="quarter" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Area type="monotone" dataKey="gmv" name="GMV (PKR M)" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Sponsor Growth</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={gmvProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="quarter" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="sponsors" name="Active Sponsors" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Cumulative Funded FYPs</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={gmvProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="quarter" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="fyps" name="Funded FYPs" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DEFENSIBILITY TAB */}
          <TabsContent value="defense" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Defensibility Radar</CardTitle>
                  <p className="text-sm text-muted-foreground">Competitors cannot replicate history quickly</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Radar name="Strength" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> 6 Defensibility Layers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {defensibilityLayers.map((d, i) => (
                    <div key={d.layer} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">Layer {i + 1}: {d.layer}</span>
                        <span className="text-muted-foreground">{d.strength}%</span>
                      </div>
                      <Progress value={d.strength} className="h-2" />
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Strategic position */}
            <Card>
              <CardHeader><CardTitle>Strategic Position After 3 Years</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { icon: GraduationCap, label: "Default FYP Funding Platform" },
                    { icon: Briefcase, label: "Trusted Corporate R&D Extension" },
                    { icon: Target, label: "Recognized Employability Engine" },
                    { icon: Rocket, label: "Startup Origin Tracker" },
                    { icon: BarChart3, label: "Regional Innovation Data Authority" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="p-4 rounded-lg border border-border text-center space-y-2">
                      <Icon className="h-6 w-6 mx-auto text-primary" />
                      <p className="text-sm font-medium text-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    Then — and only then — consider multi-region expansion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUCCESS METRICS TAB */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> 3-Year Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {successMetrics.map((m) => (
                    <div key={m.metric} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">{m.metric}</p>
                        <p className="text-2xl font-bold text-primary">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.trend}</p>
                      </div>
                      <Badge className={statusColor(m.status)}>
                        {m.status === "on_track" ? "ON TRACK" :
                         m.status === "at_risk" ? "AT RISK" :
                         m.status === "emerging" ? "EMERGING" : "NOT STARTED"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPLEXITY BUDGET TAB */}
          <TabsContent value="complexity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complexity Budget Rule</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Every new feature requires removal or merge of one old feature, clear GMV or retention path, and alignment with funded FYP engine.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {complexityBudget.map((c) => (
                  <div key={c.feature} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <p className="font-medium text-foreground">{c.feature}</p>
                    <div className="flex gap-2">
                      <Badge className={c.aligned ? "bg-chart-2/20 text-chart-2" : "bg-destructive/20 text-destructive"}>
                        {c.aligned ? "ALIGNED" : "HIDDEN"}
                      </Badge>
                      <Badge className={c.gmvPath ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                        {c.gmvPath ? "GMV PATH" : "NO GMV"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">No feature vanity.</p>
                  <p className="text-sm text-muted-foreground">Every feature must serve the funded FYP engine or be removed.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </>
);

export default ThreeYearDominationPage;
