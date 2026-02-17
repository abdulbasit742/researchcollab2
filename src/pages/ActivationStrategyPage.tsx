import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Shield, Clock, CheckCircle, Building2,
  AlertTriangle, TrendingUp, Users, Lock, ArrowRight,
  Calendar, Target, Star, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const subscriptionPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    commission: "8%",
    escrow: "2%",
    features: ["50 FYP topics", "10 funded projects", "$20K funding cap", "Basic dashboard", "Escrow execution", "Student earnings"],
    restricted: ["Advanced analytics", "Accreditation export", "Custom branding", "API access"],
    highlight: false,
    cta: "Start Free Trial",
  },
  {
    name: "Basic",
    price: "$499",
    period: "/month",
    commission: "8%",
    escrow: "2%",
    features: ["100 FYP topics", "30 funded projects", "$100K funding cap", "Basic dashboard", "Escrow execution", "Student earnings", "Email support"],
    restricted: ["Advanced analytics", "Accreditation export", "Custom branding", "API access"],
    highlight: false,
    cta: "Choose Basic",
  },
  {
    name: "Professional",
    price: "$1,999",
    period: "/month",
    commission: "6%",
    escrow: "2%",
    features: ["Unlimited FYP topics", "Unlimited funded projects", "No funding cap", "Advanced analytics", "Accreditation export", "Priority support", "Department rankings"],
    restricted: ["Custom branding", "API access"],
    highlight: true,
    cta: "Choose Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    commission: "4–6%",
    escrow: "1.5%",
    features: ["Everything in Pro", "Custom branding", "API access", "Dedicated support", "Custom commission rates", "Multi-department", "Capital pools", "SLA guarantee"],
    restricted: [],
    highlight: false,
    cta: "Contact Sales",
  },
];

const trialTimeline = [
  { day: "Day 1", event: "Trial activated — full Phase 1 access", icon: Zap },
  { day: "Day 7", event: "First usage milestone check", icon: Target },
  { day: "Day 14", event: "Mid-trial engagement review", icon: TrendingUp },
  { day: "Day 23", event: "7-day warning — show revenue stats + upgrade CTA", icon: AlertTriangle },
  { day: "Day 29", event: "Final reminder — urgency banner", icon: Clock },
  { day: "Day 30", event: "Trial expires — view-only mode, active FYPs continue", icon: Lock },
];

const founderSchedule = [
  { day: "Mon", focus: "Pipeline Build", color: "bg-primary/10", tasks: "Research sponsors, send outreach, follow up leads" },
  { day: "Tue", focus: "University", color: "bg-accent/10", tasks: "Faculty meetings, FYP onboarding, department outreach" },
  { day: "Wed", focus: "Sponsor Calls", color: "bg-primary/10", tasks: "Discovery calls, scope structuring, budget negotiation" },
  { day: "Thu", focus: "Execution", color: "bg-accent/10", tasks: "Monitor milestones, resolve delays, collect testimonials" },
  { day: "Fri", focus: "Visibility", color: "bg-primary/10", tasks: "LinkedIn posts, case studies, sponsor appreciation" },
];

const crmFields = [
  "Company name", "Contact person", "Industry", "Problem brief", "Budget range",
  "Meeting status", "Proposal sent", "Escrow status", "Repeat potential", "Notes"
];

const dealStages = ["Prospect", "Meeting", "Proposal", "Negotiation", "Funded", "Active", "Completed", "Repeat"];

