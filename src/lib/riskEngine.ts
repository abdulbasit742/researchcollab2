import { supabase } from "@/integrations/supabase/client";

/**
 * Dispute Risk Index — computes risk score (0–100) for a user.
 *
 * Risk increases if:
 *   - High dispute_rate (30%)
 *   - Low completion rate (25%)
 *   - Sudden wallet withdrawals (15%)
 *   - New account with large deal volume (15%)
 *   - Low trust score (15%)
 */

export interface RiskAssessment {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  factors: string[];
}

export async function computeDisputeRisk(userId: string): Promise<RiskAssessment> {
  const [trustRes, proofRes, walletRes, profileRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profile_proof_metrics").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("created_at").eq("id", userId).maybeSingle(),
  ]);

  const trust = trustRes.data;
  const proof = proofRes.data;
  const wallet = walletRes.data;
  const profile = profileRes.data;

  let riskScore = 0;
  const factors: string[] = [];

  // 1. Dispute rate (30%)
  const disputeRate = trust?.dispute_rate ?? 0;
  const disputeComponent = disputeRate * 100 * 0.3;
  riskScore += disputeComponent;
  if (disputeRate > 0.2) factors.push("High dispute rate");

  // 2. Low completion rate (25%)
  const successRate = trust?.successful_rate ?? 1;
  const completionRisk = (1 - successRate) * 100 * 0.25;
  riskScore += completionRisk;
  if (successRate < 0.5) factors.push("Low completion rate");

  // 3. Wallet instability (15%)
  if (wallet) {
    const totalBalance = wallet.available_balance + wallet.escrow_balance;
    const spent = wallet.total_spent ?? 0;
    if (spent > 0 && totalBalance < spent * 0.1) {
      riskScore += 15;
      factors.push("Sudden balance depletion");
    }
  }

  // 4. New account + high volume (15%)
  if (profile?.created_at) {
    const accountAgeDays = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const projectCount = proof?.projects_completed ?? 0;
    if (accountAgeDays < 30 && projectCount > 5) {
      riskScore += 15;
      factors.push("New account with high deal volume");
    }
  }

  // 5. Low trust score (15%)
  const trustScore = trust?.trust_score ?? 50;
  if (trustScore < 30) {
    riskScore += 15;
    factors.push("Very low trust score");
  } else if (trustScore < 50) {
    riskScore += 8;
    factors.push("Below-average trust score");
  }

  const finalScore = Math.min(100, Math.round(riskScore));
  const risk_level = finalScore >= 75 ? "critical" : finalScore >= 50 ? "high" : finalScore >= 25 ? "medium" : "low";

  return { risk_score: finalScore, risk_level, factors };
}
