/**
 * Decision Cooling Protocol — enforces a 72-hour cooling period on major founder decisions.
 * Prevents impulse-driven strategic moves by requiring metric review before approval.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("decisionCooling");

export type CoolingDecisionType =
  | "new_feature"
  | "new_region"
  | "new_financial_instrument"
  | "pricing_change"
  | "major_hire"
  | "architecture_change"
  | "escrow_cap_increase"
  | "institution_onboarding"
  | "marketing_campaign"
  | "partnership_commitment";

export interface CoolingRequest {
  id: string;
  decisionType: CoolingDecisionType;
  title: string;
  description: string;
  justification: string;
  requestedAt: string;
  coolingExpiresAt: string;
  status: "cooling" | "approved" | "rejected" | "expired";
  validationScore: number | null;
  validationDetails: ValidationResult | null;
  founderId: string;
}

export interface ValidationResult {
  escrowReliability: boolean;
  disputeRateReduction: boolean;
  institutionalRetention: boolean;
  ledgerIntegrity: boolean;
  operationalClarity: boolean;
  securityPosture: boolean;
  reconciliationSimplicity: boolean;
  positiveCount: number;
  passesThreshold: boolean;
}

const COOLING_PERIOD_HOURS = 72;
const VALIDATION_THRESHOLD = 4; // Must pass at least 4 of 7 criteria

/**
 * Submit a decision for cooling period enforcement.
 */
export function createCoolingRequest(
  decisionType: CoolingDecisionType,
  title: string,
  description: string,
  justification: string,
  founderId: string
): CoolingRequest {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + COOLING_PERIOD_HOURS * 3600000);

  const request: CoolingRequest = {
    id: `cool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    decisionType,
    title,
    description,
    justification,
    requestedAt: now.toISOString(),
    coolingExpiresAt: expiresAt.toISOString(),
    status: "cooling",
    validationScore: null,
    validationDetails: null,
    founderId,
  };

  log.info("Decision cooling period started", {
    id: request.id,
    type: decisionType,
    title,
    expiresAt: expiresAt.toISOString(),
  });

  return request;
}

/**
 * Check if cooling period has elapsed.
 */
export function isCoolingComplete(request: CoolingRequest): boolean {
  return new Date() >= new Date(request.coolingExpiresAt);
}

/**
 * Run the 7-point validation matrix against a decision.
 */
export function runValidationMatrix(answers: {
  escrowReliability: boolean;
  disputeRateReduction: boolean;
  institutionalRetention: boolean;
  ledgerIntegrity: boolean;
  operationalClarity: boolean;
  securityPosture: boolean;
  reconciliationSimplicity: boolean;
}): ValidationResult {
  const positiveCount = Object.values(answers).filter(Boolean).length;
  return {
    ...answers,
    positiveCount,
    passesThreshold: positiveCount >= VALIDATION_THRESHOLD,
  };
}

/**
 * Attempt to approve a decision after cooling and validation.
 */
export async function approveDecision(
  request: CoolingRequest,
  validation: ValidationResult
): Promise<CoolingRequest> {
  if (!isCoolingComplete(request)) {
    const remaining = Math.ceil(
      (new Date(request.coolingExpiresAt).getTime() - Date.now()) / 3600000
    );
    log.warn("Cannot approve — cooling period active", {
      id: request.id,
      hoursRemaining: remaining,
    });
    return { ...request, validationDetails: validation, validationScore: validation.positiveCount };
  }

  if (!validation.passesThreshold) {
    log.warn("Decision rejected — insufficient validation score", {
      id: request.id,
      score: validation.positiveCount,
      required: VALIDATION_THRESHOLD,
    });
    request = {
      ...request,
      status: "rejected",
      validationScore: validation.positiveCount,
      validationDetails: validation,
    };
  } else {
    log.info("Decision approved after cooling and validation", {
      id: request.id,
      score: validation.positiveCount,
    });
    request = {
      ...request,
      status: "approved",
      validationScore: validation.positiveCount,
      validationDetails: validation,
    };
  }

  // Audit log
  await (supabase as any).from("governance_audit_logs").insert({
    action: `founder_decision_${request.status}`,
    entity_type: "decision_cooling",
    entity_id: request.id,
    details: {
      decision_type: request.decisionType,
      title: request.title,
      validation_score: request.validationScore,
      passes_threshold: validation.passesThreshold,
      cooling_hours: COOLING_PERIOD_HOURS,
    },
  });

  return request;
}

/**
 * Get the remaining cooling time in hours.
 */
export function getRemainingCoolingHours(request: CoolingRequest): number {
  const remaining = new Date(request.coolingExpiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 3600000));
}
