import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarRange, ClipboardList, Lock, Route, UsersRound } from "lucide-react";

const batchPlans = [
  { id: "spring", label: "FYP 2026 Spring Cycle", status: "Active", start: "January 2026", end: "June 2026", completion: 64, note: "Active project tracking and review workflow." },
  { id: "summer", label: "FYP 2026 Summer Intake", status: "Planning", start: "July 2026", end: "December 2026", completion: 18, note: "Planning intake rules and capacity estimates." },
  { id: "winter", label: "FYP 2025 Winter Cycle", status: "Closed", start: "August 2025", end: "December 2025", completion: 100, note: "Closed demo cycle kept for reporting reference." },
];

const batchGroups = [
  { id: "a", label: "CS 2026-A", status: "Ready", learners: 96, teams: 32, projects: 32, slots: 34, note: "Group is ready for active tracking." },
  { id: "b", label: "CS 2026-B", status: "Needs Review", learners: 84, teams: 28, projects: 28, slots: 25, note: "Available slots are lower than team count." },
  { id: "extra", label: "Extra Teams", status: "Missing", learners: 12, teams: 4, projects: 4, slots: 0, note: "Extra group needs confirmation." },
];

const batchSteps = [
  { id: "team", title: "Team Formation Locked", status: "Ready", due: "Done", helper: "Primary teams are formed." },
  { id: "map", title: "Allocation Review", status: "Needs Review", due: "This week", helper: "Rebalance high-load reviewers." },
  { id: "proposal", title: "Proposal Review Window", status: "Ready", due: "Next 2 weeks", helper: "Teams prepare proposal readiness." },
  { id: "viva", title: "Mock Viva Scheduling", status: "Blocked", due: "Blocked", helper: "Needs final group approval." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Active") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Planning") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Closed") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/30";
};

export function BatchSessionManagementPanel() {
  const totals = batchGroups.reduce(
    (acc, group) => ({
      learners: acc.learners + group.learners,
      teams: acc.teams + group.teams,
      projects: acc.projects + group.projects,
      slotGaps: acc.slotGaps + (group.slots < group.teams ? 1 : 0),
    }),
    { learners: 0, teams: 0, projects: 0, slotGaps: 0 },
  );
  const blockedSteps = batchSteps.filter((step) => step.status === "Blocked").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Cycles" value={batchPlans.length.toString()} helper="Demo plans" />
        <MetricCard label="Learners" value={totals.learners.toString()} helper="Demo count" />
        <MetricCard label="Teams" value={totals.teams.toString()} helper="Groups" />
        <MetricCard label="Projects" value={totals.projects.toString()} helper="Tracked" />
        <MetricCard label="Slot Gaps" value={totals.slotGaps.toString()} helper="Needs review" danger={totals.slotGaps > 0} />
        <MetricCard label="Blocked Steps" value={blockedSteps.toString()} helper="Timeline" danger={blockedSteps > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Batch / Session Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-primary" /> Batch / Session Management
              </CardTitle>
              <CardDescription>
                Plan academic cycles, batch groups, project counts, reviewer capacity, timeline steps, and readiness gaps.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Route className="mr-2 h-4 w-4" /> Rebalance Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Create Cycle Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo academic planning data only. Production use should connect approved department records, permissions, timestamps, and review history.
          </div>

          <BatchPlans />
          <div className="grid gap-4 xl:grid-cols-2">
            <BatchGroups />
            <BatchTimeline />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BatchPlans() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CalendarRange className="h-4 w-4 text-primary" /> Academic Cycles
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {batchPlans.map((plan) => (
          <div key={plan.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(plan.status)}>{plan.status}</Badge>
              <Badge variant="outline">{plan.start} - {plan.end}</Badge>
            </div>
            <p className="mt-2 font-medium">{plan.label}</p>
            <Progress value={plan.completion} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{plan.completion}% complete</p>
            <p className="mt-1 text-muted-foreground">{plan.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatchGroups() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UsersRound className="h-4 w-4 text-primary" /> Batch Groups
      </p>
      <div className="mt-3 space-y-3">
        {batchGroups.map((group) => (
          <div key={group.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(group.status)}>{group.status}</Badge>
              <Badge variant="outline">{group.projects} projects</Badge>
              <Badge variant="secondary">{group.slots} slots</Badge>
            </div>
            <p className="mt-2 font-medium">{group.label}</p>
            <p className="text-xs text-muted-foreground">{group.learners} learners · {group.teams} teams</p>
            <p className="mt-1 text-muted-foreground">{group.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatchTimeline() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardList className="h-4 w-4 text-primary" /> Timeline Steps
      </p>
      <div className="mt-3 space-y-3">
        {batchSteps.map((step) => (
          <div key={step.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(step.status)}>{step.status}</Badge>
              <Badge variant="outline">{step.due}</Badge>
            </div>
            <p className="mt-2 font-medium">{step.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
