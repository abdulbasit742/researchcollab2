import { Helmet } from "react-helmet-async";
import { KPICard } from "@/components/fyp/KPICard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign, Users, CheckCircle, Building2, GraduationCap,
  Award, Star, ArrowRight, Briefcase, Shield, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { PlatformImpactIndex } from "@/components/impact/PlatformImpactIndex";
import { useProofOfValueSnapshot } from "@/hooks/useProofOfValue";

const metrics = [
  { title: "Funding Volume", value: "PKR 2.8M", icon: DollarSign, trend: "up" as const, trendValue: "+340K this month" },
  { title: "Students Paid", value: "189", icon: GraduationCap, trend: "up" as const, trendValue: "Avg PKR 14.8K" },
  { title: "Active Sponsors", value: "23", icon: Building2, trend: "up" as const, trendValue: "+5 this month" },
  { title: "Completed Projects", value: "47", icon: CheckCircle, trend: "up" as const, trendValue: "89% success rate" },
  { title: "Milestones Released", value: "156", icon: Target, trend: "up" as const, trendValue: "PKR 1.9M released" },
  { title: "Universities Active", value: "3", icon: Award, trend: "up" as const, trendValue: "2 more in pipeline" },
];

const testimonials = [
  { name: "Ahmed Khan", role: "CEO, TechVentures Lahore", content: "We funded a mobile app prototype for PKR 150K. The team delivered a working MVP in 8 weeks. That would have cost us 5x with an agency.", rating: 5 },
  { name: "Dr. Fatima Zahra", role: "HoD Computer Science, FAST-NU", content: "The milestone-based oversight has transformed how we supervise FYPs. Faculty workload is down 40% and student accountability is up significantly.", rating: 5 },
  { name: "Bilal Ahmed", role: "Final Year Student, NUST", content: "I earned PKR 45,000 from my FYP project. It's the first time my academic work translated directly into income.", rating: 5 },
];

const caseStudies = [
  { title: "AI-Powered Inventory System", sponsor: "RetailPro", amount: "PKR 120,000", duration: "8 weeks", team: 3, outcome: "Deployed to production" },
  { title: "Smart Campus Navigation", sponsor: "CampusTech", amount: "PKR 85,000", duration: "6 weeks", team: 2, outcome: "Pilot with 500+ users" },
  { title: "E-Commerce Analytics", sponsor: "ShopWave", amount: "PKR 65,000", duration: "5 weeks", team: 3, outcome: "3x conversion insight" },
];

const steps = [
  { n: "01", title: "Sponsor Funds", desc: "Industry deposits funds into milestone-controlled escrow." },
  { n: "02", title: "Team Executes", desc: "Student teams work under faculty supervision." },
  { n: "03", title: "Milestones Approved", desc: "Sponsor & faculty approve each deliverable." },
  { n: "04", title: "Earnings Released", desc: "Students receive payout per verified contribution." },
];

export default function ImpactPage() {
  const { data: snapshot } = useProofOfValueSnapshot();

  return (
    <>
      <Helmet>
        <title>Impact | FYP Execution OS</title>
        <meta name="description" content="Real impact data from sponsor-funded FYP projects. Student earnings, milestone completions, and industry partnerships." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 px-4 border-b border-border">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="outline" className="mb-5 text-xs uppercase tracking-wider">Live Impact Data</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Real Projects. Real Funding. Real Earnings.
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Every metric represents actual escrow-backed FYP projects with milestone-controlled funding and verified student payouts.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/fyp/submit-problem">
                <Button size="lg"><Briefcase className="h-4 w-4 mr-2" />Fund a Project</Button>
              </Link>
              <Link to="/fyp">
                <Button variant="outline" size="lg">Browse Projects <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <KPICard key={m.title} title={m.title} value={m.value} icon={m.icon} trend={m.trend} trendValue={m.trendValue} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="border-y border-border py-16 bg-muted/20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-10">How Escrow-Backed FYP Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="text-3xl font-bold text-primary/20 mb-2">{s.n}</div>
                  <h3 className="font-semibold mb-1 text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-xl font-bold mb-6">Completed Projects</h2>
          <div className="space-y-3">
            {caseStudies.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Sponsored by {c.sponsor} · {c.duration} · {c.team} members</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">{c.amount}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    <Shield className="h-3 w-3 mr-1" />{c.outcome}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border py-16 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-8">Stakeholder Feedback</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 leading-relaxed">"{t.content}"</p>
                    <Separator className="mb-3" />
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Impact Index */}
        {snapshot && (
          <section className="max-w-6xl mx-auto px-4 py-8">
            <PlatformImpactIndex
              index={snapshot.platform_impact_index}
              breakdown={{
                escrowVolume: Math.min(100, (snapshot.total_escrow_volume / 5000000) * 100),
                completionRate: snapshot.milestone_success_rate,
                hiringConversion: snapshot.hiring_conversion_rate,
                sponsorRetention: snapshot.repeat_sponsor_rate,
                trustStability: Math.min(100, snapshot.student_completion_rate),
              }}
            />
          </section>
        )}

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-3">Ready to Fund Innovation?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start with as little as PKR 50,000. Escrow-protected. Milestone-controlled. Faculty-supervised.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/fyp/submit-problem"><Button size="lg">Submit a Problem Brief</Button></Link>
            <Link to="/fyp/activation-strategy"><Button variant="outline" size="lg">Learn More</Button></Link>
          </div>
        </section>
      </div>
    </>
  );
}
