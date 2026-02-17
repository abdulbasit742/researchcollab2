import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target, Users, Building2, CheckCircle2, AlertTriangle,
  ArrowRight, DollarSign, Factory, Shield, Rocket, Clock,
  MessageSquare, FileText, ChevronRight, Star, Phone,
  Mail, Linkedin, Calendar, Megaphone, BarChart3,
  Handshake, ClipboardList, MapPin, Zap, PlayCircle
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// 30-Day Execution Plan — Close First 5 Sponsor-Funded FYPs
// ═══════════════════════════════════════════════════════════

const weeklyTimeline = [
  {
    week: 1,
    title: "University Activation + Industry Targeting",
    color: "bg-blue-500",
    days: [
      { day: "1–2", tasks: ["HoD meeting", "Demo session", "Get faculty champion commitment"] },
      { day: "3–4", tasks: ["Faculty onboard 10 FYP topics", "Student announcement", "Open team applications"] },
      { day: "5–7", tasks: ["Build industry target list (50+ companies)", "Research warm intros", "Prepare outreach materials"] },
    ],
    milestone: "20 FYP topics live, industry target list ready",
  },
  {
    week: 2,
    title: "Industry Outreach Blitz",
    color: "bg-emerald-500",
    days: [
      { day: "8–9", tasks: ["Send 30 LinkedIn DMs", "Send 20 cold emails", "WhatsApp 10 warm contacts"] },
      { day: "10–11", tasks: ["Book 10+ meetings", "First discovery calls", "Qualify prospects"] },
      { day: "12–14", tasks: ["Complete 5+ demo calls", "Collect problem briefs", "Identify hot prospects"] },
    ],
    milestone: "10 meetings completed, 5+ problem briefs collected",
  },
  {
    week: 3,
    title: "Sponsor Conversion + Roundtable",
    color: "bg-amber-500",
    days: [
      { day: "15–17", tasks: ["Scope refinement calls", "Milestone structuring", "Budget agreements"] },
      { day: "18–19", tasks: ["Host roundtable event (10 companies)", "Collect briefs on spot", "Demo escrow live"] },
      { day: "20–21", tasks: ["Close first 3 sponsors", "Lock 2 escrow deposits", "Assign FYP teams"] },
    ],
    milestone: "3 sponsors closed, 2 escrow deposits locked",
  },
  {
    week: 4,
    title: "Execution Launch + Public Proof",
    color: "bg-rose-500",
    days: [
      { day: "22–24", tasks: ["Close sponsors 4–5", "First milestone submissions", "Faculty reviews"] },
      { day: "25–27", tasks: ["First milestone approvals", "Sponsor testimonial collection", "LinkedIn case post"] },
      { day: "28–30", tasks: ["KPI review", "Case study draft", "Plan month 2 expansion"] },
    ],
    milestone: "5 funded FYPs, first milestone executed, proof published",
  },
];

const universityPlaybook = {
  hodMeeting: {
    title: "HoD Meeting Script (30 min)",
    agenda: [
      { time: "0–5 min", item: "Problem: FYPs have zero industry relevance and zero revenue for university" },
      { time: "5–10 min", item: "Solution: Industry-funded FYPs with escrow-backed milestones" },
      { time: "10–20 min", item: "Live demo: topic creation, milestone dashboard, escrow flow" },
      { time: "20–25 min", item: "Ask: Approve 3 faculty to onboard 20 topics this week" },
      { time: "25–30 min", item: "Next step: Faculty onboarding session tomorrow" },
    ],
  },
  onboardingChecklist: [
    "HoD approval obtained",
    "3+ faculty champions identified",
    "Faculty accounts created on platform",
    "20 FYP topics published (min 10 sponsor-ready)",
    "Student announcement sent via department channels",
    "Team formation deadline set (5 days)",
    "Faculty approval workflow tested",
    "First sponsor-ready topics flagged",
  ],
  facultyKit: [
    { doc: "1-Page Benefits Summary", content: "Revenue for department, reduced admin chaos, industry partnerships, student employability proof" },
    { doc: "FAQ Document", content: "Covers: IP ownership, workload impact, sponsor interference, grading integration, data privacy" },
    { doc: "Demo Walkthrough Guide", content: "Step-by-step: create topic → define milestones → approve team → monitor progress → approve deliverable" },
    { doc: "Internal Announcement Template", content: "Email/notice template for departments to announce FYP OS launch to students" },
  ],
};

