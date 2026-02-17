import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Shield, Eye, BarChart3, Bell, FileText, 
  Star, Users, Award, TrendingUp, CheckCircle, Clock,
  AlertTriangle, DollarSign, Zap, ArrowRight, Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const TrustExecutionUpgradePage = () => {
  const healthScoreFactors = [
    { name: "Milestone Delay %", weight: "25%", description: "Measures on-time milestone submissions vs deadlines" },
    { name: "Submission Frequency", weight: "15%", description: "Regular activity signals healthy execution" },
    { name: "Faculty Response Time", weight: "15%", description: "Faculty engagement and review speed" },
    { name: "Sponsor Response Time", weight: "10%", description: "Sponsor approval and feedback speed" },
    { name: "Team Activity Level", weight: "20%", description: "File uploads, comments, task completions" },
    { name: "Escrow Utilization", weight: "15%", description: "Funds released vs locked over time" },
  ];

  const riskAlerts = [
    { trigger: "Milestone overdue by 3 days", severity: "warning", action: "Email + dashboard alert to faculty and sponsor" },
    { trigger: "No team activity in 5 days", severity: "critical", action: "Escalate to faculty + admin notification" },
    { trigger: "Sponsor not responding in 7 days", severity: "warning", action: "Auto-reminder + admin flag" },
    { trigger: "Faculty approval delayed 5+ days", severity: "warning", action: "Department head notification" },
    { trigger: "Budget 80% consumed, milestones incomplete", severity: "critical", action: "Budget freeze alert" },
  ];

  const contributionMetrics = [
    { metric: "File Uploads", description: "Documents, code, designs uploaded per member" },
    { metric: "Task Completions", description: "Assigned tasks marked complete" },
    { metric: "Comment Activity", description: "Participation in project discussions" },
    { metric: "Milestone Submissions", description: "Who submitted each deliverable" },
    { metric: "Review Responses", description: "Engagement with faculty feedback" },
  ];

  const sponsorConfidenceItems = [
    "Team member profiles with skills + past projects",
    "Past completed FYP success rate",
    "Student impact scores",
    "On-time delivery percentage",
    "Faculty experience and track record",
    "Similar past project outcomes",
  ];

  const portfolioFields = [
    "Public summary with problem + solution",
    "Milestones achieved with dates",
    "Sponsor testimonial",
    "Revenue generated / budget utilized",
    "Technologies used",
    "Team members with contribution %",
    "Completion date and duration",
    "Exportable shareable link",
  ];

  const sponsorRatingDimensions = [
    { dimension: "Quality", description: "Technical quality of deliverables" },
    { dimension: "Communication", description: "Responsiveness and clarity" },
    { dimension: "Timeliness", description: "Adherence to milestone deadlines" },
    { dimension: "Business Value", description: "Practical usefulness of prototype" },
  ];

  const repeatIncentives = [
    { threshold: "2+ FYPs funded", reward: "2% commission reduction" },
    { threshold: "5+ FYPs funded", reward: "Priority matching + Featured badge" },
    { threshold: "10+ FYPs funded", reward: "Custom commission rate + Dedicated support" },
  ];

  return (
    <>
      <Helmet>
        <title>Trust & Execution Upgrade | FYP Execution OS</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="warning" className="mb-3">⚡ EXECUTION QUALITY</Badge>
            <h1 className="text-3xl font-bold mb-2">Trust, Quality & Execution Upgrade Layer</h1>
            <p className="text-muted-foreground">Increase sponsor trust, improve project success rate, reduce delays, and drive repeat sponsorship.</p>
          </div>

          {/* Impact Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Sponsor Conversion", icon: TrendingUp, target: "+40%" },
              { label: "On-Time Delivery", icon: Clock, target: "85%+" },
              { label: "Repeat Sponsors", icon: Award, target: "3x" },
              { label: "Risk Detection", icon: AlertTriangle, target: "<3 days" },
            ].map(m => (
              <Card key={m.label} className="text-center">
                <CardContent className="pt-4 pb-3">
                  <m.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{m.target}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="health" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="health">Health Score</TabsTrigger>
              <TabsTrigger value="transparency">Transparency</TabsTrigger>
              <TabsTrigger value="accountability">Accountability</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Health Score */}
            <TabsContent value="health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    FYP Health Score Algorithm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Composite score (0–100) calculated from execution signals. Displayed as Green/Yellow/Red badge visible to Faculty, Sponsor, and Admin.</p>
                  <div className="space-y-3">
                    {healthScoreFactors.map(f => (
                      <div key={f.name} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Badge variant="outline" className="shrink-0 w-14 justify-center">{f.weight}</Badge>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {[
                      { range: "80–100", color: "bg-emerald-500", label: "Healthy" },
                      { range: "50–79", color: "bg-amber-500", label: "At Risk" },
                      { range: "0–49", color: "bg-red-500", label: "Critical" },
                    ].map(s => (
                      <div key={s.range} className="flex items-center gap-2 p-2 border rounded">
                        <div className={`h-3 w-3 rounded-full ${s.color}`} />
                        <div>
                          <p className="text-sm font-semibold">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.range}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-500" />
                    Risk Alert Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskAlerts.map((a, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${a.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${a.severity === 'critical' ? 'text-destructive' : 'text-amber-500'}`} />
                        <div>
                          <p className="text-sm font-medium">{a.trigger}</p>
                          <p className="text-xs text-muted-foreground">{a.action}</p>
                        </div>
                        <Badge variant={a.severity === 'critical' ? 'destructive' : 'warning'} className="shrink-0 text-xs">{a.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transparency */}
            <TabsContent value="transparency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Sponsor Confidence Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Displayed on sponsor dashboard to build trust before and during project execution.</p>
                  <div className="space-y-2">
                    {sponsorConfidenceItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Escrow Transparency Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Visual money flow making financial movement extremely clear.</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {["Funding", "Escrow Locked", "Milestone 1", "Paid", "Milestone 2", "Paid", "Completed"].map((step, i) => (
                      <div key={i} className="flex items-center gap-1 shrink-0">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                          step === "Paid" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                          step === "Completed" ? "bg-primary/10 border-primary/30 text-primary" :
                          step.includes("Escrow") ? "bg-amber-500/10 border-amber-500/30 text-amber-600" :
                          "bg-muted border-border"
                        }`}>
                          {step}
                        </div>
                        {i < 6 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Financial transparency increases trust and sponsor conversion.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    FYP Portfolio Auto-Page
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Each completed FYP automatically generates a public portfolio page.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {portfolioFields.map((field, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 border rounded">
                        <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                        <span>{field}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Students can share publicly → increases motivation + sponsor visibility.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accountability */}
            <TabsContent value="accountability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Contribution Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Lightweight tracking to prevent free-riders. Visible inside team view.</p>
                  <div className="space-y-2">
                    {contributionMetrics.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                        <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{m.metric}</p>
                          <p className="text-xs text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-semibold">Output: Contribution % per team member</p>
                    <div className="mt-2 space-y-2">
                      {["Student A — 35%", "Student B — 30%", "Student C — 20%", "Student D — 15%"].map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs w-24">{s}</span>
                          <Progress value={parseInt(s.split("—")[1])} className="h-2 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Sponsor Rating System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">After project completion, sponsor rates the team on 4 dimensions.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {sponsorRatingDimensions.map(d => (
                      <div key={d.dimension} className="p-3 border rounded-lg">
                        <p className="font-semibold text-sm">{d.dimension}</p>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Score visible in student profile → increases accountability.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Faculty Performance Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Internal-only metrics to improve supervision quality.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { metric: "Avg On-Time Projects", value: "82%" },
                      { metric: "Funded FYP Count", value: "12" },
                      { metric: "Completion Rate", value: "91%" },
                      { metric: "Sponsor Satisfaction", value: "4.3/5" },
                    ].map(m => (
                      <div key={m.metric} className="p-3 border rounded-lg text-center">
                        <p className="text-2xl font-bold">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.metric}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Retention */}
            <TabsContent value="retention" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Repeat Sponsor Incentive Logic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Automatic rewards for sponsors who fund multiple FYPs.</p>
                  <div className="space-y-3">
                    {repeatIncentives.map((inc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{i + 1}</span>
                          </div>
                          <span className="font-medium text-sm">{inc.threshold}</span>
                        </div>
                        <Badge variant="success">{inc.reward}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 border-primary/30 bg-primary/5 rounded-lg border">
                    <p className="text-sm font-semibold">Retention Engine Impact</p>
                    <p className="text-xs text-muted-foreground mt-1">Sponsors who fund 2+ FYPs have 85% likelihood of continued engagement. Commission reduction pays for itself through volume.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Execution Analytics Widget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Minimal performance metrics for institutional dashboard. No heavy analytics — just execution visibility.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { metric: "On-Time %", value: "78%", trend: "+5%" },
                      { metric: "Avg Delay", value: "2.3 days", trend: "-1.2" },
                      { metric: "Active / Completed", value: "8 / 24", trend: "" },
                      { metric: "Sponsor Repeat %", value: "42%", trend: "+8%" },
                      { metric: "Revenue per FYP", value: "$3,200", trend: "+$400" },
                      { metric: "Student Earnings", value: "$18.5K", trend: "+$4K" },
                    ].map(m => (
                      <div key={m.metric} className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">{m.metric}</p>
                        <p className="text-xl font-bold mt-1">{m.value}</p>
                        {m.trend && <p className="text-xs text-emerald-500">{m.trend}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2">Strategic Impact Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> More trustworthy</div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> More transparent</div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> More accountable</div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Harder to replace</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">This increases: Conversion. Retention. Reputation. Institutional credibility.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default TrustExecutionUpgradePage;
