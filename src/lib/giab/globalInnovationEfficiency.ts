/**
 * Global Innovation Efficiency Index — GLOBAL_INNOVATION_EFFICIENCY_INDEX (0–100).
 */

import { supabase } from "@/integrations/supabase/client";
import { forecastInnovationROI } from "./innovationROI";
import { detectCapitalScarcity } from "./scarcityDetector";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalInnovationEfficiency");

export interface GlobalInnovationEfficiency {
  totalCapitalDeployed: number;
  innovationOutput: number;
  riskAdjustedReturn: number;
  completionEfficiency: number;
  crossBorderMultiplier: number;
  trustStability: number;
  liquidityBalance: number;
  globalInnovationEfficiencyIndex: number;
  timestamp: string;
}

export async function calculateGlobalInnovationEfficiency(): Promise<GlobalInnovationEfficiency> {
  const [roi, scarcity] = await Promise.all([
    forecastInnovationROI(),
    detectCapitalScarcity(),
  ]);

  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount") as { data: any[] | null };
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d: any) => d.status === "completed").length;
  const total = allDeals.length;
  const totalCapital = allDeals.reduce((s: number, d: any) => s + (d.escrow_amount ?? 0), 0);

  const completionEff = total > 0 ? Math.round((completed / total) * 100) : 0;

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("cross_border_agreement_id").eq("status", "completed");
  const crossBorderPct = (routes ?? []).length > 0
    ? (routes ?? []).filter((r: any) => r.cross_border_agreement_id).length / routes.length * 100
    : 0;
  const crossBorderMultiplier = Math.round(1 + crossBorderPct / 100 * 100) / 100;

  const liquidityBalance = Math.max(0, 100 - scarcity.capitalScarcityIndex);
  const trustStability = Math.min(100, completionEff + 10);

  const index = Math.max(0, Math.min(100, Math.round(
    roi.forecastedInnovationROIScore * 0.25 +
    completionEff * 0.2 +
    crossBorderMultiplier * 15 * 0.15 +
    trustStability * 0.15 +
    liquidityBalance * 0.15 +
    (100 - scarcity.capitalScarcityIndex) * 0.1
  )));

  log.info("Global innovation efficiency calculated", { index });

  return {
    totalCapitalDeployed: totalCapital, innovationOutput: completed,
    riskAdjustedReturn: roi.riskAdjustedROI, completionEfficiency: completionEff,
    crossBorderMultiplier, trustStability, liquidityBalance,
    globalInnovationEfficiencyIndex: index, timestamp: new Date().toISOString(),
  };
}
