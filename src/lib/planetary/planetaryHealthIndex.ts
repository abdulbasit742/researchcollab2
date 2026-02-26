/**
 * Planetary Health Index — PLANETARY_INSTITUTIONAL_HEALTH_SCORE (0-100).
 */

import { calculateLiquidityStability } from "./liquidityStability";
import { calculatePlanetaryRiskDistribution } from "./riskDistribution";
import { calculateInstitutionalLongevity } from "./institutionLongevity";
import { runMacroSimulation } from "./macroSimulationGrid";
import { calculateGlobalTrustIndex } from "@/lib/world/trustEconomyEngine";
import { calculateSystemHealth } from "@/lib/agpe/systemHealthModel";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("planetaryHealthIndex");

export interface PlanetaryHealthScore {
  liquidityStability: number;
  riskDistribution: number;
  trustStrength: number;
  governanceStability: number;
  complianceRobustness: number;
  innovationGrowth: number;
  macroResilience: number;
  institutionalLongevity: number;
  planetaryInstitutionalHealthScore: number;
  timestamp: string;
}

export async function calculatePlanetaryHealth(): Promise<PlanetaryHealthScore> {
  const [liquidity, risk, longevity, macro, trust, system] = await Promise.all([
    calculateLiquidityStability(),
    calculatePlanetaryRiskDistribution(),
    calculateInstitutionalLongevity(),
    runMacroSimulation("global_recession", 40),
    calculateGlobalTrustIndex(),
    calculateSystemHealth(),
  ]);

  const planetaryScore = Math.min(100, Math.round(
    liquidity.planetaryLiquidityStabilityIndex * 0.15 +
    (100 - risk.planetarySystemicRiskIndex) * 0.1 +
    trust.globalTrustIndex * 0.15 +
    system.governanceStability * 0.1 +
    system.complianceHealth * 0.1 +
    system.innovationGrowth * 0.1 +
    macro.planetaryMacroResilienceScore * 0.15 +
    longevity.institutionalLongevityScore * 0.15
  ));

  log.info("Planetary health calculated", { planetaryScore });

  return {
    liquidityStability: liquidity.planetaryLiquidityStabilityIndex,
    riskDistribution: 100 - risk.planetarySystemicRiskIndex,
    trustStrength: trust.globalTrustIndex,
    governanceStability: system.governanceStability,
    complianceRobustness: system.complianceHealth,
    innovationGrowth: system.innovationGrowth,
    macroResilience: macro.planetaryMacroResilienceScore,
    institutionalLongevity: longevity.institutionalLongevityScore,
    planetaryInstitutionalHealthScore: planetaryScore,
    timestamp: new Date().toISOString(),
  };
}
