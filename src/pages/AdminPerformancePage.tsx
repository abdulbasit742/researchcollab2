import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceMetrics, useAnalyticsCache } from "@/hooks/usePerformanceMetrics";
import { Activity, Database, Clock, Zap, CheckCircle } from "lucide-react";
import { useMemo } from "react";

export default function AdminPerformancePage() {
  const metrics = usePerformanceMetrics();
  const cache = useAnalyticsCache();

  const summary = useMemo(() => {
    if (!metrics.data?.length) return null;
    const endpoints = new Set(metrics.data.map((m) => m.endpoint));
    const avgLatency =
      metrics.data.reduce((s, m) => s + (m.avg_response_time || 0), 0) / metrics.data.length;
    const totalRequests = metrics.data.reduce((s, m) => s + m.request_count, 0);
    const avgErrorRate =
      metrics.data.reduce((s, m) => s + (m.error_rate || 0), 0) / metrics.data.length;
    return { endpoints: endpoints.size, avgLatency, totalRequests, avgErrorRate };
  }, [metrics.data]);

  const activeCaches = useMemo(() => {
    if (!cache.data) return 0;
    const now = new Date();
    return cache.data.filter((c) => new Date(c.expires_at) > now).length;
  }, [cache.data]);

  return (
    <MainLayout>
      <PageTransition>
        <PageHeader
          title="Performance Monitor"
          description="API throughput, latency metrics, and cache status."
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Performance" },
          ]}
        />

        <div className="container px-4 py-6 max-w-6xl space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              icon={Activity}
              label="Tracked Endpoints"
              value={summary?.endpoints ?? "—"}
            />
            <SummaryCard
              icon={Clock}
              label="Avg Latency"
              value={summary ? `${summary.avgLatency.toFixed(0)}ms` : "—"}
            />
            <SummaryCard
              icon={Zap}
              label="Total Requests"
              value={summary?.totalRequests.toLocaleString() ?? "—"}
            />
            <SummaryCard
              icon={Database}
              label="Active Caches"
              value={activeCaches}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Endpoint Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Endpoint Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : !metrics.data?.length ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No performance data recorded yet. Metrics populate as the platform is used.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 pr-3 font-medium text-muted-foreground">Endpoint</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground">Avg</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground">P95</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground">P99</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground">Reqs</th>
                          <th className="py-2 font-medium text-muted-foreground">Err%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.data.slice(0, 30).map((m) => (
                          <tr key={m.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                            <td className="py-1.5 pr-3 font-mono truncate max-w-[180px]">{m.endpoint}</td>
                            <td className="py-1.5 pr-3">{m.avg_response_time?.toFixed(0) ?? "—"}ms</td>
                            <td className="py-1.5 pr-3">{m.p95_response_time?.toFixed(0) ?? "—"}ms</td>
                            <td className="py-1.5 pr-3">{m.p99_response_time?.toFixed(0) ?? "—"}ms</td>
                            <td className="py-1.5 pr-3">{m.request_count}</td>
                            <td className="py-1.5">
                              <span className={m.error_rate > 5 ? "text-destructive font-medium" : ""}>
                                {m.error_rate?.toFixed(1) ?? 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cache Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Analytics Cache Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cache.isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : !cache.data?.length ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No cached entries. Cache populates during analytics queries.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {cache.data.map((c, i) => {
                      const isExpired = new Date(c.expires_at) < new Date();
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs border-b border-border/50 last:border-0"
                        >
                          <code className="font-mono text-[11px] truncate flex-1">
                            {c.cache_key}
                          </code>
                          <span className={`shrink-0 ${isExpired ? "text-destructive" : "text-success"}`}>
                            {isExpired ? "expired" : "active"}
                          </span>
                        </div>
                      );
                    })}
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

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
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
