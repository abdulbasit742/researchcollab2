import { useState, useEffect, useMemo, useCallback } from "react";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, Zap, Server, Wifi, HardDrive } from "lucide-react";

interface DiagnosticStats {
  recentErrors: number;
  recentRequests: number;
  avgLatency: number;
  activeConnections: number;
  queueDepth: number;
  loadLevel: string;
}

export default function SuperAdminDiagnosticsPage() {
  const [stats, setStats] = useState<DiagnosticStats>({
    recentErrors: 0, recentRequests: 0, avgLatency: 0,
    activeConnections: 0, queueDepth: 0, loadLevel: "normal",
  });
  const [errors, setErrors] = useState<any[]>([]);
  const [slowEndpoints, setSlowEndpoints] = useState<any[]>([]);

  const fetchDiagnostics = useCallback(async () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    const [errRes, traceRes, latencyRes, queueRes, loadRes, errListRes] = await Promise.all([
      (supabase as any).from("error_registry").select("id", { count: "exact", head: true }).gte("last_seen", fiveMinAgo),
      (supabase as any).from("request_traces").select("duration_ms").gte("created_at", fiveMinAgo),
      (supabase as any).from("endpoint_latency_metrics").select("*").order("recorded_at", { ascending: false }).limit(10),
      (supabase as any).from("request_processing_queue").select("id", { count: "exact", head: true }).in("status", ["queued", "processing"]),
      (supabase as any).from("system_load_state").select("current_load_level").order("detected_at", { ascending: false }).limit(1),
      (supabase as any).from("error_registry").select("*").order("last_seen", { ascending: false }).limit(10),
    ]);

    const traces = traceRes.data ?? [];
    const avgLat = traces.length > 0 ? Math.round(traces.reduce((s: number, t: any) => s + (t.duration_ms ?? 0), 0) / traces.length) : 0;

    setStats({
      recentErrors: errRes.count ?? 0,
      recentRequests: traces.length,
      avgLatency: avgLat,
      activeConnections: 0,
      queueDepth: queueRes.count ?? 0,
      loadLevel: loadRes.data?.[0]?.current_load_level ?? "normal",
    });
    setErrors(errListRes.data ?? []);
    setSlowEndpoints((latencyRes.data ?? []).filter((e: any) => (e.p95_ms ?? 0) > 500));
  }, []);

  useEffect(() => {
    fetchDiagnostics();
    const iv = setInterval(fetchDiagnostics, 15_000);
    return () => clearInterval(iv);
  }, [fetchDiagnostics]);

  const loadColor = useMemo(() => {
    switch (stats.loadLevel) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "elevated": return "secondary";
      default: return "default";
    }
  }, [stats.loadLevel]);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">System Diagnostics</h1>
            <p className="text-sm text-muted-foreground">Real-time platform health monitoring</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Requests (5m)", value: stats.recentRequests, icon: Activity },
              { label: "Errors (5m)", value: stats.recentErrors, icon: AlertTriangle },
              { label: "Avg Latency", value: `${stats.avgLatency}ms`, icon: Zap },
              { label: "Queue Depth", value: stats.queueDepth, icon: Server },
              { label: "Connections", value: stats.activeConnections, icon: Wifi },
              { label: "Load Level", value: stats.loadLevel, icon: HardDrive },
            ].map((m) => (
              <Card key={m.label}>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-lg font-bold">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                {errors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent errors</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {errors.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between border-b pb-1">
                        <div>
                          <p className="text-xs font-medium">{e.error_type}</p>
                          <p className="text-[10px] text-muted-foreground">{e.route ?? "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-[10px]">×{e.frequency}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Slow Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                {slowEndpoints.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No slow endpoints detected</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {slowEndpoints.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between border-b pb-1">
                        <p className="text-xs font-medium">{e.endpoint}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-[10px]">p95: {e.p95_ms}ms</Badge>
                          <Badge variant="outline" className="text-[10px]">p99: {e.p99_ms}ms</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Load</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={loadColor as any} className="text-sm px-3 py-1">
                {stats.loadLevel.toUpperCase()}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.loadLevel === "normal" ? "All systems operating normally." :
                 stats.loadLevel === "elevated" ? "Slightly elevated load. Monitoring." :
                 stats.loadLevel === "high" ? "High load detected. Non-essential features may be deferred." :
                 "Critical load. Degradation mode active."}
              </p>
            </CardContent>
          </Card>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
