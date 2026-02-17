import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Target, DollarSign, ShieldCheck, BarChart3, Users, FileText, Handshake, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

const pitchSlides = [
  { title: "The Research Stagnation Problem", points: ["Universities publish 2.8M papers/year globally", "Less than 3% are ever commercialized", "Revenue conversion is near zero for most institutions", "Citation metrics ≠ economic impact"] },
  { title: "The Student Employability Gap", points: ["Graduates lack verifiable execution proof", "No funded milestone experience on record", "Weak industry-connected work portfolios", "Employers cannot verify capability density"] },
  { title: "The Funding Inefficiency Crisis", points: ["Grants misallocated without milestone tracking", "No escrow protection for research funding", "Zero accountability on capital deployment", "ROI on research investment is unmeasured"] },
  { title: "The Visibility Problem", points: ["Citation count ≠ economic productivity", "No standardized commercialization dashboard", "Universities cannot benchmark against peers", "Industry cannot discover implementation-ready research"] },
  { title: "The Execution Gap", points: ["Research sits in journals — unexecuted", "No structured path from paper to product", "Talent exists but isn't routed to projects", "Capital exists but isn't matched to research"] },
  { title: "RCollab: The Execution Layer", points: ["Research → Funding → Escrow → Execution → Revenue", "Milestone-backed accountability", "Verified institutional productivity metrics", "Student earnings as employability proof"] },
  { title: "How It Works", points: ["Upload research → Mark implementation-ready", "Receive funding pledges → Auto-escrow", "Execute milestones → Release capital", "Track revenue → Institutional dashboard"] },
  { title: "Institutional Benefits", points: ["Revenue from research commercialization", "Student employability proof generation", "Productivity ranking improvement", "Industry partnership pipeline"] },
  { title: "Competitive Advantage", points: ["Scholar = Discovery | RCollab = Execution", "No existing platform owns this layer", "First-mover in execution infrastructure", "Data accumulation creates switching moat"] },
  { title: "Pilot Proposal", points: ["90-day onboarding program", "Dedicated institutional support", "No upfront infrastructure cost", "Revenue sharing from Day 1"] },
];

const objections = [
  { objection: "We already use Google Scholar.", response: "Scholar indexes citations. We index revenue. They answer 'who cited you?' — we answer 'who funded you, what did it produce, and how much did it earn?' These are complementary, not competing." },
  { objection: "We don't have funding for this.", response: "Tier 1 starts at minimal cost. More importantly, RCollab generates funding — industry partners pledge capital toward your research. It's a revenue channel, not a cost center." },
  { objection: "Faculty won't adopt.", response: "Faculty don't need to change workflows. They mark research 'implementation-ready' — students and industry handle execution. Faculty see results on their dashboard." },
  { objection: "We have an incubator.", response: "Incubators support startups. RCollab commercializes research. Most research doesn't become a startup — it becomes a service, product, or consultancy. Different pipeline." },
  { objection: "What about IP ownership?", response: "IP ownership is configurable per project — institution-owned, researcher-owned, shared, or licensed. NDA and ownership terms are set before funding begins." },
  { objection: "This sounds complex.", response: "The loop is simple: Upload → Fund → Execute → Earn. Complexity is handled by the platform. Universities see dashboards, not infrastructure." },
  { objection: "What's the risk?", response: "All funding is escrow-backed. Milestones must be completed before release. Dispute resolution is built-in. Financial risk is near zero for the institution." },
];

const pricingTiers = [
  { name: "Starter", price: "$499/mo", features: ["Up to 50 execution tracks", "Basic commercialization dashboard", "Standard escrow", "Email support"], badge: "Entry" },
  { name: "Accelerator", price: "2% of GMV + $999/mo", features: ["Unlimited execution tracks", "Advanced analytics", "Capital pool integration", "Industry matching", "Priority support"], badge: "Growth" },
  { name: "Enterprise OS", price: "Custom", features: ["Custom deployment", "Dedicated success manager", "Capital marketplace access", "Ranking boost", "API access", "SLA guarantee"], badge: "Scale" },
];

const comparison = [
  { feature: "Citation Tracking", scholar: true, scopus: true, rcollab: true },
  { feature: "Revenue Tracking", scholar: false, scopus: false, rcollab: true },
  { feature: "Funding Pipeline", scholar: false, scopus: false, rcollab: true },
  { feature: "Escrow-Backed Execution", scholar: false, scopus: false, rcollab: true },
  { feature: "Milestone Workflow", scholar: false, scopus: false, rcollab: true },
  { feature: "Commercialization Dashboard", scholar: false, scopus: false, rcollab: true },
  { feature: "Institutional Productivity Index", scholar: false, scopus: false, rcollab: true },
  { feature: "Student Earnings Tracking", scholar: false, scopus: false, rcollab: true },
  { feature: "Industry Partner Matching", scholar: false, scopus: false, rcollab: true },
  { feature: "Discovery & Indexing", scholar: true, scopus: true, rcollab: false },
];

const salesProcess = [
  { step: 1, name: "Intro Call", desc: "Pain diagnosis — identify research commercialization gaps", stakeholders: ["Research Director", "Innovation Center"] },
  { step: 2, name: "ROI Simulation", desc: "Run financial model with university's actual numbers", stakeholders: ["Finance Office", "Research Director"] },
  { step: 3, name: "Faculty Roundtable", desc: "Demo with 3-5 department heads, show execution flow", stakeholders: ["Faculty Heads", "Department Chairs"] },
  { step: 4, name: "Executive Presentation", desc: "Full pitch to decision-makers with ROI + competitive framing", stakeholders: ["Vice Chancellor", "Provost"] },
  { step: 5, name: "Pilot Agreement", desc: "90-day pilot with defined success metrics", stakeholders: ["Legal", "Finance", "Research Director"] },
  { step: 6, name: "Onboarding", desc: "Upload research, configure departments, train faculty", stakeholders: ["IT", "Faculty", "Students"] },
  { step: 7, name: "First Showcase", desc: "Present first commercialization results to leadership", stakeholders: ["All stakeholders"] },
];

