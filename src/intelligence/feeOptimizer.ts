/**
 * Platform Fee Optimization — dynamic fee adjustment based on
 * capital liquidity, dispute ratio, growth rate, and market supply/demand.
 */

import { supabase } from "@/integrations/supabase/client";

export interface FeeOptimizationResult {
  currentFeePercent: number;
  recommendedFeePercent: number;
  adjustment: "increase" | "decrease" | "maintain";
  factors: Record<string, number>;
  tierOverrides: Record<string, number>;
  computedAt: string;
}

const BASE_FEE = 8; // 8%
const MIN_FEE = 4;
const MAX_FEE = 15;

export async function optimizePlatformFees(): Promise<FeeOptimizationResult> {
  const [dealsRes, trustRes, poolsRes, feesRes] = await Promise.all([
    supabase.from("deal_rooms").select("id, status, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate"),
    supabase.from("funding_pools").select("total_capital, available_capital"),
    supabase.from("platform_fees").select("platform_fee_percentage").order("created_at", { ascending: false }).limit(1),
  ]);

  const deals = dealsRes.data ?? [];
  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];

  const currentFeePercent = feesRes.data?.[0]?.platform_fee_percentage ?? BASE_FEE;

  // Liquidity factor
  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const availableCapital = pools.reduce((s, p) => s + (p.available_capital ?? 0), 0);
  const liquidityRatio = totalCapital > 0 ? availableCapital / totalCapital : 0.5;

  // Dispute factor
  const avgDispute = trusts.length > 0 ? trusts.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) / trusts.length : 0.05;

  // Growth factor (deals in last 30 vs previous 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
  const recentDeals = deals.filter(d => d.created_at >= thirtyDaysAgo).length;
  const prevDeals = deals.filter(d => d.created_at >= sixtyDaysAgo && d.created_at < thirtyDaysAgo).length;
  const growthRate = prevDeals > 0 ? (recentDeals - prevDeals) / prevDeals : 0;

  // Fee adjustment logic
  let adjustment = 0;

  // High liquidity → lower fees to attract more deals
  if (liquidityRatio > 0.7) adjustment -= 1;
  else if (liquidityRatio < 0.2) adjustment += 1.5;

  // High dispute → increase fees to cover risk
  if (avgDispute > 0.15) adjustment += 1.5;
  else if (avgDispute < 0.03) adjustment -= 0.5;

  // Strong growth → can reduce fees slightly
  if (growthRate > 0.3) adjustment -= 0.5;
  else if (growthRate < -0.2) adjustment += 1;

  const recommendedFeePercent = Math.round(Math.max(MIN_FEE, Math.min(MAX_FEE, BASE_FEE + adjustment)) * 10) / 10;

  // Trust-tier overrides
  const tierOverrides: Record<string, number> = {
    platinum: Math.round(recommendedFeePercent * 0.6 * 10) / 10,
    gold: Math.round(recommendedFeePercent * 0.75 * 10) / 10,
    silver: Math.round(recommendedFeePercent * 0.9 * 10) / 10,
    bronze: recommendedFeePercent,
    unverified: Math.round(recommendedFeePercent * 1.25 * 10) / 10,
  };

  return {
    currentFeePercent,
    recommendedFeePercent,
    adjustment: recommendedFeePercent > currentFeePercent ? "increase" : recommendedFeePercent < currentFeePercent ? "decrease" : "maintain",
    factors: {
      liquidityRatio: Math.round(liquidityRatio * 100),
      avgDisputeRate: Math.round(avgDispute * 100),
      growthRate: Math.round(growthRate * 100),
      recentDeals,
      prevDeals,
    },
    tierOverrides,
    computedAt: new Date().toISOString(),
  };
}
