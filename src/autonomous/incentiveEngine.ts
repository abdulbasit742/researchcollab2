/**
 * Incentive Modeling Engine — measures incentive alignment across
 * users, institutions, investors, and platform.
 */

import { supabase } from "@/integrations/supabase/client";

export interface IncentiveAlignmentResult {
  overallScore: number;
  stakeholderScores: Record<string, number>;
  misalignments: string[];
  recommendations: string[];
  computedAt: string;
}

export async function computeIncentiveAlignment(): Promise<IncentiveAlignmentResult> {
  const [trustRes, poolsRes, dealsRes, feesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate, successful_rate"),
    supabase.from("funding_pools").select("total_capital, deployed_capital, available_capital"),
    supabase.from("deal_rooms").select("status, escrow_amount").in("status", ["completed", "active", "in_progress", "disputed"]),
    supabase.from("platform_fees").select("platform_fee_amount, gross_amount"),
  ]);

  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const deals = dealsRes.data ?? [];
  const fees = feesRes.data ?? [];

  // User alignment: high completion, low disputes
  const avgSuccess = trusts.length > 0 ? trusts.reduce((s, t) => s + (t.successful_rate ?? 0), 0) / trusts.length : 0;
  const avgDispute = trusts.length > 0 ? trusts.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) / trusts.length : 0;
  const userScore = Math.round((avgSuccess * 60 + (1 - avgDispute) * 40) * 100) / 100;

  // Institutional alignment: capital efficiency
  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const deployed = pools.reduce((s, p) => s + (p.deployed_capital ?? 0), 0);
  const utilization = totalCapital > 0 ? deployed / totalCapital : 0;
  const institutionalScore = Math.round(Math.min(100, utilization * 100 + (utilization > 0.3 ? 20 : 0)));

  // Investor alignment: returns vs risk
  const completedDeals = deals.filter(d => d.status === "completed").length;
  const disputedDeals = deals.filter(d => d.status === "disputed").length;
  const totalDeals = Math.max(1, deals.length);
  const investorScore = Math.round((completedDeals / totalDeals) * 80 + (1 - disputedDeals / totalDeals) * 20);

  // Platform alignment: sustainable fees + growth
  const totalFees = fees.reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);
  const totalGross = fees.reduce((s, f) => s + (f.gross_amount ?? 0), 0);
  const feeRatio = totalGross > 0 ? totalFees / totalGross : 0;
  const platformScore = Math.round(feeRatio < 0.15 ? 80 + (0.15 - feeRatio) * 200 : Math.max(30, 80 - (feeRatio - 0.15) * 300));

  const overallScore = Math.round((userScore * 0.30 + institutionalScore * 0.25 + investorScore * 0.25 + platformScore * 0.20));

  const misalignments: string[] = [];
  const recommendations: string[] = [];

  if (userScore < 50) { misalignments.push("Low user completion alignment"); recommendations.push("Increase completion incentives"); }
  if (institutionalScore < 40) { misalignments.push("Capital underutilization"); recommendations.push("Activate institutional deployment programs"); }
  if (investorScore < 50) { misalignments.push("High dispute-to-completion ratio"); recommendations.push("Strengthen dispute prevention"); }
  if (platformScore < 50) { misalignments.push("Fee structure misaligned with growth"); recommendations.push("Review fee optimization engine"); }

  return {
    overallScore,
    stakeholderScores: { users: userScore, institutions: institutionalScore, investors: investorScore, platform: platformScore },
    misalignments,
    recommendations,
    computedAt: new Date().toISOString(),
  };
}
