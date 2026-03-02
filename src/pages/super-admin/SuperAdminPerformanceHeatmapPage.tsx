import { useState, useEffect } from "react";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SuperAdminPerformanceHeatmapPage() {
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [storageStats, setStorageStats] = useState({ avgUpload: 0, failRate: 0, totalOps: 0 });

  useEffect(() => {
    const load = async () => {
      const [latRes, storRes] = await Promise.all([
        (supabase as any).from("endpoint_latency_metrics").select("*").order("recorded_at", { ascending: false }).limit(20),
        (supabase as any).from("storage_operation_logs").select("upload_duration_ms, success_flag").limit(500),
      ]);

      setLatencyData((latRes.data ?? []).map((d: any) => ({
        endpoint: d.endpoint?.split("/").pop() ?? d.endpoint,
        avg: d.avg_response_ms ?? 0,
        p95: d.p95_ms ?? 0,
        p99: d.p99_ms ?? 0,
      })));

      const ops = storRes.data ?? [];
      const total = ops.length;
      const fails = ops.filter((o: any) => !o.success_flag).length;
      const avgDur = total > 0 ? Math.round(ops.reduce((s: number, o: any) => s + (o.upload_duration_ms ?? 0), 0) / total) : 0;
      setStorageStats({ avgUpload: avgDur, failRate: total > 0 ? Math.round((fails / total) * 100) : 0, totalOps: total });
    };
    load();
  }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Performance Heatmap</h1>
            <p className="text-sm text-muted-foreground">Endpoint latency and storage performance</p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Endpoint Latency Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {latencyData.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">No latency data recorded yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="endpoint" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" name="Avg (ms)" />
                    <Bar dataKey="p95" fill="hsl(var(--muted-foreground))" name="P95 (ms)" />
                    <Bar dataKey="p99" fill="hsl(var(--destructive))" name="P99 (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-[10px] text-muted-foreground">Avg Upload Duration</p>
                <p className="text-2xl font-bold">{storageStats.avgUpload}ms</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-[10px] text-muted-foreground">Upload Failure Rate</p>
                <p className="text-2xl font-bold">{storageStats.failRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-[10px] text-muted-foreground">Total Storage Ops</p>
                <p className="text-2xl font-bold">{storageStats.totalOps}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
