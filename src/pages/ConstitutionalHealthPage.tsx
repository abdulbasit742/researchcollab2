import { useConstitutionalGuardian } from "@/hooks/useConstitutionalGuardian";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, CheckCircle2, Activity, BarChart3, Scale, RefreshCw } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

export default function ConstitutionalHealthPage() {
  const {
    invariants,
    violations,
    activeViolations,
    auditLogs,
    biasRecords,
    concentrationData,
    healthScore,
    runAudit,
    loading,
  } = useConstitutionalGuardian();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  const gaugeData = [{ value: healthScore, fill: healthScore > 70 ? "hsl(var(--primary))" : healthScore > 40 ? "hsl(45, 90%, 50%)" : "hsl(0, 80%, 55%)" }];

  const trendData = (auditLogs || []).slice(0, 20).reverse().map((log: any, i: number) => ({
    time: format(new Date(log.created_at), "HH:mm"),
    anomaly: log.anomaly_score,
    system: log.system_checked,
  }));

  const concData = (concentrationData || []).reduce((acc: any[], m: any) => {
    const existing = acc.find((a) => a.type === m.metric_type);
    if (!existing) acc.push({ type: m.metric_type, index: m.concentration_index });
    return acc;
  }, []);

  const severityColor = (s: string) => {
    if (s === "critical") return "destructive";
    if (s === "high") return "destructive";
    return "secondary";
  };

  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-6 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Constitutional Health
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered platform integrity monitoring</p>
        </div>
        <Button onClick={() => runAudit.mutate()} disabled={runAudit.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${runAudit.isPending ? "animate-spin" : ""}`} />
          Run Audit
        </Button>
      </div>

      {/* Health Score + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Platform Integrity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="text-3xl font-bold -mt-8">{healthScore}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Active Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold">{activeViolations.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {activeViolations.filter((v: any) => v.severity_level === "critical").length} critical
            </p>
            <div className="mt-3 space-y-1">
              {activeViolations.slice(0, 3).map((v: any) => (
                <div key={v.id} className="flex items-center gap-2 text-sm">
                  <Badge variant={severityColor(v.severity_level)} className="text-xs">
                    {v.severity_level}
                  </Badge>
                  <span className="truncate">{v.constitutional_invariants?.invariant_name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Invariants Monitored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold">{invariants?.length || 0}</div>
            <div className="mt-3 space-y-2">
              {(invariants || []).slice(0, 4).map((inv: any) => (
                <div key={inv.id} className="text-sm text-muted-foreground truncate">
                  • {inv.invariant_name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trend + Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" /> Anomaly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="anomaly" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No audit data yet. Run an audit to begin.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Concentration Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {concData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={concData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="index" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No concentration data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bias + Violations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-4 w-4" /> Bias Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(biasRecords || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No bias records yet.</p>
              )}
              {(biasRecords || []).slice(0, 5).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{b.algorithm_name}</p>
                    <p className="text-xs text-muted-foreground">{b.affected_group}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold">{(b.bias_score || 0).toFixed(3)}</span>
                    <p className="text-xs text-muted-foreground">{format(new Date(b.detected_at), "MMM d")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Violation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(violations || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No violations detected.</p>
              )}
              {(violations || []).slice(0, 6).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Badge variant={severityColor(v.severity_level)} className="text-xs">
                      {v.severity_level}
                    </Badge>
                    <span className="text-sm">{v.constitutional_invariants?.invariant_name || "Unknown"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm">{(v.detected_value || 0).toFixed(2)}</span>
                    {v.resolved_at && (
                      <Badge variant="outline" className="ml-2 text-xs">Resolved</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  );
}
