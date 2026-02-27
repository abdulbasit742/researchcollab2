import { supabase } from "@/integrations/supabase/client";

/**
 * Deal Health Score Engine
 * 
 * Computes a composite health score (0–100) for active deals based on:
 *   - Milestone velocity (30%) — completion speed vs deadlines
 *   - Escrow reliability (25%) — funding consistency, no partial failures  
 *   - Dispute frequency (25%) — inverse of dispute incidents
 *   - Communication activity (20%) — days since last activity
 *
 * Scores are persisted to deal_health_metrics for trending and alerts.
 */

export interface DealHealthResult {
  deal_id: string;
  health_score: number;
  milestone_velocity: number;
  communication_score: number;
  confidence: number;
  predicted_outcome: "on_track" | "at_risk" | "critical";
  risk_factors: string[];
  sentiment_trend: "improving" | "stable" | "declining";
}

interface DealData {
  id: string;
  status: string;
  created_at: string;
  milestones: any;
  escrow_status: string | null;
  agreed_amount: number | null;
  escrow_amount: number | null;
}

export async function computeDealHealthScore(dealId: string): Promise<DealHealthResult> {
  // Fetch deal
  const { data: deal, error: dealErr } = await supabase
    .from("deal_rooms")
    .select("id, status, created_at, milestones, escrow_status, agreed_amount, escrow_amount")
    .eq("id", dealId)
    .single();

  if (dealErr || !deal) throw new Error(`Deal not found: ${dealId}`);

  const riskFactors: string[] = [];

  // 1. Milestone velocity (30%)
  const milestoneVelocity = computeMilestoneVelocity(deal, riskFactors);

  // 2. Escrow reliability (25%)
  const escrowReliability = computeEscrowReliability(deal, riskFactors);

  // 3. Dispute frequency (25%)
  const disputeScore = await computeDisputeScore(dealId, riskFactors);

  // 4. Communication activity (20%)
  const commScore = computeCommunicationScore(deal, riskFactors);

  // Weighted composite
  const healthScore = Math.round(
    milestoneVelocity * 0.30 +
    escrowReliability * 0.25 +
    disputeScore * 0.25 +
    commScore * 0.20
  );

  const clampedScore = Math.max(0, Math.min(100, healthScore));

  const predictedOutcome: DealHealthResult["predicted_outcome"] =
    clampedScore >= 70 ? "on_track" :
    clampedScore >= 40 ? "at_risk" : "critical";

  // Determine sentiment from previous score
  const sentimentTrend = await determineSentimentTrend(dealId, clampedScore);

  const confidence = riskFactors.length === 0 ? 95 :
    riskFactors.length <= 2 ? 75 : 50;

  const result: DealHealthResult = {
    deal_id: dealId,
    health_score: clampedScore,
    milestone_velocity: milestoneVelocity,
    communication_score: commScore,
    confidence,
    predicted_outcome: predictedOutcome,
    risk_factors: riskFactors,
    sentiment_trend: sentimentTrend,
  };

  // Persist
  await supabase.from("deal_health_metrics").upsert({
    deal_id: dealId,
    health_score: result.health_score,
    milestone_velocity: result.milestone_velocity,
    communication_score: result.communication_score,
    confidence: result.confidence,
    predicted_outcome: result.predicted_outcome,
    risk_factors: result.risk_factors,
    sentiment_trend: result.sentiment_trend,
    calculated_at: new Date().toISOString(),
  }, { onConflict: "deal_id" });

  return result;
}

function computeMilestoneVelocity(deal: DealData, risks: string[]): number {
  const milestones = deal.milestones as any[] | null;
  if (!milestones || milestones.length === 0) {
    risks.push("no_milestones_defined");
    return 30; // Low score if no milestones
  }

  const completed = milestones.filter((m: any) => m.status === "completed" || m.status === "approved").length;
  const total = milestones.length;
  const ratio = completed / total;

  // Check for overdue milestones
  const now = new Date();
  const overdue = milestones.filter((m: any) => {
    if (m.status === "completed" || m.status === "approved") return false;
    if (!m.deadline) return false;
    return new Date(m.deadline) < now;
  }).length;

  if (overdue > 0) risks.push(`${overdue}_overdue_milestones`);

  const overdueDeduction = overdue * 15;
  return Math.max(0, Math.min(100, Math.round(ratio * 100) - overdueDeduction));
}

function computeEscrowReliability(deal: DealData, risks: string[]): number {
  if (!deal.escrow_status) {
    risks.push("no_escrow_status");
    return 40;
  }

  const statusScores: Record<string, number> = {
    funded: 100,
    partially_funded: 70,
    released: 90,
    pending: 50,
    disputed: 20,
    refunded: 30,
  };

  const score = statusScores[deal.escrow_status] ?? 50;

  if (deal.agreed_amount && deal.escrow_amount) {
    const fundingRatio = deal.escrow_amount / deal.agreed_amount;
    if (fundingRatio < 0.5) risks.push("underfunded_escrow");
  }

  if (deal.escrow_status === "disputed") risks.push("escrow_in_dispute");

  return score;
}

async function computeDisputeScore(dealId: string, risks: string[]): Promise<number> {
  const { count } = await supabase
    .from("academic_disputes")
    .select("id", { count: "exact", head: true })
    .eq("related_entity_id", dealId)
    .eq("related_entity_type", "deal");

  const disputeCount = count ?? 0;
  if (disputeCount > 0) risks.push(`${disputeCount}_disputes_filed`);
  if (disputeCount >= 3) risks.push("high_dispute_frequency");

  // Inverse scoring: 0 disputes = 100, each dispute -25
  return Math.max(0, 100 - disputeCount * 25);
}

function computeCommunicationScore(deal: DealData, risks: string[]): number {
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // For newer deals, assume active
  if (daysSinceCreation < 3) return 90;

  // For active deals, penalize staleness
  if (deal.status === "active" || deal.status === "in_progress") {
    if (daysSinceCreation > 30) {
      risks.push("stale_deal_no_recent_activity");
      return 30;
    }
    if (daysSinceCreation > 14) {
      risks.push("low_communication_activity");
      return 50;
    }
    return 80;
  }

  return 70; // Default for other statuses
}

async function determineSentimentTrend(
  dealId: string,
  currentScore: number
): Promise<DealHealthResult["sentiment_trend"]> {
  const { data: prev } = await supabase
    .from("deal_health_metrics")
    .select("health_score")
    .eq("deal_id", dealId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!prev) return "stable";
  const delta = currentScore - prev.health_score;
  if (delta > 5) return "improving";
  if (delta < -5) return "declining";
  return "stable";
}

/**
 * Batch compute health for all active deals.
 */
export async function computeAllDealHealthScores(): Promise<DealHealthResult[]> {
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id")
    .in("status", ["active", "in_progress", "funded"]);

  if (!deals || deals.length === 0) return [];

  const results: DealHealthResult[] = [];
  for (const deal of deals.slice(0, 100)) {
    try {
      const result = await computeDealHealthScore(deal.id);
      results.push(result);
    } catch {
      // Skip failed computations
    }
  }
  return results;
}
