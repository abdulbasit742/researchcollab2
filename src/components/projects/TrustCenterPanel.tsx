import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HelpCenterFAQPanel } from "@/components/projects/HelpCenterFAQPanel";
import { BookOpenCheck, CheckCircle2, FileText, Globe2, Lock, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const trustAreas = [
  { id: "privacy", title: "Privacy", owner: "Product", status: "Ready", score: 88, note: "Profile visibility and portfolio sharing need clear user controls." },
  { id: "security", title: "Security", owner: "Admin", status: "Review", score: 82, note: "Access checks, audit notes, and locked actions are summarized." },
  { id: "ai", title: "AI use", owner: "Product", status: "Ready", score: 84, note: "AI outputs should remain reviewable before use." },
  { id: "finance", title: "Demo finance labels", owner: "Operations", status: "Review", score: 76, note: "Funding labels should stay demo-only and non-transactional." },
];

const trustChecks = [
  { label: "Data explanation", status: "Ready", helper: "Explain what project and profile data can be shown." },
  { label: "Security summary", status: "Review", helper: "Summarize access, audit, and protected actions." },
  { label: "AI note", status: "Ready", helper: "Show that AI content needs human review." },
  { label: "Demo finance note", status: "Review", helper: "Make demo finance wording visible." },
];

const trustResources = [
  { label: "Privacy overview", status: "Ready", count: 5 },
  { label: "Security overview", status: "Ready", count: 4 },
  { label: "AI usage note", status: "Ready", count: 3 },
  { label: "Demo finance labels", status: "Review", count: 4 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function TrustCenterPanel() {
  const readyItems = [...trustAreas, ...trustChecks, ...trustResources].filter((item) => item.status === "Ready").length;
  const reviewItems = [...trustAreas, ...trustChecks, ...trustResources].filter((item) => item.status === "Review").length;
  const averageScore = Math.round(trustAreas.reduce((total, item) => total + item.score, 0) / trustAreas.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Areas" value={trustAreas.length.toString()} helper="Trust topics" />
        <MetricCard label="Ready" value={readyItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Readiness" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Trust Center Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" /> Trust Center Page
              </CardTitle>
              <CardDescription>
                Central page preview for privacy, security, AI use, moderation visibility, audit notes, and demo finance labels.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" /> Publish Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Edit Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Trust readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo Trust Center page only. Production content should be reviewed by authorized owners and kept aligned with real platform behavior.
          </div>
          <TrustAreas />
          <div className="grid gap-4 xl:grid-cols-2">
            <TrustChecks />
            <TrustResources />
          </div>
        </CardContent>
      </Card>
      <HelpCenterFAQPanel />
    </div>
  );
}

function TrustAreas() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Trust Areas</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{trustAreas.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.owner}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function TrustChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><BookOpenCheck className="h-4 w-4 text-primary" /> Transparency Checks</p><div className="mt-3 space-y-3">{trustChecks.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function TrustResources() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-primary" /> Trust Resources</p><div className="mt-3 space-y-3">{trustResources.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} points</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><UsersRound className="h-3 w-3" /> Owners</span><span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
