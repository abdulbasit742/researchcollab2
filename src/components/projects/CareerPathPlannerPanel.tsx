import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CVResumeHelperPanel } from "@/components/projects/CVResumeHelperPanel";
import { CalendarDays, CheckCircle2, Compass, Flag, Lock, MapPinned, Route, ShieldCheck, Sparkles } from "lucide-react";

const careerRoutes = [
  { id: "route-ai", title: "AI Research Assistant", horizon: "0-3 months", readiness: 82, status: "Best Fit", focus: "Research writing, AI prompting, methodology, literature review evidence." },
  { id: "route-frontend", title: "Frontend Product Builder", horizon: "3-6 months", readiness: 76, status: "Good Fit", focus: "React UI, dashboards, responsive components, QA proof." },
  { id: "route-data", title: "Data Analyst Intern", horizon: "3-6 months", readiness: 68, status: "Needs Prep", focus: "SQL basics, data storytelling, chart evidence, mini case studies." },
  { id: "route-validation", title: "Prototype Validation Role", horizon: "6-9 months", readiness: 54, status: "Gap", focus: "Testing logs, lab validation, evidence checklist, technical documentation." },
];

const careerMilestones = [
  { label: "Portfolio polish", period: "Week 1", status: "Ready", helper: "Use Portfolio Builder and privacy checks to create a public-ready story." },
  { label: "Evidence upgrade", period: "Week 2", status: "Needs Work", helper: "Add test logs, screenshots, rubric proof, and outcome mapping links." },
  { label: "Skill sprint", period: "Weeks 3-4", status: "Needs Work", helper: "Close SQL, QA, communication, and validation gaps." },
  { label: "Opportunity shortlist", period: "Month 2", status: "Ready", helper: "Use Opportunities Hub and listing board to shortlist top-fit roles." },
  { label: "Interview readiness", period: "Month 3", status: "Needs Work", helper: "Prepare project pitch, viva-style answers, and portfolio walkthrough." },
];

const decisionSignals = [
  { label: "Fastest route", value: "AI Research Assistant", status: "Best Fit" },
  { label: "Highest portfolio value", value: "Frontend Product Builder", status: "Good Fit" },
  { label: "Needs strongest prep", value: "Prototype Validation Role", status: "Gap" },
  { label: "Next action", value: "Upgrade evidence pack", status: "Needs Work" },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Best Fit" || status === "Good Fit") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Work" || status === "Needs Prep") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Gap") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function CareerPathPlannerPanel() {
  const readyRoutes = careerRoutes.filter((route) => route.status === "Best Fit" || route.status === "Good Fit").length;
  const needsPrep = careerRoutes.filter((route) => route.status === "Needs Prep").length;
  const gaps = careerRoutes.filter((route) => route.status === "Gap").length;
  const readyMilestones = careerMilestones.filter((milestone) => milestone.status === "Ready").length;
  const averageReadiness = Math.round(careerRoutes.reduce((total, route) => total + route.readiness, 0) / careerRoutes.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Routes" value={careerRoutes.length.toString()} helper="Career paths" />
        <MetricCard label="Ready" value={readyRoutes.toString()} helper="Strong paths" />
        <MetricCard label="Prep" value={needsPrep.toString()} helper="Needs work" danger={needsPrep > 0} />
        <MetricCard label="Gaps" value={gaps.toString()} helper="Critical" danger={gaps > 0} />
        <MetricCard label="Readiness" value={`${averageReadiness}%`} helper="Average" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Career Route Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" /> Career Path Planner
              </CardTitle>
              <CardDescription>
                Plan target career routes, milestones, readiness timelines, next actions, and decision signals from the project portfolio.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Route className="mr-2 h-4 w-4" /> Optimize Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Save Plan Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average route readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo career path planner only. Production plans should verify user goals, local opportunity rules, evidence quality, privacy settings, and revision history.
          </div>
          <CareerRoutes />
          <div className="grid gap-4 xl:grid-cols-2">
            <CareerMilestones readyMilestones={readyMilestones} />
            <DecisionSignals />
          </div>
        </CardContent>
      </Card>
      <CVResumeHelperPanel />
    </div>
  );
}

function CareerRoutes() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><MapPinned className="h-4 w-4 text-primary" /> Career Routes</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{careerRoutes.map((route) => <div key={route.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(route.status)}>{route.status}</Badge><Badge variant="outline">{route.horizon}</Badge></div><p className="mt-2 font-medium">{route.title}</p><Progress value={route.readiness} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{route.readiness}% route readiness</p><p className="mt-2 text-muted-foreground">{route.focus}</p></div>)}</div></div>;
}

function CareerMilestones({ readyMilestones }: { readyMilestones: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Flag className="h-4 w-4 text-primary" /> Career Milestones</p><p className="mt-1 text-xs text-muted-foreground">{readyMilestones} milestones are ready to start.</p><div className="mt-3 space-y-3">{careerMilestones.map((milestone) => <div key={milestone.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(milestone.status)}>{milestone.status}</Badge><Badge variant="outline" className="gap-1"><CalendarDays className="h-3 w-3" /> {milestone.period}</Badge></div><p className="mt-2 font-medium">{milestone.label}</p><p className="mt-1 text-xs text-muted-foreground">{milestone.helper}</p></div>)}</div></div>;
}

function DecisionSignals() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Decision Signals</p><div className="mt-3 space-y-3">{decisionSignals.map((signal) => <div key={signal.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(signal.status)}>{signal.status}</Badge><p className="font-medium">{signal.label}</p></div><p className="mt-2 flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> {signal.value}</p></div>)}</div><div className="mt-3 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground"><Sparkles className="mr-1 inline h-3 w-3" /> Use this with Skills Gap Analyzer before choosing a route.</div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
