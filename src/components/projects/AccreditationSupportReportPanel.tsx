import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Archive, ClipboardCheck, FileText, Lock, ShieldCheck, TableProperties, Download } from "lucide-react";

const reportSections = [
  { id: "section-outcomes", title: "Outcome Attainment Summary", status: "Ready", coverage: 78, note: "Outcome Mapping provides PLO attainment preview and evidence gaps." },
  { id: "section-rubric", title: "Evaluation Rubric Summary", status: "Needs Review", coverage: 75, note: "Rubric preview exists but final evaluator notes are not locked." },
  { id: "section-evidence", title: "Evidence Coverage", status: "Needs Review", coverage: 68, note: "Report sections and prototype screenshots are linked; validation test log is missing." },
  { id: "section-supervision", title: "Supervision and Review Trail", status: "Ready", coverage: 82, note: "Supervisor dashboard and review queue provide demo supervision history." },
  { id: "section-audit", title: "Audit and Approval History", status: "Missing", coverage: 35, note: "Production timestamps, approver identity, and export audit logs are not connected yet." },
];

const exportChecklist = [
  { label: "Outcome map included", status: "Ready", helper: "Program outcome preview is available." },
  { label: "Rubric summary included", status: "Needs Review", helper: "Final rubric scores are still locked." },
  { label: "Evidence index included", status: "Needs Review", helper: "Some evidence links need supervisor confirmation." },
  { label: "Student privacy review", status: "Missing", helper: "Production privacy redaction rules are not connected." },
  { label: "Export format", status: "Locked", helper: "PDF/CSV export is placeholder-only in demo mode." },
];

const evidenceCategories = [
  { label: "Reports", count: 8, status: "Ready" },
  { label: "Rubrics", count: 6, status: "Needs Review" },
  { label: "Viva records", count: 4, status: "Ready" },
  { label: "Validation logs", count: 2, status: "Missing" },
  { label: "Approval trail", count: 0, status: "Missing" },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Missing") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function AccreditationSupportReportPanel() {
  const readySections = reportSections.filter((section) => section.status === "Ready").length;
  const needsReview = reportSections.filter((section) => section.status === "Needs Review").length;
  const missing = [...reportSections, ...exportChecklist].filter((item) => item.status === "Missing").length;
  const evidenceTotal = evidenceCategories.reduce((total, category) => total + category.count, 0);
  const averageCoverage = Math.round(reportSections.reduce((total, section) => total + section.coverage, 0) / reportSections.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Sections" value={reportSections.length.toString()} helper="Report blocks" />
        <MetricCard label="Ready" value={readySections.toString()} helper="Sections" />
        <MetricCard label="Review" value={needsReview.toString()} helper="Sections" danger={needsReview > 0} />
        <MetricCard label="Missing" value={missing.toString()} helper="Checks" danger={missing > 0} />
        <MetricCard label="Evidence" value={evidenceTotal.toString()} helper="Items" />
        <MetricCard label="Coverage" value={`${averageCoverage}%`} helper="Report score" danger={averageCoverage < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Accreditation Report Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" /> Accreditation-support Report Placeholder
              </CardTitle>
              <CardDescription>
                Collect outcome mapping, rubric summaries, evidence coverage, supervision trail, and export readiness into one demo report.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" /> Export Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Report readiness</span>
              <span>{averageCoverage}%</span>
            </div>
            <Progress value={averageCoverage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo accreditation-support report only. Production export should verify official templates, privacy redaction, approved outcomes, evaluator permissions, timestamps, and audit history.
          </div>

          <ReportSections />
          <div className="grid gap-4 xl:grid-cols-2">
            <EvidenceCategories />
            <ExportChecklist />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSections() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4 text-primary" /> Report Sections
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {reportSections.map((section) => (
          <div key={section.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(section.status)}>{section.status}</Badge>
              <Badge variant="outline">Coverage {section.coverage}%</Badge>
            </div>
            <p className="mt-2 font-medium">{section.title}</p>
            <Progress value={section.coverage} className="mt-3 h-2" />
            <p className="mt-2 text-muted-foreground">{section.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceCategories() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <TableProperties className="h-4 w-4 text-primary" /> Evidence Index
      </p>
      <div className="mt-3 space-y-3">
        {evidenceCategories.map((category) => (
          <div key={category.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(category.status)}>{category.status}</Badge>
              <Badge variant="outline">{category.count} items</Badge>
            </div>
            <p className="mt-2 font-medium">{category.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportChecklist() {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Export Checklist
      </p>
      <div className="mt-3 space-y-3">
        {exportChecklist.map((check) => (
          <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClass(check.status)}>{check.status}</Badge>
              <p className="font-medium">{check.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{check.helper}</p>
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
