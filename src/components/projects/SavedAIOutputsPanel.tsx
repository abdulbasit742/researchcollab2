import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SAVED_AI_OUTPUTS,
  getSavedAIOutputCounts,
  getSavedAIOutputRiskClass,
  getSavedAIOutputSourceLabel,
  getSavedAIOutputStatusClass,
  getSavedAIOutputStatusLabel,
  type SavedAIOutput,
} from "@/config/savedAIOutputs";
import { Archive, Bot, CheckCircle2, FileText, History, Lock, Save, UserRoundCheck, type LucideIcon } from "lucide-react";

type SavedAIOutputsPanelProps = {
  outputs?: SavedAIOutput[];
};

export function SavedAIOutputsPanel({ outputs = SAVED_AI_OUTPUTS }: SavedAIOutputsPanelProps) {
  const counts = getSavedAIOutputCounts(outputs);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Saved Outputs" value={counts.total.toString()} helper="AI result history" />
        <MetricCard label="Approved" value={counts.approved.toString()} helper="Reusable items" />
        <MetricCard label="Needs Review" value={counts.reviewNeeded.toString()} helper="Human check" danger={counts.reviewNeeded > 0} />
        <MetricCard label="High Risk" value={counts.highRisk.toString()} helper="Do not reuse yet" danger={counts.highRisk > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Saved AI Outputs
              </CardTitle>
              <CardDescription>
                Track generated AI drafts, summaries, method notes, risk outputs, review state, and reuse readiness.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Save className="mr-2 h-4 w-4" /> Save New Output
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Approve Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only output history. Real saved outputs should store source inputs, reviewer decisions, version links, and audit records before reuse in formal documents.
          </div>

          <div className="grid gap-4">
            {outputs.map((output) => (
              <SavedAIOutputCard key={output.id} output={output} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SavedAIOutputCard({ output }: { output: SavedAIOutput }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getSavedAIOutputSourceLabel(output.source)}</Badge>
            <Badge className={getSavedAIOutputStatusClass(output.status)}>{getSavedAIOutputStatusLabel(output.status)}</Badge>
            <Badge className={getSavedAIOutputRiskClass(output.risk)}>{output.risk} risk</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{output.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{output.summary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-52">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRoundCheck className="h-3 w-3" /> Saved by
          </p>
          <p className="mt-1 font-semibold">{output.savedBy}</p>
          <p className="mt-1 text-xs text-muted-foreground">{output.savedAtLabel}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="mb-2 flex items-center gap-2 font-medium">
          <FileText className="h-4 w-4 text-primary" /> Output Preview
        </p>
        <p className="text-muted-foreground">{output.outputPreview}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Review Notes" icon={Bot} items={output.reviewNotes} />
        <Checklist title="Reuse Checklist" icon={CheckCircle2} items={output.reuseChecklist} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <Archive className="mr-2 h-4 w-4" /> Archive
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Add to Document
        </Button>
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
