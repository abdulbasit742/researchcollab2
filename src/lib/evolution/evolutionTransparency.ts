/**
 * Transparent Evolution Snapshot — anonymized sovereignty evolution metrics.
 */

import { calculateEvolutionHealth } from "./evolutionHealthIndex";
import { getNetworkMaturityLevel, MATURITY_LABELS, MaturityLevel } from "./sovereigntyMaturity";
import { simulateCapitalVotingShift } from "./capitalVotingShift";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("evolutionTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface EvolutionTransparencySnapshot {
  currentSovereigntyPhase: string;
  governanceDistributionRatio: { founder: number; institutional: number; distributed: number };
  votingWeightBand: string;
  trustDistributionBand: string;
  captureRiskBand: string;
  evolutionStabilityBand: string;
  maturityLevel: number;
  timestamp: string;
}

export async function generateEvolutionSnapshot(): Promise<EvolutionTransparencySnapshot> {
  const [health, maturity] = await Promise.all([
    calculateEvolutionHealth(),
    getNetworkMaturityLevel(),
  ]);

  const inception = 2026;
  const years = new Date().getFullYear() - inception;
  const votingDist = simulateCapitalVotingShift(Math.max(0, years));

  log.info("Evolution transparency snapshot generated");

  return {
    currentSovereigntyPhase: MATURITY_LABELS[maturity as MaturityLevel] ?? "Unknown",
    governanceDistributionRatio: {
      founder: votingDist.founderInfluencePercent,
      institutional: votingDist.institutionalInfluencePercent,
      distributed: votingDist.distributedInfluencePercent,
    },
    votingWeightBand: toBand(health.trustDistributionBalance),
    trustDistributionBand: toBand(health.trustDistributionBalance),
    captureRiskBand: toBand(100 - health.captureRisk),
    evolutionStabilityBand: toBand(health.evolutionStabilityScore),
    maturityLevel: maturity,
    timestamp: new Date().toISOString(),
  };
}
