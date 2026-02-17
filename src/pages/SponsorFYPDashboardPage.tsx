import { Helmet } from "react-helmet-async";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { EscrowTimeline, EscrowStep } from "@/components/fyp/EscrowTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign, Lock, Target, CheckCircle, Clock,
  Users, FileText, ArrowRight, MessageSquare, Shield
} from "lucide-react";

const projects = [
  {
    title: "AI-Powered Inventory System",
    faculty: "Dr. Sarah Ahmed",
    team: ["Ali R.", "Fatima K.", "Hassan M."],
    health: "healthy" as const,
    budgetUsed: 65,
    budgetTotal: "PKR 120,000",
    nextMilestone: "API Integration",
    nextDue: "Feb 24",
    status: "In Progress",
    escrowSteps: [
      { label: "Funded", amount: "PKR 120K", date: "Jan 15", status: "completed" as const },
      { label: "Escrow Locked", amount: "PKR 120K", date: "Jan 16", status: "completed" as const },
      { label: "M1 Paid", amount: "PKR 30K", date: "Feb 1", approver: "Dr. Ahmed", status: "completed" as const },
      { label: "M2 Paid", amount: "PKR 30K", date: "Feb 10", approver: "Dr. Ahmed", status: "completed" as const },
      { label: "M3 Due", amount: "PKR 30K", status: "active" as const },
      { label: "Completed", status: "pending" as const },
    ],
  },
  {
    title: "Smart Campus Navigation App",
    faculty: "Prof. Imran Shah",
    team: ["Zara S.", "Usman T."],
    health: "at-risk" as const,
    budgetUsed: 35,
    budgetTotal: "PKR 85,000",
    nextMilestone: "UX Prototype",
    nextDue: "Feb 20 (Overdue)",
    status: "At Risk",
    escrowSteps: [
      { label: "Funded", amount: "PKR 85K", date: "Jan 20", status: "completed" as const },
      { label: "Escrow Locked", amount: "PKR 85K", date: "Jan 21", status: "completed" as const },
      { label: "M1 Due", amount: "PKR 25K", status: "active" as const },
      { label: "M2", amount: "PKR 30K", status: "pending" as const },
      { label: "Completed", status: "pending" as const },
    ],
  },
];

const activities = [
  { action: "Milestone 2 approved", project: "AI Inventory", time: "2 hours ago", type: "approval" },
  { action: "Escrow released — PKR 30,000", project: "AI Inventory", time: "2 hours ago", type: "financial" },
  { action: "Team submitted deliverable", project: "Campus Nav", time: "1 day ago", type: "submission" },
  { action: "Faculty comment added", project: "AI Inventory", time: "2 days ago", type: "comment" },
];

export default function SponsorFYPDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Sponsor Dashboard | FYP Execution OS</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Sponsor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your funded FYP projects, milestones, and escrow.</p>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard title="Total Funded" value="PKR 205K" icon={DollarSign} trend="up" trendValue="+85K" />
            <KPICard title="Escrow Locked" value="PKR 145K" icon={Lock} trend="neutral" trendValue="Active" />
            <KPICard title="Active Projects" value="2" icon={Target} />
            <KPICard title="Milestones Pending" value="3" icon={Clock} trend="down" trendValue="1 overdue" />
            <KPICard title="Completion %" value="52%" icon={CheckCircle} trend="up" trendValue="+8%" />
          </div>

          {/* Project Cards */}
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            {projects.map((p, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Faculty: {p.faculty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <HealthBadge level={p.health} />
                      <Badge variant="outline" className="text-xs">{p.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Team</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{p.team.join(", ")}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Budget Used</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${p.budgetUsed}%` }} />
                        </div>
                        <span className="font-medium text-xs">{p.budgetUsed}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Next Milestone</p>
                      <span className="font-medium">{p.nextMilestone}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
                      <span className={`font-medium ${p.nextDue.includes("Overdue") ? "text-critical" : ""}`}>
                        {p.nextDue}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Escrow Timeline */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                      Escrow Flow — {p.budgetTotal}
                    </p>
                    <EscrowTimeline steps={p.escrowSteps} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      a.type === "financial" ? "bg-success/10" :
                      a.type === "approval" ? "bg-primary/10" :
                      "bg-muted"
                    }`}>
                      {a.type === "financial" ? <DollarSign className="h-3.5 w-3.5 text-success" /> :
                       a.type === "approval" ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> :
                       a.type === "submission" ? <FileText className="h-3.5 w-3.5 text-muted-foreground" /> :
                       <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.project} · {a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
