import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EdgeFunctionJWTRiskDashboardPanel } from "@/components/projects/EdgeFunctionJWTRiskDashboardPanel";
import { AlertTriangle, CheckCircle2, FileWarning, KeyRound, Lock, Radar, Shield, ShieldCheck, UserCheck } from "lucide-react";

const securitySignals = [
  { id: "SEC-001", title: "Role access posture", area: "Auth", status: "Healthy", severity: "Low", score: 91, note: "Role-based access checks are represented in protected demo flows." },
  { id: "SEC-002", title: "Public profile exposure", area: "Privacy", status: "Watch", severity: "Medium", score: 74, note: "Privacy controls exist, but public publish rules need production enforcement." },
  { id: "SEC-003", title: "Certificate lookup surface", area: "Trust", status: "Watch", severity: "Medium", score: 68, note: "Public verification should require issuer approval and anti-tamper records." },
  { id: "SEC-004", title: "Admin decision controls", area: "Moderation", status: "Protected", severity: "Low", score: 86, note: "Admin moderation actions remain locked in demo mode." },
];

const postureChecks = [
  { label: "Protected routes", status: "Healthy", helper: "Role-aware route protection is represented in the workspace." },
  { label: "Sensitive exports", status: "Protected", helper: "Export and publish actions are locked in demo mode." },
  { label: "Audit coverage", status: "Watch", helper: "More production-grade audit storage is still needed." },
  { label: "Secrets hygiene", status: "Watch", helper: "Production should verify keys, environment variables, and rotation policy." },
  { label: "Incident playbook", status: "Locked", helper: "Response actions are placeholder-only for now." },
];

const controlGroups = [
  { label: "Access control", status: "Healthy", count: 6 },
  { label: "Privacy controls", status: "Protected", count: 5 },
  { label: "Audit logging", status: "Watch", count: 4 },
  { label: "Moderation controls", status: "Protected", count: 4 },
];

const statusClass = (status: string) => {
  if (status === "Healthy" || status === "Protected") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Watch") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Priority") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function SecurityDashboardPanel() {
  const protectedItems = [...securitySignals, ...postureChecks, ...controlGroups].filter((item) => item.status === "Protected").length;
  const watchItems = [...securitySignals, ...postureChecks, ...controlGroups].filter((item) => item.status === "Watch").length;
  const healthyItems = [...securitySignals, ...postureChecks, ...controlGroups].filter((item) => item.status === "Healthy").length;
  const averageScore = Math.round(securitySignals.reduce((total, item) => total + item.score, 0) / securitySignals.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Healthy" value={healthyItems.toString()} helper="Controls" />
        <MetricCard label="Protected" value={protectedItems.toString()} helper="Items" />
        <MetricCard label="Watch" value={watchItems.toString()} helper="Items" danger={watchItems > 0} />
        <MetricCard label="Score" value={`${averageScore}%`} helper="Posture" danger={averageScore < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Security Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Security Dashboard
              </CardTitle>
              <CardDescription>
                Preview security posture, access signals, privacy exposure, audit coverage, control groups, and locked security actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Radar className="mr-2 h-4 w-4" /> Scan Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Enforce Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Security posture score</span>
              <span>{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo security dashboard only. Production security should enforce least-privilege access, secret rotation, audit retention, incident response, and privacy-safe monitoring.
          </div>
          <SecuritySignals />
          <div className="grid gap-4 xl:grid-cols-2">
            <PostureChecks />
            <ControlGroups />
          </div>
        </CardContent>
      </Card>
      <EdgeFunctionJWTRiskDashboardPanel />
    </div>
  );
}

function SecuritySignals() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4 text-primary" /> Security Signals</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{securitySignals.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.severity}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.area}</p><Progress value={item.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.score}% posture score</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function PostureChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Posture Checks</p><div className="mt-3 space-y-3">{postureChecks.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function ControlGroups() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-primary" /> Control Groups</p><div className="mt-3 space-y-3">{controlGroups.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} controls</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" /> Roles</span><span className="inline-flex items-center gap-1"><FileWarning className="h-3 w-3" /> Policy</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Audit</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
