import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ClipboardList, Code2, FileWarning, GitPullRequest, Lock, PackageCheck, ShieldCheck, Wrench } from "lucide-react";

const hardeningChecks = [
  { id: "BLH-001", title: "Unused imports sweep", area: "TypeScript", status: "Review", score: 72, note: "Scan project panels for unused lucide icons, helper types, and dead imports before release." },
  { id: "BLH-002", title: "Build script validation", area: "CI", status: "Ready", score: 88, note: "Use existing build-check workflow and local npm run build before production publish." },
  { id: "BLH-003", title: "Route smoke coverage", area: "Navigation", status: "Review", score: 76, note: "Verify Admin, Project Workspace, Team, Funding, Trust, Help, and Feedback chains render correctly." },
  { id: "BLH-004", title: "Dependency warning review", area: "Packages", status: "Review", score: 70, note: "Confirm package warnings, vite/plugin compatibility, and lockfile health before release." },
];

const cleanupTargets = [
  { label: "Legacy unused icon imports", status: "Review", helper: "Older panels may still include unused lucide icons from earlier rapid passes." },
  { label: "Compact JSX readability", status: "Review", helper: "Several helper sections use compact one-line JSX; format after build passes." },
  { label: "Demo-only wording", status: "Ready", helper: "Locked/demo labels are visible in finance, support, trust, launch, and security flows." },
  { label: "Route integration", status: "Review", helper: "Some later features are embedded through the visible chain instead of direct route tabs." },
];

const ciSteps = [
  { label: "npm install", status: "Locked", count: 1 },
  { label: "npm run lint", status: "Review", count: 2 },
  { label: "npm run build", status: "Review", count: 3 },
  { label: "GitHub Actions", status: "Ready", count: 1 },
];

const statusClass = (status: string) => {
  if (status === "Ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function BuildLintHardeningPanel() {
  const readyItems = [...hardeningChecks, ...cleanupTargets, ...ciSteps].filter((item) => item.status === "Ready").length;
  const reviewItems = [...hardeningChecks, ...cleanupTargets, ...ciSteps].filter((item) => item.status === "Review").length;
  const lockedItems = ciSteps.filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(hardeningChecks.reduce((total, item) => total + item.score, 0) / hardeningChecks.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Ready" value={readyItems.toString()} helper="Checks" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Local steps" />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Hardening" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Build Gate Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> Build / Lint Hardening Pass
              </CardTitle>
              <CardDescription>
                Production hardening tracker for imports, TypeScript cleanup, route smoke checks, CI validation, and package-warning review.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Code2 className="mr-2 h-4 w-4" /> Auto-Fix Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Build Run Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Hardening readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo hardening tracker only. Real cleanup should be confirmed by running lint, TypeScript checks, production build, route smoke tests, and CI logs.
          </div>
          <HardeningChecks />
          <div className="grid gap-4 xl:grid-cols-2">
            <CleanupTargets />
            <CISteps />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HardeningChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardList className="h-4 w-4 text-primary" /> Hardening Checks</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{hardeningChecks.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.area}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function CleanupTargets() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><FileWarning className="h-4 w-4 text-primary" /> Cleanup Targets</p><div className="mt-3 space-y-3">{cleanupTargets.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function CISteps() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><PackageCheck className="h-4 w-4 text-primary" /> CI Steps</p><div className="mt-3 space-y-3">{ciSteps.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} step</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><GitPullRequest className="h-3 w-3" /> CI</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Gate</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Build</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
