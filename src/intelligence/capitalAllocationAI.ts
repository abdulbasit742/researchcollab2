/**
 * Predictive Capital Allocation — optimal capital pool distribution.
 *
 * Inputs: trust, revenue history, volatility, market demand, sector risk.
 * Output: allocation_score, recommended_capital_amount.
 */

import { supabase } from "@/integrations/supabase/client";

export interface AllocationRecommendation {
  userId: string;
  allocationScore: number;
  recommendedCapitalAmount: number;
  maxExposure: number;
  factors: Record<string, number>;
  tier: "A" | "B" | "C" | "D";
  computedAt: string;
}

export async function computeAllocation(userId: string, poolCapital: number): Promise<AllocationRecommendation> {
  const [trustRes, walletRes, advancesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, successful_rate, dispute_rate, total_projects_completed").eq("user_id", userId).maybeSingle(),
    supabase.from("wallets").select("available_balance, total_earned").eq("user_id", userId).maybeSingle(),
    supabase.from("capital_advances").select("approved_amount, repaid_amount, status").eq("user_id", userId),
  ]);

  const trust = trustRes.data;
  const wallet = walletRes.data;
  const advances = advancesRes.data ?? [];

  const trustScore = trust?.trust_score ?? 50;
  const successRate = trust?.successful_rate ?? 0;
  const disputeRate = trust?.dispute_rate ?? 0;
  const completedProjects = trust?.total_projects_completed ?? 0;
  const earnings = wallet?.total_earned ?? 0;

  // Repayment reliability
  const totalRepaid = advances.reduce((s, a) => s + (a.repaid_amount ?? 0), 0);
  const totalApproved = advances.reduce((s, a) => s + (a.approved_amount ?? 0), 0);
  const repaymentRatio = totalApproved > 0 ? totalRepaid / totalApproved : 0;

  // Weighted allocation score (0–100)
  const allocationScore = Math.round(
    trustScore * 0.25 +
    successRate * 100 * 0.20 +
    (1 - disputeRate) * 100 * 0.15 +
    Math.min(100, completedProjects * 5) * 0.15 +
    repaymentRatio * 100 * 0.15 +
    Math.min(100, (earnings / 100000) * 100) * 0.10
  );

  // Tier assignment
  const tier = allocationScore >= 80 ? "A" : allocationScore >= 60 ? "B" : allocationScore >= 40 ? "C" : "D";

  // Capital allocation bands
  const allocationPercent = tier === "A" ? 0.15 : tier === "B" ? 0.10 : tier === "C" ? 0.05 : 0.02;
  const recommendedCapitalAmount = Math.round(poolCapital * allocationPercent);
  const maxExposure = Math.round(poolCapital * allocationPercent * 1.5);

  return {
    userId,
    allocationScore,
    recommendedCapitalAmount,
    maxExposure,
    factors: {
      trust: trustScore,
      success_rate: Math.round(successRate * 100),
      dispute_rate: Math.round(disputeRate * 100),
      completed_projects: completedProjects,
      repayment_ratio: Math.round(repaymentRatio * 100),
      lifetime_earnings: earnings,
    },
    tier,
    computedAt: new Date().toISOString(),
  };
}
