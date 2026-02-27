/**
 * Infrastructure Stability Report — admin-only dashboard.
 * No new features. Only validation, scoring, and reporting.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, XCircle, Activity, RefreshCw } from "lucide-react";
import { runStabilityAudit, type StabilityReportResult, type SubsystemScore, type AuditCheck } from "@/lib/infrastructure/stabilityAudit";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  healthy: { color: "bg-emerald-500", badge: "default" as const, icon: CheckCircle, label: "Healthy" },
  warning: { color: "bg-amber-500", badge: "secondary" as const, icon: AlertTriangle, label: "Warning" },
  critical: { color: "bg-destructive", badge: "destructive" as const, icon: XCircle, label: "Critical" },
};

function SeverityIcon({ severity }: { severity: AuditCheck["severity"] }) {
  if (severity === "critical") return <XCircle className="h-4 w-4 text-destructive" />;
  if (severity === "warn") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle className="h-4 w-4 text-emerald-500" />;
}

function SubsystemCard({ subsystem }: { subsystem: SubsystemScore }) {
  const config = statusConfig[subsystem.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{subsystem.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{subsystem.score}</span>
            <Badge variant={config.badge}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={subsystem.score} className="h-2" />
        <div className="space-y-1.5 mt-3">
          {subsystem.checks.map((check, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {check.passed ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <SeverityIcon severity={check.severity} />
              )}
              <div>
                <span className={check.passed ? "text-muted-foreground" : "text-foreground font-medium"}>
                  {check.name}
                </span>
                <p className="text-muted-foreground">{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function InfrastructureStabilityReport() {
  const [report, setReport] = useState<StabilityReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setLoading(true);
    try {
      const result = await runStabilityAudit();
      setReport(result);
      toast({
        title: "Stability Audit Complete",
        description: `Overall Score: ${result.overallScore}/100 — ${result.overallStatus.toUpperCase()}`,
      });
    } catch (err) {
      toast({ title: "Audit Failed", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const overallConfig = report ? statusConfig[report.overallStatus] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Infrastructure Stability Report</h2>
            <p className="text-sm text-muted-foreground">
              Validates trust, escrow, RLS, messaging, and observability subsystems
            </p>
          </div>
        </div>
        <Button onClick={runAudit} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Auditing…" : "Run Audit"}
        </Button>
      </div>

      {!report && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Click "Run Audit" to validate infrastructure stability</p>
          </CardContent>
        </Card>
      )}

      {report && overallConfig && (
        <>
          {/* Overall Score */}
          <Card className="border-2" style={{ borderColor: `hsl(var(--${report.overallStatus === "healthy" ? "primary" : report.overallStatus === "warning" ? "accent" : "destructive"}))` }}>
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${overallConfig.color}`}>
                  <span className="text-2xl font-bold text-white">{report.overallScore}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Overall Stability: {overallConfig.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Generated {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant={overallConfig.badge} className="text-lg px-4 py-1">
                {report.overallScore}/100
              </Badge>
            </CardContent>
          </Card>

          {/* Subsystem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.subsystems.map((s) => (
              <SubsystemCard key={s.name} subsystem={s} />
            ))}
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommendations & Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
