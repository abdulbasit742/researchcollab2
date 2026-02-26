/**
 * Capital Redemption Framework — controlled, throttled, risk-aware.
 */

import { supabase } from "@/integrations/supabase/client";
import { monitorReserveStability } from "./stabilityMonitor";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("redemptionEngine");

const STRESS_THRESHOLD = 40;
const MAX_REDEMPTION_RATE = 0.1; // max 10% of supply per redemption cycle

export interface RedemptionResult {
  unitId: string;
  redeemedAmount: number;
  status: "redeemed" | "throttled" | "blocked";
  reason?: string;
}

export async function redeemReserveUnit(unitId: string): Promise<RedemptionResult> {
  const { data: unit } = await (supabase as any).from("reserve_units").select("*").eq("id", unitId).maybeSingle();
  if (!unit) throw new Error("Reserve unit not found");
  if (unit.is_redeemed) return { unitId, redeemedAmount: 0, status: "blocked", reason: "Already redeemed" };

  // Stress check
  const stability = await monitorReserveStability();
  if (stability.reserveStabilityScore < STRESS_THRESHOLD) {
    log.warn("Redemption throttled — system under stress", { stabilityScore: stability.reserveStabilityScore });
    return { unitId, redeemedAmount: 0, status: "throttled", reason: `Reserve stability ${stability.reserveStabilityScore} below threshold ${STRESS_THRESHOLD}` };
  }

  // Rate limit check
  const { data: recentRedemptions } = await (supabase as any).from("reserve_units")
    .select("unit_value").eq("is_redeemed", true)
    .gte("redeemed_at", new Date(Date.now() - 86400000).toISOString());
  const recentTotal = (recentRedemptions ?? []).reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);

  const { data: allActive } = await (supabase as any).from("reserve_units").select("unit_value").eq("is_redeemed", false);
  const totalActive = (allActive ?? []).reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);

  if (totalActive > 0 && (recentTotal + unit.unit_value) / totalActive > MAX_REDEMPTION_RATE) {
    return { unitId, redeemedAmount: 0, status: "throttled", reason: "Daily redemption rate limit exceeded" };
  }

  // Execute redemption
  await (supabase as any).from("reserve_units").update({
    is_redeemed: true, redeemed_at: new Date().toISOString(), compliance_status: "redeemed",
  }).eq("id", unitId);

  log.info("Reserve unit redeemed", { unitId, amount: unit.backing_capital_amount });
  return { unitId, redeemedAmount: unit.backing_capital_amount, status: "redeemed" };
}
