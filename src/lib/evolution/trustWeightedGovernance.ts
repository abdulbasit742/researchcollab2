/**
 * Distributed Trust Weight Model — multi-factor voting weight with caps.
 */

import { getSovereigntyProfile } from "./sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("trustWeightedGovernance");

export interface VotingWeight {
  tenantId: string;
  rawWeight: number;
  cappedWeight: number;
  factors: {
    trustFactor: number;
    capitalFactor: number;
    complianceFactor: number;
    longevityFactor: number;
    disputePenalty: number;
    participationBonus: number;
  };
  capApplied: boolean;
}

const MAX_VOTING_CAP_PERCENT = 25;

const WEIGHTS = {
  trust: 0.30,
  capital: 0.20,
  compliance: 0.20,
  longevity: 0.15,
  dispute: -0.10,
  participation: 0.05,
};

export async function calculateVotingWeight(tenantId: string, allTenantIds: string[]): Promise<VotingWeight> {
  const profile = await getSovereigntyProfile(tenantId);

  const trustFactor = (profile?.trustScore ?? 0) * WEIGHTS.trust;
  const capitalFactor = (profile?.capitalContributionScore ?? 0) * WEIGHTS.capital;
  const complianceFactor = (profile?.complianceScore ?? 0) * WEIGHTS.compliance;
  const longevityFactor = (profile?.longevityScore ?? 0) * WEIGHTS.longevity;
  const disputePenalty = 0; // derived from external dispute data
  const participationBonus = (profile?.governanceParticipationScore ?? 0) * WEIGHTS.participation;

  const rawWeight = Math.max(0, trustFactor + capitalFactor + complianceFactor + longevityFactor + disputePenalty + participationBonus);

  // Calculate total weights for cap
  let totalRaw = rawWeight;
  for (const tid of allTenantIds) {
    if (tid === tenantId) continue;
    const p = await getSovereigntyProfile(tid);
    if (p) {
      totalRaw += (p.trustScore * WEIGHTS.trust) + (p.capitalContributionScore * WEIGHTS.capital) +
        (p.complianceScore * WEIGHTS.compliance) + (p.longevityScore * WEIGHTS.longevity) +
        (p.governanceParticipationScore * WEIGHTS.participation);
    }
  }

  const maxAllowed = totalRaw > 0 ? (totalRaw * MAX_VOTING_CAP_PERCENT / 100) : rawWeight;
  const cappedWeight = Math.min(rawWeight, maxAllowed);
  const capApplied = cappedWeight < rawWeight;

  if (capApplied) log.warn("Voting cap applied", { tenantId, rawWeight, cappedWeight });

  return {
    tenantId, rawWeight: Math.round(rawWeight * 100) / 100, cappedWeight: Math.round(cappedWeight * 100) / 100,
    factors: { trustFactor, capitalFactor, complianceFactor, longevityFactor, disputePenalty, participationBonus },
    capApplied,
  };
}
