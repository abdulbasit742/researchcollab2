import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bug, CheckCircle2, ClipboardList, FileUp, Lightbulb, Lock, MessageSquarePlus, Send, ShieldCheck } from "lucide-react";

const feedbackTypes = [
  { id: "FB-001", title: "Bug report", area: "Workspace", status: "Ready", severity: "High", score: 88, note: "Collects page, steps, expected result, actual result, and screenshot prompt." },
  { id: "FB-002", title: "Feature idea", area: "Product", status: "Ready", severity: "Low", score: 84, note: "Captures user goal, value, affected role, and priority." },
  { id: "FB-003", title: "Content issue", area: "Help Center", status: "Review", severity: "Medium", score: 73, note: "Needs article link, category, correction note, and reviewer owner." },
  { id: "FB-004", title: "Trust or privacy note", area: "Trust Center", status: "Review", severity: "Medium", score: 76, note: "Routes sensitive feedback to review-safe handling before action." },
];

const reportFields = [
  { label: "Category selector", status: "Ready", helper: "Bug, idea, content issue, trust note, or other feedback." },
  { label: "Steps to reproduce", status: "Ready", helper: "Clear steps help reproduce and prioritize bugs." },
  { label: "Evidence attachment", status: "Review", helper: "Attachments need privacy-safe handling before upload." },
  { label: "Contact preference", status: "Review", helper: "User consent is needed before follow-up contact." },
  { label: "Submit action", status: "Locked", helper: "Real ticket creation is placeholder-only for now." },
];

const triageRules = [
  { label: "Critical bug", status: "Ready", count: 1 },
  { label: "Needs evidence", status: "Review", count: 2 },
  { label: "Product idea", status: "Ready", count: 3 },
  { label: "Private review", status: "Review", count: 2 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function FeedbackBugReportWidgetPanel() {
  const readyItems = [...feedbackTypes, ...reportFields, ...triageRules].filter((item) => item.status === "Ready").length;
  const reviewItems = [...feedbackTypes, ...reportFields, ...triageRules].filter((item) => item.status === "Review").length;
  const lockedItems = reportFields.filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(feedbackTypes.reduce((total, item) => total + item.score, 0) / feedbackTypes.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Types" value={feedbackTypes.length.toString()} helper="Feedback" />
        <MetricCard label="Ready" value={readyItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Submit" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Feedback Widget Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5 text-primary" /> Feedback / Bug Report Widget
              </CardTitle>
              <CardDescription>
                Floating widget preview for bug reports, feature ideas, content issues, trust notes, evidence prompts, and triage routing.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileUp className="mr-2 h-4 w-4" /> Attach Locked
              </Button>
              <Button disabled>
                <Send className="mr-2 h-4 w-4" /> Submit Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Widget readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo feedback widget only. Production feedback should validate spam controls, privacy-safe attachments, consent for contact, audit records, and real support ownership.
          </div>
          <FeedbackTypes />
          <div className="grid gap-4 xl:grid-cols-2">
            <ReportFields />
            <TriageRules />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackTypes() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Bug className="h-4 w-4 text-primary" /> Feedback Types</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{feedbackTypes.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.severity}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.area}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function ReportFields() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardList className="h-4 w-4 text-primary" /> Report Fields</p><div className="mt-3 space-y-3">{reportFields.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function TriageRules() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Triage Rules</p><div className="mt-3 space-y-3">{triageRules.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} checks</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Ideas</span><span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Privacy</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
