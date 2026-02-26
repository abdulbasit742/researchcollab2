import { supabase } from "@/integrations/supabase/client";

/**
 * Capital Pool Engine — institutional/university funding pools.
 *
 * Uses existing tables: funding_pools, capital_pools, pool_allocations.
 * Allows organizations to create pools, allocate budgets, and track ROI.
 */

export async function createFundingPool(params: {
  name: string;
  poolType: string;
  totalCapital: number;
  institutionId?: string;
  createdBy: string;
  riskTier?: string;
  currency?: string;
}) {
  if (params.totalCapital <= 0) throw new Error("Pool capital must be positive");

  const { data, error } = await supabase
    .from("funding_pools")
    .insert({
      name: params.name,
      pool_type: params.poolType,
      total_capital: params.totalCapital,
      available_capital: params.totalCapital,
      deployed_capital: 0,
      institution_id: params.institutionId ?? null,
      created_by: params.createdBy,
      risk_tier: params.riskTier ?? "medium",
      currency: params.currency ?? "PKR",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function allocateFromPool(params: {
  poolId: string;
  advanceId: string;
  amount: number;
  approvedBy?: string;
}) {
  // Check pool capacity
  const { data: pool } = await supabase
    .from("funding_pools")
    .select("available_capital, max_exposure_per_advance")
    .eq("id", params.poolId)
    .single();

  if (!pool) throw new Error("Pool not found");
  if ((pool.available_capital ?? 0) < params.amount) throw new Error("Insufficient pool capital");

  const maxExposure = pool.max_exposure_per_advance ?? Infinity;
  if (params.amount > maxExposure) throw new Error(`Exceeds max exposure per advance (${maxExposure})`);

  // Create allocation
  const { error: allocErr } = await supabase
    .from("pool_allocations")
    .insert({
      pool_id: params.poolId,
      advance_id: params.advanceId,
      allocated_amount: params.amount,
      status: "active",
      approved_by: params.approvedBy ?? null,
      approved_at: new Date().toISOString(),
      user_id: params.approvedBy ?? "system",
    });

  if (allocErr) throw allocErr;

  // Update pool balances
  const newAvailable = (pool.available_capital ?? 0) - params.amount;
  const { error: updateErr } = await supabase
    .from("funding_pools")
    .update({
      available_capital: newAvailable,
      deployed_capital: supabase.rpc ? undefined : undefined, // Will be computed
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.poolId);

  if (updateErr) throw updateErr;

  return { success: true, remainingCapital: newAvailable };
}

export async function getInstitutionalPools(institutionId: string) {
  const { data, error } = await supabase
    .from("funding_pools")
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPoolPerformance(poolId: string) {
  const [poolRes, allocRes, yieldRes] = await Promise.all([
    supabase.from("funding_pools").select("*").eq("id", poolId).single(),
    supabase.from("pool_allocations").select("allocated_amount, status, actual_yield").eq("pool_id", poolId),
    supabase.from("yield_tracking").select("*").eq("pool_id", poolId).order("period_start", { ascending: false }).limit(12),
  ]);

  const pool = poolRes.data;
  const allocations = allocRes.data ?? [];
  const yields = yieldRes.data ?? [];

  const totalAllocated = allocations.reduce((s, a) => s + (a.allocated_amount ?? 0), 0);
  const totalReturned = allocations.reduce((s, a) => s + (a.actual_yield ?? 0), 0);
  const roi = totalAllocated > 0 ? ((totalReturned - totalAllocated) / totalAllocated) * 100 : 0;

  return {
    pool,
    totalAllocated,
    totalReturned,
    roi: Math.round(roi * 100) / 100,
    allocationCount: allocations.length,
    yields,
  };
}
