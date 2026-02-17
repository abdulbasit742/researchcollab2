import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, MessageSquare, Phone, FileText, Shield, 
  Calendar, BarChart3, Zap, Clock, CheckCircle,
  ArrowRight, AlertTriangle, Copy, Users, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SprintPlaybookPage = () => {
  const { toast } = useToast();
  const [dailyChecks, setDailyChecks] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const toggleCheck = (key: string) => {
    setDailyChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sprintDays = [
    {
      days: "Day 1–2",
      title: "Targeting & Outreach Blast",
      color: "text-blue-500",
      tasks: [
        "Identify 50 target companies (10–200 employees, tech/digital)",
        "Build tracking sheet with company, founder, LinkedIn, industry",
        "Send 25+ LinkedIn cold messages (Version A or B)",
        "Send WhatsApp follow-ups where numbers available",
        "Log all outreach in tracking sheet"
      ]
    },
    {
      days: "Day 3–4",
      title: "Discovery Meetings",
      color: "text-emerald-500",
      tasks: [
        "Book 15+ meetings from outreach responses",
        "Run 15-minute discovery calls (structured script)",
        "Qualify sponsors: budget, timeline, prototype need",
        "Send 48-hour follow-ups to non-responders",
        "Log meeting outcomes and interest level"
      ]
    },
    {
      days: "Day 5",
      title: "Proposal Structuring",
      color: "text-amber-500",
      tasks: [
        "Prepare 1-page proposals for interested sponsors",
        "Structure 3–4 milestones per project",
        "Define budget breakdown and IP model",
        "Send proposals within 24 hours of meeting",
        "Schedule follow-up calls"
      ]
    },
    {
      days: "Day 6",
      title: "Objection Handling & Follow-up",
      color: "text-orange-500",
      tasks: [
        "Address quality, timeline, IP, cost objections",
        "Send revised proposals if needed",
        "Follow up on all pending proposals",
        "Prepare escrow activation for warm leads",
        "Final push on hesitant sponsors"
      ]
    },
    {
      days: "Day 7",
      title: "Close & Escrow Lock",
      color: "text-red-500",
      tasks: [
        "Close 2–3 escrow deposits",
        "Send payment links immediately after verbal yes",
        "Lock first milestones into escrow",
        "Confirm team assignments",
        "Celebrate + plan next sprint"
      ]
    }
  ];

  const linkedinMessageA = `Hi [Name],
We're helping SMEs prototype new features through supervised university teams — milestone-based and escrow-protected, typically 40–60% cheaper than agencies.

Would you be open to a 15-min call this week to see if it fits your roadmap?`;

  const linkedinMessageB = `Hi [Name],
Quick question — when you prototype new ideas, do you usually go in-house or hire agencies?

We're enabling SMEs to run milestone-controlled prototypes via university FYP teams at lower risk and cost.

Worth a short 15-min chat?`;

  const followUpMessage = `Hi [Name], just nudging this in case it got buried.
If prototyping new ideas is on your roadmap this quarter, this model can save time + budget.
Happy to explain in 15 minutes.`;

  const whatsappScript = `Hi [Name], I sent you a quick LinkedIn note about low-risk university-backed prototyping through milestone escrow.
Worth a short call this week?`;

  const objections = [
    { objection: "Quality concern", response: "That's why funding is milestone-based. You only release funds per approved deliverable, supervised by faculty." },
    { objection: "We prefer agencies", response: "Totally fair. This is not a replacement — it's a lower-cost experimentation layer before you commit larger agency budget." },
    { objection: "Timeline too long", response: "Most sprints are 4–6 weeks. Faster than many agency cycles, especially for MVP-level prototypes." },
    { objection: "IP risk", response: "IP terms are defined upfront — sponsor-owned, shared, or licensed. Nothing ambiguous." },
    { objection: "Budget too small", response: "We offer phased milestone approaches. Start with a $1,500 research sprint and scale from there." },
  ];

  const discoveryQuestions = [
    "What product / feature are you currently stuck on?",
    "Have you prototyped before? What was the process?",
    "What does a small prototype usually cost you?",
    "Do agencies or internal teams handle it?",
    "What's your biggest frustration in that process?",
    "What budget range do you consider for experiments?",
    "What timeline would work for you?",
  ];

  const dailyMetrics = [
    { key: "outreach", label: "Outreach Sent", target: "10/day" },
    { key: "replies", label: "Replies Received", target: "3/day" },
    { key: "meetings_scheduled", label: "Meetings Scheduled", target: "3/day" },
    { key: "meetings_completed", label: "Meetings Completed", target: "2/day" },
    { key: "proposals_sent", label: "Proposals Sent", target: "1/day" },
    { key: "escrow_closed", label: "Escrow Closed", target: "—" },
  ];

  const sprintTargets = [
    { metric: "Outreach Messages", target: "50+", icon: MessageSquare },
    { metric: "Meetings Booked", target: "15+", icon: Calendar },
    { metric: "Meetings Completed", target: "8+", icon: Phone },
    { metric: "Proposals Sent", target: "3", icon: FileText },
    { metric: "Escrow Locked", target: "2", icon: Shield },
  ];

  return (
    <>
      <Helmet>
        <title>7-Day Sprint Playbook | FYP Execution OS</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="destructive" className="mb-3">🔥 EXECUTION MODE</Badge>
            <h1 className="text-3xl font-bold mb-2">7-Day Sponsor Outreach Sprint</h1>
            <p className="text-muted-foreground">Close first 2–3 escrow-funded FYP projects in 7 days. No product changes. Pure execution.</p>
          </div>

          {/* Sprint Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {sprintTargets.map(t => (
              <Card key={t.metric} className="text-center">
                <CardContent className="pt-4 pb-3">
                  <t.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{t.target}</p>
                  <p className="text-xs text-muted-foreground">{t.metric}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="proposal">Proposal</TabsTrigger>
              <TabsTrigger value="objections">Objections</TabsTrigger>
              <TabsTrigger value="tracker">Tracker</TabsTrigger>
            </TabsList>

            {/* Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              {sprintDays.map((day, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className={`h-5 w-5 ${day.color}`} />
                      {day.days} — {day.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.tasks.map((task, j) => (
                        <label key={j} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dailyChecks[`${i}-${j}`] || false}
                            onChange={() => toggleCheck(`${i}-${j}`)}
                            className="mt-1 rounded"
                          />
                          <span className={dailyChecks[`${i}-${j}`] ? "line-through text-muted-foreground" : ""}>{task}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Scripts */}
            <TabsContent value="scripts" className="space-y-4">
              {[
                { title: "LinkedIn Cold Message — Version A (Direct)", content: linkedinMessageA },
                { title: "LinkedIn Cold Message — Version B (Problem-First)", content: linkedinMessageB },
                { title: "Follow-Up Message (48 Hours Later)", content: followUpMessage },
                { title: "WhatsApp Follow-Up Script", content: whatsappScript },
              ].map((script, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{script.title}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.content, script.title)}>
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg font-sans">{script.content}</pre>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Escrow Closing Script</p>
                      <p className="text-sm mt-1">Do NOT ask: <span className="text-muted-foreground">"Are you interested?"</span></p>
                      <p className="text-sm mt-1">Instead say: <span className="font-semibold">"Shall we lock the first milestone into escrow and start this week?"</span></p>
                      <p className="text-xs text-muted-foreground mt-2">Then silence. Let them respond. If hesitant: "Is it timeline or budget holding you back?"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discovery */}
            <TabsContent value="discovery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">15-Minute Discovery Call Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Badge variant="outline" className="mb-2">Min 1–3: Context</Badge>
                    <p className="text-sm bg-muted p-3 rounded-lg italic">"Thanks for taking the time. I'll keep this short. I just want to understand how you currently prototype new features."</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Min 3–7: Diagnose Pain</Badge>
                    <div className="space-y-2">
                      {discoveryQuestions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">Listen more than talk.</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Min 7–11: Position Solution</Badge>
                    <p className="text-sm bg-muted p-3 rounded-lg italic">"We're enabling companies to run prototype sprints through final-year university teams, supervised by faculty, milestone-controlled, and escrow-backed."</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>• You only release money per approved milestone</p>
                      <p>• Faculty ensures quality oversight</p>
                      <p>• Budget is typically $1,500–$5,000</p>
                      <p>• Timeline 4–8 weeks</p>
                    </div>
                    <p className="text-sm mt-3 font-semibold">Then ask: "If you had a low-risk prototype option like this, what kind of problem would you test first?"</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Min 11–14: Scope Lightly</Badge>
                    <p className="text-sm italic">"Would you be open to sharing one specific feature or idea you're considering?"</p>
                    <p className="text-sm mt-1 font-semibold">"I'll structure this into 3–4 milestones with timeline and send you a simple proposal within 24 hours."</p>
                  </div>
                  <div>
                    <Badge variant="destructive" className="mb-2">Min 14–15: Close</Badge>
                    <p className="text-sm font-semibold">"Does that work? If the structure makes sense, we can lock the first milestone into escrow and start immediately."</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Proposal */}
            <TabsContent value="proposal" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">1-Page Proposal Template</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                      `PROTOTYPE SPRINT PROPOSAL\n\nProblem Statement:\n[Clear 2–3 line summary of the sponsor's challenge]\n\nMilestones:\n1. Research + UX Draft (Week 1–2) — $X\n2. Functional Prototype (Week 3–4) — $X\n3. Testing + Refinement (Week 5–6) — $X\n\nTotal Budget: $X\n\nIP Model: [Sponsor-Owned / Shared / Licensed]\n\nExecution Structure:\n• Student FYP team (3–4 members)\n• Faculty supervision\n• Escrow per milestone\n\nTimeline: X weeks\n\nUpon approval, we activate escrow and begin execution.`,
                      "Proposal Template"
                    )}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold text-center border-b pb-2">PROTOTYPE SPRINT PROPOSAL</h3>
                    <div>
                      <p className="font-semibold text-sm">Problem Statement:</p>
                      <p className="text-sm text-muted-foreground">[Clear 2–3 line summary of the sponsor's challenge]</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Milestones:</p>
                      <div className="space-y-2">
                        {["Research + UX Draft (Week 1–2)", "Functional Prototype (Week 3–4)", "Testing + Refinement (Week 5–6)"].map((m, i) => (
                          <div key={i} className="flex items-center justify-between text-sm border rounded p-2 bg-background">
                            <span>{i + 1}. {m}</span>
                            <span className="font-semibold">$X</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-semibold">Total Budget:</span> $X</div>
                      <div><span className="font-semibold">IP Model:</span> [Selected]</div>
                      <div><span className="font-semibold">Timeline:</span> X weeks</div>
                      <div><span className="font-semibold">Team:</span> 3–4 students</div>
                    </div>
                    <div className="text-sm border-t pt-3">
                      <p className="font-semibold">Execution Structure:</p>
                      <p>• Student FYP team • Faculty supervision • Escrow per milestone</p>
                    </div>
                    <p className="text-sm font-semibold text-primary text-center pt-2">Upon approval, we activate escrow and begin execution.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Objections */}
            <TabsContent value="objections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Objection Response Sheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {objections.map((obj, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <p className="font-semibold text-sm text-destructive">"{obj.objection}"</p>
                      </div>
                      <div className="flex items-start gap-2 ml-6">
                        <ArrowRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm">{obj.response}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Conversion Psychology
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>✓ Founders care about <strong>speed and cost</strong></p>
                    <p>✓ They hate <strong>risk</strong></p>
                    <p>✓ They want <strong>control</strong></p>
                    <p>✓ They don't want <strong>academic jargon</strong></p>
                  </div>
                  <p className="text-sm mt-3 font-semibold">Keep it: Business-focused. Short. Decisive.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tracker */}
            <TabsContent value="tracker" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Daily KPI Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dailyMetrics.map(m => (
                      <div key={m.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={dailyChecks[m.key] || false}
                            onChange={() => toggleCheck(m.key)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">{m.label}</span>
                        </div>
                        <Badge variant="outline">{m.target}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Critical Execution Rules
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>🚫 Do not improve pitch mid-week</p>
                    <p>🚫 Do not redesign product</p>
                    <p>🚫 Do not add features</p>
                    <p>🚫 Do not change pricing mid-sprint</p>
                    <p>✅ Follow up aggressively</p>
                    <p>✅ Speed {">"} perfection</p>
                    <p>✅ Close small deals first</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-3">End-of-Sprint Assessment</h3>
                  <p className="text-sm text-muted-foreground">If you hit 2 escrow locks → <span className="text-emerald-500 font-semibold">Sprint successful. Scale.</span></p>
                  <p className="text-sm text-muted-foreground mt-1">If you don't → <span className="text-destructive font-semibold">It's a messaging problem, not a product problem. Fix scripts and run again.</span></p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SprintPlaybookPage;
