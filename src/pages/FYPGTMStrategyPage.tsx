import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Target, Users, Building2, Briefcase, TrendingUp, Award,
  Calendar, CheckCircle2, AlertTriangle, ArrowRight, DollarSign,
  GraduationCap, Factory, BarChart3, Shield, Rocket, Clock,
  MessageSquare, FileText, Zap, ChevronRight, Star
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// FYP OS — 6-Month Go-To-Market Strategy
// ═══════════════════════════════════════════════════════════

const phases = [
  {
    month: 1,
    title: "University Targeting & Entry",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    status: "ready",
    tasks: [
      "Identify 10 mid-tier universities (5K–20K students)",
      "Map decision-makers: VC, Dean, HoD, Career Services",
      "Define entry wedge: FYP employability + industry sponsorship",
      "Build university targeting matrix",
      "Prepare introductory materials",
    ],
    kpis: ["10 universities shortlisted", "3 intro meetings scheduled", "1 LOI signed"],
    stakeholders: [
      { role: "Vice Chancellor", approach: "Revenue + reputation pitch" },
      { role: "Dean of Academics", approach: "Faculty workload reduction" },
      { role: "Head of Department", approach: "Student employability data" },
      { role: "Career Services", approach: "Industry partnership proof" },
      { role: "IT Department", approach: "Zero integration burden" },
    ],
  },
  {
    month: 2,
    title: "Faculty Buy-In Strategy",
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    status: "ready",
    tasks: [
      "Demo milestone oversight to faculty champions",
      "Show reduced supervision chaos metrics",
      "Offer faculty recognition badge system",
      "Optional faculty revenue share configuration",
      "Build Faculty FAQ kit",
    ],
    kpis: ["5+ faculty champions identified", "Faculty FAQ distributed", "First FYP topics created"],
    faq: [
      { q: "Will this replace supervision?", a: "No — it digitizes oversight. Faculty retain full approval authority over milestones, teams, and deliverables." },
      { q: "Is this extra workload?", a: "Less. Centralized dashboard replaces email chains, WhatsApp groups, and manual tracking spreadsheets." },
      { q: "Who owns IP?", a: "Configurable per project: student-owned, shared, or sponsor-owned. Faculty can set defaults." },
      { q: "What if sponsor interferes?", a: "Faculty has final approval on all milestones. Sponsors can provide feedback but cannot override academic decisions." },
    ],
  },
  {
    month: 3,
    title: "Student Activation Engine",
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    status: "ready",
    tasks: [
      "On-campus launch session with live demo",
      '"Earn from your FYP" positioning campaign',
      "Showcase real sponsor funding examples",
      "Highlight impact score for employability",
      "Student onboarding flow + tutorial",
    ],
    kpis: ["100+ student accounts", "50+ team applications", "20+ teams formed"],
    messaging: [
      "Your FYP can earn you real money",
      "Industry sponsors fund your project — not your parents",
      "Build a verified portfolio, not just a thesis",
      "Your impact score > your GPA for employers",
    ],
  },
  {
    month: 4,
    title: "Industry Sponsor Onboarding",
    icon: Factory,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    status: "ready",
    tasks: [
      "Identify 20+ local SMEs, tech startups, agencies",
      "Pitch: low-risk prototype funding ($1K–$5K)",
      "Escrow protection + milestone control demo",
      "Talent pipeline access positioning",
      "Sponsor dashboard walkthrough",
    ],
    kpis: ["20 sponsors contacted", "8 sponsors onboarded", "5+ FYPs funded"],
    sponsorPitch: [
      { point: "Low Risk", detail: "Escrow protection — pay only for approved milestones" },
      { point: "Low Budget", detail: "$1,000–$5,000 range for real prototypes" },
      { point: "Talent Pipeline", detail: "Identify top students before graduation" },
      { point: "IP Options", detail: "Flexible ownership: shared, licensed, or full" },
    ],
  },
  {
    month: 5,
    title: "First Execution Showcase",
    icon: Rocket,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    status: "ready",
    tasks: [
      "Publish funded FYP list publicly",
      "Show milestone completion progress",
      "Demonstrate first escrow releases",
      "Collect sponsor testimonial",
      "Get faculty endorsement quote",
    ],
    kpis: ["3+ milestones completed", "First escrow release", "1 sponsor testimonial", "1 faculty endorsement"],
  },
  {
    month: 6,
    title: "Case Study & Expansion",
    icon: Award,
    color: "text-primary",
    bg: "bg-primary/10",
    status: "ready",
    tasks: [
      "Build official case study with metrics",
      "Prepare expansion proposal for additional departments",
      "Plan next academic year rollout",
      "Draft multi-university expansion strategy",
      "Present to university leadership",
    ],
    kpis: ["100+ FYPs onboarded", "20+ sponsor-funded", "Case study published", "Expansion plan approved"],
  },
];

