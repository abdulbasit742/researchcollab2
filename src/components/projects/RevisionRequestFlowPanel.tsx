import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_REVISION_REQUEST_FLOW,
  getRevisionChecklistStatusClass,
  getRevisionChecklistStatusLabel,
  getRevisionRequestCounts,
  getRevisionRequestPriorityClass,
  getRevisionRequestScopeClass,
  getRevisionRequestScopeLabel,
  getRevisionRequestStatusClass,
  getRevisionRequestStatusLabel,
  type RevisionRequestChecklistItem,
  type RevisionRequestFlow,
  type RevisionRequestReason,
} from "@/config/revisionRequestFlow";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Lock, MessageSquareReply, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";

type RevisionRequestFlowPanelProps = {
  flow?: RevisionRequestFlow;
};

export function RevisionRequestFlowPanel({ flow = DEMO_REVISION_REQUEST_FLOW }: RevisionRequestFlowPanelProps) {
  const counts = getRevisionRequestCounts(flow);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Reasons" value={counts.reasons.toString()} helper="Buyer notes" />
        <MetricCard label="Included" value={counts.included.toString()} helper="Within scope" />
        <MetricCard label="Extra" value={counts.extra.toString()} helper="Needs separation" danger={counts.extra > 0} />
        <MetricCard label="Missing Checks" value={counts.missingChecks.toString()} helper="Before revision" danger={counts.missingChecks > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getRevisionRequestStatusClass(flow.status)}>{getRevisionRequestStatusLabel(flow.status)}</Badge>
                <Badge variant="outline">{flow.dueLabel}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Revision Request Flow
              </CardTitle>
              <CardDescription>{flow.requestSummary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <MessageSquareReply className="mr-2 h-4 w-4" /> Submit Request
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Approve Revision
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo revision flow only. Real revision handling should enforce package scope, buyer-seller timestamps, file versions, acceptance rules, and dispute-safe audit history.
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Order" value={flow.orderTitle} />
            <InfoCard label="Deliverable" value={flow.deliverableTitle} />
            <InfoCard label="Buyer" value={flow.buyerName} />
            <InfoCard label="Seller" value={flow.sellerName} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReasonList reasons={flow.reasons} />
            <Checklist checklist={flow.checklist} />
          </div>

          <div className="rounded-xl border bg-background p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getRevisionRequestStatusClass(flow.sellerResponse.status)}>
                {getRevisionRequestStatusLabel(flow.sellerResponse.status)}
              </Badge>
              <Badge variant="secondary">{flow.sellerResponse.responseLabel}</Badge>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Seller Response</h4>
              <p className="mt-1 text-sm text-muted-foreground">{flow.sellerResponse.responseSummary}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" /> Next Step
              </p>
              <p className="mt-1 text-muted-foreground">{flow.sellerResponse.nextStep}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <AlertTriangle className="mr-2 h-4 w-4" /> Reject Scope
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Accept Scope
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReasonList({ reasons }: { reasons: RevisionRequestReason[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <MessageSquareReply className="h-4 w-4 text-primary" /> Revision Reasons
      </p>
      <div className="mt-3 space-y-3">
        {reasons.map((reason) => (
          <div key={reason.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getRevisionRequestScopeClass(reason.scope)}>{getRevisionRequestScopeLabel(reason.scope)}</Badge>
              <Badge className={getRevisionRequestPriorityClass(reason.priority)}>{reason.priority} priority</Badge>
            </div>
            <p className="mt-2 font-medium">{reason.label}</p>
            <p className="mt-1 text-muted-foreground">{reason.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Checklist({ checklist }: { checklist: RevisionRequestChecklistItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Revision Checklist
      </p>
      <div className="mt-3 space-y-3">
        {checklist.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
            <Badge className={getRevisionChecklistStatusClass(item.status)}>{getRevisionChecklistStatusLabel(item.status)}</Badge>
            <span className="text-muted-foreground">{item.label}</span>
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
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
