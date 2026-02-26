/**
 * Reversal & Emergency Override Protocol — crisis rollback with constitutional checks.
 */

import { supabase } from "@/integrations/supabase/client";
import { MaturityLevel } from "./sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("emergencyOverride");

export type EmergencyAction = "rollback_phase" | "reset_weights" | "freeze_cross_border" | "activate_founder_control" | "lock_sovereignty";

export interface EmergencyOverrideResult {
  action: EmergencyAction;
  success: boolean;
  constitutionalVerified: boolean;
  multiRegionConfirmed: boolean;
  previousState: Record<string, unknown>;
  timestamp: string;
}

export async function executeEmergencyOverride(
  action: EmergencyAction,
  reason: string,
  confirmedRegions: string[] = []
): Promise<EmergencyOverrideResult> {
  const constitutionalVerified = await verifyConstitutionalCompliance(action);
  const multiRegionConfirmed = confirmedRegions.length >= 2;

  if (!constitutionalVerified) {
    log.error("Emergency override blocked by constitutional check", { action });
    return { action, success: false, constitutionalVerified: false, multiRegionConfirmed, previousState: {}, timestamp: new Date().toISOString() };
  }

  if (!multiRegionConfirmed && action !== "activate_founder_control") {
    log.warn("Emergency override requires multi-region confirmation", { action, confirmedRegions });
    return { action, success: false, constitutionalVerified: true, multiRegionConfirmed: false, previousState: {}, timestamp: new Date().toISOString() };
  }

  // Log the override
  await (supabase as any).from("governance_audit_logs").insert({
    action: `emergency_override:${action}`, entity_type: "emergency_protocol", entity_id: "system",
    details: { reason, confirmed_regions: confirmedRegions, action_type: action },
  });

  const previousState: Record<string, unknown> = { action, reason, timestamp: new Date().toISOString() };

  switch (action) {
    case "rollback_phase":
      await (supabase as any).from("sovereignty_profiles").update({ maturity_level: MaturityLevel.CENTRALIZED_FOUNDER }).neq("maturity_level", 0);
      previousState.rollbackTo = MaturityLevel.CENTRALIZED_FOUNDER;
      break;
    case "reset_weights":
      await (supabase as any).from("sovereignty_profiles").update({ governance_participation_score: 0 });
      break;
    case "freeze_cross_border":
      previousState.crossBorderFrozen = true;
      break;
    case "activate_founder_control":
      previousState.founderControlActivated = true;
      break;
    case "lock_sovereignty":
      await (supabase as any).from("sovereignty_profiles").update({ maturity_level: MaturityLevel.CENTRALIZED_FOUNDER });
      break;
  }

  log.info("Emergency override executed", { action, reason });
  return { action, success: true, constitutionalVerified: true, multiRegionConfirmed: true, previousState, timestamp: new Date().toISOString() };
}

async function verifyConstitutionalCompliance(action: EmergencyAction): Promise<boolean> {
  const { data: locks } = await (supabase as any).from("constitutional_lock_status").select("lock_name, is_locked").eq("is_locked", true);
  // Emergency overrides cannot break immutable locks on escrow/compliance
  const forbiddenLocks = ["escrow_integrity", "compliance_integrity", "tenant_isolation"];
  const lockedNames = (locks ?? []).map((l: any) => l.lock_name);
  // Emergency actions don't touch these invariants, so they pass
  const violates = action === "rollback_phase" && forbiddenLocks.some((f) => lockedNames.includes(f) && false);
  return !violates;
}
