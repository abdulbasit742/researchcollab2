/**
 * Chaos Controller — gates chaos testing to non-production environments only.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("chaos");

const CHAOS_STORAGE_KEY = "rcollab_chaos_enabled";

/**
 * Whether chaos mode is currently enabled.
 */
export function isChaosEnabled(): boolean {
  if (isProductionEnvironment()) return false;
  try {
    return localStorage.getItem(CHAOS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Enable chaos mode (non-production only).
 */
export function enableChaos(): boolean {
  if (isProductionEnvironment()) {
    log.error("BLOCKED: Chaos mode cannot be enabled in production");
    return false;
  }
  try {
    localStorage.setItem(CHAOS_STORAGE_KEY, "true");
    log.warn("Chaos mode ENABLED");
    return true;
  } catch {
    return false;
  }
}

/**
 * Disable chaos mode.
 */
export function disableChaos(): void {
  try {
    localStorage.removeItem(CHAOS_STORAGE_KEY);
  } catch { /* noop */ }
  log.info("Chaos mode disabled");
}

/**
 * Returns true with the given probability (0–1). Default 0.5.
 */
export function chaosProbability(probability = 0.5): boolean {
  if (!isChaosEnabled()) return false;
  return Math.random() < probability;
}

/**
 * Guard: throws if chaos not enabled.
 */
export function requireChaos(): void {
  if (!isChaosEnabled()) {
    throw new Error("Chaos mode is not enabled. Enable it first.");
  }
}

function isProductionEnvironment(): boolean {
  const mode = import.meta.env.MODE;
  return mode === "production";
}
