import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle2, Crown, Flag, Gauge, Lock, Rocket, ShieldCheck, Target } from "lucide-react";

const founderMetrics = [
  { id: "FCR-001", title: "Product readiness", area: "Core app", status: "Ready", score: 92, note: "Workspace, project, AI, marketplace, funding, career, and trust modules are represented." },
  { id: "FCR-002", title: "Trust readiness", area: "Trust Center", status: "Review", score: 84, note: "Trust, help, feedback, audit, moderation, and security previews need owner review." },
  { id: "FCR-003", title: "Demo finance safety", area: "Funding", status: "Ready", score: 88, note: "Demo-only finance labels and locked actions are visible across funding surfaces." },
  { id: "FCR-004", title: "Launch controls", area: "Operations", status: "Locked", score: 72, note: "Real launch actions remain disabled until production checks are complete." },
];

const launchChecklist = [
  { label: "Review demo labels", status: "Ready", helper: "Confirm demo-only text on funding, certificates, and support surfaces." },
  { label: "Check protected actions", status: "Ready", helper: "Verify publish, submit, payout, export, and admin actions are locked." },
  { label: "Owner approval", status: "Review", helper: "Assign owners for trust, support, moderation, and security content." },
  { label: "Production build", status: "Review", helper: "Run build, lint, route smoke test, and GitHub Actions before launch." },
  { label: "Go-live switch", status: "Locked", helper: "Founder launch switch is placeholder-only and cannot publish production changes." },
];

const commandAreas = [
  { label: "Product", status: "Ready", count: 36 },
  { label: "Trust", status: "Review", count: 18 },
  { label: "Funding", status: "Ready", count: 10 },
  { label: "Security", status: "Review", count: 8 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function FounderControlRoomPanel() {
  const readyItems = [...founderMetrics, ...launchChecklist, ...commandAreas].filter((item) => item.status === "Ready").length;
  const reviewItems = [...founderMetrics, ...launchChecklist, ...commandAreas].filter((item) => item.status === "Review").length;
  const lockedItems = [...founderMetrics, ...launchChecklist].filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(founderMetrics.reduce((total, item) => total + item.score, 0) / founderMetrics.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Ready" value={readyItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Controls" />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Launch" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Founder Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" /> Founder Control Room
              </CardTitle>
              <CardDescription>
                Final command-center preview for launch readiness, trust review, security posture, demo finance safety, and locked founder controls.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Rocket className="mr-2 h-4 w-4" /> Launch Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Founder Action Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Founder launch readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo founder control room only. Production launch should require owner approvals, build validation, security review, privacy checks, support readiness, and audit history.
          </div>
          <FounderMetrics />
          <div className="grid gap-4 xl:grid-cols-2">
            <LaunchChecklist />
            <CommandAreas />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FounderMetrics() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Gauge className="h-4 w-4 text-primary" /> Founder Metrics</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{founderMetrics.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.area}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function LaunchChecklist() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Flag className="h-4 w-4 text-primary" /> Launch Checklist</p><div className="mt-3 space-y-3">{launchChecklist.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function CommandAreas() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><BarChart3 className="h-4 w-4 text-primary" /> Command Areas</p><div className="mt-3 space-y-3">{commandAreas.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} modules</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> Focus</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Trust</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
