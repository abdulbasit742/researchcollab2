/**
 * Monitoring hooks — tracks critical operation failures for alerting.
 * Integrates with the structured logger; can be extended with external webhooks.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "./logger";

const log = createLogger("monitoring");

type AlertSeverity = "info" | "warning" | "critical";

interface MonitoringEvent {
  event_type: string;
  severity: AlertSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record a monitoring event to the platform_alerts table + log it.
 */
async function recordAlert(event: MonitoringEvent): Promise<void> {
  log.warn(`[ALERT:${event.severity}] ${event.event_type}: ${event.message}`, event.metadata);

  try {
    await supabase.from("platform_alerts").insert({
      alert_type: event.event_type,
      severity: event.severity,
      message: event.message,
      metadata: event.metadata ?? {},
      is_resolved: false,
    });
  } catch {
    log.error("Failed to persist monitoring alert");
  }
}

// ─── Domain-Specific Monitors ──────────────────────────────────

export function trackEscrowFundingFailure(dealId: string, reason: string) {
  return recordAlert({
    event_type: "escrow_funding_failure",
    severity: "critical",
    message: `Escrow funding failed for deal ${dealId}: ${reason}`,
    metadata: { dealId, reason },
  });
}

export function trackWithdrawalFailure(userId: string, amount: number, reason: string) {
  return recordAlert({
    event_type: "withdrawal_failure",
    severity: "warning",
    message: `Withdrawal of ${amount} failed for user: ${reason}`,
    metadata: { userId, amount, reason },
  });
}

export function trackStripeWebhookFailure(eventId: string, reason: string) {
  return recordAlert({
    event_type: "stripe_webhook_failure",
    severity: "critical",
    message: `Stripe webhook processing failed: ${reason}`,
    metadata: { eventId, reason },
  });
}

export function trackLedgerMismatch(userId: string, expected: number, actual: number) {
  return recordAlert({
    event_type: "ledger_mismatch",
    severity: "critical",
    message: `Ledger mismatch detected: expected ${expected}, actual ${actual}`,
    metadata: { userId, expected, actual, delta: Math.abs(expected - actual) },
  });
}

export function trackSuspiciousActivity(userId: string, activityType: string) {
  return recordAlert({
    event_type: "suspicious_activity",
    severity: "warning",
    message: `Suspicious activity detected: ${activityType}`,
    metadata: { userId, activityType },
  });
}
