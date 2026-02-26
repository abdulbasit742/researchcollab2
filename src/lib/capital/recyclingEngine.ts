/**
 * Capital Recycling Engine — returns capital to pools when deals complete or refund.
 */

import { supabase } from "@/integrations/supabase/client";
import { releaseBackToPool } from "./poolWalletService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("recyclingEngine");

export interface RecyclingResult {
  allocationId: string;
  poolId: string;
  returnedAmount: number;
  type: "completion" | "refund";
}

export async function recycleCompletedDealCapital(dealId: string): Promise<RecyclingResult[]> {
  // Find all active allocations for this deal
  const { data: allocations } = await (supabase as any)
    .from("pool_allocations")
    .select("id, pool_id, amount, status")
    .eq("deal_id", dealId)
    .eq("status", "allocated");

  if (!allocations || allocations.length === 0) return [];

  const results: RecyclingResult[] = [];

  for (const alloc of allocations) {
    try {
      // Release locked balance back to pool
      await releaseBackToPool(alloc.pool_id, alloc.amount);

      // Update allocation status
      await (supabase as any)
        .from("pool_allocations")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
          return_amount: alloc.amount,
        })
        .eq("id", alloc.id);

      // Update pool total_returned
      const { data: pool } = await (supabase as any)
        .from("capital_pools")
        .select("total_returned")
        .eq("id", alloc.pool_id)
        .single();

      await (supabase as any)
        .from("capital_pools")
        .update({ total_returned: (pool?.total_returned ?? 0) + alloc.amount })
        .eq("id", alloc.pool_id);

      results.push({
        allocationId: alloc.id,
        poolId: alloc.pool_id,
        returnedAmount: alloc.amount,
        type: "completion",
      });

      log.info("Capital recycled from completed deal", { dealId, poolId: alloc.pool_id, amount: alloc.amount });
    } catch (err) {
      log.error("Failed to recycle capital", { allocationId: alloc.id, error: (err as Error).message });
    }
  }

  return results;
}

export async function recycleRefundedDealCapital(dealId: string): Promise<RecyclingResult[]> {
  const { data: allocations } = await (supabase as any)
    .from("pool_allocations")
    .select("id, pool_id, amount, status")
    .eq("deal_id", dealId)
    .eq("status", "allocated");

  if (!allocations || allocations.length === 0) return [];

  const results: RecyclingResult[] = [];

  for (const alloc of allocations) {
    try {
      await releaseBackToPool(alloc.pool_id, alloc.amount);

      await (supabase as any)
        .from("pool_allocations")
        .update({
          status: "refunded",
          released_at: new Date().toISOString(),
          return_amount: alloc.amount,
        })
        .eq("id", alloc.id);

      results.push({
        allocationId: alloc.id,
        poolId: alloc.pool_id,
        returnedAmount: alloc.amount,
        type: "refund",
      });

      log.info("Capital recycled from refunded deal", { dealId, poolId: alloc.pool_id });
    } catch (err) {
      log.error("Failed to recycle refund capital", { allocationId: alloc.id, error: (err as Error).message });
    }
  }

  return results;
}
