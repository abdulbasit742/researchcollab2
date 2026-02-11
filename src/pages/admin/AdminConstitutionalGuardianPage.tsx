import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useConstitutionalGuardian } from "@/hooks/useConstitutionalGuardian";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminConstitutionalGuardianPage() {
  const {
    invariants,
    activeViolations,
    auditLogs,
    biasRecords,
    concentrationData,
    healthScore,
    runAudit,
    resolveViolation,
    loading,
  } = useConstitutionalGuardian();

  const handleResolve = (id: string) => {
    resolveViolation.mutate(id, {
      onSuccess: () => toast.success("Violation resolved"),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Constitutional Guardian
            </h1>
            <p className="text-sm text-muted-foreground">Platform integrity oversight & violation management</p>
          </div>
          <Button onClick={() => runAudit.mutate()} disabled={runAudit.isPending} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${runAudit.isPending ? "animate-spin" : ""}`} />
            Run Audit
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Health Score</p>
              <p className="text-3xl font-bold">{healthScore}/100</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Violations</p>
              <p className="text-3xl font-bold text-destructive">{activeViolations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Audits Run</p>
              <p className="text-3xl font-bold">{auditLogs?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Bias Records</p>
              <p className="text-3xl font-bold">{biasRecords?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Violations */}
        <Card>
          <CardHeader>
            <CardTitle>Active Violations</CardTitle>
          </CardHeader>
          <CardContent>
            {activeViolations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                No active violations. Platform is healthy.
              </p>
            ) : (
              <div className="space-y-3">
                {activeViolations.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant={v.severity_level === "critical" ? "destructive" : "secondary"}>
                        {v.severity_level}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{v.constitutional_invariants?.invariant_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Value: {(v.detected_value || 0).toFixed(2)} · {format(new Date(v.created_at), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(v.id)}>
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Concentration + Recent Audits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Concentration Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(concentrationData || []).slice(0, 10).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{m.metric_type}</span>
                    <span className="font-mono">{(m.concentration_index || 0).toFixed(2)}%</span>
                  </div>
                ))}
                {!(concentrationData || []).length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(auditLogs || []).slice(0, 8).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span>{log.system_checked}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{(log.anomaly_score || 0).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
                {!(auditLogs || []).length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No audits yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
