import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LITERATURE_REVIEW_DRAFTS,
  getLiteratureReviewAssistantCounts,
  getLiteratureReviewAssistantReadiness,
  getLiteratureReviewDraftStatusClass,
  getLiteratureReviewDraftStatusLabel,
  getLiteratureReviewThemeLabel,
  type LiteratureReviewDraft,
} from "@/config/literatureReviewAssistant";
import { AlertTriangle, BookOpenText, CheckCircle2, FileText, Lock, PencilLine, Sparkles, type LucideIcon } from "lucide-react";

type LiteratureReviewAssistantPanelProps = {
  drafts?: LiteratureReviewDraft[];
};

export function LiteratureReviewAssistantPanel({ drafts = LITERATURE_REVIEW_DRAFTS }: LiteratureReviewAssistantPanelProps) {
  const readiness = getLiteratureReviewAssistantReadiness(drafts);
  const counts = getLiteratureReviewAssistantCounts(drafts);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Review Readiness" value={`${readiness}%`} helper="Draft quality" danger={readiness < 70} />
        <MetricCard label="Draft Blocks" value={counts.total.toString()} helper="Review themes" />
        <MetricCard label="Review Ready" value={counts.reviewReady.toString()} helper="Supervisor-ready" />
        <MetricCard label="Citation Placeholders" value={counts.citationPlaceholders.toString()} helper="Must replace" danger={counts.citationPlaceholders > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5 text-primary" />
                Literature Review Assistant
              </CardTitle>
              <CardDescription>
                Convert matrix themes into draft review paragraphs with citation placeholders, source notes, and safety warnings.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Review
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Promote to Report
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Literature review readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only draft support. Real literature review generation must use verified source excerpts, citation records, and supervisor approval before being added to the final report.
          </div>

          <div className="grid gap-4">
            {drafts.map((draft) => (
              <LiteratureReviewDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiteratureReviewDraftCard({ draft }: { draft: LiteratureReviewDraft }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getLiteratureReviewThemeLabel(draft.theme)}</Badge>
            <Badge className={getLiteratureReviewDraftStatusClass(draft.status)}>{getLiteratureReviewDraftStatusLabel(draft.status)}</Badge>
            <Badge variant="secondary">{draft.sourceCount} sources</Badge>
            <Badge variant="outline">{draft.citationPlaceholders} citation placeholders</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{draft.title}</h4>
            <p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{draft.draftParagraph}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <PencilLine className="mr-2 h-4 w-4" /> Edit Draft
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Source Notes" icon={FileText} items={draft.sourceNotes} />
        <Checklist title="Warnings" icon={AlertTriangle} items={draft.warnings} warning />
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 text-sm">
        <p className="font-medium">Next Action</p>
        <p className="mt-1 text-muted-foreground">{draft.nextAction}</p>
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items, warning = false }: { title: string; icon: LucideIcon; items: string[]; warning?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-500" : "text-primary"}`} /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {item}
          </p>
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
