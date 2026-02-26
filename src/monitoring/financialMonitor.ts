/**
 * Financial Monitor — event emitter for all financial operations.
 * Read-only observation layer. Never mutates data.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialMonitor");

type FinancialEvent =
  | "escrow.funded"
  | "escrow.released"
  | "escrow.refunded"
  | "escrow.disputed"
  | "milestone.released"
  | "deal.transitioned"
  | "invariant.failure"
  | "rollback"
  | "sla.breach";

type EventHandler = (data: Record<string, unknown>) => void;

const listeners = new Map<FinancialEvent, EventHandler[]>();

export const financialMonitor = {
  on(event: FinancialEvent, handler: EventHandler): void {
    const existing = listeners.get(event) ?? [];
    existing.push(handler);
    listeners.set(event, existing);
  },

  emit(event: FinancialEvent, data: Record<string, unknown>): void {
    log.info(`Financial event: ${event}`, data);

    const handlers = listeners.get(event) ?? [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (err) {
        log.error(`Handler error for ${event}`, err);
      }
    }
  },

  /** Remove all listeners (for testing). */
  reset(): void {
    listeners.clear();
  },
};
