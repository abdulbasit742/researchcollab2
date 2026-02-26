/**
 * Global Academic Reserve Index — GLOBAL_ACADEMIC_RESERVE_INDEX.
 */

import { getTotalReserveSupply } from "./reserveUnit";
import { monitorReserveStability } from "./stabilityMonitor";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveIndex");

export interface GlobalAcademicReserveIndex {
  totalReserveUnits: number;
  backingRatio: number;
  regionalDistribution: Record<string, number>;
  crossBorderSettlementPercent: number;
  stabilityScore: number;
  redemptionVelocity: number;
  innovationGrowthMultiplier: number;
  globalAcademicReserveIndex: number;
  timestamp: string;
}

export async function calculateGlobalReserveIndex(): Promise<GlobalAcademicReserveIndex> {
  const supply = await getTotalReserveSupply();
  const stability = await monitorReserveStability();

  // Regional distribution
  const { data: units } = await (supabase as any).from("reserve_units").select("region_scope, unit_value").eq("is_redeemed", false);
  const regionDist: Record<string, number> = {};
  for (const u of units ?? []) {
    for (const r of u.region_scope ?? []) {
      regionDist[r] = (regionDist[r] ?? 0) + (u.unit_value ?? 0);
    }
  }

  // Settlement velocity
  const { data: settlements } = await (supabase as any).from("reserve_settlement_log").select("settlement_value, status").eq("status", "completed");
  const settledVol = (settlements ?? []).reduce((s: number, r: any) => s + (r.settlement_value ?? 0), 0);
  const crossBorderPct = supply.totalValue > 0 ? Math.min(100, Math.round((settledVol / supply.totalValue) * 100)) : 0;

  // Redemption velocity
  const { data: redeemed } = await (supabase as any).from("reserve_units").select("unit_value").eq("is_redeemed", true);
  const redeemedVal = (redeemed ?? []).reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);
  const redemptionVelocity = supply.totalValue > 0 ? Math.round((redeemedVal / (supply.totalValue + redeemedVal)) * 100) : 0;

  const regionCount = Object.keys(regionDist).length;
  const innovationMult = Math.round((1 + regionCount * 0.05 + crossBorderPct * 0.005) * 100) / 100;

  const index = Math.max(0, Math.min(100, Math.round(
    stability.reserveStabilityScore * 0.3 +
    Math.min(100, stability.backingRatio) * 0.2 +
    crossBorderPct * 0.15 +
    (100 - redemptionVelocity) * 0.15 +
    Math.min(100, regionCount * 12) * 0.1 +
    innovationMult * 10 * 0.1
  )));

  log.info("Global reserve index calculated", { index });

  return {
    totalReserveUnits: supply.totalUnits, backingRatio: stability.backingRatio,
    regionalDistribution: regionDist, crossBorderSettlementPercent: crossBorderPct,
    stabilityScore: stability.reserveStabilityScore, redemptionVelocity,
    innovationGrowthMultiplier: innovationMult, globalAcademicReserveIndex: index,
    timestamp: new Date().toISOString(),
  };
}