const positioningOptions = [
  {
    id: "funding",
    label: "FYP Funding Platform",
    icon: DollarSign,
    pros: ["Immediate revenue hook", "Sponsor-first messaging", "Easy to understand"],
    cons: ["May feel transactional", "Faculty may resist 'monetization'"],
    speed: 85,
    recommendation: "Best for sponsor acquisition",
  },
  {
    id: "os",
    label: "Industry-Linked FYP OS",
    icon: Building2,
    pros: ["Institutional buy-in", "Faculty-friendly", "Comprehensive positioning"],
    cons: ["Slower adoption", "Requires more explanation", "Higher expectations"],
    speed: 60,
    recommendation: "Best for university administration",
  },
  {
    id: "earnings",
    label: "Student Earnings Infrastructure",
    icon: TrendingUp,
    pros: ["Viral student adoption", "Emotional hook", "Media-friendly"],
    cons: ["May alienate faculty", "Regulatory scrutiny", "Pressure to deliver payouts"],
    speed: 90,
    recommendation: "Best for student-first growth",
  },
];

const pricingTiers = [
  {
    name: "Pilot (Recommended Year 1)",
    price: "Free + 8% commission",
    features: [
      "Full platform access",
      "Up to 200 FYP projects",
      "Basic institutional dashboard",
      "8% commission on funded projects",
      "2% escrow processing fee",
    ],
    recommended: true,
    rationale: "Minimize friction. Prove value first. Monetize through transaction volume.",
  },
  {
    name: "Growth",
    price: "$500/month + 6% commission",
    features: [
      "Unlimited FYP projects",
      "Advanced analytics dashboard",
      "Faculty command center",
      "Priority support",
      "6% commission rate",
    ],
    recommended: false,
    rationale: "For universities that have proven ROI and want to scale.",
  },
  {
    name: "Enterprise OS",
    price: "Custom",
    features: [
      "Multi-department deployment",
      "Custom branding",
      "API access",
      "Dedicated success manager",
      "4% commission rate",
      "Accreditation report generator",
    ],
    recommended: false,
    rationale: "For full institutional adoption after Year 1 proof.",
  },
];

const kpiFramework = [
  {
    category: "Adoption",
    icon: Users,
    metrics: [
      { name: "FYPs Onboarded", target: "100+", critical: true },
      { name: "Faculty Active", target: "10+", critical: true },
      { name: "Student Teams Formed", target: "30+", critical: false },
      { name: "Topics Created", target: "50+", critical: false },
    ],
  },
  {
    category: "Revenue",
    icon: DollarSign,
    metrics: [
      { name: "Total Sponsorship Volume", target: "$50K+", critical: true },
      { name: "Escrow Processed", target: "$40K+", critical: true },
      { name: "Student Payout", target: "$30K+", critical: true },
      { name: "Platform Revenue", target: "$4K+", critical: false },
    ],
  },
  {
    category: "Execution",
    icon: CheckCircle2,
    metrics: [
      { name: "Milestone Completion Rate", target: ">80%", critical: true },
      { name: "On-Time Delivery", target: ">70%", critical: false },
      { name: "Sponsor Satisfaction", target: ">4/5", critical: false },
      { name: "Dispute Rate", target: "<5%", critical: false },
    ],
  },
  {
    category: "Retention",
    icon: TrendingUp,
    metrics: [
      { name: "Repeat Sponsors", target: ">30%", critical: true },
      { name: "Faculty Repeat Usage", target: ">80%", critical: true },
      { name: "Student Referral Rate", target: ">20%", critical: false },
      { name: "Next-Year Renewal", target: "Yes", critical: true },
    ],
  },
];

