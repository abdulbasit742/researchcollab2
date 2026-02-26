/**
 * Capital Risk Hedging — balances institutional capital exposure
 * based on dispute clusters and completion patterns.
 */

import { supabase } from "@/integrations/supabase/client";

export interface HedgingRecommendation {
  poolId: string;
  currentExposure: number;
  adjustedAllocationWeight: number;
  hedgingAction: "increase" | "maintain" | "reduce" | "freeze";
  reasoning: string;
  riskCluster: Record<string, number>;
  computedAt: string;
}

export async function computeHedging(poolId: string): Promise<HedgingRecommendation> {
  const [poolRes, allocRes] = await Promise.all([
    supabase.from("funding_pools").select("total_capital, deployed_capital, available_capital, risk_tier").eq("id", poolId).maybeSingle(),
    supabase.from("pool_allocations").select("allocated_amount, status, user_id").eq("pool_id", poolId).eq("status", "active"),
  ]);

  const pool = poolRes.data;
  if (!pool) throw new Error("Pool not found");

  const allocations = allocRes.data ?? [];
  const userIds = allocations.map(a => a.user_id).filter(Boolean);

  let avgDispute = 0;
  let avgSuccess = 0;
  let volatilityCount = 0;

  if (userIds.length > 0) {
    const { data: trusts } = await supabase
      .from("user_trust_profiles")
      .select("dispute_rate, successful_rate, trust_velocity_24h")
      .in("user_id", userIds);

    const profiles = trusts ?? [];
    avgDispute = profiles.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) / Math.max(1, profiles.length);
    avgSuccess = profiles.reduce((s, t) => s + (t.successful_rate ?? 0), 0) / Math.max(1, profiles.length);
    volatilityCount = profiles.filter(t => Math.abs(t.trust_velocity_24h ?? 0) > 3).length;
  }

  const currentExposure = pool.deployed_capital ?? 0;
  const exposureRatio = (pool.total_capital ?? 1) > 0 ? currentExposure / pool.total_capital! : 0;

  // Risk cluster analysis
  const riskCluster = {
    avgDisputeRate: Math.round(avgDispute * 100),
    avgSuccessRate: Math.round(avgSuccess * 100),
    volatileUsers: volatilityCount,
    exposureRatio: Math.round(exposureRatio * 100),
  };

  // Hedging decision
  let adjustedAllocationWeight = 1.0;
  let hedgingAction: HedgingRecommendation["hedgingAction"] = "maintain";
  let reasoning = "Pool operating within normal parameters";

  if (avgDispute > 0.2 || volatilityCount > allocations.length * 0.3) {
    adjustedAllocationWeight = 0.5;
    hedgingAction = "reduce";
    reasoning = "High dispute cluster detected — reducing capital allocation weight";
  } else if (avgDispute > 0.1) {
    adjustedAllocationWeight = 0.75;
    hedgingAction = "reduce";
    reasoning = "Elevated dispute rates — moderate capital reduction recommended";
  } else if (avgSuccess > 0.85 && avgDispute < 0.05 && volatilityCount === 0) {
    adjustedAllocationWeight = 1.3;
    hedgingAction = "increase";
    reasoning = "High completion + low volatility — increasing capital exposure";
  }

  if (exposureRatio > 0.9) {
    adjustedAllocationWeight = 0.3;
    hedgingAction = "freeze";
    reasoning = "Pool near full exposure — freezing new allocations";
  }

  return {
    poolId,
    currentExposure,
    adjustedAllocationWeight,
    hedgingAction,
    reasoning,
    riskCluster,
    computedAt: new Date().toISOString(),
  };
}
