import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect } from "react";
import { Activity, Zap, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SuperAdminPerformancePage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = usePerformanceMetrics();

  useEffect(() => { logAction("view_performance"); }, []);

  const top10 = (data || []).slice(0, 10);
  const avgP95 = top10.length > 0 ? Math.round(top10.reduce((s, m) => s + (m.p95_response_time ?? 0), 0) / top10.length) : 0;
  const avgErrorRate = top10.length > 0 ? (top10.reduce((s, m) => s + (m.error_rate ?? 0), 0) / top10.length).toFixed(2) : "0";
  const totalRequests = top10.reduce((s, m) => s + (m.request_count ?? 0), 0);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Global Performance Monitor</h1>
            <p className="text-sm text-muted-foreground">API latency, error rates, and throughput</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Avg p95 Latency", value: `${avgP95}ms`, icon: Clock, ok: avgP95 < 300 },
              { label: "Avg Error Rate", value: `${avgErrorRate}%`, icon: AlertTriangle, ok: parseFloat(avgErrorRate) < 2 },
              { label: "Total Requests", value: totalRequests.toLocaleString(), icon: Activity, ok: true },
              { label: "Endpoints Tracked", value: top10.length, icon: Zap, ok: true },
            ].map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 text-center">
                  <m.icon className={`h-5 w-5 mx-auto mb-2 ${m.ok ? "text-success" : "text-destructive"}`} />
                  <p className="text-xl font-bold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">p95 Response Time by Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-56" /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={top10} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="endpoint" type="category" width={120} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="p95_response_time" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="p95 (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {!isLoading && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Endpoint Detail</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {top10.map(m => (
                    <div key={m.id} className="grid grid-cols-5 gap-2 p-2 rounded hover:bg-muted/30 text-xs items-center">
                      <span className="col-span-2 font-mono truncate">{m.endpoint}</span>
                      <span>p95: {m.p95_response_time ?? "—"}ms</span>
                      <span>p99: {m.p99_response_time ?? "—"}ms</span>
                      <span className={`font-semibold ${(m.error_rate ?? 0) > 2 ? "text-destructive" : "text-success"}`}>
                        Err: {m.error_rate ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
