/**
 * Sector Productivity Analyzer — SECTOR_PRODUCTIVITY_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sectorAnalyzer");

export interface SectorProductivity {
  sectorId: string;
  capitalToOutputRatio: number;
  completionEfficiency: number;
  disputeAdjustedProductivity: number;
  innovationVelocity: number;
  crossBorderMultiplier: number;
  sectorProductivityIndex: number;
}

export async function analyzeSectorProductivity(): Promise<SectorProductivity[]> {
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount, tenant_id") as { data: any[] | null };
  const allDeals = deals ?? [];

  // Use tenant_id as sector proxy
  const sectors: Record<string, { total: number; completed: number; disputed: number; capital: number }> = {};
  for (const d of allDeals) {
    const sid = d.tenant_id ?? "default";
    const s = sectors[sid] ?? { total: 0, completed: 0, disputed: 0, capital: 0 };
    s.total++; s.capital += d.escrow_amount ?? 0;
    if (d.status === "completed") s.completed++;
    if (d.status === "disputed") s.disputed++;
    sectors[sid] = s;
  }

  const results: SectorProductivity[] = [];
  for (const [sid, s] of Object.entries(sectors)) {
    const completionEff = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    const disputeRate = s.total > 0 ? s.disputed / s.total : 0;
    const disputeAdj = Math.round(completionEff * (1 - disputeRate));
    const capitalToOutput = s.capital > 0 && s.completed > 0 ? Math.min(100, Math.round((s.completed / (s.capital / 10000)) * 10)) : 0;
    const velocity = Math.min(100, s.completed * 8);
    const crossBorderMult = 1.0; // baseline

    const index = Math.round(
      capitalToOutput * 0.2 + completionEff * 0.25 + disputeAdj * 0.2 + velocity * 0.2 + crossBorderMult * 15
    );

    results.push({
      sectorId: sid, capitalToOutputRatio: capitalToOutput, completionEfficiency: completionEff,
      disputeAdjustedProductivity: disputeAdj, innovationVelocity: velocity,
      crossBorderMultiplier: crossBorderMult, sectorProductivityIndex: Math.min(100, index),
    });
  }

  log.info("Sector productivity analyzed", { sectorCount: results.length });
  return results;
}
