/**
 * Long-Term Survival Modeling System — multi-horizon forecasting.
 */

import { calculatePlanetaryHealth } from "@/lib/planetary/planetaryHealthIndex";
import { calculatePlanetaryRiskDistribution } from "@/lib/planetary/riskDistribution";
import { calculateInstitutionalLongevity } from "@/lib/planetary/institutionLongevity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("longTermSurvival");

export interface SurvivalProjection {
  horizon: string;
  years: number;
  survivalProbability: number;
  capitalGrowthTrajectory: number;
  trustDecayTrajectory: number;
  governanceFragmentationRisk: number;
  innovationStagnationProbability: number;
  liquidityCollapseProbability: number;
  complianceErosionProbability: number;
}

export interface LongTermSurvivalResult {
  projections: SurvivalProjection[];
  longTermSurvivalProbability: number;
  timestamp: string;
}

export async function modelLongTermSurvival(): Promise<LongTermSurvivalResult> {
  const [health, risk, longevity] = await Promise.all([
    calculatePlanetaryHealth(),
    calculatePlanetaryRiskDistribution(),
    calculateInstitutionalLongevity(),
  ]);

  const baseHealth = health.planetaryInstitutionalHealthScore;
  const baseRisk = risk.planetarySystemicRiskIndex;
  const baseLongevity = longevity.institutionalLongevityScore;

  const horizons: { label: string; years: number; decayFactor: number }[] = [
    { label: "5-year", years: 5, decayFactor: 0.02 },
    { label: "10-year", years: 10, decayFactor: 0.03 },
    { label: "25-year", years: 25, decayFactor: 0.04 },
    { label: "50-year", years: 50, decayFactor: 0.05 },
  ];

  const projections: SurvivalProjection[] = horizons.map((h) => {
    const decay = Math.pow(1 - h.decayFactor, h.years);
    const survival = Math.max(5, Math.min(99, Math.round(baseHealth * decay * 1.1)));
    const capitalGrowth = Math.max(0, Math.round((100 - baseRisk * 0.5) * decay));
    const trustDecay = Math.min(100, Math.round(longevity.trustDecayProjection * (1 + h.decayFactor * h.years * 0.3)));
    const govFrag = Math.min(100, Math.round(baseRisk * 0.4 * (1 + h.years * 0.01)));
    const innovStag = Math.min(100, Math.round((100 - health.innovationGrowth) * (1 + h.years * 0.005)));
    const liqCollapse = Math.min(100, Math.round(baseRisk * 0.3 * (1 + h.years * 0.008)));
    const compErosion = Math.min(100, Math.round((100 - health.complianceRobustness) * (1 + h.years * 0.006)));

    return {
      horizon: h.label, years: h.years, survivalProbability: survival,
      capitalGrowthTrajectory: capitalGrowth, trustDecayTrajectory: trustDecay,
      governanceFragmentationRisk: govFrag, innovationStagnationProbability: innovStag,
      liquidityCollapseProbability: liqCollapse, complianceErosionProbability: compErosion,
    };
  });

  const longTermProb = Math.round(projections.reduce((s, p) => s + p.survivalProbability, 0) / projections.length);

  log.info("Long-term survival modeled", { longTermProb });
  return { projections, longTermSurvivalProbability: longTermProb, timestamp: new Date().toISOString() };
}
