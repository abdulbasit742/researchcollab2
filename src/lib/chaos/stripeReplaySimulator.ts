/**
 * Stripe Webhook Replay Simulator — tests idempotency against duplicate/malformed events.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("chaos:stripe");

/**
 * Simulate duplicate webhook event processing.
 * Verifies that the stripe_events idempotency table blocks replays.
 */
export async function simulateWebhookReplay(existingEventId: string): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");

  const results: ChaosResult[] = [];

  // Attempt 1: Insert original event
  const start1 = performance.now();
  const { error: err1 } = await (supabase as any).from("stripe_events").insert({
    event_id: existingEventId,
    event_type: "checkout.session.completed",
    processed: true,
    processed_at: new Date().toISOString(),
  });
  results.push({
    operation: "stripe_replay_original",
    success: !err1,
    durationMs: Math.round(performance.now() - start1),
    error: err1?.message,
  });

  // Attempt 2: Replay same event — should fail or be blocked
  const start2 = performance.now();
  const { error: err2 } = await (supabase as any).from("stripe_events").insert({
    event_id: existingEventId,
    event_type: "checkout.session.completed",
    processed: true,
    processed_at: new Date().toISOString(),
  });
  results.push({
    operation: "stripe_replay_duplicate",
    success: !!err2, // Success means the duplicate was BLOCKED
    durationMs: Math.round(performance.now() - start2),
    error: err2 ? undefined : "INVARIANT: Duplicate event was NOT blocked!",
    invariantViolation: !err2,
  });

  const report = buildChaosReport("stripe_webhook_replay", results);
  logChaosReport(report);
  await persistChaosReport(report);

  if (!err2) {
    log.error("CRITICAL: Stripe idempotency failed — duplicate event was accepted");
  }
}

/**
 * Simulate out-of-order webhook events.
 */
export async function simulateOutOfOrderWebhooks(): Promise<void> {
  requireChaos();
  const results: ChaosResult[] = [];
  const eventIds = Array.from({ length: 5 }, (_, i) => `chaos_evt_${Date.now()}_${i}`);

  // Shuffle order
  const shuffled = [...eventIds].sort(() => Math.random() - 0.5);

  const { supabase } = await import("@/integrations/supabase/client");

  for (const eventId of shuffled) {
    const start = performance.now();
    const { error } = await (supabase as any).from("stripe_events").insert({
      event_id: eventId,
      event_type: "payment_intent.succeeded",
      processed: true,
      processed_at: new Date().toISOString(),
    });
    results.push({
      operation: `stripe_ooo_${eventId}`,
      success: !error,
      durationMs: Math.round(performance.now() - start),
      error: error?.message,
    });
  }

  const report = buildChaosReport("stripe_out_of_order", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
