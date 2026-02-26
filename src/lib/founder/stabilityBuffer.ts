/**
 * Institutional Stability Buffer — prevents panic cascades during leadership uncertainty.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("stabilityBuffer");

export interface StabilityBufferState {
  active: boolean;
  capitalIssuanceCapped: boolean;
  liquidityFrozen: boolean;
  reserveThrottled: boolean;
  bondIssuanceSuspended: boolean;
  activatedAt?: string;
  reason?: string;
}

let bufferState: StabilityBufferState = {
  active: false,
  capitalIssuanceCapped: false,
  liquidityFrozen: false,
  reserveThrottled: false,
  bondIssuanceSuspended: false,
};

/**
 * Activate stability buffer with specific protections.
 */
export function activateStabilityBuffer(
  reason: string,
  protections: Partial<Pick<StabilityBufferState, "capitalIssuanceCapped" | "liquidityFrozen" | "reserveThrottled" | "bondIssuanceSuspended">> = {}
): StabilityBufferState {
  bufferState = {
    active: true,
    capitalIssuanceCapped: protections.capitalIssuanceCapped ?? true,
    liquidityFrozen: protections.liquidityFrozen ?? false,
    reserveThrottled: protections.reserveThrottled ?? true,
    bondIssuanceSuspended: protections.bondIssuanceSuspended ?? true,
    activatedAt: new Date().toISOString(),
    reason,
  };

  log.warn("Institutional stability buffer ACTIVATED", { reason, protections: bufferState });
  return { ...bufferState };
}

/**
 * Deactivate stability buffer.
 */
export function deactivateStabilityBuffer(authorizedBy: string): StabilityBufferState {
  if (!bufferState.active) return { ...bufferState };

  log.info("Institutional stability buffer DEACTIVATED", { authorizedBy });
  bufferState = {
    active: false,
    capitalIssuanceCapped: false,
    liquidityFrozen: false,
    reserveThrottled: false,
    bondIssuanceSuspended: false,
  };
  return { ...bufferState };
}

/**
 * Check if a specific financial operation is allowed under current buffer state.
 */
export function isOperationAllowed(operation: "capital_issuance" | "liquidity_update" | "reserve_issuance" | "bond_issuance"): boolean {
  if (!bufferState.active) return true;
  switch (operation) {
    case "capital_issuance": return !bufferState.capitalIssuanceCapped;
    case "liquidity_update": return !bufferState.liquidityFrozen;
    case "reserve_issuance": return !bufferState.reserveThrottled;
    case "bond_issuance": return !bufferState.bondIssuanceSuspended;
    default: return true;
  }
}

/**
 * Get current buffer state.
 */
export function getBufferState(): StabilityBufferState {
  return { ...bufferState };
}