const industryTargetFields = [
  { field: "Company Name", type: "Text", required: true },
  { field: "Industry Vertical", type: "Select", required: true, options: "Software | Agency | E-commerce | Fintech | Manufacturing | Services" },
  { field: "Company Size", type: "Number", required: true },
  { field: "Founder/CEO Name", type: "Text", required: true },
  { field: "LinkedIn Profile", type: "URL", required: true },
  { field: "WhatsApp / Phone", type: "Phone", required: false },
  { field: "Prototype Need Likelihood", type: "Select", required: true, options: "High | Medium | Low" },
  { field: "Warm Intro Source", type: "Text", required: false },
  { field: "Contact Status", type: "Select", required: true, options: "Not Contacted | Messaged | Meeting Booked | Met | Interested | Funded | Declined" },
  { field: "Notes", type: "Text", required: false },
];

const outreachScripts = [
  {
    channel: "LinkedIn Cold DM",
    icon: Linkedin,
    script: `Hi [Name],

I noticed [Company] is doing interesting work in [vertical]. Quick question — do you ever need prototypes or internal tools built but find agencies too expensive?

We partner local SMEs with university final-year project teams. You fund the project ($1K–$5K), students build it under faculty supervision, and everything is escrow-protected — you only pay when you approve each milestone.

Would a 15-min call make sense to explore this?`,
  },
  {
    channel: "WhatsApp Outreach",
    icon: Phone,
    script: `Assalam o Alaikum [Name],

[Your Name] here. We're running a pilot program connecting [City] businesses with [University] student teams for prototype development.

$1K–$5K budget, escrow-protected, faculty-supervised. You approve every milestone before payment releases.

Would you be interested in a quick 10-min chat? No obligation.`,
  },
  {
    channel: "Cold Email",
    icon: Mail,
    script: `Subject: Build your next prototype for $3K (escrow-protected)

Hi [Name],

Quick question: does [Company] have any product ideas, internal tools, or processes that need a working prototype?

We're running a pilot with [University] — local businesses fund student final-year projects ($1K–$5K) and get working prototypes in 8–14 weeks.

Why founders are saying yes:
• 70% cheaper than agencies
• Escrow-backed — pay only for approved milestones
• Faculty-supervised quality control
• First access to hire top graduating talent

15-min call this week? Happy to show you 2 example projects.

[Your Name]`,
  },
  {
    channel: "15-Min Intro Call Script",
    icon: Phone,
    script: `OPENING (2 min):
"Thanks for taking the call, [Name]. I'll keep this to 15 minutes. I wanted to quickly show you how [Company] could get a working prototype built for a fraction of agency cost."

QUALIFY (3 min):
"Do you currently have any product ideas, internal tools, or processes you'd like to prototype?"
"What's held you back from building them?"
"Have you worked with agencies before? What was the budget?"

PITCH (5 min):
"Here's what we do differently: You fund a student team at [University] for $1K–$5K. Everything is escrow-protected — you only pay when each milestone is approved. Faculty supervises quality. And you get first-mover access to hire the best students."

DEMO OFFER (3 min):
"I'd love to show you a 30-minute live demo of the milestone dashboard and escrow system. We can also match your specific need with a student team on the spot."

CLOSE (2 min):
"Does [day/time] work for a quick demo? I'll send a calendar invite right after this call."`,
  },
  {
    channel: "30-Min Demo Call Structure",
    icon: PlayCircle,
    script: `0–5 min: Recap sponsor's problem/need
5–10 min: Show matching FYP topic or create one live
10–15 min: Walk through milestone creation (3–5 milestones)
15–20 min: Demo escrow deposit and approval flow
20–25 min: Show sponsor dashboard — progress tracking, milestone approval, payment release
25–28 min: IP ownership selection + agreement walkthrough
28–30 min: "Ready to submit your project brief? I can have a team matched by Friday."`,
  },
];

const objections = [
  { objection: "Students can't deliver quality work.", response: "Faculty supervises every milestone. You approve before payment releases. If quality isn't met, funds stay in escrow." },
  { objection: "This is too risky.", response: "Zero upfront risk. Escrow holds your money. You release per milestone. If unsatisfied, dispute resolution protects you." },
  { objection: "I don't have $5K to spare.", response: "Start at $1K for a basic prototype. Most sponsors spend $2K–$3K. Compare that to $10K+ for an agency." },
  { objection: "What if the team doesn't finish?", response: "Milestones have deadlines. Faculty monitors progress. You get weekly updates. Unfinished work = funds returned." },
  { objection: "I need this done fast.", response: "Teams are pre-formed and faculty-supervised. Typical timeline: 8–14 weeks. We structure milestones to show progress every 2–3 weeks." },
  { objection: "Who owns the IP?", response: "You choose: sponsor-owned, shared, or license-based. Defined before funding locks. No ambiguity." },
];

