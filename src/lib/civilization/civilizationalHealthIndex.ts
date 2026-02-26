/**
 * Civilizational Health Index — CIVILIZATIONAL_STABILITY_SCORE (0-100).
 */

import { modelEconomicResilience } from "./economicResilience";
import { calculateShockAbsorption } from "./shockAbsorptionModel";
import { calculateFailoverReadiness } from "./sovereignFailover";
import { calculateGovernanceContinuity } from "./intergenerationalGovernance";
import { assessInstitutionalContinuity } from "./institutionalContinuity";
import { calculateGlobalTrustIndex } from "@/lib/world/trustEconomyEngine";
import { calculateGlobalRisk } from "@/lib/world/globalRiskEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("civilizationalHealthIndex");

export interface CivilizationalHealthScore {
  economicResilience: number;
  trustStrength: number;
  complianceHealth: number;
  governanceStability: number;
  shockAbsorption: number;
  innovationGrowth: number;
  riskDistribution: number;
  failoverReadiness: number;
  civilizationalStabilityScore: number;
  timestamp: string;
}

export async function calculateCivilizationalHealth(): Promise<CivilizationalHealthScore> {
  const [resilience, shock, failover, governance, continuity, trust, risk] = await Promise.all([
    modelEconomicResilience("global_recession", 50),
    calculateShockAbsorption(),
    calculateFailoverReadiness(),
    calculateGovernanceContinuity(),
    assessInstitutionalContinuity(),
    calculateGlobalTrustIndex(),
    calculateGlobalRisk(),
  ]);

  const riskDistribution = Math.max(0, 100 - risk.globalSystemicRiskScore);

  const civilizationalScore = Math.min(100, Math.round(
    resilience.economicResilienceScore * 0.15 +
    trust.globalTrustIndex * 0.15 +
    continuity.continuityScore * 0.1 +
    governance.continuityIndex * 0.15 +
    shock.shockAbsorptionScore * 0.15 +
    failover.failoverReadinessIndex * 0.1 +
    riskDistribution * 0.1 +
    continuity.escrowIntegrity * 0.1
  ));

  log.info("Civilizational health calculated", { civilizationalScore });

  return {
    economicResilience: resilience.economicResilienceScore,
    trustStrength: trust.globalTrustIndex,
    complianceHealth: continuity.escrowIntegrity,
    governanceStability: governance.continuityIndex,
    shockAbsorption: shock.shockAbsorptionScore,
    innovationGrowth: Math.round(trust.capitalReliabilityTrust * 0.8),
    riskDistribution,
    failoverReadiness: failover.failoverReadinessIndex,
    civilizationalStabilityScore: civilizationalScore,
    timestamp: new Date().toISOString(),
  };
}
