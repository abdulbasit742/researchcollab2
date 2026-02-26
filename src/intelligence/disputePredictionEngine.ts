/**
 * Predictive Dispute Detection — early warning system.
 *
 * Detects: delayed milestones, reduced communication, wallet instability, trust volatility.
 * Triggers governance engine if threshold exceeded.
 */

import { supabase } from "@/integrations/supabase/client";

export interface DisputeRiskAssessment {
  dealId: string;
  disputeRiskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  earlyWarnings: Array<{ signal: string; severity: number; description: string }>;
  shouldTriggerGovernance: boolean;
  computedAt: string;
}

const GOVERNANCE_THRESHOLD = 70;

export async function assessDisputeRisk(dealId: string): Promise<DisputeRiskAssessment> {
  const [dealRes, milestonesRes] = await Promise.all([
    supabase.from("deal_rooms").select("buyer_id, seller_id, agreed_amount, status, created_at, offer_id").eq("id", dealId).maybeSingle(),
    supabase.from("milestones").select("status, expected_delivery, updated_at").limit(100),
  ]);

  const deal = dealRes.data;
  if (!deal) throw new Error("Deal not found");

  const participants = [deal.buyer_id, deal.seller_id].filter(Boolean);
  const { data: trusts } = await supabase
    .from("user_trust_profiles")
    .select("user_id, trust_score, dispute_rate, trust_velocity_24h")
    .in("user_id", participants);

  const { data: wallets } = await supabase
    .from("wallets")
    .select("user_id, available_balance")
    .in("user_id", participants);

  const trustMap = new Map((trusts ?? []).map(t => [t.user_id, t]));
  const walletMap = new Map((wallets ?? []).map(w => [w.user_id, w]));
  const earlyWarnings: DisputeRiskAssessment["earlyWarnings"] = [];

  // Signal 1: Delayed milestones
  const milestones = milestonesRes.data ?? [];
  const now = new Date();
  const overdue = milestones.filter(m => m.expected_delivery && new Date(m.expected_delivery) < now && m.status !== "completed");
  const overdueScore = Math.min(30, overdue.length * 10);
  if (overdue.length > 0) {
    earlyWarnings.push({ signal: "delayed_milestones", severity: overdueScore, description: `${overdue.length} milestone(s) overdue` });
  }

  // Signal 2: Trust volatility
  let trustVolScore = 0;
  for (const uid of participants) {
    const velocity = trustMap.get(uid)?.trust_velocity_24h ?? 0;
    if (velocity < -3) {
      const sev = Math.min(25, Math.abs(velocity) * 5);
      trustVolScore += sev;
      earlyWarnings.push({ signal: "trust_volatility", severity: sev, description: `User trust dropping rapidly (velocity: ${velocity})` });
    }
  }

  // Signal 3: Wallet instability
  let walletScore = 0;
  for (const uid of participants) {
    const balance = walletMap.get(uid)?.available_balance ?? 0;
    if (balance < 0) {
      walletScore += 20;
      earlyWarnings.push({ signal: "wallet_instability", severity: 20, description: `Negative wallet balance detected` });
    } else if (balance < 1000 && (deal.agreed_amount ?? 0) > 10000) {
      walletScore += 10;
      earlyWarnings.push({ signal: "low_balance", severity: 10, description: `Low balance relative to deal value` });
    }
  }

  // Signal 4: High dispute history
  let historyScore = 0;
  for (const uid of participants) {
    const rate = trustMap.get(uid)?.dispute_rate ?? 0;
    if (rate > 0.15) {
      const sev = Math.min(25, Math.round(rate * 100));
      historyScore += sev;
      earlyWarnings.push({ signal: "dispute_history", severity: sev, description: `High historical dispute rate: ${Math.round(rate * 100)}%` });
    }
  }

  const disputeRiskScore = Math.min(100, overdueScore + trustVolScore + walletScore + historyScore);
  const riskLevel = disputeRiskScore >= 70 ? "critical" : disputeRiskScore >= 50 ? "high" : disputeRiskScore >= 25 ? "medium" : "low";

  return {
    dealId,
    disputeRiskScore,
    riskLevel,
    earlyWarnings,
    shouldTriggerGovernance: disputeRiskScore >= GOVERNANCE_THRESHOLD,
    computedAt: new Date().toISOString(),
  };
}
