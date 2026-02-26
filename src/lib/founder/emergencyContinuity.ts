/**
 * Emergency Governance Continuity Protocol — activates when founder becomes unavailable.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("emergencyContinuity");

export type ContinuityTrigger = "founder_inactive" | "founder_access_lost" | "manual_activation";

export interface ContinuityState {
  active: boolean;
  trigger?: ContinuityTrigger;
  activatedAt?: string;
  frozenModules: string[];
  preservedModules: string[];
  expansionDisabled: boolean;
}

let continuityState: ContinuityState = {
  active: false,
  frozenModules: [],
  preservedModules: [],
  expansionDisabled: false,
};

const HIGH_RISK_MODULES = ["reserve", "bond", "liquidity", "credit_algorithm", "interoperability"];
const PRESERVED_MODULES = ["escrow", "ledger", "wallet", "sla", "monitoring"];

/**
 * Activate emergency governance continuity mode.
 */
export function activateContinuityMode(trigger: ContinuityTrigger): ContinuityState {
  continuityState = {
    active: true,
    trigger,
    activatedAt: new Date().toISOString(),
    frozenModules: [...HIGH_RISK_MODULES],
    preservedModules: [...PRESERVED_MODULES],
    expansionDisabled: true,
  };

  log.warn("Emergency governance continuity ACTIVATED", { trigger });
  return { ...continuityState };
}

/**
 * Deactivate continuity mode (requires explicit authority).
 */
export function deactivateContinuityMode(authorizedBy: string): ContinuityState {
  if (!continuityState.active) return { ...continuityState };

  log.info("Emergency governance continuity DEACTIVATED", { authorizedBy });
  continuityState = {
    active: false,
    frozenModules: [],
    preservedModules: [],
    expansionDisabled: false,
  };
  return { ...continuityState };
}

/**
 * Check if a module is operational under continuity mode.
 */
export function isModuleOperational(moduleName: string): boolean {
  if (!continuityState.active) return true;
  if (continuityState.frozenModules.includes(moduleName)) return false;
  return true;
}

/**
 * Check if strategic expansion is allowed.
 */
export function isExpansionAllowed(): boolean {
  return !continuityState.expansionDisabled;
}

/**
 * Get current continuity state.
 */
export function getContinuityState(): ContinuityState {
  return { ...continuityState };
}
