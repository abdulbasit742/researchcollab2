/**
 * Sponsor Repeat Probability Scoring — predicts likelihood of sponsor returning.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sponsorScoring");

export interface SponsorScore {
  sponsorId: string;
  repeatProbability: number; // 0–100
  factors: Record<string, number>;
}

export async function scoreSponsor(sponsorId: string, tenantId?: string): Promise<SponsorScore> {
  let dealQuery = supabase
    .from("deal_rooms")
    .select("id, status, agreed_amount, created_at, escrow_status")
    .eq("buyer_id", sponsorId)
    .order("created_at", { ascending: false });

  if (tenantId) dealQuery = dealQuery.eq("tenant_id", tenantId);
  const { data: deals } = await dealQuery;

  if (!deals || deals.length === 0) {
    return { sponsorId, repeatProbability: 0, factors: {} };
  }

  // Factor 1: Deal count (max 30 points)
  const dealCountScore = Math.min(deals.length * 10, 30);

  // Factor 2: Average deal value (max 20 points)
  const avgValue = deals.reduce((s, d) => s + (d.agreed_amount ?? 0), 0) / deals.length;
  const valueScore = Math.min(Math.round(avgValue / 500), 20);

  // Factor 3: Completion rate (max 25 points)
  const completed = deals.filter((d) => d.status === "completed").length;
  const completionRate = completed / deals.length;
  const completionScore = Math.round(completionRate * 25);

  // Factor 4: Recency (max 15 points)
  const lastDealDate = new Date(deals[0].created_at);
  const daysSince = (Date.now() - lastDealDate.getTime()) / 86400_000;
  const recencyScore = daysSince < 7 ? 15 : daysSince < 30 ? 10 : daysSince < 90 ? 5 : 0;

  // Factor 5: Low dispute rate (max 10 points)
  const disputed = deals.filter((d) => d.status === "disputed").length;
  const disputeRate = disputed / deals.length;
  const disputeScore = disputeRate === 0 ? 10 : disputeRate < 0.1 ? 7 : disputeRate < 0.3 ? 3 : 0;

  const repeatProbability = Math.min(dealCountScore + valueScore + completionScore + recencyScore + disputeScore, 100);

  const score: SponsorScore = {
    sponsorId,
    repeatProbability,
    factors: { dealCount: dealCountScore, avgValue: valueScore, completion: completionScore, recency: recencyScore, lowDispute: disputeScore },
  };

  log.info("Sponsor scored", { sponsorId, repeatProbability });
  return score;
}
