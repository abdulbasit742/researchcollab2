import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FYP_REPORT_SECTIONS,
  getFYPReportCompletionScore,
  getFYPReportReadinessLabel,
  getFYPReportStatusClass,
  getFYPReportStatusLabel,
  type FYPReportSection,
} from "@/config/fypReport";
import { BookOpenText, CheckCircle2, Download, FileText, Lightbulb, ListChecks, PencilLine } from "lucide-react";

type FYPFinalReportBuilderProps = {
  sections?: FYPReportSection[];
};

export function FYPFinalReportBuilder({ sections = FYP_REPORT_SECTIONS }: FYPFinalReportBuilderProps) {
  const completionScore = getFYPReportCompletionScore(sections);
  const complete = sections.filter((section) => section.status === "complete").length;
  const review = sections.filter((section) => section.status === "review").length;
  const draft = sections.filter((section) => section.status === "draft").length;
  const notStarted = sections.filter((section) => section.status === "not_started").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Report Readiness" value={`${completionScore}%`} helper={getFYPReportReadinessLabel(completionScore)} />
        <MetricCard label="Complete" value={complete.toString()} helper="Finished sections" />
        <MetricCard label="In Review" value={review.toString()} helper="Needs feedback" />
        <MetricCard label="Draft" value={draft.toString()} helper="In progress" danger={draft > 0} />
        <MetricCard label="Not Started" value={notStarted.toString()} helper="Needs drafting" danger={notStarted > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-primary" />
                FYP Final Report Builder
              </CardTitle>
              <CardDescription>
                Build the final FYP report section-by-section with required evidence, guidance, review status, and export readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled title="DOCX export will be enabled after database-backed report content is connected.">
                <Download className="mr-2 h-4 w-4" /> Export DOCX
              </Button>
              <Button disabled title="PDF export will be enabled after report content and citation checks are connected.">
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Report completion</span>
              <span>{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This builder is currently a read-only planning interface. Editing, storage, citation checks, and document export should connect to project report records in later features.
          </div>

          {sections.map((section, index) => (
            <ReportSectionCard key={section.id} section={section} number={index + 1} />
          ))}
        </CardContent>
      </Card>
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

function ReportSectionCard({ section, number }: { section: FYPReportSection; number: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Section {number}</Badge>
            <Badge className={getFYPReportStatusClass(section.status)}>{getFYPReportStatusLabel(section.status)}</Badge>
            {section.required ? <Badge variant="secondary">Required</Badge> : <Badge variant="outline">Optional</Badge>}
            <Badge variant="outline">{section.wordTarget}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{section.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled title="Section editing will be connected after report content records are added.">
          <PencilLine className="mr-2 h-4 w-4" /> Edit Section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Evidence Needed" icon={ListChecks} items={section.evidenceNeeded} />
        <Checklist title="Writing Guidance" icon={Lightbulb} items={section.guidance} />
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: typeof FileText; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
