/**
 * Escrow Anomaly Detection — detects suspicious escrow patterns.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { captureMessage } from "./errorTracker";

const log = createLogger("escrowAnomaly");

type AnomalySeverity = "low" | "medium" | "high" | "critical";

interface AnomalyEvent {
  entity_type: string;
  entity_id: string;
  anomaly_type: string;
  severity: AnomalySeverity;
  details?: Record<string, unknown>;
}

async function recordAnomaly(event: AnomalyEvent): Promise<void> {
  log.warn(`Escrow anomaly: ${event.anomaly_type}`, { ...event });
  captureMessage(`Escrow anomaly: ${event.anomaly_type}`, "warning", {
    dealId: event.entity_id,
    operation: event.anomaly_type,
  });

  try {
    await supabase.from("platform_events").insert({
      event_type: `anomaly:${event.anomaly_type}`,
      severity: event.severity,
      payload: {
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        ...event.details,
      },
    });
  } catch {
    log.error("Failed to persist anomaly event");
  }
}

/**
 * Detect escrow funding mismatch — wallet escrow ≠ deal escrow_amount.
 */
export async function detectFundingMismatch(dealId: string, userId: string): Promise<boolean> {
  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("escrow_amount, escrow_status")
    .eq("id", dealId)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("escrow_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (!deal || !wallet) return false;

  if (deal.escrow_status === "funded" && (deal.escrow_amount ?? 0) > wallet.escrow_balance) {
    await recordAnomaly({
      entity_type: "deal",
      entity_id: dealId,
      anomaly_type: "escrow_funding_mismatch",
      severity: "high",
      details: { dealEscrow: deal.escrow_amount, walletEscrow: wallet.escrow_balance },
    });
    return true;
  }
  return false;
}

/**
 * Detect deal creation spike — more than 10 deals from one user in 1 hour.
 */
export async function detectDealCreationSpike(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  const { count } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) > 10) {
    await recordAnomaly({
      entity_type: "user",
      entity_id: userId,
      anomaly_type: "deal_creation_spike",
      severity: "medium",
      details: { count, window: "1h" },
    });
    return true;
  }
  return false;
}

/**
 * Detect multiple disputes from same sponsor — more than 3 in 24h.
 */
export async function detectDisputeSpike(userId: string): Promise<boolean> {
  const dayAgo = new Date(Date.now() - 86400_000).toISOString();

  const { count } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .eq("status", "disputed")
    .gte("updated_at", dayAgo);

  if ((count ?? 0) > 3) {
    await recordAnomaly({
      entity_type: "user",
      entity_id: userId,
      anomaly_type: "dispute_spike",
      severity: "high",
      details: { count, window: "24h" },
    });
    return true;
  }
  return false;
}
