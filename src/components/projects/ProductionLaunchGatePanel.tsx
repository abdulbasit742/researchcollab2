import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ClipboardCheck, CloudUpload, FileCheck2, GitBranch, Lock, Rocket, ShieldCheck, Siren, Wrench } from "lucide-react";

const launchGates = [
  { id: "PLG-001", title: "Build and lint validation", owner: "Engineering", status: "Review", score: 78, note: "Run npm build, lint, route smoke checks, and GitHub Actions before any production release." },
  { id: "PLG-002", title: "Environment readiness", owner: "DevOps", status: "Review", score: 74, note: "Confirm Supabase keys, redirect URLs, PWA settings, and production domain configuration." },
  { id: "PLG-003", title: "Trust and support readiness", owner: "Operations", status: "Ready", score: 86, note: "Trust Center, Help Center, feedback, moderation, and audit previews are now connected." },
  { id: "PLG-004", title: "Go-live authority", owner: "Founder", status: "Locked", score: 64, note: "Actual launch remains locked until owner approval and release checklist are completed." },
];

const ownerApprovals = [
  { label: "Founder approval", status: "Locked", helper: "Final go-live approval should be explicit and logged." },
  { label: "Engineering approval", status: "Review", helper: "Requires successful build, lint, and route smoke test." },
  { label: "Trust approval", status: "Ready", helper: "Trust, finance-demo, help, and feedback surfaces are visible." },
  { label: "Security approval", status: "Review", helper: "Review JWT risk, role access, secrets, and protected actions." },
];

const runbooks = [
  { label: "Rollback plan", status: "Review", count: 3 },
  { label: "Incident contact path", status: "Review", count: 2 },
  { label: "Release notes", status: "Ready", count: 5 },
  { label: "Post-launch checklist", status: "Locked", count: 4 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function ProductionLaunchGatePanel() {
  const readyItems = [...launchGates, ...ownerApprovals, ...runbooks].filter((item) => item.status === "Ready").length;
  const reviewItems = [...launchGates, ...ownerApprovals, ...runbooks].filter((item) => item.status === "Review").length;
  const lockedItems = [...launchGates, ...ownerApprovals, ...runbooks].filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(launchGates.reduce((total, item) => total + item.score, 0) / launchGates.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Ready" value={readyItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Gates" />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Launch gate" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Post-100 Gate Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <CloudUpload className="h-5 w-5 text-primary" /> Production Launch Gate
              </CardTitle>
              <CardDescription>
                Post-roadmap launch gate for build validation, environment readiness, owner approvals, runbooks, and locked go-live controls.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Wrench className="mr-2 h-4 w-4" /> Validate Locked
              </Button>
              <Button disabled>
                <Rocket className="mr-2 h-4 w-4" /> Go Live Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Production launch gate readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo production launch gate only. Real launch should require build logs, environment verification, owner approvals, security review, support readiness, rollback plan, and release audit history.
          </div>
          <LaunchGates />
          <div className="grid gap-4 xl:grid-cols-2">
            <OwnerApprovals />
            <Runbooks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LaunchGates() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardCheck className="h-4 w-4 text-primary" /> Launch Gates</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{launchGates.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.owner}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% gate readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function OwnerApprovals() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileCheck2 className="h-4 w-4 text-primary" /> Owner Approvals</p><div className="mt-3 space-y-3">{ownerApprovals.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function Runbooks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><GitBranch className="h-4 w-4 text-primary" /> Launch Runbooks</p><div className="mt-3 space-y-3">{runbooks.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} steps</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><Siren className="h-3 w-3" /> Incident</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Security</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Release</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
