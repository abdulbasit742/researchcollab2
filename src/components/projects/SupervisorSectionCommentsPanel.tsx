import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SUPERVISOR_SECTION_COMMENTS,
  getHighPrioritySupervisorCommentCount,
  getOpenSupervisorCommentCount,
  getSupervisorCommentPriorityClass,
  getSupervisorCommentStatusClass,
  getSupervisorCommentStatusLabel,
  type SupervisorSectionComment,
} from "@/config/supervisorSectionComments";
import { AlertTriangle, CheckCircle2, MessageSquareText, PencilLine, UserRoundCheck } from "lucide-react";

type SupervisorSectionCommentsPanelProps = {
  comments?: SupervisorSectionComment[];
};

export function SupervisorSectionCommentsPanel({ comments = SUPERVISOR_SECTION_COMMENTS }: SupervisorSectionCommentsPanelProps) {
  const openCount = getOpenSupervisorCommentCount(comments);
  const highPriorityCount = getHighPrioritySupervisorCommentCount(comments);
  const resolvedCount = comments.filter((comment) => comment.status === "resolved").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Comments" value={comments.length.toString()} helper="Supervisor notes" />
        <MetricCard label="Open" value={openCount.toString()} helper="Needs response" danger={openCount > 0} />
        <MetricCard label="High Priority" value={highPriorityCount.toString()} helper="Urgent section issues" danger={highPriorityCount > 0} />
        <MetricCard label="Resolved" value={resolvedCount.toString()} helper="Closed feedback" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                Supervisor Comments on Sections
              </CardTitle>
              <CardDescription>
                Read-only feedback tracker for final report, proposal, and methodology sections.
              </CardDescription>
            </div>
            <Button variant="outline" disabled>
              <PencilLine className="mr-2 h-4 w-4" /> Add Comment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This panel is currently read-only demo feedback. Real comments should connect to authenticated supervisors, section records, notification logs, and audit history.
          </div>

          <div className="grid gap-4">
            {comments.map((comment) => (
              <SupervisorCommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisorCommentCard({ comment }: { comment: SupervisorSectionComment }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{comment.areaLabel}</Badge>
            <Badge className={getSupervisorCommentStatusClass(comment.status)}>{getSupervisorCommentStatusLabel(comment.status)}</Badge>
            <Badge className={getSupervisorCommentPriorityClass(comment.priority)}>{comment.priority} priority</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{comment.sectionTitle}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{comment.comment}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-48">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRoundCheck className="h-3 w-3" /> Supervisor
          </p>
          <p className="mt-1 font-semibold">{comment.supervisorName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{comment.createdLabel}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          {comment.status === "resolved" ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
          Required Action
        </p>
        <p className="mt-1 text-muted-foreground">{comment.requiredAction}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-red-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
