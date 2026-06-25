import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_SUPERVISOR_REVIEW_QUEUE,
  getSupervisorFeedbackToneClass,
  getSupervisorFeedbackToneLabel,
  getSupervisorQueuePriorityClass,
  getSupervisorQueueStatusClass,
  getSupervisorQueueStatusLabel,
  getSupervisorReviewQueueCounts,
  getSupervisorRubricStatusClass,
  getSupervisorRubricStatusLabel,
  type SupervisorFeedbackNote,
  type SupervisorReviewQueueSummary,
  type SupervisorReviewSubmission,
  type SupervisorRubricCheck,
} from "@/config/supervisorReviewQueue";
import { ClipboardCheck, FileCheck2, Lock, MessageSquareText, PenLine, ShieldCheck, TimerReset } from "lucide-react";

type SupervisorReviewQueuePanelProps = {
  summary?: SupervisorReviewQueueSummary;
};

export function SupervisorReviewQueuePanel({ summary = DEMO_SUPERVISOR_REVIEW_QUEUE }: SupervisorReviewQueuePanelProps) {
  const counts = getSupervisorReviewQueueCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-7">
        <MetricCard label="Submissions" value={counts.submissions.toString()} helper="Total queue" />
        <MetricCard label="Pending" value={counts.pending.toString()} helper="Needs review" danger={counts.pending > 0} />
        <MetricCard label="Changes" value={counts.changesRequested.toString()} helper="Requested" danger={counts.changesRequested > 0} />
        <MetricCard label="Approved" value={counts.approved.toString()} helper="Completed" />
        <MetricCard label="Urgent" value={counts.urgent.toString()} helper="Today" danger={counts.urgent > 0} />
        <MetricCard label="Missing Rubric" value={counts.missingRubric.toString()} helper="Gaps" danger={counts.missingRubric > 0} />
        <MetricCard label="Avg Ready" value={`${counts.averageReadiness}%`} helper="Queue readiness" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.queueLabel}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30">Review Queue</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Supervisor Review Queue
              </CardTitle>
              <CardDescription>
                Detailed review pipeline for submitted sections, rubric checks, supervisor feedback, due dates, and approval readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <MessageSquareText className="mr-2 h-4 w-4" /> Add Feedback
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
            <InfoCard label="Average readiness" value={`${counts.averageReadiness}%`} />
          </div>

          <div className="grid gap-4">
            {summary.submissions.map((submission) => (
              <ReviewSubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewSubmissionCard({ submission }: { submission: SupervisorReviewSubmission }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getSupervisorQueueStatusClass(submission.status)}>{getSupervisorQueueStatusLabel(submission.status)}</Badge>
            <Badge className={getSupervisorQueuePriorityClass(submission.priority)}>{submission.priority} priority</Badge>
            <Badge variant="outline" className="gap-1">
              <TimerReset className="h-3 w-3" /> {submission.dueLabel}
            </Badge>
            <Badge variant="secondary">{submission.submittedLabel}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{submission.sectionTitle}</h4>
            <p className="text-xs text-muted-foreground">{submission.projectTitle} · {submission.submittedBy}</p>
            <p className="mt-2 text-sm text-muted-foreground">{submission.summary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-52">
          <p className="text-xs text-muted-foreground">Submission Readiness</p>
          <p className="mt-1 text-2xl font-bold">{submission.readiness}%</p>
          <Progress value={submission.readiness} className="mt-2 h-2" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RubricChecks rubric={submission.rubric} />
        <FeedbackNotes feedback={submission.feedback} />
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" /> Next Action
        </p>
        <p className="mt-1 text-muted-foreground">{submission.nextAction}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <PenLine className="mr-2 h-4 w-4" /> Request Changes
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Approve Review
        </Button>
      </div>
    </div>
  );
}

function RubricChecks({ rubric }: { rubric: SupervisorRubricCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileCheck2 className="h-4 w-4 text-primary" /> Rubric Checks
      </p>
      <div className="mt-3 space-y-3">
        {rubric.map((check) => (
          <div key={check.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSupervisorRubricStatusClass(check.status)}>{getSupervisorRubricStatusLabel(check.status)}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackNotes({ feedback }: { feedback: SupervisorFeedbackNote[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <MessageSquareText className="h-4 w-4 text-primary" /> Feedback Notes
      </p>
      <div className="mt-3 space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSupervisorFeedbackToneClass(item.tone)}>{getSupervisorFeedbackToneLabel(item.tone)}</Badge>
              <p className="font-medium">{item.author}</p>
            </div>
            <p className="mt-1 text-muted-foreground">{item.note}</p>
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
