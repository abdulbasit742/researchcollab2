/**
 * AI Negotiation Assistant — deterministic deal negotiation suggestions.
 *
 * Generates counter-offers, acceptance probability, milestone structures,
 * and risk-adjusted pricing bands based on market and trust data.
 */

import { supabase } from "@/integrations/supabase/client";

export interface NegotiationSuggestion {
  dealId: string;
  suggestedCounterOffer: number;
  acceptanceProbability: number;
  recommendedMilestones: Array<{ title: string; amount: number; percentage: number }>;
  riskAdjustedPriceBand: { low: number; high: number; optimal: number };
  factors: Record<string, number>;
  computedAt: string;
}

export async function generateNegotiationSuggestions(dealId: string): Promise<NegotiationSuggestion> {
  const [dealRes, trustRes] = await Promise.all([
    supabase.from("deal_rooms").select("agreed_amount, buyer_id, seller_id, status").eq("id", dealId).maybeSingle(),
    supabase.from("user_trust_profiles").select("user_id, trust_score, successful_rate, dispute_rate"),
  ]);

  const deal = dealRes.data;
  if (!deal) throw new Error("Deal not found");

  const amount = deal.agreed_amount ?? 0;
  const trusts = trustRes.data ?? [];

  const buyerTrust = trusts.find(t => t.user_id === deal.buyer_id)?.trust_score ?? 50;
  const sellerTrust = trusts.find(t => t.user_id === deal.seller_id)?.trust_score ?? 50;
  const sellerSuccess = trusts.find(t => t.user_id === deal.seller_id)?.successful_rate ?? 0.7;
  const sellerDispute = trusts.find(t => t.user_id === deal.seller_id)?.dispute_rate ?? 0.05;

  // Trust-weighted pricing factor
  const trustFactor = (sellerTrust / 100) * 0.4 + sellerSuccess * 0.3 + (1 - sellerDispute) * 0.3;

  // Risk-adjusted price band
  const low = Math.round(amount * (0.75 + trustFactor * 0.1));
  const high = Math.round(amount * (1.1 + trustFactor * 0.15));
  const optimal = Math.round(amount * (0.9 + trustFactor * 0.1));

  // Counter-offer suggestion
  const counterOffer = Math.round(optimal * (buyerTrust > sellerTrust ? 0.95 : 1.03));

  // Acceptance probability
  const priceDelta = Math.abs(counterOffer - amount) / Math.max(amount, 1);
  const acceptanceProbability = Math.round(Math.max(10, Math.min(95, (1 - priceDelta) * 100 * trustFactor)) * 10) / 10;

  // Milestone structure
  const milestoneCount = amount > 100000 ? 5 : amount > 50000 ? 4 : 3;
  const milestoneAmount = Math.round(optimal / milestoneCount);
  const recommendedMilestones = Array.from({ length: milestoneCount }, (_, i) => ({
    title: `Milestone ${i + 1}`,
    amount: i === milestoneCount - 1 ? optimal - milestoneAmount * (milestoneCount - 1) : milestoneAmount,
    percentage: Math.round(100 / milestoneCount),
  }));

  return {
    dealId,
    suggestedCounterOffer: counterOffer,
    acceptanceProbability,
    recommendedMilestones,
    riskAdjustedPriceBand: { low, high, optimal },
    factors: { buyerTrust, sellerTrust, sellerSuccess, sellerDispute: sellerDispute * 100, trustFactor: Math.round(trustFactor * 100) },
    computedAt: new Date().toISOString(),
  };
}
