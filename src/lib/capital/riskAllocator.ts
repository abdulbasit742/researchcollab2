/**
 * Risk-Distributed Allocation Logic — distributes capital across deals based on risk profiles.
 */

import { supabase } from "@/integrations/supabase/client";
import { allocatePoolToDeal } from "./allocationEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskAllocator");

export type AllocationStrategy = "equal" | "trust_weighted" | "completion_weighted" | "risk_adjusted";

export interface DealRiskProfile {
  dealId: string;
  trustScore: number;
  completionRate: number;
  disputeRate: number;
  riskScore: number; // 0–100, lower = safer
  weight: number;
}

export async function calculateRiskScore(dealId: string): Promise<number> {
  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("buyer_id, seller_id, status")
    .eq("id", dealId)
    .single();

  if (!deal) return 100; // Max risk for unknown deals

  // Get buyer trust score
  let trustScore = 50;
  if (deal.buyer_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("trust_score")
      .eq("id", deal.buyer_id)
      .maybeSingle();
    trustScore = (profile as any)?.trust_score ?? 50;
  }

  // Risk inversely proportional to trust
  const trustRisk = Math.max(0, 100 - trustScore);

  // Status-based risk
  const statusRisk = deal.status === "disputed" ? 40 : deal.status === "active" ? 10 : 0;

  return Math.min(100, Math.round(trustRisk * 0.6 + statusRisk * 0.4));
}

export async function distributeCapitalAcrossDeals(
  poolId: string,
  totalAmount: number,
  dealIds: string[],
  strategy: AllocationStrategy = "risk_adjusted"
): Promise<{ dealId: string; amount: number }[]> {
  if (dealIds.length === 0) return [];

  const profiles: DealRiskProfile[] = [];

  for (const dealId of dealIds) {
    const riskScore = await calculateRiskScore(dealId);
    profiles.push({
      dealId,
      trustScore: 100 - riskScore,
      completionRate: 0,
      disputeRate: 0,
      riskScore,
      weight: 0,
    });
  }

  // Calculate weights based on strategy
  switch (strategy) {
    case "equal":
      profiles.forEach((p) => (p.weight = 1 / profiles.length));
      break;

    case "trust_weighted":
      const totalTrust = profiles.reduce((s, p) => s + p.trustScore, 0);
      profiles.forEach((p) => (p.weight = totalTrust > 0 ? p.trustScore / totalTrust : 1 / profiles.length));
      break;

    case "risk_adjusted":
      // Inverse risk: safer deals get more capital
      const safetyScores = profiles.map((p) => Math.max(1, 100 - p.riskScore));
      const totalSafety = safetyScores.reduce((a, b) => a + b, 0);
      profiles.forEach((p, i) => (p.weight = totalSafety > 0 ? safetyScores[i] / totalSafety : 1 / profiles.length));
      break;

    default:
      profiles.forEach((p) => (p.weight = 1 / profiles.length));
  }

  // Allocate
  const allocations: { dealId: string; amount: number }[] = [];
  for (const profile of profiles) {
    const amount = Math.round(totalAmount * profile.weight);
    if (amount > 0) {
      try {
        await allocatePoolToDeal(poolId, profile.dealId, amount);
        allocations.push({ dealId: profile.dealId, amount });
      } catch (err) {
        log.warn(`Failed to allocate to deal ${profile.dealId}`, { error: (err as Error).message });
      }
    }
  }

  log.info("Capital distributed across deals", { poolId, strategy, dealCount: allocations.length });
  return allocations;
}
