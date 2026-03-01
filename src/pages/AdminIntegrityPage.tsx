import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIntegrityChecks,
  useRunIntegrityChecks,
  useRlsValidation,
  useRunRlsValidation,
  useExecutionFlowAudit,
  useFrontendErrors,
  useReconciliationReports,
} from "@/hooks/useIntegrityChecks";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Lock,
  Bug,
  FileWarning,
  Loader2,
} from "lucide-react";

function statusToVariant(status: string): string {
  if (status === "pass") return "approved";
  if (status === "fail") return "rejected";
  if (status === "warning") return "submitted";
  return "pending";
}

export default function AdminIntegrityPage() {
  const integrityChecks = useIntegrityChecks();
  const runChecks = useRunIntegrityChecks();
  const rlsValidation = useRlsValidation();
  const runRls = useRunRlsValidation();
  const flowAudit = useExecutionFlowAudit();
  const frontendErrors = useFrontendErrors();
  const reconciliation = useReconciliationReports();

  const failCount = integrityChecks.data?.filter((c) => c.status === "fail").length || 0;
  const warnCount = integrityChecks.data?.filter((c) => c.status === "warning").length || 0;
  const rlsFails = rlsValidation.data?.filter((r) => !r.rls_enabled).length || 0;
  const anomalyCount = flowAudit.data?.length || 0;
  const errorCount = frontendErrors.data?.length || 0;

  return (
    <MainLayout>
      <PageTransition>
        <PageHeader
          title="Platform Integrity"
          description="Automated QA checks, RLS validation, execution flow audit, and error monitoring."
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Integrity" },
          ]}
        >
          <Button
            size="sm"
            onClick={() => {
              runChecks.mutate();
              runRls.mutate();
            }}
            disabled={runChecks.isPending || runRls.isPending}
          >
            {runChecks.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All Checks
          </Button>
        </PageHeader>

        <div className="container px-4 py-6 max-w-6xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard
              icon={ShieldCheck}
              label="Integrity Failures"
              value={failCount}
              status={failCount === 0 ? "pass" : "fail"}
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Warnings"
              value={warnCount}
              status={warnCount === 0 ? "pass" : "warning"}
            />
            <SummaryCard
              icon={Lock}
              label="RLS Failures"
              value={rlsFails}
              status={rlsFails === 0 ? "pass" : "fail"}
            />
            <SummaryCard
              icon={FileWarning}
              label="Flow Anomalies"
              value={anomalyCount}
              status={anomalyCount === 0 ? "pass" : "warning"}
            />
            <SummaryCard
              icon={Bug}
              label="Frontend Errors"
              value={errorCount}
              status={errorCount === 0 ? "pass" : "warning"}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Integrity Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Integrity Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {integrityChecks.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !integrityChecks.data?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No integrity checks recorded. Click "Run All Checks" to start.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {integrityChecks.data.map((check) => (
                      <div
                        key={check.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold">{check.check_type}</span>
                            <StatusBadge status={statusToVariant(check.status)} size="sm" />
                          </div>
                          {check.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {check.description}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(check.detected_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RLS Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  RLS Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rlsValidation.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : !rlsValidation.data?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No RLS scan results. Click "Run All Checks" to validate.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {rlsValidation.data.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs border-b border-border/50 last:border-0"
                      >
                        <code className="font-mono text-[11px] truncate flex-1">
                          {r.table_name}
                        </code>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground">
                            {r.policy_count} {r.policy_count === 1 ? "policy" : "policies"}
                          </span>
                          {r.rls_enabled ? (
                            <CheckCircle className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Flow Anomalies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileWarning className="h-4 w-4" />
                  Execution Flow Anomalies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flowAudit.isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : !flowAudit.data?.length ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No anomalies detected</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {flowAudit.data.map((a) => (
                      <div key={a.id} className="p-2 rounded border text-xs">
                        <p className="font-medium text-destructive">{a.anomaly_description}</p>
                        <p className="text-muted-foreground mt-0.5">
                          {new Date(a.checked_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Frontend Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Frontend Errors (Recent)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {frontendErrors.isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : !frontendErrors.data?.length ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No frontend errors logged</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {frontendErrors.data.map((e) => (
                      <div key={e.id} className="p-2 rounded border text-xs">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <code className="font-mono text-destructive truncate flex-1">
                            {e.error_message}
                          </code>
                          <span className="text-muted-foreground shrink-0">
                            {e.route || "unknown"}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(e.occurred_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reconciliation Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reconciliation Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reconciliation.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !reconciliation.data?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No reconciliation reports yet. Nightly jobs will populate this.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Date</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Check</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Status</th>
                        <th className="py-2 font-medium text-muted-foreground">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliation.data.map((r) => (
                        <tr key={r.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4">{r.report_date}</td>
                          <td className="py-2 pr-4">{r.check_type}</td>
                          <td className="py-2 pr-4">
                            <StatusBadge status={statusToVariant(r.status)} size="sm" />
                          </td>
                          <td className="py-2 font-medium">
                            {r.issues_found}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: any;
  label: string;
  value: number;
  status: "pass" | "fail" | "warning";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
              status === "pass"
                ? "bg-success/10"
                : status === "fail"
                ? "bg-destructive/10"
                : "bg-warning/10"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                status === "pass"
                  ? "text-success"
                  : status === "fail"
                  ? "text-destructive"
                  : "text-warning"
              }`}
            />
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
