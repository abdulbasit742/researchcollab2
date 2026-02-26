import { supabase } from "@/integrations/supabase/client";

/**
 * Investor Engine — capital pool funding, ROI tracking, risk exposure.
 *
 * Uses existing tables: capital_pools, funding_pools, risk_exposure_log, yield_tracking.
 * No investor_profiles table exists — we derive investor metrics from capital_pools + pool_allocations.
 */

export interface InvestorMetrics {
  totalCommitted: number;
  totalDeployed: number;
  availableBalance: number;
  poolCount: number;
  avgYield: number;
  riskExposure: number;
}

export async function getInvestorMetrics(userId: string): Promise<InvestorMetrics> {
  const { data: pools } = await supabase
    .from("capital_pools")
    .select("total_committed, total_allocated, available_balance")
    .eq("created_by", userId);

  const poolList = pools ?? [];

  const totalCommitted = poolList.reduce((s, p) => s + (p.total_committed ?? 0), 0);
  const totalDeployed = poolList.reduce((s, p) => s + (p.total_allocated ?? 0), 0);
  const availableBalance = poolList.reduce((s, p) => s + (p.available_balance ?? 0), 0);

  // Get yield data
  const { data: yields } = await supabase
    .from("yield_tracking")
    .select("annualized_return")
    .order("period_start", { ascending: false })
    .limit(20);

  const yieldList = yields ?? [];
  const avgYield = yieldList.length > 0
    ? yieldList.reduce((s, y) => s + (y.annualized_return ?? 0), 0) / yieldList.length
    : 0;

  // Risk exposure
  const { data: risks } = await supabase
    .from("risk_exposure_log")
    .select("exposure_amount")
    .order("recorded_at", { ascending: false })
    .limit(10);

  const riskExposure = (risks ?? []).reduce((s, r) => s + (r.exposure_amount ?? 0), 0);

  return {
    totalCommitted,
    totalDeployed,
    availableBalance,
    poolCount: poolList.length,
    avgYield: Math.round(avgYield * 100) / 100,
    riskExposure,
  };
}

export async function createCapitalPool(params: {
  name: string;
  poolType: string;
  totalCommitted: number;
  createdBy: string;
  countryId?: string;
  riskCategory?: string;
}) {
  const { data, error } = await supabase
    .from("capital_pools")
    .insert({
      name: params.name,
      pool_type: params.poolType,
      total_committed: params.totalCommitted,
      available_balance: params.totalCommitted,
      total_allocated: 0,
      created_by: params.createdBy,
      country_id: params.countryId ?? null,
      risk_category: params.riskCategory ?? "medium",
      lifecycle_status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCapitalPools(createdBy?: string) {
  let query = supabase
    .from("capital_pools")
    .select("*")
    .order("created_at", { ascending: false });

  if (createdBy) query = query.eq("created_by", createdBy);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFundedUsers(poolId: string) {
  const { data, error } = await supabase
    .from("pool_allocations")
    .select("*, capital_advances(user_id, requested_amount, status)")
    .eq("capital_pool_id", poolId);

  if (error) throw error;
  return data ?? [];
}

export async function getRiskExposureSummary() {
  const { data, error } = await supabase
    .from("risk_exposure_log")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const logs = data ?? [];
  const totalExposure = logs.reduce((s, r) => s + (r.exposure_amount ?? 0), 0);
  const avgConfidence = logs.length > 0
    ? logs.reduce((s, r) => s + (r.ai_confidence ?? 0), 0) / logs.length
    : 0;

  return {
    logs,
    totalExposure,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    entryCount: logs.length,
  };
}
