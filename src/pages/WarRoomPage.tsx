import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Swords, Target, TrendingUp, Shield, Users, AlertTriangle, CheckCircle2, Clock, Zap, Building2, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PHASES = [
  {
    number: 1, name: "Dominate One City", months: "0–6", color: "bg-red-500",
    objective: "Turn one city into a closed innovation loop.",
    targets: ["5–8 universities onboarded", "25+ active corporate sponsors", "100+ funded FYPs", "Real escrow movement", "10+ employment conversions", "3–5 startup spin-offs", "Arbitration system stress-tested"],
    actions: ["Dedicated city task force", "Weekly sponsor acquisition meetings", "Faculty ambassador program", "FYP-to-corporate matching sprint cycles", "Escrow automation stabilization", "On-ground campus presence"],
    gate: "No second city until KPIs stable.",
  },
  {
    number: 2, name: "Regional Density Expansion", months: "6–12", color: "bg-amber-500",
    objective: "Expand within region but maintain capital density.",
    targets: ["3–4 cities live", "15+ universities", "75+ corporate sponsors", "500+ funded projects cumulative", "Capital velocity improvement", "AI allocation benchmarked", "Intelligence subscription pilots"],
    actions: ["Regional corporate roundtables", "Corporate R&D allocation workshops", "Capital pool creation drives", "Government observer onboarding", "Intelligence reports to enterprise leads"],
    gate: "Arbitration, trust volatility, escrow reconciliation all stable.",
  },
  {
    number: 3, name: "Capital Gravity Creation", months: "12–18", color: "bg-blue-500",
    objective: "Make RCollab economically unavoidable in region.",
    targets: ["Anchor multinational partnership", "Government reporting cycle active", "Capital pools recurring", "Equity tracking live", "1,000+ cumulative funded projects", "50+ verified hires", "Intelligence ARR meaningful"],
    actions: ["Launch regional innovation index", "Corporate challenge programs", "Public innovation summit", "Developer ecosystem beta", "Media positioning as backbone"],
    gate: "If corporates/universities leave → measurable disruption.",
  },
  {
    number: 4, name: "Dominance Consolidation", months: "18–24", color: "bg-emerald-500",
    objective: "Lock position before expanding internationally.",
    targets: ["2–3 government partnerships", "100+ enterprise alliance projects", "10+ documented spin-offs", "Intelligence subscription scaling", "90%+ FYP completion integrity", "Dispute rate minimized", "AI forecast accuracy defensible"],
    actions: ["Publish annual innovation impact report", "Institutionalize university enrollment", "Expand corporate retention contracts", "Strengthen developer marketplace", "Tighten governance visibility"],
    gate: "Real capital, employment, startups, arbitration fairness, economic impact.",
  },
];

const DISCIPLINE_RULES = [
  "No expansion without density",
  "No new features without usage data",
  "No capital raise without KPI proof",
  "No media hype without outcome data",
  "No global announcement before regional dominance",
  "No compromise on escrow integrity",
  "No arbitration shortcuts",
];

const DOCTRINE = [
  { rule: "Density > Breadth", icon: Target },
  { rule: "Anchor Institutions First", icon: Building2 },
  { rule: "Capital Velocity > Vanity Metrics", icon: TrendingUp },
  { rule: "Measurable Outcomes > Feature Count", icon: CheckCircle2 },
  { rule: "Corporate Gravity > Public Hype", icon: Globe },
  { rule: "System Stability > Rapid Expansion", icon: Shield },
  { rule: "Execution Discipline > Vision Talk", icon: Swords },
];

const TEAM = [
  "City Expansion Lead", "Corporate Acquisition Lead", "University Partnerships Lead",
  "Capital Pool Manager", "AI & Intelligence Lead", "Compliance & Arbitration Director",
  "Escrow Operations Manager", "Product Performance Lead",
];

const SERVICE_BOUNDARIES = [
  { name: "Escrow Engine", domain: "Financial" },
  { name: "Arbitration Engine", domain: "Legal" },
  { name: "AI Engine", domain: "Intelligence" },
  { name: "Intelligence Engine", domain: "Analytics" },
  { name: "Equity Engine", domain: "Financial" },
  { name: "Docs Engine", domain: "Productivity" },
  { name: "Node Deployment Engine", domain: "Infrastructure" },
];

const DOMINANCE_CONDITIONS = [
  "Process meaningful GMV",
  "Show employment conversion trend",
  "Show startup survival data",
  "Have arbitration precedent history",
  "Have recurring corporate capital",
  "Have ≥1 government reporting integration",
  "Have intelligence subscription revenue",
  "Have proven AI predictive accuracy",
];

