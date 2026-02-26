/**
 * Capital Performance Tracker — ROI, default rate, and deployment duration per pool.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("performanceTracker");

export interface PoolPerformance {
  poolId: string;
  totalDeployed: number;
  totalReturned: number;
  roi: number;
  defaultRate: number;
  avgDeploymentTimeHours: number;
  activeAllocations: number;
}

export async function calculatePoolPerformance(poolId: string): Promise<PoolPerformance> {
  const { data: allocations } = await (supabase as any)
    .from("pool_allocations")
    .select("amount, status, allocated_at, released_at, return_amount")
    .eq("pool_id", poolId);

  const allocs = allocations ?? [];
  const totalDeployed = allocs.reduce((s: number, a: any) => s + (a.amount ?? 0), 0);
  const released = allocs.filter((a: any) => a.status === "released");
  const refunded = allocs.filter((a: any) => a.status === "refunded");
  const active = allocs.filter((a: any) => a.status === "allocated");

  const totalReturned = [...released, ...refunded].reduce((s: number, a: any) => s + (a.return_amount ?? a.amount ?? 0), 0);

  const roi = totalDeployed > 0 ? Math.round(((totalReturned - totalDeployed) / totalDeployed) * 10000) / 100 : 0;
  const defaultRate = allocs.length > 0 ? Math.round((refunded.length / allocs.length) * 100) : 0;

  // Avg deployment time for released allocations
  const deployTimes = released
    .filter((a: any) => a.allocated_at && a.released_at)
    .map((a: any) => (new Date(a.released_at).getTime() - new Date(a.allocated_at).getTime()) / 3600_000);

  const avgDeploymentTimeHours = deployTimes.length > 0
    ? Math.round(deployTimes.reduce((a: number, b: number) => a + b, 0) / deployTimes.length)
    : 0;

  const performance: PoolPerformance = {
    poolId,
    totalDeployed,
    totalReturned,
    roi,
    defaultRate,
    avgDeploymentTimeHours,
    activeAllocations: active.length,
  };

  log.info("Pool performance calculated", { poolId, roi, defaultRate });
  return performance;
}

export async function snapshotPoolMetrics(poolId: string): Promise<void> {
  const perf = await calculatePoolPerformance(poolId);

  await (supabase as any).from("pool_metrics").insert({
    pool_id: poolId,
    roi: perf.roi,
    default_rate: perf.defaultRate,
    avg_deployment_time_hours: perf.avgDeploymentTimeHours,
    total_deployed: perf.totalDeployed,
    total_returned: perf.totalReturned,
  });

  log.info("Pool metrics snapshot saved", { poolId });
}
