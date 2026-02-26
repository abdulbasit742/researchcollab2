/**
 * Multi-Dimensional Objective Function Engine — CIVILIZATIONAL_OBJECTIVE_SCORE.
 */

import { calculatePlanetaryHealth } from "@/lib/planetary/planetaryHealthIndex";
import { calculatePlanetaryRiskDistribution } from "@/lib/planetary/riskDistribution";
import { calculateInstitutionalLongevity } from "@/lib/planetary/institutionLongevity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("objectiveFunction");

export interface ObjectiveDimension {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
}

export interface ObjectiveFunctionResult {
  dimensions: ObjectiveDimension[];
  civilizationalObjectiveScore: number;
  timestamp: string;
}

const DEFAULT_WEIGHTS = {
  capitalIntegrity: 0.15,
  innovationGrowth: 0.15,
  complianceRobustness: 0.12,
  trustStability: 0.15,
  liquiditySufficiency: 0.10,
  governanceResilience: 0.10,
  riskMinimization: 0.13,
  institutionalLongevity: 0.10,
};

export async function calculateObjectiveScore(
  weightOverrides?: Partial<typeof DEFAULT_WEIGHTS>
): Promise<ObjectiveFunctionResult> {
  const weights = { ...DEFAULT_WEIGHTS, ...weightOverrides };
  const [health, risk, longevity] = await Promise.all([
    calculatePlanetaryHealth(),
    calculatePlanetaryRiskDistribution(),
    calculateInstitutionalLongevity(),
  ]);

  const dims: ObjectiveDimension[] = [
    { name: "Capital Integrity", score: health.liquidityStability, weight: weights.capitalIntegrity, weightedScore: 0 },
    { name: "Innovation Growth", score: health.innovationGrowth, weight: weights.innovationGrowth, weightedScore: 0 },
    { name: "Compliance Robustness", score: health.complianceRobustness, weight: weights.complianceRobustness, weightedScore: 0 },
    { name: "Trust Stability", score: health.trustStrength, weight: weights.trustStability, weightedScore: 0 },
    { name: "Liquidity Sufficiency", score: health.liquidityStability, weight: weights.liquiditySufficiency, weightedScore: 0 },
    { name: "Governance Resilience", score: health.governanceStability, weight: weights.governanceResilience, weightedScore: 0 },
    { name: "Risk Minimization", score: Math.max(0, 100 - risk.planetarySystemicRiskIndex), weight: weights.riskMinimization, weightedScore: 0 },
    { name: "Institutional Longevity", score: longevity.institutionalLongevityScore, weight: weights.institutionalLongevity, weightedScore: 0 },
  ];

  for (const d of dims) d.weightedScore = Math.round(d.score * d.weight * 100) / 100;
  const total = Math.min(100, Math.round(dims.reduce((s, d) => s + d.weightedScore, 0)));

  log.info("Objective score calculated", { total });

  return { dimensions: dims, civilizationalObjectiveScore: total, timestamp: new Date().toISOString() };
}
