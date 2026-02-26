/**
 * Risk-Adjusted Return Modeling — RISK_ADJUSTED_RETURN_SCORE.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskReturnModel");

export interface RiskReturnAssessment {
  riskAdjustedYield: number;
  defaultProbability: number;
  capitalEfficiencyRatio: number;
  trustAdjustedReturn: number;
  liquidityAdjustedReturn: number;
  riskAdjustedReturnScore: number;
}

export function calculateRiskAdjustedReturn(params: {
  grossYield: number;
  riskScore: number;
  defaultRate: number;
  collateralRatio: number;
  trustScore: number;
  liquidityUtilization: number;
}): RiskReturnAssessment {
  const riskPenalty = params.riskScore / 100;
  const riskAdjustedYield = Math.max(0, params.grossYield * (1 - riskPenalty * 0.5));

  const defaultProb = Math.min(100, params.defaultRate * 100);
  const survivalRate = 1 - defaultProb / 100;

  const capitalEfficiency = Math.min(1, params.collateralRatio);
  const capitalEfficiencyRatio = Math.round(capitalEfficiency * 100);

  const trustMultiplier = Math.min(1.2, 0.5 + (params.trustScore / 100) * 0.7);
  const trustAdjustedReturn = Math.round(riskAdjustedYield * trustMultiplier * 100) / 100;

  const liquidityPenalty = params.liquidityUtilization > 0.9 ? 0.8 : params.liquidityUtilization > 0.7 ? 0.9 : 1;
  const liquidityAdjustedReturn = Math.round(trustAdjustedReturn * liquidityPenalty * 100) / 100;

  const composite = (
    riskAdjustedYield * 0.3 +
    survivalRate * 10 * 0.25 +
    capitalEfficiency * 10 * 0.2 +
    trustMultiplier * 8 * 0.15 +
    liquidityPenalty * 10 * 0.1
  );

  const score = Math.max(0, Math.min(100, Math.round(composite)));
  log.info("Risk-adjusted return calculated", { score });

  return {
    riskAdjustedYield: Math.round(riskAdjustedYield * 100) / 100,
    defaultProbability: Math.round(defaultProb * 100) / 100,
    capitalEfficiencyRatio,
    trustAdjustedReturn,
    liquidityAdjustedReturn,
    riskAdjustedReturnScore: score,
  };
}
