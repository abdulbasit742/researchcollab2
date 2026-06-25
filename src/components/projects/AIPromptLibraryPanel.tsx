import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_PROMPT_LIBRARY_ITEMS,
  getPromptCategoryLabel,
  getPromptLibraryCounts,
  getPromptSafetyClass,
  getPromptSafetyLabel,
  type PromptLibraryItem,
} from "@/config/aiPromptLibrary";
import { CheckCircle2, FileText, Library, Lock, Save, ShieldCheck, type LucideIcon } from "lucide-react";

type AIPromptLibraryPanelProps = {
  items?: PromptLibraryItem[];
};

export function AIPromptLibraryPanel({ items = AI_PROMPT_LIBRARY_ITEMS }: AIPromptLibraryPanelProps) {
  const counts = getPromptLibraryCounts(items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Templates" value={counts.total.toString()} helper="Reusable guidance" />
        <MetricCard label="Safe" value={counts.safe.toString()} helper="Low-risk items" />
        <MetricCard label="Review Needed" value={counts.reviewNeeded.toString()} helper="Needs human check" danger={counts.reviewNeeded > 0} />
        <MetricCard label="Source Required" value={counts.sourceRequired.toString()} helper="Needs evidence" danger={counts.sourceRequired > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5 text-primary" />
                AI Prompt Library
              </CardTitle>
              <CardDescription>
                Reusable guidance templates for writing, review, research, methodology, viva practice, and planning workflows.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Lock className="mr-2 h-4 w-4" /> Use Template
              </Button>
              <Button disabled>
                <Save className="mr-2 h-4 w-4" /> Save Variant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is a read-only template library. Real AI use should rely on saved project context, verified inputs, and human review.
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <PromptLibraryCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromptLibraryCard({ item }: { item: PromptLibraryItem }) {
  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getPromptCategoryLabel(item.category)}</Badge>
            <Badge className={getPromptSafetyClass(item.safetyLevel)}>{getPromptSafetyLabel(item.safetyLevel)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{item.useCase}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <Lock className="mr-2 h-4 w-4" /> Locked
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="mb-2 flex items-center gap-2 font-medium">
          <FileText className="h-4 w-4 text-primary" /> Template Preview
        </p>
        <p className="whitespace-pre-wrap text-muted-foreground">{item.prompt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Inputs Needed" icon={ShieldCheck} items={item.inputsNeeded} />
        <Checklist title="Output Checklist" icon={CheckCircle2} items={item.outputChecklist} />
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
