/**
 * Launch Lock — prevents go-live if validation fails.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("launchLock");

const LOCK_KEY = "rcollab_launch_locked";

/**
 * Check if launch is currently locked (default: locked).
 */
export function isLaunchLocked(): boolean {
  try {
    return localStorage.getItem(LOCK_KEY) !== "unlocked";
  } catch {
    return true;
  }
}

/**
 * Unlock launch — only after all validations pass.
 */
export function unlockLaunch(): void {
  try {
    localStorage.setItem(LOCK_KEY, "unlocked");
    log.info("Launch UNLOCKED by admin");
  } catch { /* noop */ }
}

/**
 * Lock launch (re-lock after issues detected).
 */
export function lockLaunch(): void {
  try {
    localStorage.setItem(LOCK_KEY, "locked");
    log.warn("Launch LOCKED");
  } catch { /* noop */ }
}

/**
 * Guard: throws if launch is locked.
 */
export function requireLaunchUnlocked(): void {
  if (isLaunchLocked()) {
    throw new Error("Launch is locked. Run all validations and unlock via platform admin.");
  }
}
