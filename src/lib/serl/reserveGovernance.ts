/**
 * Reserve Governance Guardrails — constitutional enforcement on issuance policy.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveGovernance");

export interface GovernanceValidation {
  allowed: boolean;
  violations: string[];
}

const IMMUTABLE_RULES = [
  "No governance override of backing rules",
  "No political manipulation of issuance",
  "No emergency minting without simulation",
  "No trust manipulation",
  "No cross-tenant privilege escalation",
];

export function validateReserveGovernanceAction(action: string, params: {
  hasSimulation?: boolean;
  hasGovernanceApproval?: boolean;
  hasConstitutionalValidation?: boolean;
  backingRatioMaintained?: boolean;
}): GovernanceValidation {
  const violations: string[] = [];

  if (action === "mint" || action === "issue") {
    if (!params.hasSimulation) violations.push("Risk simulation required before issuance");
    if (!params.backingRatioMaintained) violations.push("Backing ratio must be maintained — no unbacked minting");
  }

  if (action === "policy_change") {
    if (!params.hasSimulation) violations.push("Risk simulation required for policy changes");
    if (!params.hasGovernanceApproval) violations.push("Governance approval required for policy changes");
    if (!params.hasConstitutionalValidation) violations.push("Constitutional validation required");
  }

  if (action === "emergency_mint") {
    if (!params.hasSimulation) violations.push("Emergency minting still requires simulation");
    if (!params.hasGovernanceApproval) violations.push("Emergency minting requires governance approval");
    violations.push("Emergency minting is constitutionally restricted");
  }

  if (action === "override_backing") {
    violations.push(IMMUTABLE_RULES[0]);
  }

  if (violations.length > 0) {
    log.warn("Reserve governance violation", { action, violations });
  }

  return { allowed: violations.length === 0, violations };
}
