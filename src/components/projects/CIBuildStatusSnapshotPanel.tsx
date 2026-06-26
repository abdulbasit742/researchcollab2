import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle2, Clock3, GitCommit, Lock, Radar, ShieldCheck, Workflow } from "lucide-react";

const ciSignals = [
  { id: "CI-001", title: "Latest commit status", status: "No Status Reported", owner: "GitHub", score: 52, note: "Combined classic status API returned an empty status list for the latest cleanup commit." },
  { id: "CI-002", title: "Build workflow expectation", status: "Needs Actions Run", owner: "CI", score: 68, note: "Build-check workflow should validate npm install, lint, and production build on push or pull request." },
  { id: "CI-003", title: "Manual verification", status: "Review", owner: "Engineering", score: 74, note: "A maintainer should run npm run lint and npm run build locally before production release." },
  { id: "CI-004", title: "Release readiness", status: "Locked", owner: "Founder", score: 60, note: "Go-live remains locked until CI evidence and owner approvals are available." },
];

const verificationSteps = [
  { label: "Check latest commit", status: "Checked", helper: "Commit 0e9338e was queried through GitHub combined status." },
  { label: "Review reported statuses", status: "No Status Reported", helper: "No classic status contexts were returned for that commit." },
  { label: "Run Actions build", status: "Needs Actions Run", helper: "Use GitHub Actions build-check workflow as the source of validation." },
  { label: "Record release evidence", status: "Locked", helper: "Production release evidence should be logged before go-live." },
];

const statusClass = (status: string) => {
  if (status === "Checked") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Review" || status === "Needs Actions Run" || status === "No Status Reported") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function CIBuildStatusSnapshotPanel() {
  const checkedItems = [...ciSignals, ...verificationSteps].filter((item) => item.status === "Checked").length;
  const reviewItems = [...ciSignals, ...verificationSteps].filter((item) => item.status === "Review" || item.status === "Needs Actions Run" || item.status === "No Status Reported").length;
  const lockedItems = [...ciSignals, ...verificationSteps].filter((item) => item.status === "Locked").length;
  const averageScore = Math.round(ciSignals.reduce((total, item) => total + item.score, 0) / ciSignals.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Checked" value={checkedItems.toString()} helper="Items" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Needed" danger={reviewItems > 0} />
        <MetricCard label="Locked" value={lockedItems.toString()} helper="Release" />
        <MetricCard label="Score" value={`${averageScore}%`} helper="CI snapshot" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">CI Snapshot</Badge>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" /> CI Build Status Snapshot
              </CardTitle>
              <CardDescription>
                Snapshot panel for latest commit status, workflow validation, manual build checks, and release evidence tracking.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Radar className="mr-2 h-4 w-4" /> Refresh Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Release Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>CI snapshot readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            GitHub combined status check returned no classic status contexts for the latest cleanup commit. Treat this as not validated until GitHub Actions and local build/lint checks are reviewed.
          </div>
          <CISignals />
          <VerificationSteps />
        </CardContent>
      </Card>
    </div>
  );
}

function CISignals() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4 text-primary" /> CI Signals</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{ciSignals.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.owner}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% confidence</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function VerificationSteps() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Verification Steps</p><div className="mt-3 space-y-3">{verificationSteps.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><GitCommit className="h-3 w-3" /> Commit</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> Pending</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Evidence</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
