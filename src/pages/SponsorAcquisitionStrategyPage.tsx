import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Target, Users, Building2, Briefcase, TrendingUp, Award,
  Calendar, CheckCircle2, AlertTriangle, ArrowRight, DollarSign,
  Factory, BarChart3, Shield, Rocket, Clock, MapPin,
  MessageSquare, FileText, Zap, ChevronRight, Star, Phone,
  Mail, Linkedin, Globe, Handshake, RefreshCw, Repeat,
  Megaphone, PieChart, Layout
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Industry Sponsor Acquisition & Cluster Domination Strategy
// ═══════════════════════════════════════════════════════════

const targetProfiles = [
  { type: "Software Houses", size: "10–100", budget: "$2K–$5K", fit: 95 },
  { type: "Digital Agencies", size: "5–50", budget: "$1K–$3K", fit: 90 },
  { type: "E-commerce Brands", size: "10–200", budget: "$2K–$5K", fit: 85 },
  { type: "Fintech Startups", size: "5–50", budget: "$3K–$8K", fit: 88 },
  { type: "Manufacturing SMEs", size: "20–200", budget: "$3K–$6K", fit: 75 },
  { type: "Consulting Firms", size: "10–100", budget: "$2K–$4K", fit: 80 },
  { type: "Health Tech", size: "5–50", budget: "$3K–$7K", fit: 82 },
  { type: "Regional Services", size: "10–150", budget: "$1K–$3K", fit: 70 },
];

const pitchSlides = [
  { slide: 1, title: "The R&D Problem", content: "SMEs need prototypes but can't afford agencies. Average agency cost: $10K+. Most SMEs skip R&D entirely." },
  { slide: 2, title: "The Solution", content: "Fund student FYP teams to build your prototype. Escrow-backed, milestone-controlled, faculty-supervised." },
  { slide: 3, title: "Risk Control", content: "Pay per milestone, not upfront. Escrow holds funds until deliverables approved. Full dispute resolution." },
  { slide: 4, title: "Quality Assurance", content: "Faculty supervision ensures academic rigor. Contribution tracking shows individual effort. Regular progress reports." },
  { slide: 5, title: "IP Clarity", content: "Choose ownership: sponsor-owned, shared, or license-based. Defined before funding locks. No ambiguity." },
  { slide: 6, title: "Cost Comparison", content: "Agency prototype: $10K+ | Freelancer: $5K+ | FYP milestone-based: $1K–$5K. Same output, 5x savings." },
  { slide: 7, title: "Talent Pipeline", content: "Evaluate students during execution. Hire top performers post-graduation. First-mover hiring advantage." },
];

const onboardingSteps = [
  { step: 1, title: "Discovery Call", duration: "30 min", description: "Understand sponsor's problem, budget, timeline, and IP preferences." },
  { step: 2, title: "Submit Problem Brief", duration: "1 day", description: "Sponsor submits structured brief: problem, expected outcome, budget range." },
  { step: 3, title: "Match with FYP Topic", duration: "2–3 days", description: "Faculty matches brief with existing topic or creates new one. Student teams assigned." },
  { step: 4, title: "Define Milestones", duration: "1 day", description: "Jointly define 3–5 milestones with deliverables, amounts, and deadlines." },
  { step: 5, title: "Lock Escrow", duration: "1 day", description: "Sponsor deposits funds into escrow. IP agreement signed. Execution begins." },
  { step: 6, title: "Track Execution", duration: "Ongoing", description: "Monitor progress via sponsor dashboard. Approve milestones. Release payments." },
];