const conversionWorkflow = [
  { step: 1, title: "Problem Brief Intake", description: "Sponsor fills structured form: problem statement, expected outcome, budget range, timeline, IP preference.", duration: "1 day" },
  { step: 2, title: "Scope Refinement Call", description: "20-min call to align expectations, define deliverables, and confirm budget.", duration: "1 day" },
  { step: 3, title: "Milestone Structuring", description: "Define 3–5 milestones with clear deliverables, amounts, and deadlines using standard template.", duration: "1 day" },
  { step: 4, title: "Budget & IP Agreement", description: "Confirm total budget, payment schedule, IP model, and NDA requirements.", duration: "1 day" },
  { step: 5, title: "Escrow Deposit", description: "Sponsor deposits funds. Escrow confirmed. Execution begins.", duration: "1 day" },
  { step: 6, title: "Team Assignment", description: "Faculty matches sponsor project with approved student team. Introductions made.", duration: "1–2 days" },
];

const milestoneTemplate = [
  { milestone: 1, title: "Requirements & Architecture", deliverables: "Requirements doc, wireframes, tech stack decision", percentage: 15 },
  { milestone: 2, title: "Core Feature Development", deliverables: "Working core functionality, database schema, API endpoints", percentage: 30 },
  { milestone: 3, title: "Integration & Testing", deliverables: "Integrated system, test results, bug fixes", percentage: 25 },
  { milestone: 4, title: "UI/UX Polish & Documentation", deliverables: "Polished UI, user documentation, deployment guide", percentage: 20 },
  { milestone: 5, title: "Final Delivery & Demo", deliverables: "Demo video, source code, final presentation", percentage: 10 },
];

const roundtableGuide = {
  logistics: [
    "Venue: University meeting room or co-working space",
    "Capacity: 10 companies max (focused)",
    "Duration: 60 minutes",
    "Materials: Laptop for live demo, printed 1-pagers, problem brief forms",
    "Faculty: 2–3 present for credibility",
  ],
  agenda: [
    { time: "0–5 min", item: "Welcome + context: why industry-funded FYPs matter" },
    { time: "5–15 min", item: "Problem: R&D is expensive, talent is hard to evaluate pre-hire" },
    { time: "15–25 min", item: "Solution demo: escrow, milestones, sponsor dashboard (live)" },
    { time: "25–30 min", item: "Cost comparison slide: Agency $10K vs FYP $3K" },
    { time: "30–45 min", item: "Interactive: each company describes one prototype need (collect briefs)" },
    { time: "45–55 min", item: "Q&A + objection handling" },
    { time: "55–60 min", item: "Commitment ask: who wants to fund a project this month?" },
  ],
  followUp: [
    "Same day: Send thank-you WhatsApp + problem brief form link",
    "Day 2: Share matched FYP topic suggestions",
    "Day 3: Book scope refinement call",
    "Day 5: Send milestone proposal",
    "Day 7: Close escrow deposit",
  ],
};

const proofContentKit = [
  {
    type: "LinkedIn Post — First Funded FYP",
    template: `🚀 Exciting news from [University]!

[Company] just funded their first student FYP project through RCollab — a [brief description] prototype with escrow-backed milestones.

What this means:
✅ Students earn real money from their FYP
✅ Industry gets low-cost prototypes
✅ Faculty gains industry credibility
✅ University generates revenue

This is what industry-university collaboration should look like.

Want to fund a student project? DM me.

#FYP #IndustryPartnership #StudentEarnings`,
  },
  {
    type: "Sponsor Testimonial Template",
    template: `"We needed [specific prototype] but agencies quoted $[X]. Through RCollab, we funded a student team at [University] for $[Y] with full escrow protection.

The team delivered [specific outcome] in [X weeks]. We approved every milestone before payment released.

Best part? We've already identified 2 students we want to hire after graduation."

— [Name], [Title], [Company]`,
  },
  {
    type: "Student Earnings Announcement",
    template: `💰 [Student Name] just earned PKR [amount] from their FYP!

Through RCollab's sponsor-funded FYP program at [University], [Student] and their team delivered [milestone] for [Company] — and got paid for real work.

This isn't a stipend. This is earned income from verified execution.

Your FYP can earn you money too. Ask your faculty about RCollab.`,
  },
  {
    type: "Case Study Mini-Report (1-page)",
    template: `CASE STUDY: [Company] x [University]

Problem: [Company] needed [prototype] but agencies were too expensive.

Solution: Funded student FYP team via RCollab ($[X] budget, [Y] milestones).

Results:
• Working prototype delivered in [Z] weeks
• [Specific deliverables]
• Student team earned $[amount]
• Sponsor satisfaction: [rating]/5
• Faculty feedback: [quote]

Next: [Company] has funded a second project for next semester.`,
  },
];

