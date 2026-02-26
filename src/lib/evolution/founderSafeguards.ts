/**
 * Founder Veto Safeguards — transparent, logged, expiring founder controls.
 */

import { supabase } from "@/integrations/supabase/client";
import { MaturityLevel, getNetworkMaturityLevel } from "./sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("founderSafeguards");

export type FounderAction = "veto_proposal" | "freeze_escalation" | "reverse_vote" | "lock_capital_routing" | "emergency_reset";

export interface FounderVetoRecord {
  action: FounderAction;
  targetId: string;
  reason: string;
  timestamp: string;
  networkMaturityAtTime: MaturityLevel;
  wasExpired: boolean;
}

const FOUNDER_EXPIRY_LEVEL = MaturityLevel.CONSTITUTIONAL_DISTRIBUTED;

export async function isFounderAuthorityActive(): Promise<boolean> {
  const level = await getNetworkMaturityLevel();
  return level < FOUNDER_EXPIRY_LEVEL;
}

export async function executeFounderAction(action: FounderAction, targetId: string, reason: string): Promise<FounderVetoRecord> {
  const level = await getNetworkMaturityLevel();
  const expired = level >= FOUNDER_EXPIRY_LEVEL;

  if (expired && action !== "emergency_reset") {
    log.warn("Founder authority expired", { action, level });
    return { action, targetId, reason, timestamp: new Date().toISOString(), networkMaturityAtTime: level, wasExpired: true };
  }

  // Audit log
  await (supabase as any).from("governance_audit_logs").insert({
    action: `founder_${action}`, entity_type: "founder_safeguard", entity_id: targetId,
    details: { reason, network_maturity: level, action_type: action },
  });

  log.info("Founder action executed", { action, targetId });
  return { action, targetId, reason, timestamp: new Date().toISOString(), networkMaturityAtTime: level, wasExpired: false };
}

export async function getFounderDependencyRatio(): Promise<number> {
  const level = await getNetworkMaturityLevel();
  // 100% at level 0, decreasing to 0% at level 4
  return Math.max(0, Math.round((1 - level / 4) * 100));
}
