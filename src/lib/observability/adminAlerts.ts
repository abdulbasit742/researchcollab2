/**
 * Admin Alerts — persists critical system alerts for admin visibility.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("adminAlerts");

type AlertSeverity = "info" | "warning" | "critical";

/**
 * Create an admin alert.
 */
export async function createAdminAlert(
  title: string,
  message: string,
  severity: AlertSeverity,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  log.warn(`Admin alert [${severity}]: ${title}`);

  try {
    await supabase.from("platform_alerts").insert({
      alert_type: title.toLowerCase().replace(/\s+/g, "_"),
      severity,
      message,
      metadata,
      is_resolved: false,
    });
  } catch {
    log.error("Failed to persist admin alert");
  }
}

/**
 * Resolve an alert by ID.
 */
export async function resolveAlert(alertId: string): Promise<void> {
  await (supabase as any)
    .from("platform_alerts")
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", alertId);
}

/**
 * Get unresolved alerts count.
 */
export async function getUnresolvedAlertCount(): Promise<number> {
  const { count } = await (supabase as any)
    .from("platform_alerts")
    .select("id", { count: "exact", head: true })
    .eq("is_resolved", false);

  return count ?? 0;
}

// ─── Convenience alert triggers ────────────────────────────────

export function alertEscrowAnomaly(dealId: string, details: string) {
  return createAdminAlert("Escrow Anomaly", `Deal ${dealId}: ${details}`, "critical", { dealId });
}

export function alertWalletDrift(userId: string, delta: number) {
  return createAdminAlert("Wallet Drift", `User wallet drift: PKR ${delta}`, delta > 1000 ? "critical" : "warning", { userId, delta });
}

export function alertStripeFailure(eventId: string, reason: string) {
  return createAdminAlert("Stripe Webhook Failure", reason, "critical", { eventId });
}

export function alertHighDisputeRate(userId: string, count: number) {
  return createAdminAlert("High Dispute Rate", `User has ${count} disputes in 24h`, "warning", { userId, count });
}

export function alertRateLimitAbuse(userId: string, action: string) {
  return createAdminAlert("Rate Limit Abuse", `User hitting rate limits on ${action}`, "warning", { userId, action });
}
