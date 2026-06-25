import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CITATION_WARNINGS,
  getCitationReadinessScore,
  getCitationWarningSeverityClass,
  getCitationWarningTypeLabel,
  getHighRiskCitationWarningCount,
  getOpenCitationWarningCount,
  type CitationWarning,
} from "@/config/citationWarnings";
import { AlertTriangle, BookOpenCheck, FileSearch, ScanSearch, ShieldCheck, Wrench } from "lucide-react";

type CitationWarningSystemProps = {
  warnings?: CitationWarning[];
};

export function CitationWarningSystem({ warnings = CITATION_WARNINGS }: CitationWarningSystemProps) {
  const readiness = getCitationReadinessScore(warnings);
  const openCount = getOpenCitationWarningCount(warnings);
  const highRiskCount = getHighRiskCitationWarningCount(warnings);
  const formatIssues = warnings.filter((warning) => warning.warningType === "format_issue").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Citation Readiness" value={`${readiness}%`} helper="Source safety score" danger={readiness < 70} />
        <MetricCard label="Open Warnings" value={openCount.toString()} helper="Needs review" danger={openCount > 0} />
        <MetricCard label="High Risk" value={highRiskCount.toString()} helper="Critical/high" danger={highRiskCount > 0} />
        <MetricCard label="Format Issues" value={formatIssues.toString()} helper="Style consistency" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-primary" />
                Citation Warning System
              </CardTitle>
              <CardDescription>
                Review missing citations, weak sources, outdated references, formatting problems, and unsupported claims.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <ScanSearch className="mr-2 h-4 w-4" /> Scan Citations
              </Button>
              <Button disabled>
                <Wrench className="mr-2 h-4 w-4" /> Fix Selected
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Citation readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only demo checking. Real citation scans should connect to report/proposal text, citation records, reference files, and supervisor review logs.
          </div>

          <div className="grid gap-4">
            {warnings.map((warning) => (
              <CitationWarningCard key={warning.id} warning={warning} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CitationWarningCard({ warning }: { warning: CitationWarning }) {
  const Icon = warning.severity === "critical" || warning.severity === "high" ? AlertTriangle : FileSearch;

  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{warning.areaLabel}</Badge>
            <Badge variant="secondary">{getCitationWarningTypeLabel(warning.warningType)}</Badge>
            <Badge className={getCitationWarningSeverityClass(warning.severity)}>{warning.severity}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{warning.sectionTitle}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{warning.issue}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-56">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-3 w-3" /> Claim / Reference
          </p>
          <p className="mt-1 text-sm font-medium">{warning.claimOrReference}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" /> Recommended Action
        </p>
        <p className="mt-1 text-muted-foreground">{warning.recommendedAction}</p>
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
