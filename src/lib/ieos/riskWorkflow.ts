/**
 * Risk Approval Workflow — tiered risk evaluation and approval routing.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskWorkflow");

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface RiskEvaluation {
  changeId: string;
  tier: RiskTier;
  autoApproved: boolean;
  requiresReview: boolean;
  requiresGovernance: boolean;
  requiresEmergencyOverride: boolean;
  factors: string[];
  evaluatedAt: string;
}

export interface RiskFactors {
  financialImpact: boolean;
  complianceChange: boolean;
  governanceChange: boolean;
  escrowModification: boolean;
  reserveModification: boolean;
  bondModification: boolean;
  creditAlgorithmChange: boolean;
  liquidityModelChange: boolean;
  userFacingChange: boolean;
  riskScore: number;
}

/**
 * Evaluate risk tier for a change and determine approval routing.
 */
export function evaluateRiskTier(changeId: string, factors: RiskFactors): RiskEvaluation {
  const flaggedFactors: string[] = [];
  let score = factors.riskScore;

  if (factors.financialImpact) { score += 15; flaggedFactors.push("financial_impact"); }
  if (factors.complianceChange) { score += 20; flaggedFactors.push("compliance_change"); }
  if (factors.governanceChange) { score += 20; flaggedFactors.push("governance_change"); }
  if (factors.escrowModification) { score += 25; flaggedFactors.push("escrow_modification"); }
  if (factors.reserveModification) { score += 30; flaggedFactors.push("reserve_modification"); }
  if (factors.bondModification) { score += 25; flaggedFactors.push("bond_modification"); }
  if (factors.creditAlgorithmChange) { score += 15; flaggedFactors.push("credit_algorithm_change"); }
  if (factors.liquidityModelChange) { score += 15; flaggedFactors.push("liquidity_model_change"); }

  const tier = scoreToTier(score);

  const evaluation: RiskEvaluation = {
    changeId,
    tier,
    autoApproved: tier === "low",
    requiresReview: tier === "medium" || tier === "high",
    requiresGovernance: tier === "high" || tier === "critical",
    requiresEmergencyOverride: tier === "critical",
    factors: flaggedFactors,
    evaluatedAt: new Date().toISOString(),
  };

  log.info("Risk evaluated", { changeId, tier, score, factors: flaggedFactors.length });
  return evaluation;
}

function scoreToTier(score: number): RiskTier {
  if (score <= 20) return "low";
  if (score <= 50) return "medium";
  if (score <= 80) return "high";
  return "critical";
}

/**
 * Check if a risk evaluation allows proceeding.
 */
export function canProceed(evaluation: RiskEvaluation, approvals: { reviewed?: boolean; governanceApproved?: boolean; emergencyOverride?: boolean }): boolean {
  if (evaluation.autoApproved) return true;
  if (evaluation.requiresEmergencyOverride && !approvals.emergencyOverride) return false;
  if (evaluation.requiresGovernance && !approvals.governanceApproved) return false;
  if (evaluation.requiresReview && !approvals.reviewed) return false;
  return true;
}
