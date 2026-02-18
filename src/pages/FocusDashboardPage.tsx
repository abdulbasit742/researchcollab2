import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Lock, Shield, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, BarChart3, Briefcase } from "lucide-react";

// ── Static constraint data ──
const PRIORITY_FEATURES = [
  { name: "Funded FYP Count", icon: Target, current: 47, target: 500, unit: "FYPs" },
  { name: "Corporate Sponsor Retention", icon: Briefcase, current: 72, target: 90, unit: "%" },
  { name: "Escrow Reliability", icon: Shield, current: 99.2, target: 99.9, unit: "%" },
  { name: "Trust Score Credibility", icon: TrendingUp, current: 68, target: 85, unit: "avg" },
  { name: "Milestone Completion Rate", icon: CheckCircle2, current: 81, target: 95, unit: "%" },
  { name: "Employment Conversion", icon: BarChart3, current: 23, target: 100, unit: "hires" },
  { name: "Startup Spin-Offs", icon: Target, current: 3, target: 10, unit: "startups" },
  { name: "Revenue Growth", icon: TrendingUp, current: 14, target: 50, unit: "% MoM" },
  { name: "User Retention", icon: CheckCircle2, current: 64, target: 80, unit: "%" },
  { name: "Dispute Reduction", icon: AlertTriangle, current: 8, target: 3, unit: "% rate", inverse: true },
] as const;

const EXPANSION_GATES = [
  { label: "500+ Funded FYPs", current: 47, target: 500, met: false },
  { label: "50+ Recurring Sponsors", current: 12, target: 50, met: false },
  { label: "10+ Startup Spin-Offs", current: 3, target: 10, met: false },
  { label: "100+ Verified Hires", current: 23, target: 100, met: false },
  { label: "Positive Revenue Trend", current: 14, target: 1, met: true },
  { label: "Stable Escrow Uptime", current: 99.2, target: 99, met: true },
  { label: "Dispute Rate < 5%", current: 8, target: 5, met: false },
  { label: "Cash Runway > 12mo", current: 9, target: 12, met: false },
];

const BLOCKED_FEATURES = [
  "Multi-country node engine",
  "Global intelligence marketplace",
  "Advanced macro simulations",
  "Developer ecosystem public marketplace",
  "Public governance token systems",
  "Over-engineered constitutional expansion",
  "International expansion tooling",
  "Advanced federation layer",
  "IPO-level reporting infrastructure",
  "Sovereign global data federation",
];

const FOUNDER_FOCUS = [
  { do: "Corporate funding deals", dont: "Chase media hype" },
  { do: "University integration", dont: "Redesign architecture weekly" },
  { do: "Escrow reliability", dont: "Add visionary systems" },
  { do: "Hiring proof cases", dont: "Expand into policy debates" },
  { do: "Regional dominance", dont: "Constantly reposition branding" },
];

const MONTHLY_CHECKS = [
  "Did funded FYP count increase?",
  "Did escrow volume increase?",
  "Did disputes decrease?",
  "Did sponsors return?",
  "Did employment conversion rise?",
  "Did revenue improve?",
];

export default function FocusDashboardPage() {
  const [tab, setTab] = useState("kpis");
  const gatesMet = EXPANSION_GATES.filter(g => g.met).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              12-Month Execution Focus
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discipline over distraction — track only what matters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-destructive/40 text-destructive">
              <Lock className="h-3 w-3 mr-1" /> Expansion Locked
            </Badge>
            <Badge variant="secondary">
              {gatesMet}/{EXPANSION_GATES.length} gates met
            </Badge>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="kpis" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Focus KPIs</span></TabsTrigger>
            <TabsTrigger value="gates" className="gap-1"><Lock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Expansion Lock</span></TabsTrigger>
            <TabsTrigger value="blocked" className="gap-1"><XCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">Not Building</span></TabsTrigger>
            <TabsTrigger value="discipline" className="gap-1"><Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Founder Rules</span></TabsTrigger>
            <TabsTrigger value="review" className="gap-1"><Clock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Monthly Review</span></TabsTrigger>
          </TabsList>

          {/* Focus KPIs */}
          <TabsContent value="kpis" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRIORITY_FEATURES.map((kpi) => {
                const Icon = kpi.icon;
                const pct = "inverse" in kpi && kpi.inverse
                  ? Math.max(0, Math.min(100, ((kpi.target / kpi.current) * 100)))
                  : Math.min(100, (kpi.current / kpi.target) * 100);
                const isGood = "inverse" in kpi && kpi.inverse ? kpi.current <= kpi.target : kpi.current >= kpi.target;

                return (
                  <Card key={kpi.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{kpi.name}</span>
                        </div>
                        <Badge variant={isGood ? "default" : "secondary"} className={isGood ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : ""}>
                          {kpi.current} / {kpi.target} {kpi.unit}
                        </Badge>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Expansion Lock */}
          <TabsContent value="gates" className="mt-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-destructive" />
                  Expansion Gate — {gatesMet}/{EXPANSION_GATES.length} Conditions Met
                </CardTitle>
                <p className="text-sm text-muted-foreground">No new region, country, or large capital round until ALL gates are cleared.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EXPANSION_GATES.map((gate) => (
                    <div key={gate.label} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="flex items-center gap-2">
                        {gate.met
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          : <XCircle className="h-5 w-5 text-destructive/60" />}
                        <span className="font-medium text-sm">{gate.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {gate.current} / {gate.target}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Not Building */}
          <TabsContent value="blocked" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Features We Will NOT Build (12 Months)
                </CardTitle>
                <p className="text-sm text-muted-foreground">These are future-stage systems. Right now, they dilute focus.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {BLOCKED_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2 p-2.5 rounded-md border border-destructive/10 bg-destructive/5 text-sm">
                      <XCircle className="h-4 w-4 text-destructive/60 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Founder Discipline */}
          <TabsContent value="discipline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Founder Discipline Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FOUNDER_FOCUS.map((item, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="font-medium">{item.do}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
                        <XCircle className="h-4 w-4 text-destructive/60 shrink-0" />
                        <span className="text-muted-foreground">{item.dont}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Review */}
          <TabsContent value="review" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Monthly Traction Review Checklist
                </CardTitle>
                <p className="text-sm text-muted-foreground">If any answer is "No" → fix core engine, do NOT add features.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MONTHLY_CHECKS.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm font-medium">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
                  <strong>Rule:</strong> If answer to any question is "No" for 2 consecutive months — halt all new development, fix core engine only.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
