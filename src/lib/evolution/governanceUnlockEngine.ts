/**
 * Phase-Controlled Governance Unlock — capability grants based on maturity.
 */

import { MaturityLevel, getNetworkMaturityLevel, getSovereigntyProfile } from "./sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governanceUnlock");

export interface GovernanceCapabilities {
  canVote: boolean;
  votingWeightMultiplier: number;
  canProposePolicy: boolean;
  canVoteCrossBorder: boolean;
  canInfluenceCapitalRouting: boolean;
  canVoteRiskThresholds: boolean;
  founderOverrideActive: boolean;
}

const CAPABILITY_UNLOCKS: Record<MaturityLevel, Partial<GovernanceCapabilities>> = {
  [MaturityLevel.CENTRALIZED_FOUNDER]: { canVote: false, votingWeightMultiplier: 0, canProposePolicy: false, canVoteCrossBorder: false, canInfluenceCapitalRouting: false, canVoteRiskThresholds: false },
  [MaturityLevel.REGIONAL_ADVISORY]: { canVote: true, votingWeightMultiplier: 0.5, canProposePolicy: false, canVoteCrossBorder: false, canInfluenceCapitalRouting: false, canVoteRiskThresholds: false },
  [MaturityLevel.WEIGHTED_INSTITUTIONAL]: { canVote: true, votingWeightMultiplier: 1.0, canProposePolicy: true, canVoteCrossBorder: false, canInfluenceCapitalRouting: false, canVoteRiskThresholds: true },
  [MaturityLevel.DISTRIBUTED_SOVEREIGN]: { canVote: true, votingWeightMultiplier: 1.5, canProposePolicy: true, canVoteCrossBorder: true, canInfluenceCapitalRouting: true, canVoteRiskThresholds: true },
  [MaturityLevel.CONSTITUTIONAL_DISTRIBUTED]: { canVote: true, votingWeightMultiplier: 2.0, canProposePolicy: true, canVoteCrossBorder: true, canInfluenceCapitalRouting: true, canVoteRiskThresholds: true },
};

const FOUNDER_OVERRIDE_EXPIRY_LEVEL = MaturityLevel.DISTRIBUTED_SOVEREIGN;

export async function getGovernanceCapabilities(tenantId: string): Promise<GovernanceCapabilities> {
  const profile = await getSovereigntyProfile(tenantId);
  const networkLevel = await getNetworkMaturityLevel();
  const tenantLevel = profile?.maturityLevel ?? MaturityLevel.CENTRALIZED_FOUNDER;

  const caps = CAPABILITY_UNLOCKS[tenantLevel];
  const founderOverrideActive = networkLevel < FOUNDER_OVERRIDE_EXPIRY_LEVEL;

  const result: GovernanceCapabilities = {
    canVote: caps.canVote ?? false,
    votingWeightMultiplier: caps.votingWeightMultiplier ?? 0,
    canProposePolicy: caps.canProposePolicy ?? false,
    canVoteCrossBorder: caps.canVoteCrossBorder ?? false,
    canInfluenceCapitalRouting: caps.canInfluenceCapitalRouting ?? false,
    canVoteRiskThresholds: caps.canVoteRiskThresholds ?? false,
    founderOverrideActive,
  };

  log.info("Governance capabilities resolved", { tenantId, tenantLevel, founderOverrideActive });
  return result;
}
