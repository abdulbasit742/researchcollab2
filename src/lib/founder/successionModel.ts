/**
 * Succession Readiness Model — measures system readiness for founder authority reduction.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("successionModel");

export interface SuccessionFactors {
  governanceMaturity: number; // 0-100
  institutionalLeadershipReadiness: number; // 0-100
  creditSystemStability: number; // 0-100
  liquidityResilience: number; // 0-100
  founderDependencyRatio: number; // 0-100 (lower = better)
  escrowStability: number; // 0-100
  multiPartyDecisionRate: number; // 0-100%
  autonomousOperationCapability: number; // 0-100
}

export interface SuccessionReadinessReport {
  score: number; // 0-100
  ready: boolean;
  phase: "high_dependency" | "transition_ready" | "distributed" | "autonomous";
  factors: SuccessionFactors;
  recommendations: string[];
  evaluatedAt: string;
}

/**
 * Calculate the Succession Readiness Score.
 */
export function calculateSuccessionReadiness(factors: SuccessionFactors): SuccessionReadinessReport {
  const recommendations: string[] = [];

  // Weighted score calculation
  const weights = {
    governanceMaturity: 0.20,
    institutionalLeadershipReadiness: 0.15,
    creditSystemStability: 0.10,
    liquidityResilience: 0.10,
    founderDependencyRatio: 0.20, // inverted — lower dependency = higher contribution
    escrowStability: 0.10,
    multiPartyDecisionRate: 0.10,
    autonomousOperationCapability: 0.05,
  };

  let score = 0;
  score += factors.governanceMaturity * weights.governanceMaturity;
  score += factors.institutionalLeadershipReadiness * weights.institutionalLeadershipReadiness;
  score += factors.creditSystemStability * weights.creditSystemStability;
  score += factors.liquidityResilience * weights.liquidityResilience;
  score += (100 - factors.founderDependencyRatio) * weights.founderDependencyRatio; // Invert
  score += factors.escrowStability * weights.escrowStability;
  score += factors.multiPartyDecisionRate * weights.multiPartyDecisionRate;
  score += factors.autonomousOperationCapability * weights.autonomousOperationCapability;
  score = Math.round(score);

  // Determine phase
  let phase: SuccessionReadinessReport["phase"];
  if (score < 30) phase = "high_dependency";
  else if (score < 55) phase = "transition_ready";
  else if (score < 80) phase = "distributed";
  else phase = "autonomous";

  // Generate recommendations
  if (factors.governanceMaturity < 50) {
    recommendations.push("Strengthen governance pod maturity before reducing founder authority");
  }
  if (factors.founderDependencyRatio > 60) {
    recommendations.push("Reduce founder-sole decision rate — delegate to multi-party workflows");
  }
  if (factors.multiPartyDecisionRate < 40) {
    recommendations.push("Increase multi-party decision rate for critical operations");
  }
  if (factors.escrowStability < 80) {
    recommendations.push("Escrow stability must exceed 80% before succession planning");
  }
  if (factors.autonomousOperationCapability < 30) {
    recommendations.push("Build autonomous operation capability — system must self-heal without founder");
  }

  log.info("Succession readiness evaluated", { score, phase });

  return { score, ready: score >= 55, phase, factors, recommendations, evaluatedAt: new Date().toISOString() };
}