const competitiveFraming = [
  { feature: "FYP Tracking", rcollab: "✅ Full lifecycle", scholar: "❌ None", scopus: "❌ None" },
  { feature: "Industry Funding", rcollab: "✅ Escrow-backed", scholar: "❌ None", scopus: "❌ None" },
  { feature: "Student Earnings", rcollab: "✅ Transparent ledger", scholar: "❌ None", scopus: "❌ None" },
  { feature: "Milestone Execution", rcollab: "✅ Full workflow", scholar: "❌ None", scopus: "❌ None" },
  { feature: "Faculty Dashboard", rcollab: "✅ Real-time", scholar: "❌ None", scopus: "❌ None" },
  { feature: "Employability Proof", rcollab: "✅ Impact score", scholar: "❌ Citations only", scopus: "❌ Citations only" },
  { feature: "Revenue Tracking", rcollab: "✅ Per-project", scholar: "❌ None", scopus: "❌ None" },
  { feature: "IP Management", rcollab: "✅ Configurable", scholar: "❌ None", scopus: "❌ None" },
];

const objectionHandling = [
  {
    objection: "We already use Google Scholar.",
    response: "Google Scholar tracks citations. We track revenue. Your students can't eat citations. We enable funded execution, verifiable earnings, and employability proof — Scholar cannot.",
    category: "Competitive",
  },
  {
    objection: "We don't have funding.",
    response: "You don't need funding. Industry sponsors fund projects. We bring the sponsors, manage escrow, and your institution earns a revenue share — at zero upfront cost.",
    category: "Financial",
  },
  {
    objection: "Faculty won't adopt.",
    response: "Faculty currently manage FYPs via WhatsApp, email, and spreadsheets. We replace that chaos with a single dashboard. Faculty retain full authority — we just digitize oversight.",
    category: "Adoption",
  },
  {
    objection: "We have an incubator.",
    response: "Incubators serve 2% of students. We serve 100% of FYP students. Every final year student can benefit, not just the entrepreneurial ones.",
    category: "Scope",
  },
  {
    objection: "What about IP ownership?",
    response: "Fully configurable per project: student-owned, shared, or sponsor-owned. Faculty set defaults, students and sponsors agree before funding locks.",
    category: "Legal",
  },
  {
    objection: "This sounds complex.",
    response: "Zero IT integration. Cloud-hosted. Faculty create topics, students join, sponsors fund. We handle escrow, milestones, and payouts. Live in 2 weeks.",
    category: "Implementation",
  },
  {
    objection: "What's the risk?",
    response: "Pilot is free. Commission-only model. If no projects get funded, you pay nothing. All funds are escrow-protected. We take the risk, you get the upside.",
    category: "Risk",
  },
];

