/**
 * SOCE Transparency Report — anonymized system optimization metrics.
 */

import { calculateObjectiveScore } from "./objectiveFunction";
import { modelLongTermSurvival } from "./longTermSurvivalModel";
import { detectTrustDrift } from "./trustDriftEngine";
import { assessInequality } from "./inequalityRegulator";
import { calculateMultiGenerationalStability } from "./multiGenerationalStability";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("soceTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface SOCETransparencyReport {
  objectiveScoreBand: string;
  survivalProbabilityBand: string;
  innovationOptimizationBand: string;
  trustDriftBand: string;
  inequalityBand: string;
  stabilityIndexBand: string;
  objectiveScore: number;
  stabilityIndex: number;
  timestamp: string;
}

export async function generateSOCETransparencyReport(): Promise<SOCETransparencyReport> {
  const [objective, survival, drift, inequality, stability] = await Promise.all([
    calculateObjectiveScore(),
    modelLongTermSurvival(),
    detectTrustDrift(),
    assessInequality(),
    calculateMultiGenerationalStability(),
  ]);

  log.info("SOCE transparency report generated");

  return {
    objectiveScoreBand: toBand(objective.civilizationalObjectiveScore),
    survivalProbabilityBand: toBand(survival.longTermSurvivalProbability),
    innovationOptimizationBand: toBand(100 - (survival.projections[0]?.innovationStagnationProbability ?? 50)),
    trustDriftBand: toBand(100 - drift.overallDriftScore),
    inequalityBand: toBand(inequality.inequalityBalanceIndex),
    stabilityIndexBand: toBand(stability.multiGenerationalStabilityIndex),
    objectiveScore: objective.civilizationalObjectiveScore,
    stabilityIndex: stability.multiGenerationalStabilityIndex,
    timestamp: new Date().toISOString(),
  };
}
