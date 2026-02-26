/**
 * Trust recompute queue — debounced, deduplicated trust recalculation.
 * Prevents recompute storms when multiple deal events fire at once.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("trustQueue");

const DEBOUNCE_MS = 5000;

const pendingUsers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Enqueue a trust recompute for a user. Deduplicated within DEBOUNCE_MS window.
 */
export function enqueueTrustRecompute(
  userId: string,
  recomputeFn: (uid: string) => Promise<void>
): void {
  // Cancel existing timer for this user
  const existing = pendingUsers.get(userId);
  if (existing) {
    clearTimeout(existing);
  }

  const timer = setTimeout(async () => {
    pendingUsers.delete(userId);
    try {
      log.info("Executing debounced trust recompute", { userId });
      await recomputeFn(userId);
    } catch (err) {
      log.error("Trust recompute failed", err);
    }
  }, DEBOUNCE_MS);

  pendingUsers.set(userId, timer);
  log.debug("Trust recompute enqueued", { userId, pendingCount: pendingUsers.size });
}

/**
 * Batch enqueue for multiple users (e.g., both deal parties).
 */
export function enqueueTrustRecomputeBatch(
  userIds: string[],
  recomputeFn: (uid: string) => Promise<void>
): void {
  const unique = [...new Set(userIds.filter(Boolean))];
  for (const uid of unique) {
    enqueueTrustRecompute(uid, recomputeFn);
  }
}

/**
 * Flush all pending — useful for testing or shutdown.
 */
export function flushPendingRecomputes(): void {
  for (const [, timer] of pendingUsers) {
    clearTimeout(timer);
  }
  pendingUsers.clear();
}

/**
 * Get count of pending recomputes.
 */
export function getPendingCount(): number {
  return pendingUsers.size;
}
