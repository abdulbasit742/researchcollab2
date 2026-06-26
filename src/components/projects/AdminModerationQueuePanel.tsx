import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SecurityDashboardPanel } from "@/components/projects/SecurityDashboardPanel";
import { ClipboardCheck, Clock3, Eye, FileCheck2, Lock, Scale, ShieldCheck, UserCog, UsersRound } from "lucide-react";

const moderationCases = [
  { id: "MOD-001", title: "Listing quality review", queue: "Opportunities", assignee: "Admin Demo", status: "In Review", priority: "Medium", readiness: 74, note: "Check listing source, eligibility notes, and repeated content signals." },
  { id: "MOD-002", title: "User conduct review", queue: "Team area", assignee: "Safety Admin", status: "Priority", priority: "High", readiness: 88, note: "Review reporter privacy, evidence redaction, and temporary safeguards." },
  { id: "MOD-003", title: "Certificate issuer review", queue: "Certificates", assignee: "Trust Admin", status: "Needs Evidence", priority: "Medium", readiness: 61, note: "Issuer approval and audit trail evidence need to be attached." },
  { id: "MOD-004", title: "Profile visibility review", queue: "Public profile", assignee: "Privacy Admin", status: "Protected", priority: "High", readiness: 92, note: "Private profile data is protected while visibility settings are reviewed." },
];

const decisionStates = [
  { label: "Review evidence", status: "In Review", helper: "Moderator checks reports, audit events, and attached proof." },
  { label: "Apply temporary protection", status: "Protected", helper: "Protects users while the case is reviewed." },
  { label: "Request more evidence", status: "Needs Evidence", helper: "Asks for safer evidence before final decision." },
  { label: "Final decision", status: "Locked", helper: "Production decisions need policy rules, roles, and audit trail." },
];

const queueHealth = [
  { label: "Assigned cases", status: "Ready", count: 4 },
  { label: "Needs evidence", status: "Needs Evidence", count: 2 },
  { label: "Priority cases", status: "Priority", count: 1 },
  { label: "Protected cases", status: "Protected", count: 1 },
];

const statusClass = (status: string) => {
  if (status === "Ready" || status === "Protected") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "In Review" || status === "Needs Evidence") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Priority") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function AdminModerationQueuePanel() {
  const protectedCases = moderationCases.filter((item) => item.status === "Protected").length;
  const evidenceNeeded = [...moderationCases, ...decisionStates].filter((item) => item.status === "Needs Evidence").length;
  const priorityCases = [...moderationCases, ...queueHealth].filter((item) => item.status === "Priority").length;
  const averageReadiness = Math.round(moderationCases.reduce((total, item) => total + item.readiness, 0) / moderationCases.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Cases" value={moderationCases.length.toString()} helper="Demo queue" />
        <MetricCard label="Protected" value={protectedCases.toString()} helper="Cases" />
        <MetricCard label="Evidence" value={evidenceNeeded.toString()} helper="Needed" danger={evidenceNeeded > 0} />
        <MetricCard label="Priority" value={priorityCases.toString()} helper="Cases" danger={priorityCases > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Admin Queue Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" /> Admin Moderation Queue
              </CardTitle>
              <CardDescription>
                Preview assigned cases, priority labels, evidence readiness, decision states, queue health, and locked admin actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Eye className="mr-2 h-4 w-4" /> Review Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Decide Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average case readiness</span>
              <span>{averageReadiness}%</span>
            </div>
            <Progress value={averageReadiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo admin moderation queue only. Production moderation should enforce role permissions, policy review, evidence redaction, appeal windows, and audit logging.
          </div>
          <ModerationCases />
          <div className="grid gap-4 xl:grid-cols-2">
            <DecisionStates />
            <QueueHealth />
          </div>
        </CardContent>
      </Card>
      <SecurityDashboardPanel />
    </div>
  );
}

function ModerationCases() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardCheck className="h-4 w-4 text-primary" /> Case Queue</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{moderationCases.map((item) => <div key={item.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.priority}</Badge><Badge variant="secondary">{item.id}</Badge></div><p className="mt-2 font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.queue} · {item.assignee}</p><Progress value={item.readiness} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{item.readiness}% case readiness</p><p className="mt-2 text-muted-foreground">{item.note}</p></div>)}</div></div>;
}

function DecisionStates() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Scale className="h-4 w-4 text-primary" /> Decision States</p><div className="mt-3 space-y-3">{decisionStates.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><p className="font-medium">{item.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{item.helper}</p></div>)}</div></div>;
}

function QueueHealth() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Queue Health</p><div className="mt-3 space-y-3">{queueHealth.map((item) => <div key={item.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(item.status)}>{item.status}</Badge><Badge variant="outline">{item.count} items</Badge></div><p className="mt-2 font-medium">{item.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><UsersRound className="h-3 w-3" /> Admin</span><span className="inline-flex items-center gap-1"><FileCheck2 className="h-3 w-3" /> Evidence</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> SLA</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
