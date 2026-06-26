import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ModerationReportFlowPanel } from "@/components/projects/ModerationReportFlowPanel";
import { Activity, Archive, CheckCircle2, Clock3, Download, FileClock, Lock, ShieldCheck, UserCog } from "lucide-react";

const auditEvents = [
  { id: "AUD-001", actor: "Student Demo", action: "Portfolio preview opened", area: "Portfolio", status: "Logged", risk: "Low", integrity: 96, time: "2 min ago" },
  { id: "AUD-002", actor: "Supervisor Demo", action: "Review note added", area: "Evaluation", status: "Logged", risk: "Low", integrity: 91, time: "14 min ago" },
  { id: "AUD-003", actor: "Admin Demo", action: "Certificate verify check", area: "Certificates", status: "Needs Review", risk: "Medium", integrity: 72, time: "1 hour ago" },
  { id: "AUD-004", actor: "System Demo", action: "Export attempt blocked", area: "Privacy", status: "Blocked", risk: "High", integrity: 58, time: "Today" },
];

const integrityChecks = [
  { label: "Actor identity", status: "Logged", helper: "Demo actor names are attached to each event." },
  { label: "Timestamp order", status: "Logged", helper: "Events include readable demo timestamps." },
  { label: "Permission context", status: "Needs Review", helper: "Production should connect role and tenant permissions." },
  { label: "Export attempt trail", status: "Blocked", helper: "Blocked actions should keep audit notes without exposing private data." },
  { label: "Immutable storage", status: "Locked", helper: "Tamper-resistant storage is placeholder-only for now." },
];

const retentionRules = [
  { label: "Profile changes", period: "180 days", status: "Preview" },
  { label: "Certificate checks", period: "1 year", status: "Preview" },
  { label: "Admin actions", period: "2 years", status: "Needs Review" },
  { label: "Security events", period: "2 years", status: "Needs Review" },
];

const statusClass = (status: string) => {
  if (status === "Logged") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "Needs Review" || status === "Preview") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "Blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export function AuditLogServicePanel() {
  const logged = auditEvents.filter((event) => event.status === "Logged").length;
  const reviewItems = [...auditEvents, ...integrityChecks, ...retentionRules].filter((item) => item.status === "Needs Review").length;
  const blocked = [...auditEvents, ...integrityChecks].filter((item) => item.status === "Blocked").length;
  const averageIntegrity = Math.round(auditEvents.reduce((total, event) => total + event.integrity, 0) / auditEvents.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Events" value={auditEvents.length.toString()} helper="Demo logs" />
        <MetricCard label="Logged" value={logged.toString()} helper="Events" />
        <MetricCard label="Review" value={reviewItems.toString()} helper="Items" danger={reviewItems > 0} />
        <MetricCard label="Integrity" value={`${averageIntegrity}%`} helper="Average" danger={averageIntegrity < 80} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/30">Audit Preview</Badge>
              <CardTitle className="flex items-center gap-2">
                <FileClock className="h-5 w-5 text-primary" /> Audit Log Service
              </CardTitle>
              <CardDescription>
                Preview event history, actor actions, risk labels, integrity checks, retention rules, and locked audit export controls.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" /> Export Locked
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Configure Locked
              </Button>
            </div>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Audit integrity score</span>
              <span>{averageIntegrity}%</span>
            </div>
            <Progress value={averageIntegrity} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            Demo audit log service only. Production audit logs should use tamper-resistant storage, strict permissions, retention policies, privacy redaction, and verified timestamps.
          </div>
          <AuditEvents />
          <div className="grid gap-4 xl:grid-cols-2">
            <IntegrityChecks blocked={blocked} />
            <RetentionRules />
          </div>
        </CardContent>
      </Card>
      <ModerationReportFlowPanel />
    </div>
  );
}

function AuditEvents() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4 text-primary" /> Audit Events</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{auditEvents.map((event) => <div key={event.id} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(event.status)}>{event.status}</Badge><Badge variant="outline">{event.risk}</Badge><Badge variant="secondary">{event.id}</Badge></div><p className="mt-2 font-medium">{event.action}</p><p className="text-xs text-muted-foreground">{event.actor} · {event.area} · {event.time}</p><Progress value={event.integrity} className="mt-3 h-2" /><p className="mt-1 text-xs text-muted-foreground">{event.integrity}% integrity</p></div>)}</div></div>;
}

function IntegrityChecks({ blocked }: { blocked: number }) {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-primary" /> Integrity Checks</p><p className="mt-1 text-xs text-muted-foreground">{blocked} blocked audit item requires review.</p><div className="mt-3 space-y-3">{integrityChecks.map((check) => <div key={check.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(check.status)}>{check.status}</Badge><p className="font-medium">{check.label}</p></div><p className="mt-1 text-xs text-muted-foreground">{check.helper}</p></div>)}</div></div>;
}

function RetentionRules() {
  return <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-sm font-medium"><Archive className="h-4 w-4 text-primary" /> Retention Rules</p><div className="mt-3 space-y-3">{retentionRules.map((rule) => <div key={rule.label} className="rounded-lg border bg-muted/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge className={statusClass(rule.status)}>{rule.status}</Badge><Badge variant="outline" className="gap-1"><Clock3 className="h-3 w-3" /> {rule.period}</Badge></div><p className="mt-2 font-medium">{rule.label}</p></div>)}</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3"><span className="inline-flex items-center gap-1"><UserCog className="h-3 w-3" /> Actor</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Action</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Integrity</span></div></div>;
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return <Card className={danger ? "border-amber-500/30" : undefined}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p><p className="text-xs text-muted-foreground">{helper}</p></CardContent></Card>;
}
