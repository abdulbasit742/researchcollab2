/**
 * Capital Market Liquidity Pooling — risk-tiered, exposure-capped pools.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("marketLiquidityPools");

export type PoolTier = "low_risk" | "balanced" | "growth" | "sovereign_backed";

export interface MarketLiquidityPool {
  poolId: string;
  tier: PoolTier;
  totalCapital: number;
  allocatedCapital: number;
  participantCount: number;
  utilizationRate: number;
  exposureCap: number;
  diversificationScore: number;
}

export async function getMarketLiquidityPools(): Promise<MarketLiquidityPool[]> {
  const { data: pools } = await (supabase as any).from("capital_pools").select("id, pool_type, total_committed, total_allocated, tenant_id");

  const poolMap = new Map<string, MarketLiquidityPool>();

  for (const p of pools ?? []) {
    const tier = mapPoolTier(p.pool_type);
    const existing = poolMap.get(tier) ?? {
      poolId: tier, tier, totalCapital: 0, allocatedCapital: 0,
      participantCount: 0, utilizationRate: 0, exposureCap: getExposureCap(tier), diversificationScore: 0,
    };
    existing.totalCapital += p.total_committed ?? 0;
    existing.allocatedCapital += p.total_allocated ?? 0;
    existing.participantCount += 1;
    poolMap.set(tier, existing);
  }

  return Array.from(poolMap.values()).map(pool => {
    pool.utilizationRate = pool.totalCapital > 0 ? Math.round((pool.allocatedCapital / pool.totalCapital) * 100) : 0;
    pool.diversificationScore = Math.min(100, pool.participantCount * 10);
    return pool;
  });
}

function mapPoolTier(poolType: string): PoolTier {
  if (poolType?.includes("sovereign") || poolType?.includes("grant")) return "sovereign_backed";
  if (poolType?.includes("growth") || poolType?.includes("innovation")) return "growth";
  if (poolType?.includes("balanced")) return "balanced";
  return "low_risk";
}

function getExposureCap(tier: PoolTier): number {
  const caps: Record<PoolTier, number> = { low_risk: 500000, balanced: 1000000, growth: 2000000, sovereign_backed: 5000000 };
  return caps[tier];
}