const outreachTemplates = [
  {
    channel: "LinkedIn DM",
    icon: Linkedin,
    template: `Hi [Name],

I'm reaching out from RCollab — we connect SMEs with university student teams for escrow-backed prototype development.

Instead of hiring an agency for $10K+, you can fund a student FYP team for $1K–$5K with milestone-based payments, faculty supervision, and IP ownership.

Would you be open to a 15-min call to see if this fits your current R&D needs?

No commitment, just exploring.`,
  },
  {
    channel: "Cold Email",
    icon: Mail,
    template: `Subject: Build your next prototype for 80% less — with university talent

Hi [Name],

Quick question: Do you have a product idea, internal tool, or process that needs a prototype?

We partner SMEs with university final-year project teams. You fund the project ($1K–$5K), and students build it under faculty supervision — with escrow protection and milestone-based payments.

Think of it as low-risk R&D with a talent pipeline bonus.

3 reasons founders love this:
1. 5x cheaper than agencies
2. Escrow-backed = pay only for approved work
3. First access to hire top graduating talent

Would a 15-min call this week work?

Best,
[Your Name]`,
  },
  {
    channel: "WhatsApp",
    icon: Phone,
    template: `Assalam o Alaikum [Name],

[Your Name] here from RCollab. Quick message — we help SMEs fund university student projects as low-cost R&D prototypes.

$1K–$5K budget range, escrow-protected, faculty-supervised.

Would you be interested in a quick chat about how this could work for [Company]?

No pressure at all. Happy to share examples.`,
  },
  {
    channel: "Call Script",
    icon: Phone,
    template: `Opening: "Hi [Name], this is [You] from RCollab. I'm reaching out because we've been working with [University] to connect local businesses with student project teams for prototype development."

Hook: "Most SMEs tell us they have ideas they'd love to prototype but agencies charge $10K+. We've created a model where you can fund a student team for $1K–$5K with full escrow protection."

Qualify: "Do you currently have any product ideas, internal tools, or processes you'd like to prototype?"

Close: "Great — I'd love to set up a 15-minute demo to show you how the milestone and escrow system works. Does [day/time] work?"`,
  },
];

const fundingTiers = [
  {
    name: "Prototype",
    range: "$1,000–$2,000",
    milestones: 3,
    duration: "6–8 weeks",
    includes: ["Requirements doc", "Basic prototype", "Demo video"],
    best: "Simple web apps, data analysis, small automation",
  },
  {
    name: "Functional MVP",
    range: "$3,000–$5,000",
    milestones: 4,
    duration: "10–14 weeks",
    includes: ["Full requirements", "Working MVP", "Testing report", "Deployment guide"],
    best: "Mobile apps, dashboards, IoT prototypes, ML models",
  },
  {
    name: "Extended Development",
    range: "$6,000–$8,000",
    milestones: 5,
    duration: "14–18 weeks",
    includes: ["Architecture doc", "Core features", "Testing", "User feedback round", "Production-ready build"],
    best: "Complex systems, multi-module platforms, hardware integration",
  },
];

const pilotOffer = [
  { benefit: "0% Platform Fee", detail: "No commission on first project" },
  { benefit: "Reduced Escrow Fee", detail: "1% instead of standard 2%" },
  { benefit: "Featured Badge", detail: "Public sponsor recognition" },
  { benefit: "Early Hiring Access", detail: "Interview students before graduation" },
  { benefit: "Case Study Spotlight", detail: "Published success story" },
];

const clusterCriteria = [
  { criterion: "Active SMEs in area", weight: 25, description: "50–500 companies in target vertical" },
  { criterion: "University proximity", weight: 20, description: "Partner university within 30km" },
  { criterion: "Innovation demand", weight: 20, description: "Companies actively seeking R&D or tech solutions" },
  { criterion: "Accessible founders", weight: 15, description: "Direct access to decision-makers via meetups, associations" },
  { criterion: "No accelerator dominance", weight: 10, description: "Area not already saturated by existing programs" },
  { criterion: "Budget capacity", weight: 10, description: "Companies can afford $1K–$5K investment" },
];

const roadmap90Days = [
  { week: "1–2", phase: "Setup", tasks: ["Select cluster city/vertical", "Build sponsor target list (50+)", "Prepare outreach materials", "Identify 5 anchor sponsors"] },
  { week: "3–4", phase: "Anchor Outreach", tasks: ["Contact anchor sponsors", "Book 10+ meetings", "Secure 3 anchor commitments", "Plan industry roundtable"] },
  { week: "5–6", phase: "Roundtable Event", tasks: ["Host industry roundtable", "Collect 10+ problem briefs", "Match briefs to FYP topics", "Begin onboarding"] },
  { week: "7–8", phase: "First Funding", tasks: ["Lock first 5 escrow deposits", "Launch execution for funded FYPs", "Weekly sponsor updates"] },
  { week: "9–10", phase: "Execution", tasks: ["First milestone submissions", "Sponsor approval cycle", "First escrow releases", "Collect testimonials"] },
  { week: "11–12", phase: "Momentum", tasks: ["Publish first case study", "Launch repeat sponsor program", "Expand outreach to next 20", "Plan cluster expansion"] },
];

