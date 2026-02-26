import { computeTrustScore } from "./trustEngine";
import { computeProfileStrengthForUser } from "./profileStrengthEngine";
import { computeReputationScore } from "./reputationGraph";
import { computeDisputeRisk } from "./riskEngine";
import { detectFraudPatterns } from "./fraudEngine";

/**
 * Metrics Scheduler — recomputes all intelligence metrics for a user.
 *
 * Triggers:
 *   - After deal completed
 *   - After dispute logged
 *   - After profile updated
 *   - After endorsement added
 *
 * Debounced: use with a 5-second delay to prevent rapid recomputation.
 */

const pendingRecomputes = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 5000;

export function scheduleRecompute(userId: string) {
  // Clear any pending recompute for this user
  const existing = pendingRecomputes.get(userId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    pendingRecomputes.delete(userId);
    recomputeAllMetrics(userId).catch(err =>
      console.error(`[metricsScheduler] Failed to recompute for ${userId}:`, err)
    );
  }, DEBOUNCE_MS);

  pendingRecomputes.set(userId, timer);
}

export async function recomputeAllMetrics(userId: string): Promise<{
  trust_score: number;
  profile_strength: number;
  reputation_score: number;
  risk_score: number;
  fraud_flagged: boolean;
}> {
  const [trustScore, profileStrength, reputation, risk, fraud] = await Promise.all([
    computeTrustScore(userId),
    computeProfileStrengthForUser(userId),
    computeReputationScore(userId),
    computeDisputeRisk(userId),
    detectFraudPatterns(userId),
  ]);

  return {
    trust_score: trustScore,
    profile_strength: profileStrength,
    reputation_score: reputation.reputation_score,
    risk_score: risk.risk_score,
    fraud_flagged: fraud.is_flagged,
  };
}
