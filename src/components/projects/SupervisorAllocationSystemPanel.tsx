import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRightLeft, BrainCircuit, Lock, Route, ShieldCheck, UsersRound } from "lucide-react";

const supervisors = [
  { id: "sup-1", name: "Dr. Supervisor Preview", area: "AI Systems", status: "Needs Review", assigned: 12, capacity: 10, pending: 5, note: "Over suggested load; two AI teams should be reassigned." },
  { id: "sup-2", name: "Dr. Methods Lead", area: "Research Methods", status: "Balanced", assigned: 8, capacity: 10, pending: 2, note: "Can accept literature and methodology-heavy teams." },
  { id: "sup-3", name: "Dr. Lab Coordinator", area: "Hardware Validation", status: "Overloaded", assigned: 16, capacity: 10, pending: 7, note: "Validation projects need department-level rebalance." },
  { id: "sup-4", name: "Dr. Data Systems", area: "Data Platforms", status: "Available", assigned: 5, capacity: 10, pending: 1, note: "Good match for data dashboard and analytics teams." },
];

const teamMatches = [
  { id: "match-1", team: "Smart Lab Assistant for FYP Teams", current: "Dr. Supervisor Preview", recommended: "Dr. Data Systems", fit: 86, status: "Suggested", reason: "AI workflow plus dashboard evidence makes a better data-systems pairing." },
  { id: "match-2", team: "Prototype Validation Kit", current: "Dr. Lab Coordinator", recommended: "Dr. Methods Lead", fit: 72, status: "Needs Review", reason: "Validation plan needs methods review before lab slot approval." },
  { id: "match-3", team: "Defense Readiness Pack", current: "Dr. Supervisor Preview", recommended: "No change", fit: 91, status: "Keep", reason: "Project is near viva readiness and continuity is preferred." },
];

const allocationChecks = [
  { label: "Capacity balance", status: "Needs Review", helper: "Two supervisors are above suggested team load." },
  { label: "Domain fit", status: "Ready", helper: "Recommended matches include expertise tags." },
  { label: "Pending review load", status: "Blocked", helper: "High pending queue must be reduced before new allocation." },
  { label: "Student visibility", status: "Missing", helper: "Production allocation changes need notification and audit trail." },
  { label: "Demo safety", status: "Ready", helper: "No real allocation is changed from this preview." },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Balanced" || status === "Available" || status === "Keep") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Suggested") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Overloaded" || status === "Blocked" || status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function SupervisorAllocationSystemPanel() {
  const totalAssigned = supervisors.reduce((total, supervisor) => total + supervisor.assigned, 0);
  const totalCapacity = supervisors.reduce((total, supervisor) => total + supervisor.capacity, 0);
  const overloaded = supervisors.filter((supervisor) => supervisor.assigned > supervisor.capacity).length;
  const suggested = teamMatches.filter((match) => match.status === "Suggested" || match.status === "Needs Review").length;
  const pending = supervisors.reduce((total, supervisor) => total + supervisor.pending, 0);
  const loadPercent = Math.round((totalAssigned / totalCapacity) * 100);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Assigned" value={totalAssigned.toString()} helper="Teams" />
        <MetricCard label="Capacity" value={totalCapacity.toString()} helper="Suggested slots" />
        <MetricCard label="Load" value={`${loadPercent}%`} helper="Overall" danger={loadPercent > 100} />
        <MetricCard label="Overloaded" value={overloaded.toString()} helper="Supervisors" danger={overloaded > 0} />
        <MetricCard label="Suggestions" value={suggested.toString()} helper="Rebalance" danger={suggested > 0} />
        <MetricCard label="Pending" value={pending.toString()} helper="Reviews" danger={pending > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Allocation Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Supervisor Allocation System
              </CardTitle>
              <CardDescription>
                Preview supervisor capacity, team fit, recommended reassignments, review load, and allocation safety checks.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Route className="mr-2 h-4 w-4" /> Rebalance Preview
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Apply Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall allocation load</span>
              <span>{loadPercent}%</span>
            </div>
            <Progress value={Math.min(loadPercent, 100)} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo allocation preview only. Production allocation should verify official roles, supervisor consent, student visibility, department approval, timestamps, and audit history.
          </div>

          <SupervisorLoadCards />
          <div className="grid gap-4 xl:grid-cols-2">
            <TeamMatchSuggestions />
            <AllocationChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisorLoadCards() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UsersRound className="h-4 w-4 text-primary" /> Supervisor Capacity
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {supervisors.map((supervisor) => {
          const percent = Math.round((supervisor.assigned / supervisor.capacity) * 100);
          return (
            <div key={supervisor.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusClass(supervisor.status)}>{supervisor.status}</Badge>
                <Badge variant="outline">{supervisor.area}</Badge>
                <Badge variant="secondary">{supervisor.pending} pending</Badge>
              </div>
              <p className="mt-2 font-medium">{supervisor.name}</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{supervisor.assigned}/{supervisor.capacity} teams</span>
                  <span>{percent}%</span>
                </div>
                <Progress value={Math.min(percent, 100)} className="h-2" />
              </div>
              <p className="mt-2 text-muted-foreground">{supervisor.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamMatchSuggestions() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <BrainCircuit className="h-4 w-4 text-primary" /> Team Match Suggestions
      </p>
      <div className="mt-3 space-y-3">
        {teamMatches.map((match) => (
          <div key={match.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(match.status)}>{match.status}</Badge>
              <Badge variant="outline">Fit {match.fit}%</Badge>
            </div>
            <p className="mt-2 font-medium">{match.team}</p>
            <p className="text-xs text-muted-foreground">Current: {match.current} → Recommended: {match.recommended}</p>
            <Progress value={match.fit} className="mt-3 h-2" />
            <p className="mt-2 text-muted-foreground">{match.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllocationChecks() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Allocation Checks
      </p>
      <div className="mt-3 space-y-3">
        {allocationChecks.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
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
