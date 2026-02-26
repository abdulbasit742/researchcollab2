/**
 * Founder Dependency Score — measures how dependent the system is on founder involvement.
 */

import { getRecentDecisions } from "./decisionLog";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("dependencyScore");

export interface DependencyReport {
  score: number; // 0-100, lower = healthier
  soleDecisionRate: number; // % of critical decisions made solely by founder
  governanceDependencyRate: number; // % of governance dependent on founder vote
  financialApprovalRate: number; // % of financial activation requiring founder
  emergencyOverrideFrequency: number;
  trend: "improving" | "stable" | "worsening";
  evaluatedAt: string;
}

/**
 * Calculate the Founder Dependency Score.
 */
export async function calculateDependencyScore(): Promise<DependencyReport> {
  const decisions = await getRecentDecisions(200);

  const last90Days = decisions.filter(d => {
    const age = Date.now() - new Date(d.timestamp).getTime();
    return age < 90 * 24 * 3600000;
  });

  const totalDecisions = last90Days.length || 1;
  const soleDecisions = last90Days.filter(d => !d.reviewedByOthers).length;
  const governanceDecisions = last90Days.filter(d =>
    d.decisionType === "governance_veto" || d.decisionType === "policy_escalation"
  ).length;
  const financialDecisions = last90Days.filter(d =>
    d.decisionType === "capital_activation" || d.decisionType === "reserve_issuance" || d.decisionType === "escrow_override"
  ).length;
  const emergencyOverrides = last90Days.filter(d => d.decisionType === "emergency_override").length;

  const soleDecisionRate = Math.round((soleDecisions / totalDecisions) * 100);
  const governanceDependencyRate = Math.round((governanceDecisions / totalDecisions) * 100);
  const financialApprovalRate = Math.round((financialDecisions / totalDecisions) * 100);

  let score = 0;
  score += soleDecisionRate * 0.4;
  score += governanceDependencyRate * 0.25;
  score += financialApprovalRate * 0.25;
  score += Math.min(emergencyOverrides * 5, 10);
  score = Math.min(Math.round(score), 100);

  // Trend detection — compare first half vs second half of window
  const midpoint = last90Days.length / 2;
  const firstHalf = last90Days.slice(Math.floor(midpoint));
  const secondHalf = last90Days.slice(0, Math.floor(midpoint));
  const firstSoleRate = firstHalf.length > 0 ? firstHalf.filter(d => !d.reviewedByOthers).length / firstHalf.length : 0;
  const secondSoleRate = secondHalf.length > 0 ? secondHalf.filter(d => !d.reviewedByOthers).length / secondHalf.length : 0;
  let trend: DependencyReport["trend"] = "stable";
  if (secondSoleRate < firstSoleRate - 0.1) trend = "improving";
  else if (secondSoleRate > firstSoleRate + 0.1) trend = "worsening";

  log.info("Founder dependency evaluated", { score, trend });

  return {
    score,
    soleDecisionRate,
    governanceDependencyRate,
    financialApprovalRate,
    emergencyOverrideFrequency: emergencyOverrides,
    trend,
    evaluatedAt: new Date().toISOString(),
  };
}
