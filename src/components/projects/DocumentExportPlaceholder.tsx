import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DOCUMENT_EXPORT_TARGETS,
  getExportFormatLabel,
  getExportReadinessScore,
  getExportStatusClass,
  getExportStatusCounts,
  getExportStatusLabel,
  type ExportTarget,
} from "@/config/documentExports";
import { AlertTriangle, Download, FileArchive, FileText, FileType2, Lock, PackageCheck } from "lucide-react";

type DocumentExportPlaceholderProps = {
  targets?: ExportTarget[];
};

export function DocumentExportPlaceholder({ targets = DOCUMENT_EXPORT_TARGETS }: DocumentExportPlaceholderProps) {
  const readiness = getExportReadinessScore(targets);
  const counts = getExportStatusCounts(targets);
  const pdfCount = targets.filter((target) => target.format === "pdf").length;
  const docxCount = targets.filter((target) => target.format === "docx").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Export Readiness" value={`${readiness}%`} helper="All export targets" danger={readiness < 70} />
        <MetricCard label="Ready" value={counts.ready.toString()} helper="Can export later" />
        <MetricCard label="Blocked" value={counts.blocked.toString()} helper="Needs fixes" danger={counts.blocked > 0} />
        <MetricCard label="PDF / DOCX" value={`${pdfCount}/${docxCount}`} helper="Target formats" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-primary" />
                PDF/DOCX Export Placeholder
              </CardTitle>
              <CardDescription>
                Prepare safe export targets for final report, proposal, methodology, and evidence bundle documents.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
              <Button disabled>
                <FileType2 className="mr-2 h-4 w-4" /> Export DOCX
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Export readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a placeholder only. Real PDF/DOCX generation should connect to saved section content, citation checks, evidence links, file storage, and export audit logs.
          </div>

          <div className="grid gap-4">
            {targets.map((target) => (
              <ExportTargetCard key={target.id} target={target} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportTargetCard({ target }: { target: ExportTarget }) {
  const blocked = target.status === "blocked";
  const Icon = target.format === "pdf" ? FileText : FileType2;

  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Icon className="h-3 w-3" /> {getExportFormatLabel(target.format)}
            </Badge>
            <Badge className={getExportStatusClass(target.status)}>{getExportStatusLabel(target.status)}</Badge>
            <Badge variant="secondary">{target.fileName}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{target.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{target.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          {blocked ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
          {blocked ? "Blocked" : "Export Later"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <PackageCheck className="h-4 w-4 text-primary" /> Included Sections
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {target.includedSections.map((section) => (
              <Badge key={section} variant="outline" className="text-xs">
                {section}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Blockers / Checks
          </p>
          <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {target.blockers.length > 0 ? (
              target.blockers.map((blocker) => <p key={blocker}>• {blocker}</p>)
            ) : (
              <p>No current blockers. Keep content synced before production export.</p>
            )}
          </div>
        </div>
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
