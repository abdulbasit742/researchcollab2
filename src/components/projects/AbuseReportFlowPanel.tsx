import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, ClipboardList, FileWarning, Flag, Lock, MessageSquareWarning, ShieldAlert, ShieldCheck } from "lucide-react";

const reportQueue = [
  { id: "REP-001", category: "Spam or fake listing", source: "Opportunities", status: "Triage", severity: "Medium", score: 72, note: "Listing authenticity and repeated posts need review." },
  { id: "REP-002", category: "Harassment concern", source: "Team chat", status: "Escalated", severity: "High", score: 88, note: "Moderator review and user safety steps should be prioritized." },
  { id: "REP-003", category: "Suspicious certificate", source: "Certificates", status: "Needs Evidence", severity: "Medium", score: 64, note: "Issuer proof and audit trail should be attached." },
  { id: "REP-004", category: "Privacy issue", source: "Public profile", status: "Protected", severity: "High", score: 91, note: "Sensitive profile data is hidden in demo mode." },
];

const triageSteps = [
  { label: "Receive report", status: "Complete", helper: "Reporter category and source are captured." },
  { label: "Check evidence", status: "Needs Evidence", helper: "Screenshots, links, and audit events should be attached." },
  { label: "Protect affected user", status: "Protected", helper: "Private details should remain hidden during review." },
  { label: "Moderator review", status: "Triage", helper: "Admin moderation queue will handle final decision." },
  { label: "Escalation action", status: "Locked", helper: "Production escalation needs policy rules and permissions." },
];

const safetyChecks = [
  { label: "Reporter privacy", status: "Protected", helper: "Reporter identity should be restricted to authorized reviewers." },
  { label: "Evidence redaction", status: "Needs Evidence", helper: "Evidence must be reviewed for sensitive data before sharing." },
  { label: "Repeat offender flag", status: "Triage", helper: "Audit log can connect repeat patterns later." },
  { label: "Resolution notice", status: "Locked", helper: "Notifications are placeholder-only for now." },
];

const statusClass = (status: string) => {
  if (status === "Complete" || status === "Protected") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Triage" || status === "Needs Evidence") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Escalated") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function AbuseReportFlowPanel() {
  const protectedCount = [...reportQueue, ...triageSteps, ...safetyChecks].filter((item) => item.status === "Protected").length;
  const evidenceNeeded = [...reportQueue, ...triageSteps, ...safetyChecks].filter((item) => item.status === "Needs Evidence").length;
  const escalated = reportQueue.filter((report) => report.status === "Escalated").length;
  const averageRisk = Math.round(reportQueue.reduce((total, report) => total + report.score, 0) / reportQueue.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Reports" value={reportQueue.length.toString()} helper="Demo queue" />
        <MetricCard label="Protected" value={protectedCount.toString()} helper="Items" />
        <MetricCard label="Evidence" value={evidenceNeeded.toString()} helper="Needed" danger={evidenceNeeded > 0} />
        <MetricCard label="Risk" value={`${averageRisk}%`} helper="Average" danger={averageRisk > 75} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Report Flow Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Abuse Report Flow
              </CardTitle>
              <CardDescription>
                Preview report intake, categories, severity labels, evidence checks, safety protections, and locked moderator actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Flag className="mr-2 h-4 w-4" /> Escalate Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Resolve Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Average report risk</span>
              <span>{averageRisk}%</span>
            </div>
            <Progress value={averageRisk} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo abuse report flow only. Production moderation should enforce user safety, reporter privacy, evidence redaction, policy review, audit logging, and appeal handling.
          </div>
          <ReportQueue escalated={escalated} />
          <div className="grid gap-4 xl:grid-cols-2">
            <TriageSteps />
            <SafetyChecks />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportQueue({ escalated }: { escalated: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><MessageSquareWarning className="h-4 w-4 text-primary" /> Report Queue</p><p className="mt-1 text-xs text-muted-foreground">{escalated} report is escalated for high-priority review.</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{reportQueue.map((report) => <div key={report.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(report.status)}>{report.status}</Badge><Badge variant="outline">{report.severity}</Badge><Badge variant="secondary">{report.id}</Badge></div><p className="mt-2 font-medium">{report.category}</p><p className="text-xs text-muted-foreground">{report.source}</p><Progress value={report.score} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{report.score}% severity score</p><p className="mt-2 text-muted-foreground">{report.note}</p></div>)}</div></div>;
}

function TriageSteps() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ClipboardList className="h-4 w-4 text-primary" /> Triage Steps</p><div className="mt-3 space-y-3">{triageSteps.map((step) => <div key={step.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(step.status)}>{step.status}</Badge><p className="font-medium">{step.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{step.helper}</p></div>)}</div></div>;
}

function SafetyChecks() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Safety Checks</p><div className="mt-3 space-y-3">{safetyChecks.map((check) => <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(check.status)}>{check.status}</Badge><p className="font-medium">{check.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{check.helper}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Triage</span><span className="inline-flex items-center gap-1"><FileWarning className="h-3 w-3" /> Evidence</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Review</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
