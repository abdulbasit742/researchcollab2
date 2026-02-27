/**
 * Execution Reputation Score (ERS) Engine
 * Replaces LinkedIn's endorsement-based credibility with escrow-verified execution metrics.
 * Scoring is fully explainable — no black-box ranking.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("executionReputationScore");

export interface ERSBreakdown {
  onTimeMilestonePct: number;       // Weight: 25%
  disputeFreeCompletionPct: number; // Weight: 25%
  sponsorRepeatPct: number;         // Weight: 20%
  projectComplexityFactor: number;  // Weight: 15%
  institutionalValidationScore: number; // Weight: 15%
  totalScore: number;               // 0–100
  tier: "emerging" | "established" | "proven" | "elite";
  projectCount: number;
  totalEscrowHandled: number;
  explainability: string[];
}

const WEIGHTS = {
  onTime: 0.25,
  disputeFree: 0.25,
  sponsorRepeat: 0.20,
  complexity: 0.15,
  institutional: 0.15,
} as const;

function classifyTier(score: number, projectCount: number): ERSBreakdown["tier"] {
  if (projectCount < 3) return "emerging";
  if (score >= 85) return "elite";
  if (score >= 65) return "proven";
  return "established";
}

export async function calculateERS(userId: string): Promise<ERSBreakdown> {
  // Fetch accountability records for the user (as executor)
  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .eq("executor_id", userId);

  const all = records ?? [];
  const projectCount = all.length;

  // On-time milestone %
  const completed = all.filter((r) => r.outcome_status === "completed");
  const onTime = completed.filter((r) => {
    if (!r.deadline || !r.verified_at) return true; // no deadline = on time
    return new Date(r.verified_at) <= new Date(r.deadline);
  });
  const onTimePct = completed.length > 0 ? (onTime.length / completed.length) * 100 : 0;

  // Dispute-free completion %
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const disputeFreePct = projectCount > 0 ? ((projectCount - disputed.length) / projectCount) * 100 : 0;

  // Sponsor repeat % (unique sponsors who funded more than once)
  const sponsorIds = all.map((r) => r.funder_id).filter(Boolean);
  const sponsorCounts = sponsorIds.reduce<Record<string, number>>((acc, id) => {
    acc[id!] = (acc[id!] || 0) + 1;
    return acc;
  }, {});
  const uniqueSponsors = Object.keys(sponsorCounts).length;
  const repeatSponsors = Object.values(sponsorCounts).filter((c) => c > 1).length;
  const sponsorRepeatPct = uniqueSponsors > 0 ? (repeatSponsors / uniqueSponsors) * 100 : 0;

  // Project complexity factor (based on escrow amounts and team size)
  const totalEscrow = all.reduce((sum, r) => sum + (r.escrow_amount ?? 0), 0);
  const avgEscrow = projectCount > 0 ? totalEscrow / projectCount : 0;
  // Normalize: 0-10K = low, 10K-50K = medium, 50K+ = high
  const complexityFactor = Math.min(100, Math.round(
    Math.min(50, avgEscrow / 1000) + Math.min(50, projectCount * 5)
  ));

  // Institutional validation score
  const { count: validatedCount } = await supabase
    .from("academic_records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verification_status", "verified");

  const institutionalScore = Math.min(100, (validatedCount ?? 0) * 20);

  // Calculate total
  const totalScore = Math.min(100, Math.round(
    onTimePct * WEIGHTS.onTime +
    disputeFreePct * WEIGHTS.disputeFree +
    sponsorRepeatPct * WEIGHTS.sponsorRepeat +
    complexityFactor * WEIGHTS.complexity +
    institutionalScore * WEIGHTS.institutional
  ));

  const tier = classifyTier(totalScore, projectCount);

  // Explainability
  const explainability: string[] = [];
  if (onTimePct >= 90) explainability.push("Exceptional on-time delivery record");
  else if (onTimePct < 50) explainability.push("On-time delivery needs improvement");
  if (disputeFreePct >= 95) explainability.push("Near-zero dispute rate");
  if (sponsorRepeatPct >= 50) explainability.push("High sponsor loyalty — repeat funding");
  if (institutionalScore >= 60) explainability.push("Strong institutional validation");
  if (projectCount < 3) explainability.push("Early career — score will stabilize with more projects");

  log.info("ERS calculated", { userId, totalScore, tier, projectCount });

  return {
    onTimeMilestonePct: Math.round(onTimePct * 100) / 100,
    disputeFreeCompletionPct: Math.round(disputeFreePct * 100) / 100,
    sponsorRepeatPct: Math.round(sponsorRepeatPct * 100) / 100,
    projectComplexityFactor: complexityFactor,
    institutionalValidationScore: institutionalScore,
    totalScore,
    tier,
    projectCount,
    totalEscrowHandled: totalEscrow,
    explainability,
  };
}
