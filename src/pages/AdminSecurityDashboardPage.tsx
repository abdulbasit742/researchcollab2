import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRateLimitLogs,
  useSessionAuditLogs,
  useSecurityAuditLogs,
  useStorageSecurityLogs,
  useRlsAuditHistory,
} from "@/hooks/useSecurityDashboard";
import {
  Shield,
  Lock,
  AlertTriangle,
  Users,
  HardDrive,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

export default function AdminSecurityPage() {
  const rateLimits = useRateLimitLogs();
  const sessions = useSessionAuditLogs();
  const auditLogs = useSecurityAuditLogs();
  const storageLogs = useStorageSecurityLogs();
  const rlsAudit = useRlsAuditHistory();

  const blockedCount = rateLimits.data?.filter((r) => r.blocked).length || 0;
  const suspiciousSessions = sessions.data?.filter((s) => s.suspicious_flag).length || 0;
  const criticalEvents = auditLogs.data?.filter((l) => l.severity === "critical").length || 0;
  const storageRejections = storageLogs.data?.filter((s) => !s.mime_verified || !s.size_valid).length || 0;
  const rlsIssues = rlsAudit.data?.filter((r) => r.severity === "critical" || r.severity === "warning").length || 0;

  return (
    <MainLayout>
      <PageTransition>
        <PageHeader
          title="Security Dashboard"
          description="Rate limiting, session audit, security events, and storage validation."
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Security" },
          ]}
        />

        <div className="container px-4 py-6 max-w-6xl space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard icon={Shield} label="Rate Limit Blocks" value={blockedCount} status={blockedCount === 0 ? "pass" : "warning"} />
            <SummaryCard icon={Users} label="Suspicious Sessions" value={suspiciousSessions} status={suspiciousSessions === 0 ? "pass" : "fail"} />
            <SummaryCard icon={AlertTriangle} label="Critical Events" value={criticalEvents} status={criticalEvents === 0 ? "pass" : "fail"} />
            <SummaryCard icon={HardDrive} label="Storage Rejections" value={storageRejections} status={storageRejections === 0 ? "pass" : "warning"} />
            <SummaryCard icon={Lock} label="RLS Issues" value={rlsIssues} status={rlsIssues === 0 ? "pass" : "fail"} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Security Audit Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogs.isLoading ? (
                  <LoadingSkeleton />
                ) : !auditLogs.data?.length ? (
                  <EmptyState message="No security events recorded." />
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {auditLogs.data.map((log) => (
                      <div key={log.id} className="flex items-start justify-between gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold">{log.action_type}</span>
                            <SeverityBadge severity={log.severity} />
                          </div>
                          {log.entity_type && (
                            <p className="text-muted-foreground truncate">{log.entity_type}: {log.entity_id?.slice(0, 8)}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Audit */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Session Audit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.isLoading ? (
                  <LoadingSkeleton />
                ) : !sessions.data?.length ? (
                  <EmptyState message="No session data yet." />
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {sessions.data.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <code className="font-mono text-[10px] truncate max-w-[100px]">{s.user_id.slice(0, 8)}</code>
                          <span className="text-muted-foreground">{s.device_info || "unknown"}</span>
                          {s.suspicious_flag && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.logout_time ? (
                            <span className="text-muted-foreground">ended</span>
                          ) : (
                            <span className="text-success font-medium">active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rate Limit Violations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Rate Limit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rateLimits.isLoading ? (
                  <LoadingSkeleton />
                ) : !rateLimits.data?.length ? (
                  <EmptyState message="No rate limit events." />
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {rateLimits.data.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-[11px]">{r.endpoint}</code>
                          {r.blocked ? (
                            <XCircle className="h-3 w-3 text-destructive" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Storage Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {storageLogs.isLoading ? (
                  <LoadingSkeleton />
                ) : !storageLogs.data?.length ? (
                  <EmptyState message="No storage validation logs." />
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {storageLogs.data.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="truncate">{s.file_name || "unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {s.mime_verified ? <CheckCircle className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />}
                          {s.size_valid ? <CheckCircle className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

function SummaryCard({ icon: Icon, label, value, status }: { icon: any; label: string; value: number; status: "pass" | "fail" | "warning" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
            status === "pass" ? "bg-success/10" : status === "fail" ? "bg-destructive/10" : "bg-warning/10"
          }`}>
            <Icon className={`h-4 w-4 ${
              status === "pass" ? "text-success" : status === "fail" ? "text-destructive" : "text-warning"
            }`} />
          </div>
          <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity === "critical" ? "rejected" : severity === "warning" ? "submitted" : "pending";
  return <StatusBadge status={variant} size="sm" />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6">
      <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
