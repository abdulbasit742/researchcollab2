import { Helmet } from "react-helmet-async";
import { KPICard } from "@/components/fyp/KPICard";
import { EscrowTimeline } from "@/components/fyp/EscrowTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign, Target, CheckCircle, Star, Percent,
  FileText, Code, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

const milestones = [
  { title: "Research & UX Draft", status: "completed" as const, amount: "PKR 15,000", date: "Jan 28" },
  { title: "Backend API Development", status: "completed" as const, amount: "PKR 20,000", date: "Feb 8" },
  { title: "Frontend Integration", status: "active" as const, amount: "PKR 20,000" },
  { title: "Testing & Delivery", status: "pending" as const, amount: "PKR 15,000" },
];

const portfolioItems = [
  { title: "E-Commerce Analytics Dashboard", tech: ["React", "Node.js", "PostgreSQL"], rating: 4.8, earnings: "PKR 55,000" },
];

export default function StudentFYPDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Student Dashboard | FYP OS</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Your FYP Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your earnings, milestones, and professional portfolio.</p>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard title="Earnings Total" value="PKR 35K" icon={DollarSign} trend="up" trendValue="+20K" />
            <KPICard title="Active Projects" value="1" icon={Target} />
            <KPICard title="Completion Rate" value="85%" icon={CheckCircle} trend="up" trendValue="+5%" />
            <KPICard title="Contribution %" value="42%" icon={Percent} subtitle="of team output" />
            <KPICard title="Rating" value="4.8" icon={Star} subtitle="from sponsors" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Milestone Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Milestone Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <EscrowTimeline steps={milestones.map(m => ({
                    label: m.title,
                    amount: m.amount,
                    date: m.date,
                    status: m.status,
                  }))} />

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            m.status === "completed" ? "bg-success" :
                            m.status === "active" ? "bg-primary" : "bg-border"
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{m.title}</p>
                            {m.date && <p className="text-xs text-muted-foreground">{m.date}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{m.amount}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {m.status === "completed" ? "Paid" : m.status === "active" ? "In Progress" : "Upcoming"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Portfolio Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {portfolioItems.map((p, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                      <h3 className="font-medium text-sm">{p.title}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tech.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-warning">
                          <Star className="h-3 w-3 fill-warning" /> {p.rating}
                        </span>
                        <span className="font-semibold text-success">{p.earnings}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        View Full Portfolio
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contribution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5" /> Code commits
                    </span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Files uploaded
                    </span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Tasks completed
                    </span>
                    <span className="font-medium">23</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
