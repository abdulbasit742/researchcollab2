import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORDER_DELIVERABLES,
  getDeliverablePriorityClass,
  getDeliverableReviewCheckStatusClass,
  getDeliverableReviewCheckStatusLabel,
  getDeliverableStatusClass,
  getDeliverableStatusLabel,
  getDeliverablesTrackerCounts,
  type DeliverableReviewCheck,
  type OrderDeliverable,
} from "@/config/deliverablesTracker";
import { CheckCircle2, ClipboardCheck, FileCheck2, FileText, Lock, RotateCcw, UploadCloud, type LucideIcon } from "lucide-react";

type DeliverablesTrackerPanelProps = {
  deliverables?: OrderDeliverable[];
};

export function DeliverablesTrackerPanel({ deliverables = ORDER_DELIVERABLES }: DeliverablesTrackerPanelProps) {
  const counts = getDeliverablesTrackerCounts(deliverables);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Deliverables" value={counts.total.toString()} helper="Order outputs" />
        <MetricCard label="Submitted" value={counts.submitted.toString()} helper="Ready for buyer" />
        <MetricCard label="Accepted" value={counts.accepted.toString()} helper="Approved outputs" />
        <MetricCard label="Revisions" value={counts.revisionNeeded.toString()} helper="Needs changes" danger={counts.revisionNeeded > 0} />
        <MetricCard label="High Priority" value={counts.highPriority.toString()} helper="Review first" danger={counts.highPriority > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                Deliverables Tracker
              </CardTitle>
              <CardDescription>
                Track order outputs, submitted files, buyer review checks, revision needs, and acceptance readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Deliverable
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Accept Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo tracker only. Real deliverable acceptance should store file versions, buyer approvals, revision decisions, timestamps, and payment-safe audit history.
          </div>

          <div className="grid gap-4">
            {deliverables.map((deliverable) => (
              <DeliverableCard key={deliverable.id} deliverable={deliverable} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeliverableCard({ deliverable }: { deliverable: OrderDeliverable }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getDeliverableStatusClass(deliverable.status)}>{getDeliverableStatusLabel(deliverable.status)}</Badge>
            <Badge className={getDeliverablePriorityClass(deliverable.priority)}>{deliverable.priority} priority</Badge>
            <Badge variant="outline">{deliverable.dueLabel}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{deliverable.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{deliverable.summary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-56">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> File
          </p>
          <p className="mt-1 font-semibold">{deliverable.fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Owner: {deliverable.owner}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ReviewChecks checks={deliverable.reviewChecks} />
        <div className="rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <ClipboardCheck className="h-4 w-4 text-primary" /> Next Action
          </p>
          <p className="mt-1 text-muted-foreground">{deliverable.nextAction}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <RotateCcw className="mr-2 h-4 w-4" /> Request Revision
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Accept Deliverable
        </Button>
      </div>
    </div>
  );
}

function ReviewChecks({ checks }: { checks: DeliverableReviewCheck[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4 text-primary" /> Review Checks
      </p>
      <div className="mt-3 space-y-2">
        {checks.map((check) => (
          <div key={check.id} className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-2 text-sm">
            <Badge className={getDeliverableReviewCheckStatusClass(check.status)}>{getDeliverableReviewCheckStatusLabel(check.status)}</Badge>
            <span className="text-muted-foreground">{check.label}</span>
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
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
