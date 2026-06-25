import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_SUPERVISOR_DASHBOARD,
  getSupervisorActionStatusClass,
  getSupervisorActionStatusLabel,
  getSupervisorDashboardCounts,
  getSupervisorPriorityClass,
  getSupervisorProjectStatusClass,
  getSupervisorProjectStatusLabel,
  getSupervisorReviewStatusClass,
  getSupervisorReviewStatusLabel,
  type SupervisorActionItem,
  type SupervisorAssignedProject,
  type SupervisorDashboardSummary,
  type SupervisorReviewQueueItem,
} from "@/config/supervisorDashboard";
import { ClipboardCheck, GraduationCap, Lock, MessageSquareText, ShieldCheck, UserCheck, UsersRound } from "lucide-react";

type SupervisorDashboardPanelProps = {
  summary?: SupervisorDashboardSummary;
};

export function SupervisorDashboardPanel({ summary = DEMO_SUPERVISOR_DASHBOARD }: SupervisorDashboardPanelProps) {
  const counts = getSupervisorDashboardCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Projects" value={counts.projects.toString()} helper="Assigned" />
        <MetricCard label="Needs Review" value={counts.needsReview.toString()} helper="Project status" danger={counts.needsReview > 0} />
        <MetricCard label="Blocked" value={counts.blockedProjects.toString()} helper="Needs escalation" danger={counts.blockedProjects > 0} />
        <MetricCard label="Pending Reviews" value={counts.pendingReviews.toString()} helper="Queue items" danger={counts.pendingReviews > 0} />
        <MetricCard label="Approved" value={counts.approvedReviews.toString()} helper="Reviews" />
        <MetricCard label="High Priority" value={counts.highPriority.toString()} helper="Attention" danger={counts.highPriority > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.cycleLabel}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30">Supervisor View</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Supervisor Dashboard
              </CardTitle>
              <CardDescription>
                Review assigned projects, pending submissions, defense readiness, blocked items, and supervisor action priorities.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <MessageSquareText className="mr-2 h-4 w-4" /> Add Comment
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Approve Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Supervisor" value={summary.supervisorName} />
            <InfoCard label="Department" value={summary.department} />
            <InfoCard label="Pending reviews" value={counts.pendingReviews.toString()} />
          </div>

          <AssignedProjects projects={summary.assignedProjects} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ReviewQueue reviews={summary.reviewQueue} />
            <SupervisorActions actions={summary.actionItems} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignedProjects({ projects }: { projects: SupervisorAssignedProject[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <UsersRound className="h-4 w-4 text-primary" /> Assigned Projects
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSupervisorProjectStatusClass(project.status)}>{getSupervisorProjectStatusLabel(project.status)}</Badge>
              <Badge className={getSupervisorPriorityClass(project.priority)}>{project.priority} priority</Badge>
              <Badge variant="outline">{project.riskLabel}</Badge>
            </div>
            <p className="mt-2 font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">{project.studentTeam} · {project.department}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <p className="mt-2 text-muted-foreground">{project.summary}</p>
            <p className="mt-1 text-xs text-muted-foreground">Next review: {project.nextReviewLabel}</p>
            <Button className="mt-3 w-full" variant="outline" disabled>
              <UserCheck className="mr-2 h-4 w-4" /> Open Review Locked
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewQueue({ reviews }: { reviews: SupervisorReviewQueueItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Review Queue
      </p>
      <div className="mt-3 space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSupervisorReviewStatusClass(review.status)}>{getSupervisorReviewStatusLabel(review.status)}</Badge>
              <Badge className={getSupervisorPriorityClass(review.priority)}>{review.priority} priority</Badge>
              <Badge variant="outline">{review.dueLabel}</Badge>
            </div>
            <p className="mt-2 font-medium">{review.sectionTitle}</p>
            <p className="text-xs text-muted-foreground">{review.projectTitle} · {review.submittedBy}</p>
            <p className="mt-1 text-muted-foreground">{review.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupervisorActions({ actions }: { actions: SupervisorActionItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Supervisor Action Items
      </p>
      <div className="mt-3 space-y-3">
        {actions.map((action) => (
          <div key={action.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSupervisorActionStatusClass(action.status)}>{getSupervisorActionStatusLabel(action.status)}</Badge>
              <p className="font-medium">{action.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{action.helper}</p>
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
