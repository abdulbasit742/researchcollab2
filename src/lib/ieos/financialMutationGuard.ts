/**
 * Financial Mutation Control Layer — intercepts and validates all financial state changes.
 */

import { validateEscrowInvariants } from "@/lib/escrow/escrowInvariants";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialMutationGuard");

export type MutationType =
  | "escrow_lock"
  | "escrow_release"
  | "escrow_refund"
  | "reserve_issuance"
  | "bond_issuance"
  | "liquidity_update"
  | "credit_recalculation"
  | "wallet_adjustment";

export interface MutationRequest {
  id: string;
  type: MutationType;
  amount?: number;
  targetId: string;
  initiatedBy: string;
  metadata?: Record<string, unknown>;
}

export interface MutationGuardResult {
  allowed: boolean;
  blockers: string[];
  riskScore: number;
  auditLogId?: string;
  evaluatedAt: string;
}

const HIGH_VALUE_THRESHOLD = 50000;
const CRITICAL_TYPES: MutationType[] = ["reserve_issuance", "bond_issuance"];

/**
 * Validate a financial mutation before execution.
 */
export async function guardFinancialMutation(request: MutationRequest): Promise<MutationGuardResult> {
  const blockers: string[] = [];
  let riskScore = 0;

  // 1. Pre-mutation invariant check
  const preCheck = await validateEscrowInvariants();
  if (!preCheck.valid) {
    blockers.push(`Pre-mutation invariant violation: ${preCheck.violations.join("; ")}`);
    riskScore += 40;
  }

  // 2. High-value transaction check
  if (request.amount && request.amount > HIGH_VALUE_THRESHOLD) {
    riskScore += 30;
    log.warn("High-value financial mutation", { type: request.type, amount: request.amount });
  }

  // 3. Critical type requires elevated review
  if (CRITICAL_TYPES.includes(request.type)) {
    riskScore += 25;
    if (!request.metadata?.governanceApproved) {
      blockers.push(`${request.type} requires governance approval`);
    }
  }

  // 4. Negative amount guard
  if (request.amount !== undefined && request.amount < 0) {
    blockers.push("Negative mutation amount not allowed");
    riskScore += 50;
  }

  // 5. Missing initiator
  if (!request.initiatedBy) {
    blockers.push("Mutation must have an identified initiator");
    riskScore += 20;
  }

  const allowed = blockers.length === 0;
  const result: MutationGuardResult = {
    allowed,
    blockers,
    riskScore: Math.min(riskScore, 100),
    evaluatedAt: new Date().toISOString(),
  };

  if (!allowed) {
    log.warn("Financial mutation blocked", { id: request.id, type: request.type, blockers });
  } else {
    log.info("Financial mutation approved", { id: request.id, type: request.type, riskScore });
  }

  return result;
}

/**
 * Post-mutation validation — run after any financial state change.
 */
export async function validatePostMutation(mutationId: string): Promise<{ valid: boolean; violations: string[] }> {
  const result = await validateEscrowInvariants();
  if (!result.valid) {
    log.warn("Post-mutation invariant violation", { mutationId, violations: result.violations });
  }
  return { valid: result.valid, violations: result.violations };
}
