import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  RESEARCH_PROPOSAL_SECTIONS,
  getResearchProposalCategoryLabel,
  getResearchProposalCompletionScore,
  getResearchProposalReadinessLabel,
  getResearchProposalStatusClass,
  getResearchProposalStatusLabel,
  type ResearchProposalSection,
} from "@/config/researchProposal";
import { BookMarked, CheckCircle2, Download, FileText, Lightbulb, ListChecks, Microscope, PencilLine, type LucideIcon } from "lucide-react";

type ResearchProposalBuilderProps = {
  sections?: ResearchProposalSection[];
};

export function ResearchProposalBuilder({ sections = RESEARCH_PROPOSAL_SECTIONS }: ResearchProposalBuilderProps) {
  const completionScore = getResearchProposalCompletionScore(sections);
  const complete = sections.filter((section) => section.status === "complete").length;
  const draft = sections.filter((section) => section.status === "draft").length;
  const notStarted = sections.filter((section) => section.status === "not_started").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Proposal Readiness" value={`${completionScore}%`} helper={getResearchProposalReadinessLabel(completionScore)} />
        <MetricCard label="Complete" value={complete.toString()} helper="Finished sections" />
        <MetricCard label="Draft" value={draft.toString()} helper="Needs polishing" />
        <MetricCard label="Not Started" value={notStarted.toString()} helper="Needs planning" danger={notStarted > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-primary" />
                Research Proposal Builder
              </CardTitle>
              <CardDescription>
                Structure a supervisor-review-ready proposal with problem, gap, questions, method, timeline, and references.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <BookMarked className="mr-2 h-4 w-4" /> Export DOCX
              </Button>
              <Button disabled>
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Proposal completion</span>
              <span>{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This proposal builder is currently read-only planning UI. Editing, comments, checks, and exports can connect to proposal records in later features.
          </div>

          {sections.map((section, index) => (
            <ProposalSectionCard key={section.id} section={section} number={index + 1} />
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

function ProposalSectionCard({ section, number }: { section: ResearchProposalSection; number: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Section {number}</Badge>
            <Badge className={getResearchProposalStatusClass(section.status)}>{getResearchProposalStatusLabel(section.status)}</Badge>
            <Badge variant="secondary">{getResearchProposalCategoryLabel(section.category)}</Badge>
            {section.required ? <Badge variant="secondary">Required</Badge> : <Badge variant="outline">Optional</Badge>}
            <Badge variant="outline">{section.wordTarget}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{section.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <PencilLine className="mr-2 h-4 w-4" /> Edit Section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Evidence Needed" icon={ListChecks} items={section.evidenceNeeded} />
        <Checklist title="Proposal Guidance" icon={Lightbulb} items={section.guidance} />
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
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
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="mt-0.5 h-4 w-4 text-primary" />
          <span>Keep this section aligned with the proposal file structure.</span>
        </div>
      </div>
    </div>
  );
}
