/**
 * Institutional Autonomy Unlock Engine — conditional autonomy grants.
 */

import { getSovereigntyProfile, MaturityLevel } from "./sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("autonomyUnlock");

export interface AutonomyCapabilities {
  autonomousCapitalRouting: boolean;
  regionalRiskAdjustment: boolean;
  localGovernanceAuthority: boolean;
  regionalComplianceAdaptation: boolean;
  autonomyLevel: number;
  blockers: string[];
}

const COMPLIANCE_THRESHOLD = 80;
const TRUST_THRESHOLD = 65;
const LONGEVITY_THRESHOLD = 60; // ~3 years

export async function evaluateAutonomy(tenantId: string): Promise<AutonomyCapabilities> {
  const profile = await getSovereigntyProfile(tenantId);
  const blockers: string[] = [];

  if (!profile) {
    return { autonomousCapitalRouting: false, regionalRiskAdjustment: false, localGovernanceAuthority: false, regionalComplianceAdaptation: false, autonomyLevel: 0, blockers: ["No sovereignty profile"] };
  }

  if (profile.complianceScore < COMPLIANCE_THRESHOLD) blockers.push(`Compliance score ${profile.complianceScore} < ${COMPLIANCE_THRESHOLD}`);
  if (profile.trustScore < TRUST_THRESHOLD) blockers.push(`Trust score ${profile.trustScore} < ${TRUST_THRESHOLD}`);
  if (profile.longevityScore < LONGEVITY_THRESHOLD) blockers.push(`Longevity score ${profile.longevityScore} < ${LONGEVITY_THRESHOLD} (~3yr)`);

  const qualified = blockers.length === 0;
  const atLeastLevel2 = profile.maturityLevel >= MaturityLevel.WEIGHTED_INSTITUTIONAL;
  const atLeastLevel3 = profile.maturityLevel >= MaturityLevel.DISTRIBUTED_SOVEREIGN;

  const caps: AutonomyCapabilities = {
    autonomousCapitalRouting: qualified && atLeastLevel2,
    regionalRiskAdjustment: qualified && atLeastLevel2,
    localGovernanceAuthority: qualified && atLeastLevel3,
    regionalComplianceAdaptation: qualified && atLeastLevel3,
    autonomyLevel: qualified ? profile.maturityLevel : 0,
    blockers,
  };

  log.info("Autonomy evaluated", { tenantId, autonomyLevel: caps.autonomyLevel, blockers: blockers.length });
  return caps;
}
