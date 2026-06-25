import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ABSTRACT_DRAFT,
  ABSTRACT_INPUT_BLOCKS,
  getAbstractBlockStatusClass,
  getAbstractBlockStatusLabel,
  getAbstractCounts,
  getAbstractReadiness,
  type AbstractInputBlock,
} from "@/config/abstractGenerator";
import { AlertTriangle, CheckCircle2, FileText, Lock, PencilLine, Sparkles, Wand2 } from "lucide-react";

type AbstractGeneratorPanelProps = {
  blocks?: AbstractInputBlock[];
  draft?: string;
};

export function AbstractGeneratorPanel({ blocks = ABSTRACT_INPUT_BLOCKS, draft = ABSTRACT_DRAFT }: AbstractGeneratorPanelProps) {
  const readiness = getAbstractReadiness(blocks);
  const counts = getAbstractCounts(blocks);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Abstract Readiness" value={`${readiness}%`} helper="Block completeness" danger={readiness < 75} />
        <MetricCard label="Ready Blocks" value={counts.ready.toString()} helper="Safe to use" />
        <MetricCard label="Draft Blocks" value={counts.drafts.toString()} helper="Needs polish" />
        <MetricCard label="Evidence Needed" value={counts.evidenceNeeded.toString()} helper="Cannot overclaim" danger={counts.evidenceNeeded > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Abstract Generator
              </CardTitle>
              <CardDescription>
                Build a safe abstract from problem, method, results, contribution, and keywords without overclaiming missing evidence.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Abstract
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Promote to Report
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Abstract readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a read-only draft preview. Real abstract generation should only include measured results, verified contribution claims, and supervisor-approved wording.
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" /> Draft Abstract Preview
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{draft}</p>
          </div>

          <div className="grid gap-4">
            {blocks.map((block) => (
              <AbstractBlockCard key={block.id} block={block} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AbstractBlockCard({ block }: { block: AbstractInputBlock }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{block.type}</Badge>
            <Badge className={getAbstractBlockStatusClass(block.status)}>{getAbstractBlockStatusLabel(block.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{block.label}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{block.content}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <PencilLine className="mr-2 h-4 w-4" /> Edit Block
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-primary/5 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Evidence Requirement
          </p>
          <p className="mt-1 text-muted-foreground">{block.evidenceRequirement}</p>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Safety Warning
          </p>
          <p className="mt-1 text-muted-foreground">{block.warning ?? "No special warning. Keep wording aligned with verified project evidence."}</p>
        </div>
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
