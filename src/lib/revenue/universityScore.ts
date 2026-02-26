/**
 * University Performance Score — composite score per tenant/institution.
 */

import { calculateCompletionMetrics } from "./dealCompletionMetrics";
import { calculateSponsorRetention } from "./sponsorRetention";
import { calculateEscrowVelocity } from "./escrowVelocity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("universityScore");

export interface UniversityScore {
  tenantId: string;
  completionRate: number;
  disputeRate: number;
  repeatRate: number;
  avgVelocityHours: number;
  overallScore: number; // 0–100
}

export async function calculateUniversityScore(tenantId: string): Promise<UniversityScore> {
  const [completion, retention, velocity] = await Promise.all([
    calculateCompletionMetrics(tenantId),
    calculateSponsorRetention(tenantId),
    calculateEscrowVelocity(tenantId),
  ]);

  // Weighted composite score
  const completionScore = completion.completionRate * 0.35; // 35%
  const lowDisputeScore = Math.max(0, (100 - completion.disputeRate * 5)) * 0.2; // 20%
  const retentionScore = retention.repeatRate * 0.25; // 25%
  const velocityScore = Math.min(100, Math.max(0, 100 - velocity.avgCompletionTimeHours / 2)) * 0.2; // 20%

  const overallScore = Math.round(completionScore + lowDisputeScore + retentionScore + velocityScore);

  const score: UniversityScore = {
    tenantId,
    completionRate: completion.completionRate,
    disputeRate: completion.disputeRate,
    repeatRate: retention.repeatRate,
    avgVelocityHours: velocity.avgCompletionTimeHours,
    overallScore: Math.min(100, Math.max(0, overallScore)),
  };

  log.info("University score calculated", { tenantId, overallScore: score.overallScore });
  return score;
}
