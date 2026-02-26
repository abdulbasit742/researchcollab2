/**
 * Multi-Generational Stability Index — MULTI_GENERATIONAL_STABILITY_INDEX (0-100).
 */

import { modelLongTermSurvival } from "./longTermSurvivalModel";
import { analyzeGovernanceStability } from "./governanceStability";
import { calculatePlanetaryRiskDistribution } from "@/lib/planetary/riskDistribution";
import { calculateLiquidityStability } from "@/lib/planetary/liquidityStability";
import { calculateGlobalTrustIndex } from "@/lib/world/trustEconomyEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("multiGenStability");

export interface MultiGenerationalStabilityResult {
  fiveYearSurvival: number;
  twentyFiveYearStability: number;
  governanceMaturity: number;
  trustEquilibrium: number;
  riskDistributionStability: number;
  liquiditySufficiency: number;
  innovationTrajectory: number;
  multiGenerationalStabilityIndex: number;
  timestamp: string;
}

export async function calculateMultiGenerationalStability(): Promise<MultiGenerationalStabilityResult> {
  const [survival, governance, risk, liquidity, trust] = await Promise.all([
    modelLongTermSurvival(),
    analyzeGovernanceStability(),
    calculatePlanetaryRiskDistribution(),
    calculateLiquidityStability(),
    calculateGlobalTrustIndex(),
  ]);

  const fiveYear = survival.projections.find((p) => p.years === 5)?.survivalProbability ?? 50;
  const twentyFive = survival.projections.find((p) => p.years === 25)?.survivalProbability ?? 30;
  const riskStability = Math.max(0, 100 - risk.planetarySystemicRiskIndex);
  const innovTrajectory = Math.max(0, 100 - (survival.projections.find((p) => p.years === 10)?.innovationStagnationProbability ?? 50));

  const index = Math.min(100, Math.round(
    fiveYear * 0.15 + twentyFive * 0.15 + governance.governanceStabilityScore * 0.15 +
    trust.globalTrustIndex * 0.15 + riskStability * 0.1 +
    liquidity.planetaryLiquidityStabilityIndex * 0.15 + innovTrajectory * 0.15
  ));

  log.info("Multi-generational stability calculated", { index });

  return {
    fiveYearSurvival: fiveYear, twentyFiveYearStability: twentyFive,
    governanceMaturity: governance.governanceStabilityScore,
    trustEquilibrium: trust.globalTrustIndex, riskDistributionStability: riskStability,
    liquiditySufficiency: liquidity.planetaryLiquidityStabilityIndex,
    innovationTrajectory: innovTrajectory, multiGenerationalStabilityIndex: index,
    timestamp: new Date().toISOString(),
  };
}
