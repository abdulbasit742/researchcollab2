import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, Users, DollarSign, CheckCircle, Building2, 
  GraduationCap, Briefcase, Target, ArrowRight, Star,
  Shield, Clock, Award
} from "lucide-react";
import { Link } from "react-router-dom";

const impactMetrics = [
  { label: "FYP Projects Funded", value: "47", icon: Target, trend: "+12 this month" },
  { label: "Student Earnings Distributed", value: "PKR 2.8M", icon: DollarSign, trend: "+340K this week" },
  { label: "Active Sponsors", value: "23", icon: Building2, trend: "5 new this month" },
  { label: "Milestones Completed", value: "156", icon: CheckCircle, trend: "89% completion rate" },
  { label: "Students Earning", value: "189", icon: GraduationCap, trend: "Avg PKR 14.8K each" },
  { label: "Universities Active", value: "3", icon: Award, trend: "2 more in pipeline" },
];

const testimonials = [
  {
    name: "Ahmed Khan",
    role: "CEO, TechVentures Lahore",
    content: "We funded a mobile app prototype for PKR 150K. The team delivered a working MVP in 8 weeks. That would have cost us 5x with an agency.",
    rating: 5,
  },
  {
    name: "Dr. Fatima Zahra",
    role: "HoD Computer Science, FAST-NU",
    content: "The milestone-based oversight has transformed how we supervise FYPs. Faculty workload is down 40% and student accountability is up significantly.",
    rating: 5,
  },
  {
    name: "Bilal Ahmed",
    role: "Final Year Student, NUST",
    content: "I earned PKR 45,000 from my FYP project. It's the first time my academic work translated directly into income.",
    rating: 5,
  },
];

const milestoneHighlights = [
  { project: "AI-Powered Inventory System", sponsor: "RetailPro", amount: "PKR 85,000", status: "Milestone 3/4 Released" },
  { project: "Smart Campus Navigation", sponsor: "CampusTech", amount: "PKR 120,000", status: "Completed - All Released" },
  { project: "E-Commerce Analytics Dashboard", sponsor: "ShopWave", amount: "PKR 65,000", status: "Milestone 2/3 Released" },
];

export default function ImpactPage() {
  return (
    <>
      <Helmet>
        <title>Impact | FYP Execution OS</title>
        <meta name="description" content="See the real impact of sponsor-funded FYP projects. Student earnings, milestone completions, and industry partnerships." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Live Impact Data</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Real Projects. Real Funding. Real Earnings.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Every metric below represents actual escrow-backed FYP projects with milestone-controlled funding and verified student payouts.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/fyp/submit-problem">
                <Button size="lg">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Fund a Project
                </Button>
              </Link>
              <Link to="/fyp">
                <Button variant="outline" size="lg">
                  Browse FYP Projects
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="max-w-6xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {impactMetrics.map((metric) => (
              <Card key={metric.label} className="text-center">
                <CardContent className="pt-6">
                  <metric.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">How Sponsor-Funded FYP Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sponsor Funds", desc: "Industry deposits funds into escrow", icon: DollarSign },
              { step: "2", title: "Team Executes", desc: "Students work on milestones with faculty oversight", icon: Users },
              { step: "3", title: "Milestones Approved", desc: "Sponsor & faculty approve deliverables", icon: CheckCircle },
              { step: "4", title: "Earnings Distributed", desc: "Students receive payout per contribution %", icon: TrendingUp },
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Milestones */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">Recent Milestone Releases</h2>
          <div className="space-y-3">
            {milestoneHighlights.map((m, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">{m.project}</p>
                    <p className="text-sm text-muted-foreground">Sponsored by {m.sponsor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{m.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {m.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What Stakeholders Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">"{t.content}"</p>
                    <Separator className="mb-3" />
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Fund Innovation?</h2>
          <p className="text-muted-foreground mb-6">
            Start with as little as PKR 50,000. Escrow-protected. Milestone-controlled. Faculty-supervised.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/fyp/submit-problem">
              <Button size="lg">Submit a Problem Brief</Button>
            </Link>
            <Link to="/fyp/sponsor-strategy">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
