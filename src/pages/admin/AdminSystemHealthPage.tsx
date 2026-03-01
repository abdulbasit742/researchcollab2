import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useSystemHealth, useErrorLogs } from "@/hooks/useSystemHealth";
import { formatDistanceToNow } from "date-fns";

function getHealthColor(score: number) {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getHealthBadge(score: number) {
  if (score >= 90) return "default" as const;
  if (score >= 70) return "secondary" as const;
  return "destructive" as const;
}

export default function AdminSystemHealthPage() {
  const { data: metrics, isLoading: metricsLoading } = useSystemHealth();
  const { data: errors, isLoading: errorsLoading } = useErrorLogs(30);

  const overallScore = metrics && metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.health_score || 0), 0) / metrics.length)
    : null;

  return (
    <MainLayout>
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">System Health</h1>
              <p className="text-sm text-muted-foreground">
                Real-time platform monitoring and error tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Server className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">Overall Health</p>
              {metricsLoading ? (
                <Skeleton className="h-10 w-20 mx-auto" />
              ) : overallScore !== null ? (
                <p className={`text-4xl font-bold ${getHealthColor(overallScore)}`}>
                  {overallScore}
                </p>
              ) : (
                <p className="text-4xl font-bold text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground mb-1">Healthy Subsystems</p>
              <p className="text-4xl font-bold">
                {metrics ? metrics.filter(m => (m.health_score || 0) >= 90).length : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-muted-foreground mb-1">Recent Errors</p>
              <p className="text-4xl font-bold">
                {errors ? errors.length : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subsystem Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Subsystem Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : metrics && metrics.length > 0 ? (
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div
                    key={m.subsystem_name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        (m.health_score || 0) >= 90 ? "bg-green-500" :
                        (m.health_score || 0) >= 70 ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                      <span className="font-medium text-sm capitalize">
                        {m.subsystem_name.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {m.response_time_ms != null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {m.response_time_ms}ms
                        </span>
                      )}
                      <Badge variant={getHealthBadge(m.health_score || 0)}>
                        {m.health_score ?? 0}/100
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Server}
                title="No health data"
                description="Health metrics will appear once the monitoring system runs."
              />
            )}
          </CardContent>
        </Card>

        {/* Error Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Recent Error Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : errors && errors.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {errors.map((err) => (
                  <div key={err.id} className="p-3 rounded-lg border bg-card space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {err.endpoint}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(err.occurred_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-destructive">{err.error_message}</p>
                    {err.stack_trace && (
                      <pre className="text-[10px] text-muted-foreground bg-muted p-2 rounded overflow-x-auto max-h-24">
                        {err.stack_trace}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No errors"
                description="No errors have been logged recently."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