export default function FYPGTMStrategyPage() {
  const [selectedPositioning, setSelectedPositioning] = useState("earnings");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">GTM Strategy</Badge>
            <Badge className="bg-primary/10 text-primary text-xs">6-Month Plan</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">FYP Execution OS — Go-To-Market Strategy</h1>
          <p className="text-muted-foreground max-w-2xl">
            Land 1 pilot university. Prove measurable outcomes. Revenue-first acquisition strategy.
          </p>
        </div>

        {/* 6-Month Target */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3">6-Month Outcome Target</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "University Onboarded", value: "1", icon: Building2 },
                    { label: "FYPs Registered", value: "100+", icon: FileText },
                    { label: "Sponsor-Funded", value: "20+", icon: DollarSign },
                    { label: "Case Study Ready", value: "Yes", icon: Award },
                  ].map((t) => (
                    <div key={t.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <t.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="text-2xl font-bold">{t.value}</div>
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="timeline">6-Month Timeline</TabsTrigger>
            <TabsTrigger value="positioning">Positioning</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="objections">Objection Handling</TabsTrigger>
            <TabsTrigger value="competitive">Competitive Frame</TabsTrigger>
            <TabsTrigger value="kpis">KPI Framework</TabsTrigger>
            <TabsTrigger value="phases">Build Phases</TabsTrigger>
          </TabsList>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            {phases.map((phase, i) => (
              <Card key={phase.month} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${phase.bg} shrink-0`}>
                      <phase.icon className={`h-5 w-5 ${phase.color}`} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="mb-1">Month {phase.month}</Badge>
                          <h3 className="font-bold text-lg">{phase.title}</h3>
                        </div>
                        <Badge className="bg-muted text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" /> 4 weeks
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Deliverables
                          </h4>
                          <ul className="space-y-1">
                            {phase.tasks.map((t) => (
                              <li key={t} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-3 w-3 mt-1 shrink-0" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                            <Target className="h-4 w-4 text-blue-500" /> KPIs
                          </h4>
                          <ul className="space-y-1">
                            {phase.kpis.map((k) => (
                              <li key={k} className="text-sm flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {k}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {phase.stakeholders && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Stakeholder Engagement</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {phase.stakeholders.map((s) => (
                              <div key={s.role} className="p-2 rounded bg-muted/50 text-xs">
                                <div className="font-medium">{s.role}</div>
                                <div className="text-muted-foreground">{s.approach}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {phase.faq && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Faculty FAQ</h4>
                          <div className="space-y-2">
                            {phase.faq.map((f) => (
                              <div key={f.q} className="p-3 rounded bg-muted/50 text-sm">
                                <div className="font-medium">{f.q}</div>
                                <div className="text-muted-foreground mt-1">{f.a}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {phase.sponsorPitch && (
                        <div className="grid grid-cols-2 gap-2">
                          {phase.sponsorPitch.map((s) => (
                            <div key={s.point} className="p-3 rounded bg-muted/50">
                              <div className="text-sm font-medium">{s.point}</div>
                              <div className="text-xs text-muted-foreground">{s.detail}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {phase.messaging && (
                        <div className="flex flex-wrap gap-2">
                          {phase.messaging.map((m) => (
                            <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {i < phases.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Positioning */}
          <TabsContent value="positioning" className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Positioning Strategy</CardTitle>
                <CardDescription>Your positioning determines adoption speed. Choose wisely.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {positioningOptions.map((opt) => (
                    <Card
                      key={opt.id}
                      variant={selectedPositioning === opt.id ? "premium" : "outline"}
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedPositioning(opt.id)}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-5 w-5 text-primary" />
                          <h3 className="font-bold">{opt.label}</h3>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Adoption Speed</div>
                          <Progress value={opt.speed} className="h-2" />
                          <div className="text-xs text-right mt-1">{opt.speed}%</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-emerald-500 mb-1">Pros</div>
                          {opt.pros.map((p) => (
                            <div key={p} className="text-xs text-muted-foreground">✓ {p}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-rose-500 mb-1">Cons</div>
                          {opt.cons.map((c) => (
                            <div key={c} className="text-xs text-muted-foreground">✗ {c}</div>
                          ))}
                        </div>
                        <div className="p-2 rounded bg-muted/50 text-xs">
                          <Star className="h-3 w-3 inline mr-1 text-amber-500" />
                          {opt.recommendation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <h4 className="font-bold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Recommended: Dual Positioning
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lead with <strong>"Student Earnings Infrastructure"</strong> for student adoption (viral),
                    then sell to administration as <strong>"Industry-Linked FYP OS"</strong> (institutional buy-in).
                    Different message for different stakeholder.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} variant={tier.recommended ? "premium" : "elevated"}>
                  <CardContent className="p-6 space-y-4">
                    {tier.recommended && (
                      <Badge className="bg-primary text-primary-foreground">Recommended for Pilot</Badge>
                    )}
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                    <div className="text-2xl font-bold text-primary">{tier.price}</div>
                    <Separator />
                    <ul className="space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 rounded bg-muted/50 text-xs text-muted-foreground">
                      {tier.rationale}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Objection Handling */}
          <TabsContent value="objections" className="space-y-4">
            {objectionHandling.map((obj) => (
              <Card key={obj.objection} variant="elevated">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-rose-500/10 shrink-0">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm">"{obj.objection}"</h4>
                        <Badge variant="outline" className="text-xs">{obj.category}</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-sm">{obj.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Competitive */}
          <TabsContent value="competitive">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Competitive Comparison</CardTitle>
                <CardDescription>RCollab vs traditional academic platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Feature</th>
                        <th className="text-center p-3 font-semibold text-primary">RCollab FYP OS</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Google Scholar</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">Scopus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitiveFraming.map((row) => (
                        <tr key={row.feature} className="border-b border-border/50">
                          <td className="p-3 font-medium">{row.feature}</td>
                          <td className="p-3 text-center text-emerald-600">{row.rcollab}</td>
                          <td className="p-3 text-center text-muted-foreground">{row.scholar}</td>
                          <td className="p-3 text-center text-muted-foreground">{row.scopus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPIs */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {kpiFramework.map((cat) => (
                <Card key={cat.category} variant="elevated">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <cat.icon className="h-5 w-5 text-primary" />
                      {cat.category} KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cat.metrics.map((m) => (
                        <div key={m.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            {m.critical && <Shield className="h-3 w-3 text-rose-500" />}
                            <span className="text-sm">{m.name}</span>
                          </div>
                          <Badge variant={m.critical ? "default" : "outline"} className="text-xs">
                            {m.target}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Build Phases */}
          <TabsContent value="phases" className="space-y-4">
            {[
              {
                phase: "Phase 1 — Survival MVP",
                color: "bg-emerald-500",
                timeline: "60–90 days",
                items: [
                  "FYP Topic Registry (basic)",
                  "Student Team Formation (manual)",
                  "Sponsorship + Escrow (core)",
                  "Milestone Execution Engine",
                  "Student Earnings Ledger",
                  "Faculty Command Center (simple)",
                  "Institutional Dashboard (minimal)",
                ],
                rule: "If this loop fails → system fails. Nothing else matters.",
              },
              {
                phase: "Phase 2 — Operational Excellence",
                color: "bg-amber-500",
                timeline: "After Phase 1 proves demand",
                items: [
                  "Contribution tracking",
                  "Peer evaluation",
                  "Plagiarism checker",
                  "Rubric grading engine",
                  "Industry rating system",
                  "FYP Health Score",
                  "Portfolio auto-generator",
                ],
                rule: "Only build after Phase 1 proves demand.",
              },
              {
                phase: "Phase 3 — Institutional Lock-In",
                color: "bg-violet-500",
                timeline: "After multiple universities active",
                items: [
                  "Employability Index",
                  "Accreditation report generator",
                  "Department performance ranking",
                  "AI advisor",
                  "Skill-demand matching",
                  "Capital pool expansion",
                ],
                rule: "Infrastructure comes after traction.",
              },
            ].map((p) => (
              <Card key={p.phase} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-3 w-3 rounded-full ${p.color}`} />
                    <h3 className="font-bold text-lg">{p.phase}</h3>
                    <Badge variant="outline" className="ml-auto">{p.timeline}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 mb-4">
                    {p.items.map((item) => (
                      <div key={item} className="text-sm flex items-center gap-2 p-2 rounded bg-muted/50">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded border border-border/50 text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    {p.rule}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
