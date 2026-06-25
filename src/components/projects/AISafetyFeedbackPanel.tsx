import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_SAFETY_FEEDBACK_ITEMS,
  getAISafetyCategoryLabel,
  getAISafetyFeedbackCounts,
  getAISafetySeverityClass,
  getAISafetyStatusClass,
  getAISafetyStatusLabel,
  type AISafetyFeedbackItem,
} from "@/config/aiSafetyFeedback";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Lock, MessageSquareWarning, ShieldAlert, UserRoundCheck, type LucideIcon } from "lucide-react";

type AISafetyFeedbackPanelProps = {
  items?: AISafetyFeedbackItem[];
};

export function AISafetyFeedbackPanel({ items = AI_SAFETY_FEEDBACK_ITEMS }: AISafetyFeedbackPanelProps) {
  const counts = getAISafetyFeedbackCounts(items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Feedback Items" value={counts.total.toString()} helper="AI safety review" />
        <MetricCard label="Open" value={counts.open.toString()} helper="Needs action" danger={counts.open > 0} />
        <MetricCard label="High Severity" value={counts.high.toString()} helper="Review first" danger={counts.high > 0} />
        <MetricCard label="Resolved" value={counts.resolved.toString()} helper="Closed checks" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                AI Safety Feedback / Report System
              </CardTitle>
              <CardDescription>
                Track unsafe wording, unsupported claims, missing sources, unclear scope, and quality issues across AI-generated outputs.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <MessageSquareWarning className="mr-2 h-4 w-4" /> Submit Feedback
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Resolve Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This is read-only safety review support. Real reporting should store reporter identity, reviewer action, source output, resolution notes, and audit history.
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <AISafetyFeedbackCard key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AISafetyFeedbackCard({ item }: { item: AISafetyFeedbackItem }) {
  const needsAction = item.status === "open" || item.status === "under_review";

  return (
    <div className="space-y-4 rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getAISafetyCategoryLabel(item.category)}</Badge>
            <Badge className={getAISafetySeverityClass(item.severity)}>{item.severity}</Badge>
            <Badge className={getAISafetyStatusClass(item.status)}>{getAISafetyStatusLabel(item.status)}</Badge>
            <Badge variant="secondary">{item.relatedTool}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{item.feedbackSummary}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-52">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRoundCheck className="h-3 w-3" /> Reviewer
          </p>
          <p className="mt-1 font-semibold">{item.reviewer}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.createdLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoBox title="Affected Output" icon={needsAction ? AlertTriangle : CheckCircle2} text={item.affectedOutput} warning={needsAction} />
        <InfoBox title="Suggested Fix" icon={ClipboardCheck} text={item.suggestedFix} />
      </div>
    </div>
  );
}

function InfoBox({ title, icon: Icon, text, warning = false }: { title: string; icon: LucideIcon; text: string; warning?: boolean }) {
  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <Icon className={`h-4 w-4 ${warning ? "text-amber-500" : "text-primary"}`} /> {title}
      </p>
      <p className="mt-1 text-muted-foreground">{text}</p>
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