export default function ActivationStrategyPage() {
  return (
    <>
      <Helmet>
        <title>Activation & Pricing Strategy | FYP Execution OS</title>
        <meta name="description" content="Complete institutional activation strategy including trial plans, subscription pricing, founder execution OS, and sales-first activation framework." />
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">Strategic Operations</Badge>
            <h1 className="text-3xl font-bold mb-2">Institutional Activation &amp; Pricing Strategy</h1>
            <p className="text-muted-foreground max-w-2xl">
              Complete framework for trial plans, subscription pricing, founder execution discipline, and sales-first activation.
            </p>
          </div>

          <Tabs defaultValue="trial">
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="trial">Trial Plan</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Architecture</TabsTrigger>
              <TabsTrigger value="founder-os">Founder OS</TabsTrigger>
              <TabsTrigger value="sales-first">Sales-First Mode</TabsTrigger>
              <TabsTrigger value="anti-abuse">Anti-Abuse</TabsTrigger>
              <TabsTrigger value="conversion">Conversion Logic</TabsTrigger>
            </TabsList>

            {/* Trial Plan */}
            <TabsContent value="trial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    30-Day Free Trial — Institution &amp; Sponsor Activation
                  </CardTitle>
                  <CardDescription>
                    Remove institutional friction. Allow real funding + escrow execution. Create urgency before expiry.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trial scope */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-3">✅ Trial Includes</h3>
                      <ul className="space-y-2 text-sm">
                        {["Full FYP creation", "Sponsor funding & escrow", "Milestone execution & approvals", "Student earnings distribution", "Basic institutional dashboard", "Up to 50 FYP topics", "Up to 10 funded projects", "Up to $20K funding volume"].map(f => (
                          <li key={f} className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary shrink-0" />{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-3">🚫 Restricted During Trial</h3>
                      <ul className="space-y-2 text-sm">
                        {["Advanced analytics", "Multi-department ranking", "Export reports / accreditation", "Custom branding", "API access"].map(f => (
                          <li key={f} className="flex items-center gap-2"><Lock className="h-3 w-3 text-muted-foreground shrink-0" /><span className="text-muted-foreground">{f}</span></li>
                        ))}
                      </ul>
                      <Separator className="my-4" />
                      <h3 className="font-semibold text-sm mb-3">After Expiry (If Not Upgraded)</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• New FYP creation locked</li>
                        <li>• New sponsor funding blocked</li>
                        <li>• Historical data viewable</li>
                        <li>• Active funded FYPs continue to completion</li>
                        <li>• Escrow NEVER frozen mid-project</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-4">Trial Timeline</h3>
                    <div className="space-y-3">
                      {trialTimeline.map((item) => (
                        <div key={item.day} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Badge variant="outline" className="w-16 justify-center shrink-0">{item.day}</Badge>
                          <item.icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{item.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Architecture */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.name} className={plan.highlight ? "border-primary shadow-lg" : ""}>
                    {plan.highlight && <div className="bg-primary text-primary-foreground text-center text-xs py-1 font-semibold rounded-t-lg">RECOMMENDED</div>}
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4 text-xs">
                        <div className="bg-muted rounded px-2 py-1">
                          <span className="font-semibold">{plan.commission}</span> commission
                        </div>
                        <div className="bg-muted rounded px-2 py-1">
                          <span className="font-semibold">{plan.escrow}</span> escrow fee
                        </div>
                      </div>
                      <Separator />
                      <ul className="space-y-1.5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-primary shrink-0" />{f}
                          </li>
                        ))}
                        {plan.restricted.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.highlight ? "default" : "outline"} size="sm">
                        {plan.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { stream: "Institutional Subscription", desc: "Monthly/annual fee", icon: Building2 },
                      { stream: "Platform Commission", desc: "% of funded FYP amount", icon: DollarSign },
                      { stream: "Escrow Processing Fee", desc: "Fixed % on each deposit", icon: Shield },
                      { stream: "Enterprise Contracts", desc: "Custom annual agreements", icon: Star },
                    ].map((s) => (
                      <div key={s.stream} className="p-4 border rounded-lg text-center">
                        <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold text-sm">{s.stream}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Founder OS */}
            <TabsContent value="founder-os" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Execution Cadence</CardTitle>
                  <CardDescription>Structured 5-day operating framework for founding team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-5 gap-3">
                    {founderSchedule.map((day) => (
                      <div key={day.day} className={`p-4 rounded-lg ${day.color}`}>
                        <p className="font-bold text-sm">{day.day}</p>
                        <Badge variant="outline" className="my-2 text-xs">{day.focus}</Badge>
                        <p className="text-xs text-muted-foreground">{day.tasks}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CRM Structure (External)</CardTitle>
                    <CardDescription>Use Google Sheets / Notion — NOT internal build</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {crmFields.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Deal Stage Progression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-1">
                      {dealStages.map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <Badge variant={i < 5 ? "default" : "outline"} className="text-xs">{s}</Badge>
                          {i < dealStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="font-semibold mb-2">🚨 Hard Truth</p>
                  <p className="text-sm text-muted-foreground">
                    The difference between a startup that works and one that dies is <strong>daily discipline</strong> — not idea quality. 
                    For the next 90 days: product supports sales, sales drives revenue, revenue validates product. Not the other way around.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales-First */}
            <TabsContent value="sales-first" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">✅ Build These (Minimal)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        { title: "Sponsor Fast Onboarding", desc: "Email → Company → Payment → IP = < 3 min", link: "/fyp/submit-problem" },
                        { title: "Problem Brief Intake", desc: "Public shareable link for sponsors", link: "/fyp/submit-problem" },
                        { title: "Milestone Templates", desc: "3 standard templates: Prototype, MVP, Extended" },
                        { title: "Testimonial Capture", desc: "Auto-trigger after milestone approval" },
                        { title: "Revenue Snapshot Widget", desc: "Funding, escrow, students paid, sponsors" },
                        { title: "Public Impact Page", desc: "Credibility page — no financial details", link: "/impact" },
                      ].map((item) => (
                        <li key={item.title} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                            {item.link && (
                              <Link to={item.link} className="text-xs text-primary hover:underline">View →</Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">🚫 Do NOT Build (Next 90 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[
                        "Internal CRM", "AI lead scoring", "Sponsor subscription tiers",
                        "Complex analytics", "Referral system", "Multi-cluster management",
                        "Automated outbound tools", "Predictive models", "Global federation",
                        "Research commercialization", "Ranking engines"
                      ].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Anti-Abuse */}
            <TabsContent value="anti-abuse" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anti-Exploitation Safeguards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Trial Abuse Prevention</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />trial_used = true after activation (one-time)</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Domain verification required</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Institution admin verification</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Manual approval for enterprise</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-3">Revenue Protection</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Commission bypass monitoring</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Shadow account detection</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Downgrade-to-avoid-commission flags</li>
                        <li className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" />Direct deal detection (off-platform)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Validation Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {["Verified business email", "Basic KYC", "Payment method verified", "No anonymous funding"].map(r => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conversion Logic */}
            <TabsContent value="conversion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trial-to-Paid Conversion Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-2">7 Days Before Expiry</h3>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Email reminder with usage stats</li>
                        <li>• In-app banner with revenue generated</li>
                        <li>• Show students paid count</li>
                        <li>• Projected future revenue</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-2">1 Day Before Expiry</h3>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Final urgency reminder</li>
                        <li>• Full usage statistics summary</li>
                        <li>• One-click upgrade button</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-2">After Expiry</h3>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Auto-change to expired status</li>
                        <li>• Lock new FYP creation</li>
                        <li>• Block new sponsor onboarding</li>
                        <li>• View-only mode enabled</li>
                        <li>• Upgrade reactivates instantly</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">💡 Key Insight</p>
                    <p className="text-sm text-muted-foreground">
                      If the trial ends and they have funded FYPs + paid students, conversion probability increases to ~70%. 
                      The trial must <strong>demonstrate real value</strong> — not just features, but actual revenue and student earnings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 flex-wrap">
                <Link to="/founder/dashboard"><Button>Open Founder Dashboard <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
                <Link to="/impact"><Button variant="outline">View Impact Page</Button></Link>
                <Link to="/fyp/submit-problem"><Button variant="outline">Problem Brief Form</Button></Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
