/**
 * Pool Allocation Engine — allocates capital from pools to deals through escrow.
 */

import { supabase } from "@/integrations/supabase/client";
import { allocateFromPool } from "./poolWalletService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("allocationEngine");

export interface AllocationResult {
  allocationId: string;
  poolId: string;
  dealId: string;
  amount: number;
}

export async function allocatePoolToDeal(
  poolId: string,
  dealId: string,
  amount: number
): Promise<AllocationResult> {
  if (amount <= 0) throw new Error("Allocation amount must be positive");

  // Verify pool and deal share same tenant
  const { data: pool } = await (supabase as any)
    .from("capital_pools")
    .select("tenant_id, lifecycle_status")
    .eq("id", poolId)
    .single();

  if (!pool) throw new Error("Capital pool not found");
  if (pool.lifecycle_status !== "active" && pool.lifecycle_status !== undefined) {
    // Also check 'status' field
    const { data: poolStatus } = await (supabase as any)
      .from("capital_pools")
      .select("status")
      .eq("id", poolId)
      .single();
    if (poolStatus?.status && poolStatus.status !== "active") {
      throw new Error("Capital pool is not active");
    }
  }

  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("tenant_id, escrow_amount")
    .eq("id", dealId)
    .single();

  if (!deal) throw new Error("Deal not found");

  if (pool.tenant_id && deal.tenant_id && pool.tenant_id !== deal.tenant_id) {
    throw new Error("Cross-tenant allocation blocked: pool and deal must share tenant");
  }

  // Check allocation doesn't exceed deal amount
  const { data: existingAllocations } = await (supabase as any)
    .from("pool_allocations")
    .select("amount")
    .eq("deal_id", dealId)
    .eq("status", "allocated");

  const totalExisting = (existingAllocations ?? []).reduce((s: number, a: any) => s + (a.amount ?? 0), 0);
  if (totalExisting + amount > (deal.escrow_amount ?? Infinity)) {
    throw new Error("Allocation would exceed deal escrow amount");
  }

  // Move balance → locked_balance in pool wallet
  await allocateFromPool(poolId, amount);

  // Create allocation record
  const { data: allocation, error } = await (supabase as any)
    .from("pool_allocations")
    .insert({
      pool_id: poolId,
      deal_id: dealId,
      amount,
      status: "allocated",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create allocation: ${error.message}`);

  // Update pool total_allocated
  const { data: poolData } = await (supabase as any)
    .from("capital_pools")
    .select("total_allocated")
    .eq("id", poolId)
    .single();

  await (supabase as any)
    .from("capital_pools")
    .update({ total_allocated: (poolData?.total_allocated ?? 0) + amount })
    .eq("id", poolId);

  log.info("Pool allocated to deal", { poolId, dealId, amount, allocationId: allocation.id });

  return { allocationId: allocation.id, poolId, dealId, amount };
}
