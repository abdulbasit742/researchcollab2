import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  METHODOLOGY_ASSISTANT_ITEMS,
  getMethodologyAssistantAreaLabel,
  getMethodologyAssistantCounts,
  getMethodologyAssistantReadiness,
  getMethodologyAssistantStatusClass,
  getMethodologyAssistantStatusLabel,
  type MethodologyAssistantItem,
} from "@/config/methodologyAssistant";
import { AlertTriangle, BrainCircuit, CheckCircle2, ClipboardCheck, FlaskConical, Lock, PencilLine, Sparkles, type LucideIcon } from "lucide-react";

type MethodologyAssistantPanelProps = {
  items?: MethodologyAssistantItem[];
};

export function MethodologyAssistantPanel({ items = METHODOLOGY_ASSISTANT_ITEMS }: MethodologyAssistantPanelProps) {
  const readiness = getMethodologyAssistantReadiness(items);
  const counts = getMethodologyAssistantCounts(items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Method AI Readiness" value={`${readiness}%`} helper="Method quality" danger={readiness < 70} />
        <MetricCard label="Ready" value={counts.ready.toString()} helper="Safe guidance" />
        <MetricCard label="Needs Evidence" value={counts.needsEvidence.toString()} helper="Must verify" danger={counts.needsEvidence > 0} />
        <MetricCard label="Missing" value={counts.missing.toString()} helper="Needs drafting" danger={counts.missing > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Methodology Assistant
              </CardTitle>
              <CardDescription>
                Improve methodology sections with artifact requirements, validation checks, safe prompts, and risk notes.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Method
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Apply to Report
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Methodology assistant readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only planning support. Real methodology generation must use actual implementation details, supervisor-approved scope, validation evidence, and ethics/privacy notes.
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <MethodologyAssistantCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MethodologyAssistantCard({ item }: { item: MethodologyAssistantItem }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getMethodologyAssistantAreaLabel(item.area)}</Badge>
            <Badge className={getMethodologyAssistantStatusClass(item.status)}>{getMethodologyAssistantStatusLabel(item.status)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{item.draftText}</p>
          </div>
        </div>
        <Button variant="outline" disabled>
          <PencilLine className="mr-2 h-4 w-4" /> Refine Draft
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Artifacts Needed" icon={ClipboardCheck} items={item.artifactsNeeded} />
        <Checklist title="Validation Checks" icon={CheckCircle2} items={item.validationChecks} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-primary/5 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <BrainCircuit className="h-4 w-4 text-primary" /> Safe AI Prompt
          </p>
          <p className="mt-1 text-muted-foreground">{item.safePrompt}</p>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Note
          </p>
          <p className="mt-1 text-muted-foreground">{item.riskNote}</p>
        </div>
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