const weeklyKPIs = [
  { metric: "Companies Contacted", w1: 50, w2: 20, w3: 10, w4: 5, target: "85" },
  { metric: "Meetings Booked", w1: 5, w2: 8, w3: 5, w4: 2, target: "20" },
  { metric: "Meetings Completed", w1: 2, w2: 5, w3: 5, w4: 2, target: "14" },
  { metric: "Sponsors Onboarded", w1: 0, w2: 1, w3: 3, w4: 2, target: "5+" },
  { metric: "FYP Topics Created", w1: 20, w2: 0, w3: 0, w4: 0, target: "20" },
  { metric: "Escrow Deposits", w1: 0, w2: 0, w3: 2, w4: 1, target: "3+" },
  { metric: "Milestones Approved", w1: 0, w2: 0, w3: 0, w4: 2, target: "2+" },
  { metric: "Funding Volume ($)", w1: 0, w2: 3000, w3: 9000, w4: 6000, target: "$15K+" },
];

export default function ThirtyDayExecutionPlanPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Execution Plan</Badge>
            <Badge className="bg-primary/10 text-primary text-xs">30 Days</Badge>
            <Badge variant="secondary" className="text-xs">{checkedCount} items checked</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">30-Day Execution Plan — First 5 Funded FYPs</h1>
          <p className="text-muted-foreground max-w-2xl">
            Not building. Executing. One city. One university. 5 sponsors. Prove it works.
          </p>
        </div>

        {/* Targets */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-3">Day 30 Outcomes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "University Active", value: "1" },
                    { label: "Topics Onboarded", value: "20" },
                    { label: "Meetings Done", value: "10+" },
                    { label: "Funded FYPs", value: "5" },
                    { label: "Escrow Locked", value: "2+" },
                    { label: "Milestones Started", value: "1+" },
                  ].map((t) => (
                    <div key={t.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-xl font-bold text-primary">{t.value}</div>
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
            <TabsTrigger value="timeline">Weekly Timeline</TabsTrigger>
            <TabsTrigger value="university">University Playbook</TabsTrigger>
            <TabsTrigger value="targeting">Industry Targeting</TabsTrigger>
            <TabsTrigger value="outreach">Outreach Scripts</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Workflow</TabsTrigger>
            <TabsTrigger value="roundtable">Roundtable Guide</TabsTrigger>
            <TabsTrigger value="proof">Proof Content Kit</TabsTrigger>
            <TabsTrigger value="kpis">KPI Tracker</TabsTrigger>
          </TabsList>

          {/* Weekly Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            {weeklyTimeline.map((w) => (
              <Card key={w.week} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-3 w-3 rounded-full ${w.color}`} />
                    <h3 className="font-bold text-lg">Week {w.week}: {w.title}</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {w.days.map((d) => (
                      <div key={d.day} className="p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="mb-2 text-xs">Day {d.day}</Badge>
                        {d.tasks.map((t) => (
                          <div key={t} className="text-sm flex items-start gap-2 py-1">
                            <ChevronRight className="h-3 w-3 mt-1 shrink-0 text-muted-foreground" />
                            {t}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">Week {w.week} Milestone: {w.milestone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* University Playbook */}
          <TabsContent value="university" className="space-y-4">
            {/* HoD Meeting */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {universityPlaybook.hodMeeting.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {universityPlaybook.hodMeeting.agenda.map((a) => (
                    <div key={a.time} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="text-xs w-20 justify-center shrink-0">{a.time}</Badge>
                      <span className="text-sm">{a.item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Checklist */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  University Onboarding Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {universityPlaybook.onboardingChecklist.map((item, i) => {
                    const id = `checklist-${i}`;
                    return (
                      <div key={id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer" onClick={() => toggleCheck(id)}>
                        <Checkbox checked={!!checkedItems[id]} />
                        <span className={`text-sm ${checkedItems[id] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Faculty Kit */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Faculty Onboarding Kit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {universityPlaybook.facultyKit.map((k) => (
                    <div key={k.doc} className="p-4 rounded-lg border border-border/50">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {k.doc}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{k.content}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry Targeting */}
          <TabsContent value="targeting">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-primary" />
                  Industry Target Sheet Template
                </CardTitle>
                <CardDescription>Build a list of 50+ companies in your selected cluster. Track every touchpoint.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Field</th>
                        <th className="text-center p-3 font-semibold">Type</th>
                        <th className="text-center p-3 font-semibold">Required</th>
                        <th className="text-left p-3 font-semibold">Options/Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {industryTargetFields.map((f) => (
                        <tr key={f.field} className="border-b border-border/50">
                          <td className="p-3 font-medium">{f.field}</td>
                          <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{f.type}</Badge></td>
                          <td className="p-3 text-center">{f.required ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : "—"}</td>
                          <td className="p-3 text-xs text-muted-foreground">{f.options || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <strong>Filtering priority:</strong> Software houses & agencies first (highest prototype need), then startups, then manufacturing SMEs.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outreach Scripts */}
          <TabsContent value="outreach" className="space-y-4">
            {outreachScripts.map((s) => (
              <Card key={s.channel} variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <s.icon className="h-5 w-5 text-primary" />
                    {s.channel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg font-sans leading-relaxed">{s.script}</pre>
                </CardContent>
              </Card>
            ))}

            {/* Objection Handling */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Quick Objection Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objections.map((o) => (
                  <div key={o.objection} className="p-3 rounded-lg bg-muted/50">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      "{o.objection}"
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-5">→ {o.response}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Workflow */}
          <TabsContent value="conversion" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Sponsor Conversion Flow (7 Days Max)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionWorkflow.map((s, i) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{s.step}</div>
                        {i < conversionWorkflow.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{s.title}</h4>
                          <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />{s.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Milestone Template */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Standard Software Prototype Milestone Template</CardTitle>
                <CardDescription>Adjust per project. Keep 3–5 milestones.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestoneTemplate.map((m) => (
                    <div key={m.milestone} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {m.milestone}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{m.title}</div>
                        <div className="text-xs text-muted-foreground">{m.deliverables}</div>
                      </div>
                      <Badge className="bg-primary/10 text-primary">{m.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roundtable Guide */}
          <TabsContent value="roundtable" className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  Industry Roundtable Execution Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Logistics</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {roundtableGuide.logistics.map((l) => (
                      <div key={l} className="text-sm flex items-center gap-2 p-2 rounded bg-muted/50">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">60-Minute Agenda</h4>
                  <div className="space-y-2">
                    {roundtableGuide.agenda.map((a) => (
                      <div key={a.time} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="text-xs w-20 justify-center shrink-0">{a.time}</Badge>
                        <span className="text-sm">{a.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">Follow-Up Sequence</h4>
                  <div className="space-y-2">
                    {roundtableGuide.followUp.map((f, i) => (
                      <div key={f} className="flex items-center gap-3 text-sm">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proof Content Kit */}
          <TabsContent value="proof" className="space-y-4">
            {proofContentKit.map((p) => (
              <Card key={p.type} variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="h-5 w-5 text-primary" />
                    {p.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg font-sans leading-relaxed">{p.template}</pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* KPI Tracker */}
          <TabsContent value="kpis">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Weekly KPI Tracker
                </CardTitle>
                <CardDescription>Track these numbers every Friday. No excuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Metric</th>
                        <th className="text-center p-3 font-semibold">Week 1</th>
                        <th className="text-center p-3 font-semibold">Week 2</th>
                        <th className="text-center p-3 font-semibold">Week 3</th>
                        <th className="text-center p-3 font-semibold">Week 4</th>
                        <th className="text-center p-3 font-semibold text-primary">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyKPIs.map((k) => (
                        <tr key={k.metric} className="border-b border-border/50">
                          <td className="p-3 font-medium">{k.metric}</td>
                          <td className="p-3 text-center">{k.w1}</td>
                          <td className="p-3 text-center">{k.w2}</td>
                          <td className="p-3 text-center">{k.w3}</td>
                          <td className="p-3 text-center">{k.w4}</td>
                          <td className="p-3 text-center font-bold text-primary">{k.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Rule */}
            <Card variant="outline" className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Strategic Rule</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      We are not scaling. We are proving. If 5 sponsor-funded FYPs close in 30 days: <strong>you have validation.</strong> If not: <strong>fix sales — not product.</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
