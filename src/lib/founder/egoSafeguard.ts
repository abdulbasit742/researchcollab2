/**
 * Ego Override Safeguard — blocks silent high-risk founder overrides.
 */

import { logFounderDecision, type FounderDecision, type DecisionType } from "./decisionLog";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("egoSafeguard");

export interface OverrideAttempt {
  decisionType: DecisionType;
  riskLevel: "high" | "critical";
  description: string;
  justification: string;
  founderId: string;
}

export interface SafeguardResult {
  allowed: boolean;
  requiresMultiParty: boolean;
  deploymentDelayed: boolean;
  simulationRequired: boolean;
  blockers: string[];
  logged: boolean;
}

const RESTRICTED_ACTIONS: DecisionType[] = [
  "escrow_override",
  "reserve_issuance",
  "governance_veto",
  "release_gate_bypass",
];

/**
 * Evaluate a founder override attempt against safeguard rules.
 */
export async function evaluateOverrideAttempt(attempt: OverrideAttempt): Promise<SafeguardResult> {
  const blockers: string[] = [];
  let requiresMultiParty = false;
  let deploymentDelayed = false;
  let simulationRequired = false;

  // All high/critical overrides require multi-party review
  requiresMultiParty = true;

  // Restricted actions always require simulation
  if (RESTRICTED_ACTIONS.includes(attempt.decisionType)) {
    simulationRequired = true;
  }

  // Critical risk always delays deployment
  if (attempt.riskLevel === "critical") {
    deploymentDelayed = true;
    blockers.push("Critical-risk override requires 48h deployment delay");
  }

  // Escrow overrides are the most restricted
  if (attempt.decisionType === "escrow_override") {
    blockers.push("Escrow override requires governance pod approval + stability simulation");
  }

  // Reserve issuance acceleration
  if (attempt.decisionType === "reserve_issuance") {
    blockers.push("Reserve issuance acceleration requires multi-party capital review");
  }

  // No justification = blocked
  if (!attempt.justification || attempt.justification.trim().length < 20) {
    blockers.push("Insufficient justification — minimum 20 characters required");
  }

  // Log the attempt regardless
  const decision: FounderDecision = {
    id: `override_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    decisionType: attempt.decisionType,
    riskLevel: attempt.riskLevel,
    impactScope: ["platform_wide"],
    overrideFlag: true,
    description: attempt.description,
    justification: attempt.justification,
    reviewedByOthers: false,
    timestamp: new Date().toISOString(),
  };

  await logFounderDecision(decision);

  const allowed = blockers.length === 0;

  if (!allowed) {
    log.warn("Ego override blocked", { type: attempt.decisionType, blockers });
  } else {
    log.info("Override attempt evaluated — requires review", { type: attempt.decisionType });
  }

  return {
    allowed,
    requiresMultiParty,
    deploymentDelayed,
    simulationRequired,
    blockers,
    logged: true,
  };
}
