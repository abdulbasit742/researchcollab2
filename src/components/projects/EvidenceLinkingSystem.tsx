import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  EVIDENCE_LINKS,
  getEvidenceLinkCounts,
  getEvidenceLinkReadiness,
  getEvidenceStatusClass,
  getEvidenceStatusLabel,
  getEvidenceTypeLabel,
  type EvidenceLink,
} from "@/config/evidenceLinks";
import { AlertTriangle, FileCheck2, Link2, Paperclip, PlusCircle, ShieldCheck, UploadCloud } from "lucide-react";

type EvidenceLinkingSystemProps = {
  links?: EvidenceLink[];
};

export function EvidenceLinkingSystem({ links = EVIDENCE_LINKS }: EvidenceLinkingSystemProps) {
  const readiness = getEvidenceLinkReadiness(links);
  const counts = getEvidenceLinkCounts(links);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Evidence Readiness" value={`${readiness}%`} helper="Linked + approved" danger={readiness < 70} />
        <MetricCard label="Approved" value={counts.approved.toString()} helper="Review accepted" />
        <MetricCard label="Needs Review" value={counts.reviewNeeded.toString()} helper="Check evidence" danger={counts.reviewNeeded > 0} />
        <MetricCard label="Missing" value={counts.missing.toString()} helper="Upload required" danger={counts.missing > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Evidence Linking System
              </CardTitle>
              <CardDescription>
                Link report claims, methodology requirements, proposal risks, and literature gaps to supporting evidence.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Evidence
              </Button>
              <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Link Evidence
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Evidence readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only demo evidence mapping. Real evidence links should connect to uploaded files, storage paths, report sections, review approvals, and audit history.
          </div>

          <div className="grid gap-4">
            {links.map((link) => (
              <EvidenceLinkCard key={link.id} link={link} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EvidenceLinkCard({ link }: { link: EvidenceLink }) {
  const needsAttention = link.status === "missing" || link.status === "review_needed";

  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{link.areaLabel}</Badge>
            <Badge variant="secondary">{getEvidenceTypeLabel(link.evidenceType)}</Badge>
            <Badge className={getEvidenceStatusClass(link.status)}>{getEvidenceStatusLabel(link.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{link.sectionTitle}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{link.claimOrRequirement}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-56">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" /> Evidence
          </p>
          <p className="mt-1 font-medium">{link.evidenceLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">Owner: {link.owner}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          {needsAttention ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
          Next Action
        </p>
        <p className="mt-1 text-muted-foreground">{link.nextAction}</p>
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
