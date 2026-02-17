import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target, TrendingUp, DollarSign, Users, AlertTriangle,
  Calendar, CheckCircle, Clock, Phone, Linkedin,
  Mail, MessageSquare, Building2, ArrowRight, Flag
} from "lucide-react";
import { useState } from "react";

// Weekly Targets
const weeklyTargets = [
  { label: "Sponsor outreach attempts", target: 20, current: 14, icon: Mail },
  { label: "Meetings booked", target: 10, current: 7, icon: Calendar },
  { label: "Meetings completed", target: 5, current: 3, icon: Phone },
  { label: "Funding proposals sent", target: 2, current: 1, icon: Target },
  { label: "Escrow deposits closed", target: 1, current: 0, icon: DollarSign },
  { label: "FYP topics onboarded", target: 10, current: 8, icon: CheckCircle },
];

// 30-60-90 milestones
const executionMilestones = [
  { day: 30, targets: ["5 funded FYPs", "$20K volume", "1 university active"], progress: 60 },
  { day: 60, targets: ["15 funded FYPs", "$75K volume", "5 repeat sponsors"], progress: 20 },
  { day: 90, targets: ["30 funded FYPs", "$150K volume", "2nd university"], progress: 5 },
];

// Red flags
const redFlags = [
  { flag: "No escrow deposit in 14 days", status: "warning", action: "Increase outreach volume" },
  { flag: "Faculty inactive for 10 days", status: "ok", action: "Schedule check-in" },
  { flag: "Milestone delay > 5 days", status: "ok", action: "Escalate to team lead" },
  { flag: "No sponsor meetings in 7 days", status: "warning", action: "Run outreach blitz" },
  { flag: "Funding pipeline empty", status: "ok", action: "Refresh target list" },
];

// Daily schedule
const dailySchedule = [
  { day: "Monday", focus: "Pipeline Build", tasks: ["Research 20 target sponsors", "Send outreach messages", "Follow up old leads", "Update pipeline tracker"] },
  { day: "Tuesday", focus: "University Engagement", tasks: ["Faculty meetings", "FYP onboarding review", "Dashboard demo", "Department outreach"] },
  { day: "Wednesday", focus: "Sponsor Calls", tasks: ["Discovery calls", "Scope structuring", "Budget negotiation", "IP agreement clarification"] },
  { day: "Thursday", focus: "Execution Oversight", tasks: ["Monitor milestone progress", "Resolve delays", "Ensure escrow functioning", "Collect testimonials"] },
  { day: "Friday", focus: "Visibility & Momentum", tasks: ["Publish LinkedIn case study", "Share milestone completion", "Highlight student earnings", "Public sponsor appreciation"] },
];

// Conversion funnel
const funnelStages = [
  { stage: "Outreach", count: 87, rate: "100%" },
  { stage: "Response", count: 34, rate: "39%" },
  { stage: "Meeting", count: 18, rate: "53%" },
  { stage: "Proposal", count: 9, rate: "50%" },
  { stage: "Escrow", count: 4, rate: "44%" },
  { stage: "Repeat", count: 1, rate: "25%" },
];

export default function FounderDashboardPage() {
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (key: string) => {
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Helmet>
        <title>Founder Execution OS | FYP Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Founder Execution OS</h1>
              <p className="text-sm text-muted-foreground">Revenue-first. Discipline daily. Prove it works.</p>
            </div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Week 3 of 12
            </Badge>
          </div>

          <Tabs defaultValue="kpis">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="kpis">Weekly KPIs</TabsTrigger>
              <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
              <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
              <TabsTrigger value="milestones">30-60-90</TabsTrigger>
              <TabsTrigger value="risks">Red Flags</TabsTrigger>
            </TabsList>

            {/* Weekly KPIs */}
            <TabsContent value="kpis">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {weeklyTargets.map((kpi) => {
                  const pct = Math.round((kpi.current / kpi.target) * 100);
                  return (
                    <Card key={kpi.label}>
                      <CardContent className="pt-5">
                        <div className="flex items-center gap-2 mb-3">
                          <kpi.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{kpi.label}</span>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-2xl font-bold">{kpi.current}</span>
                          <span className="text-sm text-muted-foreground">/ {kpi.target}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{pct}% of target</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Revenue snapshot */}
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Funding This Month", value: "PKR 485K" },
                  { label: "Active Escrow", value: "PKR 320K" },
                  { label: "Students Paid", value: "12" },
                  { label: "Sponsors Onboarded", value: "4" },
                ].map((m) => (
                  <Card key={m.label}>
                    <CardContent className="pt-5 text-center">
                      <p className="text-2xl font-bold">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Daily Schedule */}
            <TabsContent value="schedule">
              <div className="grid md:grid-cols-5 gap-4">
                {dailySchedule.map((day) => (
                  <Card key={day.day}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{day.day}</CardTitle>
                      <Badge variant="secondary" className="w-fit text-xs">{day.focus}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {day.tasks.map((task, i) => {
                        const key = `${day.day}-${i}`;
                        return (
                          <label key={key} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox checked={checkedTasks[key] || false} onCheckedChange={() => toggleTask(key)} className="mt-0.5" />
                            <span className={`text-xs ${checkedTasks[key] ? "line-through text-muted-foreground" : ""}`}>{task}</span>
                          </label>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Conversion Funnel */}
            <TabsContent value="funnel">
              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Conversion Funnel</CardTitle>
                  <CardDescription>Track conversion at each stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {funnelStages.map((stage, i) => {
                      const maxCount = funnelStages[0].count;
                      const width = (stage.count / maxCount) * 100;
                      return (
                        <div key={stage.stage} className="flex items-center gap-4">
                          <span className="w-20 text-sm font-medium">{stage.stage}</span>
                          <div className="flex-1">
                            <div className="h-8 bg-muted rounded-md overflow-hidden">
                              <div className="h-full bg-primary/80 rounded-md flex items-center px-3 transition-all" style={{ width: `${Math.max(width, 8)}%` }}>
                                <span className="text-xs font-bold text-primary-foreground">{stage.count}</span>
                              </div>
                            </div>
                          </div>
                          <span className="w-12 text-sm text-muted-foreground text-right">{stage.rate}</span>
                          {i < funnelStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 30-60-90 */}
            <TabsContent value="milestones">
              <div className="grid md:grid-cols-3 gap-4">
                {executionMilestones.map((m) => (
                  <Card key={m.day}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        Day {m.day}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={m.progress} className="h-3 mb-4" />
                      <p className="text-sm font-medium mb-2">{m.progress}% complete</p>
                      <ul className="space-y-2">
                        {m.targets.map((t) => (
                          <li key={t} className="flex items-center gap-2 text-sm">
                            <Target className="h-3 w-3 text-primary shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Red Flags */}
            <TabsContent value="risks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Red Flag Monitor
                  </CardTitle>
                  <CardDescription>Weekly risk summary — act immediately on warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {redFlags.map((rf, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {rf.status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm font-medium">{rf.flag}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={rf.status === "warning" ? "destructive" : "secondary"}>
                            {rf.status === "warning" ? "⚠ Action Needed" : "✓ OK"}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{rf.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
