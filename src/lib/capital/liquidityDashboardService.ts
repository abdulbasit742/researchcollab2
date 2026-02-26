/**
 * Liquidity Dashboard Data Source — aggregated capital analytics for admin consumption.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculatePoolPerformance } from "./performanceTracker";
import { runAllPoolHealthChecks, type PoolHealthIssue } from "./poolHealth";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("liquidityDashboard");

export interface LiquidityDashboardData {
  totalCapitalCommitted: number;
  totalDeployed: number;
  availableLiquidity: number;
  lockedLiquidity: number;
  poolCount: number;
  avgROI: number;
  riskExposure: number;
  capitalTurnoverRate: number;
  healthIssues: PoolHealthIssue[];
  poolSummaries: PoolSummary[];
  timestamp: string;
}

export interface PoolSummary {
  poolId: string;
  name: string;
  totalCommitted: number;
  balance: number;
  lockedBalance: number;
  roi: number;
  status: string;
}

export async function getLiquidityDashboardData(): Promise<LiquidityDashboardData> {
  // Get all pools
  const { data: pools } = await (supabase as any)
    .from("capital_pools")
    .select("id, name, total_committed, total_allocated, total_returned, lifecycle_status, status")
    .limit(100);

  const allPools = pools ?? [];

  // Get all pool wallets
  const { data: wallets } = await (supabase as any)
    .from("pool_wallets")
    .select("pool_id, balance, locked_balance")
    .limit(100);

  const walletMap = new Map<string, any>((wallets ?? []).map((w: any) => [w.pool_id, w]));

  let totalCapitalCommitted = 0;
  let totalDeployed = 0;
  let availableLiquidity = 0;
  let lockedLiquidity = 0;
  const rois: number[] = [];

  const poolSummaries: PoolSummary[] = [];

  for (const pool of allPools) {
    totalCapitalCommitted += pool.total_committed ?? 0;
    totalDeployed += pool.total_allocated ?? 0;

    const wallet = walletMap.get(pool.id);
    const balance = wallet?.balance ?? 0;
    const locked = wallet?.locked_balance ?? 0;
    availableLiquidity += balance;
    lockedLiquidity += locked;

    // Calculate ROI per pool
    let roi = 0;
    try {
      const perf = await calculatePoolPerformance(pool.id);
      roi = perf.roi;
      rois.push(roi);
    } catch { /* skip */ }

    poolSummaries.push({
      poolId: pool.id,
      name: pool.name,
      totalCommitted: pool.total_committed ?? 0,
      balance,
      lockedBalance: locked,
      roi,
      status: pool.status ?? pool.lifecycle_status ?? "unknown",
    });
  }

  const avgROI = rois.length > 0 ? Math.round(rois.reduce((a, b) => a + b, 0) / rois.length * 100) / 100 : 0;

  // Risk exposure: % of capital in disputed deals
  const { data: disputedAllocs } = await (supabase as any)
    .from("pool_allocations")
    .select("amount, deal_id, status")
    .eq("status", "allocated");

  let disputedCapital = 0;
  if (disputedAllocs && disputedAllocs.length > 0) {
    const dealIds: string[] = [...new Set(disputedAllocs.map((a: any) => a.deal_id).filter(Boolean))] as string[];
    if (dealIds.length > 0) {
      const { data: deals } = await supabase
        .from("deal_rooms")
        .select("id, status")
        .in("id", dealIds.slice(0, 100))
        .eq("status", "disputed");

      const disputedDealIds = new Set((deals ?? []).map((d) => d.id));
      disputedCapital = disputedAllocs
        .filter((a: any) => disputedDealIds.has(a.deal_id))
        .reduce((s: number, a: any) => s + (a.amount ?? 0), 0);
    }
  }

  const riskExposure = totalDeployed > 0 ? Math.round((disputedCapital / totalDeployed) * 100) : 0;
  const capitalTurnoverRate = totalCapitalCommitted > 0
    ? Math.round((totalDeployed / totalCapitalCommitted) * 100)
    : 0;

  // Health issues
  const healthIssues = await runAllPoolHealthChecks();

  log.info("Liquidity dashboard data loaded", { poolCount: allPools.length });

  return {
    totalCapitalCommitted,
    totalDeployed,
    availableLiquidity,
    lockedLiquidity,
    poolCount: allPools.length,
    avgROI,
    riskExposure,
    capitalTurnoverRate,
    healthIssues,
    poolSummaries,
    timestamp: new Date().toISOString(),
  };
}
