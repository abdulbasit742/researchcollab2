/**
 * Global Academic Capital Index — aggregate market health metric.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateMarketStability } from "./marketStability";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalCapitalIndex");

export interface GlobalAcademicCapitalIndex {
  totalResearchCapital: number;
  averageCreditRating: number;
  crossBorderLiquidityPercent: number;
  innovationGrowthRate: number;
  riskAdjustedReturn: number;
  bondIssuanceGrowth: number;
  defaultRate: number;
  globalAcademicCapitalIndex: number;
  timestamp: string;
}

export async function calculateGlobalCapitalIndex(): Promise<GlobalAcademicCapitalIndex> {
  const stability = await calculateMarketStability();

  const { data: assets } = await (supabase as any).from("research_capital_assets").select("total_value, backing_type, expected_return").eq("is_active", true);
  const totalCapital = (assets ?? []).reduce((s: number, a: any) => s + (a.total_value ?? 0), 0);
  const crossBorder = (assets ?? []).filter((a: any) => a.backing_type === "cross_border_research").reduce((s: number, a: any) => s + (a.total_value ?? 0), 0);
  const crossBorderPct = totalCapital > 0 ? Math.round((crossBorder / totalCapital) * 100) : 0;
  const avgReturn = (assets ?? []).length > 0 ? (assets ?? []).reduce((s: number, a: any) => s + (a.expected_return ?? 0), 0) / assets.length : 0;

  const { data: credits } = await (supabase as any).from("institution_credit_profiles").select("credit_score");
  const avgCredit = (credits ?? []).length > 0 ? Math.round((credits ?? []).reduce((s: number, c: any) => s + (c.credit_score ?? 0), 0) / credits.length) : 50;

  const { data: bonds } = await (supabase as any).from("research_bonds").select("status, default_probability");
  const totalBonds = (bonds ?? []).length;
  const defaulted = (bonds ?? []).filter((b: any) => b.status === "defaulted").length;
  const defaultRate = totalBonds > 0 ? Math.round((defaulted / totalBonds) * 100) : 0;

  const composite = Math.max(0, Math.min(100, Math.round(
    stability.academicCapitalMarketStabilityIndex * 0.25 +
    avgCredit * 0.2 +
    crossBorderPct * 0.15 +
    Math.min(100, avgReturn * 10) * 0.15 +
    (100 - defaultRate) * 0.15 +
    Math.min(100, totalBonds * 5) * 0.1
  )));

  log.info("Global capital index calculated", { composite });

  return {
    totalResearchCapital: totalCapital, averageCreditRating: avgCredit,
    crossBorderLiquidityPercent: crossBorderPct, innovationGrowthRate: Math.round(avgReturn * 100) / 100,
    riskAdjustedReturn: Math.round(avgReturn * 0.7 * 100) / 100, bondIssuanceGrowth: totalBonds,
    defaultRate, globalAcademicCapitalIndex: composite, timestamp: new Date().toISOString(),
  };
}
