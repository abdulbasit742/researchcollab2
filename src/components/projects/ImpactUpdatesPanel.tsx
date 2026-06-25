import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_IMPACT_UPDATES,
  getImpactAudienceClass,
  getImpactAudienceLabel,
  getImpactEvidenceStatusClass,
  getImpactEvidenceStatusLabel,
  getImpactMetricTrendClass,
  getImpactUpdateCounts,
  getImpactUpdateStatusClass,
  getImpactUpdateStatusLabel,
  type CampaignImpactUpdate,
  type ImpactEvidenceItem,
  type ImpactUpdateMetric,
} from "@/config/impactUpdates";
import { BellRing, CheckCircle2, Eye, FileCheck2, Lock, Megaphone, ShieldCheck } from "lucide-react";

type ImpactUpdatesPanelProps = {
  updates?: CampaignImpactUpdate[];
};

export function ImpactUpdatesPanel({ updates = DEMO_IMPACT_UPDATES }: ImpactUpdatesPanelProps) {
  const counts = getImpactUpdateCounts(updates);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Updates" value={counts.updates.toString()} helper="Campaign posts" />
        <MetricCard label="Published" value={counts.published.toString()} helper="Visible updates" />
        <MetricCard label="Needs Evidence" value={counts.needsEvidence.toString()} helper="Before publish" danger={counts.needsEvidence > 0} />
        <MetricCard label="Attached Evidence" value={counts.attachedEvidence.toString()} helper="Proof items" />
        <MetricCard label="Missing Evidence" value={counts.missingEvidence.toString()} helper="Needs upload" danger={counts.missingEvidence > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Impact Updates
              </CardTitle>
              <CardDescription>
                Prepare funder-facing progress posts with metrics, evidence attachments, audience visibility, and review status.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <BellRing className="mr-2 h-4 w-4" /> Notify Funders
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Update
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo impact updates only. Production updates should store verified evidence files, reviewer approvals, audience permissions, notification logs, and sponsor-safe audit history.
          </div>

          <div className="grid gap-4">
            {updates.map((update) => (
              <ImpactUpdateCard key={update.id} update={update} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ImpactUpdateCard({ update }: { update: CampaignImpactUpdate }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getImpactUpdateStatusClass(update.status)}>{getImpactUpdateStatusLabel(update.status)}</Badge>
            <Badge className={getImpactAudienceClass(update.audience)}>{getImpactAudienceLabel(update.audience)}</Badge>
            <Badge variant="outline">{update.timeLabel}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{update.title}</h4>
            <p className="text-xs text-muted-foreground">{update.campaignTitle} · {update.author}</p>
            <p className="mt-2 text-sm text-muted-foreground">{update.summary}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <Eye className="mr-2 h-4 w-4" /> Preview Locked
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MetricList metrics={update.metrics} />
        <EvidenceList evidence={update.evidence} />
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" /> Next Action
        </p>
        <p className="mt-1 text-muted-foreground">{update.nextAction}</p>
      </div>
    </div>
  );
}

function MetricList({ metrics }: { metrics: ImpactUpdateMetric[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4 text-primary" /> Impact Metrics
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-1">
        {metrics.map((metric) => (
          <div key={metric.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getImpactMetricTrendClass(metric.trend)}>{metric.trend}</Badge>
              <p className="font-medium">{metric.label}</p>
            </div>
            <p className="mt-1 text-lg font-semibold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceList({ evidence }: { evidence: ImpactEvidenceItem[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileCheck2 className="h-4 w-4 text-primary" /> Evidence Attachments
      </p>
      <div className="mt-3 space-y-3">
        {evidence.map((item) => (
          <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getImpactEvidenceStatusClass(item.status)}>{getImpactEvidenceStatusLabel(item.status)}</Badge>
              <p className="font-medium">{item.title}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Source: {item.source}</p>
            <p className="mt-1 text-muted-foreground">{item.note}</p>
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
