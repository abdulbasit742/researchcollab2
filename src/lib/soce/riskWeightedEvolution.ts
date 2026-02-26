/**
 * Risk-Weighted Evolution Engine — gate optimizations by systemic risk threshold.
 */

import { calculatePlanetaryRiskDistribution } from "@/lib/planetary/riskDistribution";
import { calculateLiquidityStability } from "@/lib/planetary/liquidityStability";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskWeightedEvolution");

const RISK_THRESHOLD = 65;

export interface RiskGateResult {
  systemicRisk: number;
  capitalShockRisk: number;
  complianceErosionRisk: number;
  trustFragility: number;
  combinedRiskScore: number;
  threshold: number;
  approved: boolean;
  blockReasons: string[];
}

export async function evaluateEvolutionRisk(proposalDescription: string): Promise<RiskGateResult> {
  const [risk, liquidity] = await Promise.all([
    calculatePlanetaryRiskDistribution(),
    calculateLiquidityStability(),
  ]);

  const systemicRisk = risk.planetarySystemicRiskIndex;
  const capitalShock = Math.min(100, liquidity.highRiskConcentration + liquidity.capitalStagnationRisk * 0.3);
  const complianceErosion = risk.complianceFragilityBands * 10;
  const trustFrag = risk.trustFragilityScore;

  const combined = Math.round(systemicRisk * 0.35 + capitalShock * 0.25 + complianceErosion * 0.2 + trustFrag * 0.2);
  const approved = combined < RISK_THRESHOLD;

  const blockReasons: string[] = [];
  if (!approved) {
    if (systemicRisk > 60) blockReasons.push(`Systemic risk (${systemicRisk}) exceeds safe threshold`);
    if (capitalShock > 60) blockReasons.push(`Capital shock risk (${Math.round(capitalShock)}) too high`);
    if (complianceErosion > 50) blockReasons.push(`Compliance fragility elevated`);
    if (trustFrag > 50) blockReasons.push(`Trust fragility score (${trustFrag}) indicates instability`);
    log.warn("Evolution proposal blocked by risk gate", { combined, proposalDescription });
  } else {
    log.info("Evolution proposal risk-approved", { combined, proposalDescription });
  }

  return {
    systemicRisk, capitalShockRisk: Math.round(capitalShock), complianceErosionRisk: complianceErosion,
    trustFragility: trustFrag, combinedRiskScore: combined, threshold: RISK_THRESHOLD,
    approved, blockReasons,
  };
}
