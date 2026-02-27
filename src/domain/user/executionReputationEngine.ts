import { supabase } from "@/integrations/supabase/client";

/**
 * Execution Reputation Score (ERS) Engine
 *
 * A data-backed reputation score (0–100) based entirely on financial execution data.
 * Unlike LinkedIn endorsements, ERS is derived from escrow-backed verified outcomes.
 *
 * Formula weights:
 *   - Completion rate (25%) — projects completed / total projects
 *   - On-time milestone rate (20%) — milestones completed before deadline
 *   - Dispute history (20%) — inverse of dispute rate
 *   - Escrow integrity (20%) — escrow success rate from profile_proof_metrics
 *   - Sponsor rating (15%) — financial reliability score from trust profile
 *
 * Stored in user_trust_profiles.trust_score (existing field) and surfaced via hook.
 */

export interface ExecutionReputationScore {
  user_id: string;
  ers_score: number;
  completion_rate: number;
  on_time_rate: number;
  dispute_score: number;
  escrow_integrity: number;
  sponsor_satisfaction: number;
  tier: "unranked" | "emerging" | "reliable" | "proven" | "elite";
  data_points: number;
  computed_at: string;
}

export async function computeERS(userId: string): Promise<ExecutionReputationScore> {
  const [trustRes, proofRes] = await Promise.all([
    supabase
      .from("user_trust_profiles")
      .select("trust_score, successful_rate, dispute_rate, total_projects_completed, total_projects_posted, financial_reliability_score, avg_milestone_approval_hours")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("profile_proof_metrics")
      .select("escrow_success_rate, projects_completed, dispute_loss_count")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const trust = trustRes.data;
  const proof = proofRes.data;

  // 1. Completion rate (25%)
  const totalPosted = trust?.total_projects_posted ?? 0;
  const totalCompleted = trust?.total_projects_completed ?? 0;
  const completionRate = totalPosted > 0
    ? Math.min(100, Math.round((totalCompleted / totalPosted) * 100))
    : 0;

  // 2. On-time milestone rate (20%) — derived from avg approval hours
  const avgApprovalHours = trust?.avg_milestone_approval_hours ?? 72;
  // Under 48h = 100, under 96h = 70, over 96h = 40
  const onTimeRate = avgApprovalHours <= 48 ? 100 :
    avgApprovalHours <= 96 ? 70 :
    avgApprovalHours <= 168 ? 50 : 30;

  // 3. Dispute history (20%) — inverse
  const disputeRate = trust?.dispute_rate ?? 0;
  const disputeScore = Math.max(0, Math.round(100 - disputeRate * 100));

  // 4. Escrow integrity (20%)
  const escrowIntegrity = Math.round((proof?.escrow_success_rate ?? 0) * 100);

  // 5. Sponsor satisfaction / financial reliability (15%)
  const sponsorSatisfaction = Math.round((trust?.financial_reliability_score ?? 0.5) * 100);

  // Weighted ERS
  const ersRaw =
    completionRate * 0.25 +
    onTimeRate * 0.20 +
    disputeScore * 0.20 +
    escrowIntegrity * 0.20 +
    sponsorSatisfaction * 0.15;

  const ersScore = Math.max(0, Math.min(100, Math.round(ersRaw)));

  // Data points = number of completed projects (determines confidence)
  const dataPoints = totalCompleted + (proof?.projects_completed ?? 0);

  // Tier classification
  const tier = classifyTier(ersScore, dataPoints);

  return {
    user_id: userId,
    ers_score: ersScore,
    completion_rate: completionRate,
    on_time_rate: onTimeRate,
    dispute_score: disputeScore,
    escrow_integrity: escrowIntegrity,
    sponsor_satisfaction: sponsorSatisfaction,
    tier,
    data_points: dataPoints,
    computed_at: new Date().toISOString(),
  };
}

function classifyTier(score: number, dataPoints: number): ExecutionReputationScore["tier"] {
  if (dataPoints < 2) return "unranked";
  if (score >= 90 && dataPoints >= 10) return "elite";
  if (score >= 75 && dataPoints >= 5) return "proven";
  if (score >= 55 && dataPoints >= 3) return "reliable";
  return "emerging";
}

/**
 * Batch compute ERS for multiple users (e.g., for leaderboard).
 */
export async function computeBatchERS(userIds: string[]): Promise<ExecutionReputationScore[]> {
  const results: ExecutionReputationScore[] = [];
  for (const uid of userIds.slice(0, 50)) {
    try {
      results.push(await computeERS(uid));
    } catch {
      // Skip failures
    }
  }
  return results.sort((a, b) => b.ers_score - a.ers_score);
}
