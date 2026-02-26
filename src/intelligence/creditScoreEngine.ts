/**
 * Institutional Credit Scoring Model — 300–850 scale.
 *
 * Factors: trust, earnings stability, completion rate, dispute history,
 * capital repayment, network endorsements, institutional backing.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CreditScoreResult {
  userId: string;
  creditScore: number;
  grade: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
  factors: Record<string, { value: number; weight: number; contribution: number }>;
  computedAt: string;
}

export async function computeCreditScore(userId: string): Promise<CreditScoreResult> {
  const [trustRes, walletRes, advancesRes, endorsementsRes, orgMemberRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, successful_rate, dispute_rate, total_projects_completed").eq("user_id", userId).maybeSingle(),
    supabase.from("wallets").select("available_balance, total_earned").eq("user_id", userId).maybeSingle(),
    supabase.from("capital_advances").select("approved_amount, repaid_amount, status").eq("user_id", userId),
    supabase.from("skill_endorsements").select("id, endorser_id, user_skill_id"),
    supabase.from("organization_members").select("id, role").eq("user_id", userId),
  ]);

  const trust = trustRes.data;
  const wallet = walletRes.data;
  const advances = advancesRes.data ?? [];
  const endorsements = endorsementsRes.data ?? [];
  const orgMemberships = orgMemberRes.data ?? [];

  // Factor calculations (each normalized to 0–1)
  const trustNorm = (trust?.trust_score ?? 50) / 100;
  const successNorm = trust?.successful_rate ?? 0;
  const disputeNorm = 1 - Math.min(1, (trust?.dispute_rate ?? 0) * 5);
  const completionNorm = Math.min(1, (trust?.total_projects_completed ?? 0) / 20);

  // Earnings stability proxy
  const earnings = wallet?.total_earned ?? 0;
  const earningsNorm = Math.min(1, earnings / 500000);

  // Capital repayment
  const totalApproved = advances.reduce((s, a) => s + (a.approved_amount ?? 0), 0);
  const totalRepaid = advances.reduce((s, a) => s + (a.repaid_amount ?? 0), 0);
  const repaymentNorm = totalApproved > 0 ? Math.min(1, totalRepaid / totalApproved) : 0.5;

  // Network endorsements
  const endorsementNorm = Math.min(1, endorsements.length / 10);

  // Institutional backing
  const institutionalNorm = orgMemberships.length > 0 ? Math.min(1, 0.5 + orgMemberships.length * 0.25) : 0;

  // Weighted composite (0–1)
  const weights = {
    trust: 0.25, success: 0.15, dispute: 0.15, completion: 0.10,
    earnings: 0.10, repayment: 0.10, endorsements: 0.08, institutional: 0.07,
  };

  const composite =
    trustNorm * weights.trust +
    successNorm * weights.success +
    disputeNorm * weights.dispute +
    completionNorm * weights.completion +
    earningsNorm * weights.earnings +
    repaymentNorm * weights.repayment +
    endorsementNorm * weights.endorsements +
    institutionalNorm * weights.institutional;

  // Map to 300–850 scale
  const creditScore = Math.round(300 + composite * 550);
  const clamped = Math.max(300, Math.min(850, creditScore));

  const grade = clamped >= 750 ? "Excellent" : clamped >= 670 ? "Good" : clamped >= 580 ? "Fair" : clamped >= 450 ? "Poor" : "Very Poor";

  return {
    userId,
    creditScore: clamped,
    grade,
    factors: {
      trust: { value: Math.round(trustNorm * 100), weight: weights.trust, contribution: Math.round(trustNorm * weights.trust * 550) },
      success_rate: { value: Math.round(successNorm * 100), weight: weights.success, contribution: Math.round(successNorm * weights.success * 550) },
      dispute_history: { value: Math.round(disputeNorm * 100), weight: weights.dispute, contribution: Math.round(disputeNorm * weights.dispute * 550) },
      completion: { value: Math.round(completionNorm * 100), weight: weights.completion, contribution: Math.round(completionNorm * weights.completion * 550) },
      earnings_stability: { value: Math.round(earningsNorm * 100), weight: weights.earnings, contribution: Math.round(earningsNorm * weights.earnings * 550) },
      repayment: { value: Math.round(repaymentNorm * 100), weight: weights.repayment, contribution: Math.round(repaymentNorm * weights.repayment * 550) },
      endorsements: { value: endorsements.length, weight: weights.endorsements, contribution: Math.round(endorsementNorm * weights.endorsements * 550) },
      institutional: { value: orgMemberships.length, weight: weights.institutional, contribution: Math.round(institutionalNorm * weights.institutional * 550) },
    },
    computedAt: new Date().toISOString(),
  };
}
