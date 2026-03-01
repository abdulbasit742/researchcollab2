import { useComplianceAuditLog } from "@/hooks/useComplianceAuditLog";
import { useComplianceHealth } from "@/hooks/useComplianceHealth";
import { useComplianceFlags } from "@/hooks/useComplianceFlags";
import { useRegulatoryReports } from "@/hooks/useRegulatoryReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Shield, FileText, AlertTriangle, CheckCircle2, Clock, Activity, Download, Users,
} from "lucide-react";
import { toast } from "sonner";

const DEMO_INSTITUTION_ID = "00000000-0000-0000-0000-000000000001";

const REPORT_TYPES = [
  { type: "milestone_lifecycle", label: "Milestone Lifecycle" },
  { type: "dispute_history", label: "Dispute History" },
  { type: "review_accountability", label: "Review Accountability" },
  { type: "user_performance", label: "User Performance Summary" },
  { type: "data_access_log", label: "Data Access Log" },
  { type: "security_events", label: "Security Events" },
];

function complianceColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-destructive";
}

function complianceLabel(score: number) {
  if (score >= 80) return "Compliant";
  if (score >= 50) return "Needs Improvement";
  return "At Risk";
}

export default function GovernanceOversightPage() {
  const institutionId = DEMO_INSTITUTION_ID;
  const { data: auditLog = [], isLoading: logLoading } = useComplianceAuditLog(institutionId, 20);
  const { data: health } = useComplianceHealth(institutionId);
  const { data: flags = [] } = useComplianceFlags(institutionId);
  const { reports, requestReport } = useRegulatoryReports(institutionId);

  const handleRequestReport = (type: string) => {
    requestReport(type);
    toast.success("Report requested");
  };

  const healthScores = health
    ? [
        { label: "Audit Completeness", value: health.audit_completeness_score },
        { label: "Dispute Transparency", value: health.dispute_transparency_score },
        { label: "Review Accountability", value: health.review_accountability_score },
        { label: "Role Integrity", value: health.role_integrity_score },
        { label: "Data Access Traceability", value: health.data_access_traceability_score },
      ]
    : [];

  const criticalFlags = flags.filter((f) => f.severity === "critical" || f.severity === "high");

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Governance Oversight
        </h1>
        <p className="text-sm text-muted-foreground">Compliance health, audit trail, and regulatory reporting</p>
      </div>

      {/* Compliance Health Score */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Compliance Health</CardTitle>
            {health && (
              <Badge variant="outline" className={complianceColor(health.overall_compliance_score)}>
                {health.overall_compliance_score.toFixed(0)}% — {complianceLabel(health.overall_compliance_score)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {healthScores.map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg font-bold ${complianceColor(s.value)}`}>{s.value.toFixed(0)}%</p>
                  <Progress value={s.value} className="h-1.5 mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No compliance data available yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compliance Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Compliance Flags
              {criticalFlags.length > 0 && (
                <Badge variant="destructive" className="text-[10px]">{criticalFlags.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No flags detected.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {flags.slice(0, 15).map((f) => (
                  <div key={f.id} className="flex items-start justify-between p-2 rounded border border-border text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{f.flag_type.replace(/_/g, " ")}</p>
                      {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        f.severity === "critical" ? "border-destructive/30 text-destructive" :
                        f.severity === "high" ? "border-amber-500/30 text-amber-600" :
                        "border-muted-foreground/30 text-muted-foreground"
                      }
                    >
                      {f.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regulatory Reports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Regulatory Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {REPORT_TYPES.map((r) => (
              <div key={r.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{r.label}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleRequestReport(r.type)}>
                  Generate
                </Button>
              </div>
            ))}
            {reports.length > 0 && (
              <>
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Recent Reports</p>
                {reports.slice(0, 5).map((rp) => (
                  <div key={rp.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{rp.report_type.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className={rp.status === "completed" ? "border-emerald-500/30 text-emerald-600" : ""}>
                      {rp.status}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Compliance Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No audit events recorded yet.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {auditLog.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-2 rounded text-sm hover:bg-muted/30">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{entry.action_type.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground"> on </span>
                    <span className="text-foreground">{entry.entity_type}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