const kpiMetrics = [
  { category: "Outreach", metrics: [
    { name: "Messages Sent", target: "200+", current: 0 },
    { name: "Meetings Booked", target: "40+", current: 0 },
    { name: "Response Rate", target: ">15%", current: 0 },
  ]},
  { category: "Conversion", metrics: [
    { name: "Sponsors Onboarded", target: "20+", current: 0 },
    { name: "FYPs Funded", target: "20+", current: 0 },
    { name: "Total Funding", target: "$30K+", current: 0 },
  ]},
  { category: "Execution", metrics: [
    { name: "Milestones Completed", target: "30+", current: 0 },
    { name: "Escrow Released", target: "$20K+", current: 0 },
    { name: "Completion Rate", target: ">80%", current: 0 },
  ]},
  { category: "Retention", metrics: [
    { name: "Repeat Sponsors", target: "5+", current: 0 },
    { name: "Satisfaction Score", target: ">4/5", current: 0 },
    { name: "Referral Rate", target: ">20%", current: 0 },
  ]},
];

export default function SponsorAcquisitionStrategyPage() {
  const [roiProjects, setRoiProjects] = useState(5);
  const [avgFunding, setAvgFunding] = useState(3000);
  const [agencyCost, setAgencyCost] = useState(10000);

  const totalSavings = roiProjects * (agencyCost - avgFunding);
  const totalInvestment = roiProjects * avgFunding;
  const savingsPercent = Math.round((1 - avgFunding / agencyCost) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Sponsor Strategy</Badge>
            <Badge className="bg-primary/10 text-primary text-xs">90-Day Plan</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Industry Sponsor Acquisition & Cluster Domination</h1>
          <p className="text-muted-foreground max-w-2xl">
            Dominate one city. One cluster. One university. Visible success. Then scale.
          </p>
        </div>

        {/* 90-Day Targets */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3">90-Day Outcome Targets</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Sponsor-Funded FYPs", value: "20+" },
                    { label: "Total Funding Volume", value: "$30K–$50K" },
                    { label: "Repeat Sponsors", value: "5+" },
                    { label: "Milestone Releases", value: "3+" },
                  ].map((t) => (
                    <div key={t.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{t.value}</div>
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="targets" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="targets">Target Profiles</TabsTrigger>
            <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
            <TabsTrigger value="outreach">Outreach Scripts</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Flow</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & ROI</TabsTrigger>
            <TabsTrigger value="cluster">Cluster Strategy</TabsTrigger>
            <TabsTrigger value="roadmap">90-Day Roadmap</TabsTrigger>
            <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
          </TabsList>

          {/* Target Profiles */}
          <TabsContent value="targets" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-primary" />
                  Ideal Sponsor Profiles
                </CardTitle>
                <CardDescription>Target SMEs first. Large corporates move too slow for Phase 1.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {targetProfiles.map((p) => (
                    <div key={p.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium text-sm">{p.type}</div>
                        <div className="text-xs text-muted-foreground">{p.size} employees · {p.budget} budget</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={p.fit} className="w-16 h-2" />
                        <span className="text-xs font-medium w-8">{p.fit}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Avoid in Phase 1
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Large corporates (500+ employees), government agencies, multinationals. 
                    Enterprise sales cycles (6–12 months) will kill momentum.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Value Proposition */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Sponsor Value Proposition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: "Not Donation", desc: "This is business R&D investment with measurable deliverables", icon: DollarSign },
                    { title: "Not CSR", desc: "Escrow-backed execution with IP ownership and milestone control", icon: Shield },
                    { title: "Business ROI", desc: "5x cheaper than agencies, talent pipeline access, prototype in weeks", icon: TrendingUp },
                  ].map((v) => (
                    <div key={v.title} className="p-4 rounded-lg bg-muted/50 text-center">
                      <v.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="font-bold text-sm">{v.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{v.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pitch Deck */}
          <TabsContent value="pitch" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>7-Slide Sponsor Pitch Structure</CardTitle>
                <CardDescription>Keep it concise. Focus on cost savings and risk control.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pitchSlides.map((s) => (
                  <div key={s.slide} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {s.slide}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{s.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{s.content}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Risk Mitigation Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { feature: "Escrow Control", detail: "Funds locked until milestones approved. No upfront risk." },
                    { feature: "Milestone Approval", detail: "Sponsor approves each deliverable before payment release." },
                    { feature: "IP Agreement", detail: "Ownership defined before funding. No post-project disputes." },
                    { feature: "Faculty Oversight", detail: "Academic supervision ensures quality and structure." },
                    { feature: "Contribution Tracking", detail: "See who did what. Individual accountability visible." },
                    { feature: "Dispute Resolution", detail: "Structured process if deliverables don't meet expectations." },
                  ].map((f) => (
                    <div key={f.feature} className="p-3 rounded-lg border border-border/50">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {f.feature}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{f.detail}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outreach Scripts */}
          <TabsContent value="outreach" className="space-y-4">
            {outreachTemplates.map((t) => (
              <Card key={t.channel} variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <t.icon className="h-5 w-5 text-primary" />
                    {t.channel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg font-sans leading-relaxed">
                    {t.template}
                  </pre>
                </CardContent>
              </Card>
            ))}

            {/* Outreach Channels */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Acquisition Channels (Priority Order)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { channel: "Faculty Referrals", priority: "Highest", reason: "Warmest leads — faculty know industry contacts" },
                    { channel: "LinkedIn Founder DM", priority: "High", reason: "Direct access to decision-makers" },
                    { channel: "Industry WhatsApp Groups", priority: "High", reason: "Local SME communities already active" },
                    { channel: "Local Tech Meetups", priority: "Medium", reason: "Face-to-face credibility building" },
                    { channel: "Chamber of Commerce", priority: "Medium", reason: "Structured access to SME directories" },
                    { channel: "Startup Incubators", priority: "Medium", reason: "Innovation-minded companies" },
                    { channel: "Direct Referrals", priority: "Ongoing", reason: "Satisfied sponsors refer peers" },
                  ].map((c, i) => (
                    <div key={c.channel} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{c.channel}</div>
                        <div className="text-xs text-muted-foreground">{c.reason}</div>
                      </div>
                      <Badge variant={c.priority === "Highest" ? "default" : "outline"} className="text-xs">
                        {c.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Flow */}
          <TabsContent value="onboarding" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Sponsor Onboarding Flow</CardTitle>
                <CardDescription>Target: Under 7 days from first contact to escrow lock.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingSteps.map((s, i) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {s.step}
                        </div>
                        {i < onboardingSteps.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{s.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" /> {s.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pilot Offer */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  First 10 Sponsors — Pilot Offer
                </CardTitle>
                <CardDescription>Reduce friction. Prove value first.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-3">
                  {pilotOffer.map((p) => (
                    <div key={p.benefit} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                      <div className="font-bold text-sm text-amber-600">{p.benefit}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.detail}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing & ROI */}
          <TabsContent value="pricing" className="space-y-4">
            {/* Funding Tiers */}
            <div className="grid md:grid-cols-3 gap-4">
              {fundingTiers.map((t, i) => (
                <Card key={t.name} variant={i === 1 ? "premium" : "elevated"}>
                  <CardContent className="p-6 space-y-4">
                    {i === 1 && <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>}
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <div className="text-2xl font-bold text-primary">{t.range}</div>
                    <div className="text-xs text-muted-foreground">{t.milestones} milestones · {t.duration}</div>
                    <Separator />
                    <div>
                      <div className="text-xs font-medium mb-2">Includes:</div>
                      {t.includes.map((inc) => (
                        <div key={inc} className="text-sm flex items-center gap-2 py-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          {inc}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      Best for: {t.best}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ROI Calculator */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sponsor ROI Calculator
                </CardTitle>
                <CardDescription>Show sponsors their savings vs agency hiring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Number of Projects</Label>
                    <Slider
                      value={[roiProjects]}
                      onValueChange={(v) => setRoiProjects(v[0])}
                      min={1} max={20} step={1}
                    />
                    <div className="text-center text-lg font-bold">{roiProjects}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Avg FYP Funding ($)</Label>
                    <Input
                      type="number"
                      value={avgFunding}
                      onChange={(e) => setAvgFunding(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Agency Equivalent ($)</Label>
                    <Input
                      type="number"
                      value={agencyCost}
                      onChange={(e) => setAgencyCost(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Total Investment</div>
                    <div className="text-xl font-bold">${totalInvestment.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground">Agency Equivalent</div>
                    <div className="text-xl font-bold">${(roiProjects * agencyCost).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                    <div className="text-xs text-muted-foreground">Total Savings</div>
                    <div className="text-xl font-bold text-emerald-600">${totalSavings.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <div className="text-xs text-muted-foreground">Cost Reduction</div>
                    <div className="text-xl font-bold text-primary">{savingsPercent}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Model */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Subscription Sponsor Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: "Single Project", price: "Pay-per-project", desc: "One-time funding with standard 8% commission", best: "First-time sponsors" },
                    { name: "3-Project Pack", price: "10% discount on fees", desc: "Fund 3 FYPs per year, reduced commission (6%)", best: "Repeat sponsors" },
                    { name: "Annual Partner", price: "Custom rate", desc: "Unlimited projects, 4% commission, priority matching", best: "Strategic sponsors" },
                  ].map((s) => (
                    <div key={s.name} className="p-4 rounded-lg border border-border/50 space-y-2">
                      <div className="font-bold">{s.name}</div>
                      <div className="text-sm text-primary font-medium">{s.price}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                      <Badge variant="outline" className="text-xs">Best for: {s.best}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cluster Strategy */}
          <TabsContent value="cluster" className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Cluster Selection Framework
                </CardTitle>
                <CardDescription>Score each potential cluster. Pick the highest. Go deep.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clusterCriteria.map((c) => (
                    <div key={c.criterion} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="w-20 text-right">
                        <Badge variant="outline" className="text-xs">{c.weight}%</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{c.criterion}</div>
                        <div className="text-xs text-muted-foreground">{c.description}</div>
                      </div>
                      <Progress value={c.weight * 4} className="w-24 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anchor Sponsor Strategy */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  Anchor Sponsor Strategy
                </CardTitle>
                <CardDescription>3–5 anchor companies create cluster legitimacy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Anchor Benefits</h4>
                    {[
                      "Priority access to best student teams",
                      "Zero platform fee during pilot",
                      "Branding inside university campus",
                      "Early hiring pipeline access",
                      "Co-hosted industry day recognition",
                    ].map((b) => (
                      <div key={b} className="text-sm flex items-center gap-2 py-1.5">
                        <Star className="h-3 w-3 text-amber-500 shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Industry Roundtable Format</h4>
                    <div className="space-y-2">
                      {[
                        { time: "0–15 min", activity: "FYP funding model explanation" },
                        { time: "15–25 min", activity: "Live escrow & milestone demo" },
                        { time: "25–35 min", activity: "Cost comparison presentation" },
                        { time: "35–50 min", activity: "Live problem brief collection" },
                        { time: "50–60 min", activity: "Q&A + commitment collection" },
                      ].map((a) => (
                        <div key={a.time} className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="text-xs w-20 justify-center">{a.time}</Badge>
                          <span>{a.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expansion Trigger */}
            <Card variant="outline">
              <CardContent className="p-6">
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Expansion Trigger — Do NOT Scale Until:
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    "10+ active sponsors in cluster",
                    "30+ funded FYPs",
                    "Visible repeat funding pattern",
                    "3+ documented case studies",
                  ].map((r) => (
                    <div key={r} className="flex items-center gap-2 text-sm p-2 rounded bg-amber-500/5">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 90-Day Roadmap */}
          <TabsContent value="roadmap" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>90-Day Cluster Execution Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roadmap90Days.map((r, i) => (
                    <div key={r.week} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          W{r.week}
                        </div>
                        {i < roadmap90Days.length - 1 && <div className="w-px h-full bg-border mt-2 min-h-[2rem]" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold">{r.phase}</h4>
                          <Badge variant="outline" className="text-xs">Week {r.week}</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          {r.tasks.map((t) => (
                            <div key={t} className="text-sm flex items-center gap-2 p-2 rounded bg-muted/50">
                              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Loop */}
            <Card variant="glass">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Public Success Loop (After First Milestone Release)
                </h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Publish sponsor testimonial",
                    "Share student earning story",
                    "Post LinkedIn case study",
                    "Tag sponsor publicly",
                    "Highlight local impact",
                  ].map((s, i) => (
                    <React.Fragment key={s}>
                      <Badge variant="secondary" className="py-2 px-3">{s}</Badge>
                      {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Reputation spreads locally fast. One visible success creates momentum for the next 10 sponsors.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPI Dashboard */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {kpiMetrics.map((cat) => (
                <Card key={cat.category} variant="elevated">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{cat.category} KPIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cat.metrics.map((m) => (
                        <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">{m.name}</span>
                          <Badge className="bg-primary/10 text-primary">{m.target}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Repeat Sponsor Retention */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  Repeat Sponsor Retention Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { incentive: "Commission Discount", detail: "6% on second project (vs 8% standard)" },
                    { incentive: "Priority Matching", detail: "First pick of best student teams" },
                    { incentive: "Subscription Package", detail: "3-project annual pack at bulk rate" },
                    { incentive: "Dedicated Team Pool", detail: "Pre-vetted students for repeat work" },
                  ].map((r) => (
                    <div key={r.incentive} className="p-3 rounded-lg border border-border/50">
                      <div className="font-medium text-sm">{r.incentive}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <strong>Key insight:</strong> Retention &gt; Acquisition. One repeat sponsor at $3K/year is worth more than 3 one-time sponsors at $1K each.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