const KPI_LABELS = [
  { key: "gmv", label: "GMV Processed", prefix: "PKR " },
  { key: "deals", label: "Deal Completion Rate", suffix: "%" },
  { key: "disputes", label: "Dispute Rate", suffix: "%" },
  { key: "cycle", label: "Capital Cycle Time", suffix: " days" },
  { key: "employment", label: "Employment Conversion", suffix: "%" },
  { key: "startups", label: "Startup Creation Rate", suffix: "/mo" },
  { key: "retention", label: "User Retention", suffix: "%" },
  { key: "uptime", label: "System Uptime", suffix: "%" },
];

export default function WarRoomPage() {
  const { data: kpiSnapshots = [] } = useQuery({
    queryKey: ["war-room-kpis"],
    queryFn: async () => {
      const { data } = await supabase.from("war_room_kpi_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(12);
      return data ?? [];
    },
  });

  const { data: serviceHealth = [] } = useQuery({
    queryKey: ["service-boundary-health"],
    queryFn: async () => {
      const { data } = await supabase.from("service_boundary_health").select("*");
      return data ?? [];
    },
  });

  const latestKpi = kpiSnapshots[0];

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex items-center gap-3">
          <Swords className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">24-Month Elite Execution War Room</h1>
            <p className="text-sm text-muted-foreground">Tactical Domination Framework — Focused Regional Density</p>
          </div>
        </div>

        {/* Strategic Doctrine Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {DOCTRINE.map((d, i) => (
            <Card key={i} className="bg-muted/30">
              <CardContent className="p-3 text-center">
                <d.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-[10px] font-semibold leading-tight">{d.rule}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Phase Timeline Bar */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> 24-Month Phase Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground">{i % 6 === 0 ? `M${i}` : ""}</div>
              ))}
            </div>
            <div className="space-y-1.5">
              {PHASES.map(p => (
                <div key={p.number} className="flex items-center gap-2">
                  <span className="text-xs w-6 text-right text-muted-foreground font-mono">P{p.number}</span>
                  <div className="flex-1 relative h-6 bg-muted/20 rounded">
                    <div
                      className={`absolute h-full rounded ${p.color} opacity-80 flex items-center justify-center`}
                      style={{ left: `${(parseInt(p.months) * 100) / 24}%`, width: `${25}%` }}
                    >
                      <span className="text-[9px] text-white font-semibold truncate px-1">{p.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="phases">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="phases">Execution Phases</TabsTrigger>
              <TabsTrigger value="kpis">War Room KPIs</TabsTrigger>
              <TabsTrigger value="services">Service Boundaries</TabsTrigger>
              <TabsTrigger value="team">Team Structure</TabsTrigger>
              <TabsTrigger value="dominance">Dominance Conditions</TabsTrigger>
              <TabsTrigger value="discipline">Discipline Rules</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="phases" className="space-y-4">
            {PHASES.map(phase => (
              <Card key={phase.number}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                      Phase {phase.number}: {phase.name}
                    </CardTitle>
                    <Badge variant="outline">Month {phase.months}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{phase.objective}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">TARGETS</p>
                      <ul className="space-y-1">
                        {phase.targets.map((t, i) => (
                          <li key={i} className="text-sm flex items-start gap-2"><Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">ACTIONS</p>
                      <ul className="space-y-1">
                        {phase.actions.map((a, i) => (
                          <li key={i} className="text-sm flex items-start gap-2"><Zap className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-xs font-semibold text-destructive flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" /> GATE: {phase.gate}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {KPI_LABELS.map(kpi => (
                <Card key={kpi.key}>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {latestKpi ? (kpi.prefix || "") + "—" + (kpi.suffix || "") : "—"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Weekly KPI snapshots will populate as execution begins.</p>
                <p className="text-xs mt-1">Weekly executive review mandatory.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-3">
            <p className="text-sm text-muted-foreground">Logical service isolation for horizontal scaling readiness.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(serviceHealth.length > 0 ? serviceHealth : SERVICE_BOUNDARIES).map((s: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{s.name || s.service_name}</p>
                      <p className="text-xs text-muted-foreground">{s.domain || s.service_domain}</p>
                    </div>
                    <Badge variant={s.status === "healthy" ? "default" : "secondary"}>
                      {s.status || "planned"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEAM.map((role, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium">Founder Role</p>
                <p className="text-xs text-muted-foreground mt-1">Strategic direction + high-level deal closure. No micro-management.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dominance" className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">All conditions must be met at Month 24 to qualify as regional economic infrastructure.</p>
            {DOMINANCE_CONDITIONS.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{c}</p>
              </div>
            ))}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-semibold">If all conditions met → You are regional economic infrastructure.</p>
                <p className="text-xs text-muted-foreground mt-1">Only then consider international node expansion.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discipline" className="space-y-3">
            {DISCIPLINE_RULES.map((rule, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm font-medium">{rule}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
