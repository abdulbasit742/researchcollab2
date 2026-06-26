import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DemoFinanceLabelCheckerPanel } from "@/components/projects/DemoFinanceLabelCheckerPanel";
import { AlertTriangle, CheckCircle2, CloudCog, FileWarning, KeyRound, Lock, RotateCcwKey, ShieldCheck, Workflow } from "lucide-react";

const functionRisks = [
  { id: "JWT-001", name: "create-project-summary", area: "Project AI", status: "Aligned", level: "Low", score: 91, note: "Uses user-scoped context and should keep service credentials server-side only." },
  { id: "JWT-002", name: "verify-certificate", area: "Trust", status: "Watch", level: "Medium", score: 72, note: "Public lookup should validate issuer approval and avoid exposing private claims." },
  { id: "JWT-003", name: "moderation-review", area: "Safety", status: "Protected", level: "Low", score: 86, note: "Admin actions remain locked and should require role-checked JWT claims." },
  { id: "JWT-004", name: "funding-ledger-demo", area: "Funding", status: "Watch", level: "Medium", score: 67, note: "Demo ledger should never accept privileged claims from the client." },
];

const jwtChecks = [
  { label: "JWT role claim alignment", status: "Aligned", helper: "Role checks should match server-side authorization rules." },
  { label: "Service role isolation", status: "Protected", helper: "Service credentials must stay in edge function secrets only." },
  { label: "Anonymous access boundary", status: "Watch", helper: "Public functions should validate read-only scope and rate limits." },
  { label: "RLS policy alignment", status: "Watch", helper: "Function behavior should match database row-level security." },
  { label: "Secret rotation policy", status: "Locked", helper: "Rotation checks are placeholder-only in this demo." },
];

const remediationItems = [
  { label: "Add claim validation checklist", status: "Aligned", count: 4 },
  { label: "Review public functions", status: "Watch", count: 2 },
  { label: "Confirm server-only secrets", status: "Protected", count: 3 },
  { label: "Document rotation runbook", status: "Locked", count: 1 },
];

const statusClass = (status: string) => {
  if (status === "Aligned" || status === "Protected") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Watch") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Priority") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function EdgeFunctionJWTRiskDashboardPanel() {
  const aligned = [...functionRisks, ...jwtChecks, ...remediationItems].filter((item) => item.status === "Aligned").length;
  const protectedItems = [...functionRisks, ...jwtChecks, ...remediationItems].filter((item) => item.status === "Protected").length;
  const watchItems = [...functionRisks, ...jwtChecks, ...remediationItems].filter((item) => item.status === "Watch").length;
  const averageScore = Math.round(functionRisks.reduce((total, item) => total + item.score, 0) / functionRisks.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Aligned" value={aligned.toString()} helper="Checks" />
        <MetricCard label="Protected" value={protectedItems.toString()} helper="Items" />
        <MetricCard label="Watch" value={watchItems.toString()} helper="Items" danger={watchItems > 0} />
        <MetricCard label="Score" value={`${averageScore}%`} helper="JWT risk" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Edge Security Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <CloudCog className="h-5 w-5 text-primary" /> Edge Function JWT Risk Dashboard
              </CardTitle>
              <CardDescription>
                Preview edge function JWT checks, role-claim alignment, service-secret isolation, RLS posture, and locked remediation actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <RotateCcwKey className="mr-2 h-4 w-4" /> Rotate Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Remediate Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>JWT risk readiness</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo JWT risk dashboard only. Production edge functions should validate JWT claims server-side, isolate service-role secrets, enforce RLS alignment, rate limits, audit logs, and secret rotation.
          </div>
          <FunctionRisks />
          <div className="grid gap-4 xl:grid-cols-2">
            <JWTChecks />
            <RemediationItems />
          </div>
        </CardContent>
      </Card>
      <DemoFinanceLabelCheckerPanel />
    </div>
  );
}

function FunctionRisks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Workflow className="h-4 w-4 text-primary" /> Edge Function Signals</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{functionRisks.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.level}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.area}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% JWT readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function JWTChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> JWT Checks</p><div className="mt-3 space-y-3">{jwtChecks.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function RemediationItems() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-primary" /> Remediation Preview</p><div className="mt-3 space-y-3">{remediationItems.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} items</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Risk</span><span className="inline-flex items-center gap-1"><FileWarning className="h-3 w-3" /> RLS</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Audit</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
