import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_DISPUTE_CASE,
  getDisputeCategoryLabel,
  getDisputeCounts,
  getDisputeEvidenceStatusClass,
  getDisputeEvidenceStatusLabel,
  getDisputeSeverityClass,
  getDisputeStatusClass,
  getDisputeStatusLabel,
  type DisputeCase,
  type DisputeEvidenceItem,
  type DisputeTimelineEvent,
} from "@/config/disputePlaceholder";
import { AlertTriangle, CheckCircle2, FileSearch, Gavel, Lock, Scale, ShieldCheck, Timeline, type LucideIcon } from "lucide-react";

type DisputePlaceholderPanelProps = {
  dispute?: DisputeCase;
};

export function DisputePlaceholderPanel({ dispute = DEMO_DISPUTE_CASE }: DisputePlaceholderPanelProps) {
  const counts = getDisputeCounts(dispute);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Evidence" value={counts.evidence.toString()} helper="Case files" />
        <MetricCard label="Attached" value={counts.attachedEvidence.toString()} helper="Ready items" />
        <MetricCard label="Missing" value={counts.missingEvidence.toString()} helper="Needs proof" danger={counts.missingEvidence > 0} />
        <MetricCard label="Checks" value={`${counts.completedChecks}/${dispute.reviewChecks.length}`} helper="Review progress" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getDisputeStatusClass(dispute.status)}>{getDisputeStatusLabel(dispute.status)}</Badge>
                <Badge variant="outline">{getDisputeCategoryLabel(dispute.category)}</Badge>
                <Badge className={getDisputeSeverityClass(dispute.severity)}>{dispute.severity} severity</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Dispute Placeholder
              </CardTitle>
              <CardDescription>{dispute.summary}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Gavel className="mr-2 h-4 w-4" /> Escalate Review
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Resolve Case
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo dispute placeholder only. Real disputes should include verified order records, moderator roles, evidence retention, decision notes, appeal windows, and payment-safe audit history.
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Order" value={dispute.orderTitle} />
            <InfoCard label="Buyer" value={dispute.buyerName} />
            <InfoCard label="Seller" value={dispute.sellerName} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoBlock title="Requested Resolution" icon={ShieldCheck} text={dispute.requestedResolution} />
            <InfoBlock title="Moderator Note" icon={AlertTriangle} text={dispute.moderatorNote} warning />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <EvidenceList evidence={dispute.evidence} />
            <TimelineList events={dispute.timeline} />
          </div>

          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Review Checks
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {dispute.reviewChecks.map((check) => (
                <p key={check.id} className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                  <CheckCircle2 className={`mt-0.5 h-4 w-4 ${check.completed ? "text-primary" : "text-amber-500"}`} />
                  {check.label}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EvidenceList({ evidence }: { evidence: DisputeEvidenceItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileSearch className="h-4 w-4 text-primary" /> Evidence
      </p>
      <div className="mt-3 space-y-3">
        {evidence.map((item) => (
          <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDisputeEvidenceStatusClass(item.status)}>{getDisputeEvidenceStatusLabel(item.status)}</Badge>
              <p className="font-medium">{item.title}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Owner: {item.owner}</p>
            <p className="mt-2 text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineList({ events }: { events: DisputeTimelineEvent[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Timeline className="h-4 w-4 text-primary" /> Case Timeline
      </p>
      <div className="mt-3 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{event.actor}</Badge>
              <p className="text-xs text-muted-foreground">{event.timeLabel}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{event.event}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ title, icon: Icon, text, warning = false }: { title: string; icon: LucideIcon; text: string; warning?: boolean }) {
  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-500" : "text-primary"}`} /> {title}
      </p>
      <p className="mt-1 text-muted-foreground">{text}</p>
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