const timelineMilestones = [
  { month: "1–2", phase: "Foundation", tasks: ["Onboard research database", "Identify 20+ implementation-ready projects", "Configure institutional dashboard", "Train faculty on platform"] },
  { month: "3–4", phase: "Activation", tasks: ["Launch first funding round", "Activate industry outreach", "Onboard 5+ industry partners", "First funding pledges received"] },
  { month: "5–6", phase: "Execution", tasks: ["Execute first milestone-backed projects", "Release first escrow payments", "Track student earnings", "Generate initial revenue data"] },
  { month: "7–9", phase: "Growth", tasks: ["Publish first commercialization report", "Expand to 3+ departments", "Refine productivity metrics", "Industry partnership pipeline"] },
  { month: "10–12", phase: "Proof", tasks: ["Showcase institutional case study", "Demonstrate revenue generation", "Benchmark productivity improvement", "Plan Year 2 expansion"] },
];

const PilotAcquisitionKitPage = () => {
  return (
    <>
      <Helmet><title>Pilot Acquisition Kit | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Pilot University Acquisition Kit</h1>
              <p className="text-muted-foreground">Complete sales toolkit for onboarding 3–5 pilot universities</p>
            </div>
          </div>
          <Badge variant="outline" className="mb-8">Target: Mid-tier universities, 5K–25K students, emerging markets</Badge>

          <Tabs defaultValue="pitch" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
              <TabsTrigger value="objections">Objection Handling</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="competitive">Competitive</TabsTrigger>
              <TabsTrigger value="timeline">12-Month Plan</TabsTrigger>
              <TabsTrigger value="sales">Sales Process</TabsTrigger>
              <TabsTrigger value="casestudy">Case Study Template</TabsTrigger>
            </TabsList>

            {/* Pitch Deck */}
            <TabsContent value="pitch" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Institutional Pain Breakdown Deck</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pitchSlides.map((slide, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-xs bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">{i + 1}</span>
                        {slide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {slide.points.map((p, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-primary shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Objection Handling */}
            <TabsContent value="objections" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Objection Handling Script</h2>
              {objections.map((o, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-2">"{o.objection}"</p>
                        <p className="text-sm text-muted-foreground">{o.response}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Pricing */}
            <TabsContent value="pricing" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5" /> Institutional Pricing Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pricingTiers.map((tier, i) => (
                  <Card key={i} className={i === 1 ? "border-primary/50 shadow-lg" : ""}>
                    <CardHeader>
                      <Badge variant={i === 1 ? "default" : "secondary"} className="w-fit mb-2">{tier.badge}</Badge>
                      <CardTitle>{tier.name}</CardTitle>
                      <p className="text-2xl font-bold text-primary">{tier.price}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((f, j) => (
                          <li key={j} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Competitive */}
            <TabsContent value="competitive" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Competitive Comparison</h2>
              <Card>
                <CardContent className="pt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Feature</th>
                        <th className="text-center py-2 px-3">Google Scholar</th>
                        <th className="text-center py-2 px-3">Scopus</th>
                        <th className="text-center py-2 px-3 text-primary font-bold">RCollab</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((c, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 px-3 font-medium">{c.feature}</td>
                          <td className="text-center px-3">{c.scholar ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="text-center px-3">{c.scopus ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="text-center px-3">{c.rcollab ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4 text-sm">
                  <p className="font-medium mb-1">Positioning Statement</p>
                  <p className="text-muted-foreground">Scholar = Discovery Layer. RCollab = Execution Layer. Universities can ignore Scholar. They cannot ignore capital.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Target className="h-5 w-5" /> 12-Month Institutional Transformation Plan</h2>
              <div className="space-y-4">
                {timelineMilestones.map((m, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs">Month {m.month}</Badge>
                        <span className="font-semibold">{m.phase}</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {m.tasks.map((t, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Sales Process */}
            <TabsContent value="sales" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Structured Sales Process</h2>
              <div className="space-y-3">
                {salesProcess.map((s) => (
                  <Card key={s.step}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shrink-0">{s.step}</span>
                        <div>
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.stakeholders.map((st, i) => <Badge key={i} variant="secondary" className="text-xs">{st}</Badge>)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Case Study Template */}
            <TabsContent value="casestudy" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="h-5 w-5" /> Pilot Case Study Template</h2>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {[
                    { label: "Institution Name", value: "[University Name]" },
                    { label: "Pilot Duration", value: "90 days" },
                    { label: "Research Uploaded", value: "[X] projects" },
                    { label: "Implementation-Ready %", value: "[X]%" },
                    { label: "Funded Projects", value: "[X] projects, $[X] total funding" },
                    { label: "Revenue Generated", value: "$[X] total, $[X] avg per project" },
                    { label: "Student Earnings", value: "$[X] distributed to [X] students" },
                    { label: "Industry Partners Onboarded", value: "[X] companies" },
                    { label: "Milestone Completion Rate", value: "[X]%" },
                    { label: "Institutional Productivity Index", value: "[Grade] — up from [Previous]" },
                    { label: "Key Quote", value: "\"[University representative testimonial]\"" },
                    { label: "Recommendation", value: "[Expand to all departments / Continue pilot / Custom]" },
                  ].map((field, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium min-w-[200px]">{field.label}</span>
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PilotAcquisitionKitPage;
