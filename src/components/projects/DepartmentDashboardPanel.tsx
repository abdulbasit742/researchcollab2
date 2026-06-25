import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_DEPARTMENT_DASHBOARD,
  getDepartmentBatchStatusClass,
  getDepartmentBatchStatusLabel,
  getDepartmentComplianceStatusClass,
  getDepartmentComplianceStatusLabel,
  getDepartmentDashboardCounts,
  getDepartmentLoadStatusClass,
  getDepartmentLoadStatusLabel,
  getDepartmentProjectHealthClass,
  getDepartmentProjectHealthLabel,
  type DepartmentBatchMetric,
  type DepartmentComplianceCheck,
  type DepartmentDashboardSummary,
  type DepartmentProjectSignal,
  type DepartmentSupervisorLoad,
} from "@/config/departmentDashboard";
import { Building2, ClipboardCheck, Gauge, Lock, Route, ShieldCheck, UsersRound } from "lucide-react";

type DepartmentDashboardPanelProps = {
  summary?: DepartmentDashboardSummary;
};

export function DepartmentDashboardPanel({ summary = DEMO_DEPARTMENT_DASHBOARD }: DepartmentDashboardPanelProps) {
  const counts = getDepartmentDashboardCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5 xl:grid-cols-9">
        <MetricCard label="Batches" value={counts.batches.toString()} helper="Active tracks" />
        <MetricCard label="Students" value={counts.students.toString()} helper="Demo count" />
        <MetricCard label="Teams" value={counts.teams.toString()} helper="FYP teams" />
        <MetricCard label="Projects" value={counts.projects.toString()} helper="Tracked" />
        <MetricCard label="Avg Complete" value={`${counts.averageCompletion}%`} helper="Batch progress" />
        <MetricCard label="Pending Reviews" value={counts.pendingReviews.toString()} helper="Supervisor queue" danger={counts.pendingReviews > 0} />
        <MetricCard label="Overloaded" value={counts.overloadedSupervisors.toString()} helper="Supervisors" danger={counts.overloadedSupervisors > 0} />
        <MetricCard label="Blocked" value={counts.blockedProjects.toString()} helper="Projects" danger={counts.blockedProjects > 0} />
        <MetricCard label="Missing Checks" value={counts.missingCompliance.toString()} helper="Compliance" danger={counts.missingCompliance > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.cycleLabel}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30">Department View</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Department Dashboard
              </CardTitle>
              <CardDescription>
                Monitor batches, supervisor load, project health, review bottlenecks, and academic operations readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Route className="mr-2 h-4 w-4" /> Rebalance Load
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Admin Action Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Department" value={summary.departmentName} />
            <InfoCard label="Coordinator" value={summary.coordinatorName} />
            <InfoCard label="Review bottlenecks" value={counts.pendingReviews.toString()} />
          </div>

          <BatchMetrics batches={summary.batches} />

          <div className="grid gap-4 xl:grid-cols-2">
            <SupervisorLoads loads={summary.supervisorLoads} />
            <ComplianceChecks checks={summary.complianceChecks} />
          </div>

          <ProjectSignals signals={summary.projectSignals} />
        </CardContent>
      </Card>
    </div>
  );
}

function BatchMetrics({ batches }: { batches: DepartmentBatchMetric[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UsersRound className="h-4 w-4 text-primary" /> Batch Metrics
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {batches.map((batch) => (
          <div key={batch.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDepartmentBatchStatusClass(batch.status)}>{getDepartmentBatchStatusLabel(batch.status)}</Badge>
              <Badge variant="outline">{batch.projects} projects</Badge>
            </div>
            <p className="mt-2 font-medium">{batch.label}</p>
            <p className="text-xs text-muted-foreground">{batch.students} students · {batch.teams} teams</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Completion</span>
                <span>{batch.completion}%</span>
              </div>
              <Progress value={batch.completion} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{batch.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupervisorLoads({ loads }: { loads: DepartmentSupervisorLoad[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Gauge className="h-4 w-4 text-primary" /> Supervisor Load
      </p>
      <div className="mt-3 space-y-3">
        {loads.map((load) => (
          <div key={load.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDepartmentLoadStatusClass(load.status)}>{getDepartmentLoadStatusLabel(load.status)}</Badge>
              <Badge variant="outline">{load.assignedProjects} projects</Badge>
              <Badge variant="secondary">{load.pendingReviews} reviews</Badge>
            </div>
            <p className="mt-2 font-medium">{load.name}</p>
            <p className="text-xs text-muted-foreground">Blocked projects: {load.blockedProjects}</p>
            <p className="mt-1 text-muted-foreground">{load.nextAction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceChecks({ checks }: { checks: DepartmentComplianceCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Department Checks
      </p>
      <div className="mt-3 space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDepartmentComplianceStatusClass(check.status)}>{getDepartmentComplianceStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectSignals({ signals }: { signals: DepartmentProjectSignal[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Project Health Signals
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {signals.map((signal) => (
          <div key={signal.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDepartmentProjectHealthClass(signal.health)}>{getDepartmentProjectHealthLabel(signal.health)}</Badge>
              <Badge variant="outline">{signal.progress}%</Badge>
            </div>
            <p className="mt-2 font-medium">{signal.title}</p>
            <p className="text-xs text-muted-foreground">{signal.owner}</p>
            <Progress value={signal.progress} className="mt-3 h-2" />
            <p className="mt-2 text-muted-foreground">{signal.riskReason}</p>
            <p className="mt-1 text-xs text-muted-foreground">Department action: {signal.departmentAction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
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
