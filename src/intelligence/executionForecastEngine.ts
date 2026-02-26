/**
 * Execution Probability Forecasting — predicts deal completion, delay, dispute, and ROI.
 */

import { supabase } from "@/integrations/supabase/client";

export interface ExecutionForecast {
  dealId: string;
  completionProbability: number;
  delayProbability: number;
  disputeProbability: number;
  expectedROI: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: Record<string, number>;
  computedAt: string;
}

export async function forecastDealCompletion(dealId: string): Promise<ExecutionForecast> {
  const [dealRes, milestonesRes] = await Promise.all([
    supabase.from("deal_rooms").select("buyer_id, seller_id, agreed_amount, status, created_at, offer_id").eq("id", dealId).maybeSingle(),
    supabase.from("milestones").select("status, expected_delivery").limit(200),
  ]);

  const deal = dealRes.data;
  if (!deal) throw new Error("Deal not found");

  const participants = [deal.buyer_id, deal.seller_id].filter(Boolean);
  const { data: trusts } = await supabase
    .from("user_trust_profiles")
    .select("user_id, trust_score, successful_rate, dispute_rate")
    .in("user_id", participants);

  const trustMap = new Map((trusts ?? []).map(t => [t.user_id, t]));
  const buyerTrust = trustMap.get(deal.buyer_id)?.trust_score ?? 50;
  const sellerTrust = trustMap.get(deal.seller_id)?.trust_score ?? 50;
  const sellerSuccess = trustMap.get(deal.seller_id)?.successful_rate ?? 0.7;
  const sellerDispute = trustMap.get(deal.seller_id)?.dispute_rate ?? 0.05;
  const buyerDispute = trustMap.get(deal.buyer_id)?.dispute_rate ?? 0.05;

  const milestones = milestonesRes.data ?? [];
  const overdueMilestones = milestones.filter(m => m.expected_delivery && new Date(m.expected_delivery) < new Date() && m.status !== "completed").length;
  const totalMilestones = Math.max(1, milestones.length);

  const avgTrust = (buyerTrust + sellerTrust) / 2;
  const overdueRatio = overdueMilestones / totalMilestones;

  // Completion probability
  const completionProbability = Math.round(Math.max(5, Math.min(98,
    sellerSuccess * 100 * 0.35 +
    avgTrust * 0.30 +
    (1 - overdueRatio) * 100 * 0.20 +
    (1 - sellerDispute) * 100 * 0.15
  )));

  // Delay probability
  const delayProbability = Math.round(Math.max(2, Math.min(90,
    overdueRatio * 100 * 0.40 +
    (100 - avgTrust) * 0.30 +
    (1 - sellerSuccess) * 100 * 0.30
  )));

  // Dispute probability
  const disputeProbability = Math.round(Math.max(1, Math.min(85,
    (buyerDispute + sellerDispute) * 50 * 0.40 +
    (100 - avgTrust) * 0.30 +
    overdueRatio * 100 * 0.30
  )));

  // Expected ROI
  const amount = deal.agreed_amount ?? 0;
  const expectedROI = Math.round(amount * (completionProbability / 100) * 0.95 - amount * (disputeProbability / 100) * 0.3);

  const riskLevel = disputeProbability > 60 ? "critical" : disputeProbability > 40 ? "high" : disputeProbability > 20 ? "medium" : "low";

  return {
    dealId,
    completionProbability,
    delayProbability,
    disputeProbability,
    expectedROI,
    riskLevel,
    factors: { buyerTrust, sellerTrust, sellerSuccess: Math.round(sellerSuccess * 100), overdueMilestones, totalMilestones, avgTrust: Math.round(avgTrust) },
    computedAt: new Date().toISOString(),
  };
}
