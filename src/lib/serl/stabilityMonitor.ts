/**
 * Reserve Stability Monitoring Engine — RESERVE_STABILITY_SCORE (0–100).
 */

import { supabase } from "@/integrations/supabase/client";
import { getTotalReserveSupply } from "./reserveUnit";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("stabilityMonitor");

export interface ReserveStability {
  backingRatio: number;
  capitalConcentration: number;
  crossBorderExposure: number;
  liquiditySufficiency: number;
  defaultExposure: number;
  trustStability: number;
  riskWeightShift: number;
  reserveStabilityScore: number;
}

export async function monitorReserveStability(): Promise<ReserveStability> {
  const supply = await getTotalReserveSupply();
  const backingRatio = supply.totalValue > 0 ? Math.min(200, Math.round((supply.totalBacking / supply.totalValue) * 100)) : 100;

  // Concentration
  const { data: units } = await (supabase as any).from("reserve_units").select("issuing_institution, unit_value").eq("is_redeemed", false);
  const instMap: Record<string, number> = {};
  const total = (units ?? []).reduce((s: number, u: any) => { instMap[u.issuing_institution ?? "x"] = (instMap[u.issuing_institution ?? "x"] ?? 0) + (u.unit_value ?? 0); return s + (u.unit_value ?? 0); }, 0);
  const maxShare = total > 0 ? Math.round((Math.max(...Object.values(instMap)) / total) * 100) : 0;

  // Cross-border settlements
  const { data: settlements } = await (supabase as any).from("reserve_settlement_log").select("status, settlement_value").eq("status", "completed");
  const settledVol = (settlements ?? []).reduce((s: number, r: any) => s + (r.settlement_value ?? 0), 0);
  const crossBorderExp = total > 0 ? Math.min(100, Math.round((settledVol / total) * 100)) : 0;

  // Redeemed ratio
  const { data: redeemed } = await (supabase as any).from("reserve_units").select("unit_value").eq("is_redeemed", true);
  const redeemedVal = (redeemed ?? []).reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);
  const liquiditySuff = supply.totalValue > 0 ? Math.round(((supply.totalValue - redeemedVal) / supply.totalValue) * 100) : 100;

  const avgRisk = (units ?? []).length > 0 ? (units ?? []).reduce((s: number, u: any) => s + (u.risk_weight ?? 1), 0) / units.length : 1;
  const riskShift = Math.round(Math.abs(avgRisk - 1) * 50);

  const score = Math.max(0, Math.min(100, Math.round(
    Math.min(100, backingRatio) * 0.25 + (100 - maxShare) * 0.2 + liquiditySuff * 0.2 +
    (100 - riskShift) * 0.15 + crossBorderExp * 0.1 + 80 * 0.1
  )));

  log.info("Reserve stability monitored", { score });

  return {
    backingRatio, capitalConcentration: maxShare, crossBorderExposure: crossBorderExp,
    liquiditySufficiency: liquiditySuff, defaultExposure: 0, trustStability: 80,
    riskWeightShift: riskShift, reserveStabilityScore: score,
  };
}
