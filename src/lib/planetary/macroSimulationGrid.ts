/**
 * Macro-Economic Simulation Grid — planetary-scale economic shock modeling.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("macroSimulationGrid");

export type MacroScenario = "global_recession" | "capital_freeze" | "sanction_regime" | "inflation_shock" | "currency_collapse" | "innovation_stagnation" | "sponsor_collapse" | "government_funding_shift";

export interface MacroSimulationResult {
  scenario: MacroScenario;
  magnitude: number;
  capitalContractionPercent: number;
  institutionalCollapseProbability: number;
  trustErosionRate: number;
  liquiditySufficiency: number;
  recoveryHalfLifeDays: number;
  innovationReboundPotential: number;
  planetaryMacroResilienceScore: number;
}

export async function runMacroSimulation(scenario: MacroScenario, magnitude: number = 60): Promise<MacroSimulationResult> {
  const mag = Math.min(100, Math.max(0, magnitude)) / 100;

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const reserves = totalCapital - (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score");
  const avgTrust = (nodes ?? []).length > 0 ? (nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 50), 0) / nodes.length : 50;

  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const activeDeals = (deals ?? []).filter((d) => ["active", "in_progress"].includes(d.status ?? "")).length;

  const models: Record<MacroScenario, { contraction: number; collapse: number; erosion: number; recovery: number; rebound: number }> = {
    global_recession: { contraction: 50, collapse: 30, erosion: 25, recovery: 730, rebound: 40 },
    capital_freeze: { contraction: 80, collapse: 45, erosion: 35, recovery: 180, rebound: 30 },
    sanction_regime: { contraction: 35, collapse: 20, erosion: 40, recovery: 1095, rebound: 25 },
    inflation_shock: { contraction: 40, collapse: 25, erosion: 20, recovery: 365, rebound: 50 },
    currency_collapse: { contraction: 60, collapse: 40, erosion: 45, recovery: 540, rebound: 20 },
    innovation_stagnation: { contraction: 15, collapse: 10, erosion: 15, recovery: 1460, rebound: 60 },
    sponsor_collapse: { contraction: 70, collapse: 50, erosion: 30, recovery: 270, rebound: 35 },
    government_funding_shift: { contraction: 30, collapse: 15, erosion: 20, recovery: 540, rebound: 55 },
  };

  const m = models[scenario];
  const contraction = Math.round(m.contraction * mag);
  const collapse = Math.round(m.collapse * mag * (1 - avgTrust / 200));
  const erosion = Math.round(m.erosion * mag);
  const liquidity = reserves > 0 && totalCapital > 0 ? Math.min(100, Math.round((reserves / (totalCapital * mag || 1)) * 100)) : 0;
  const recoveryHalf = Math.round(m.recovery * mag);
  const rebound = Math.max(0, Math.round(m.rebound * (1 - mag * 0.3)));

  const resilienceScore = Math.max(0, Math.min(100, Math.round(
    (100 - contraction) * 0.25 + (100 - collapse) * 0.2 + liquidity * 0.2 +
    (100 - erosion) * 0.15 + rebound * 0.2
  )));

  log.info("Macro simulation completed", { scenario, resilienceScore });

  return {
    scenario, magnitude, capitalContractionPercent: contraction,
    institutionalCollapseProbability: collapse, trustErosionRate: erosion,
    liquiditySufficiency: liquidity, recoveryHalfLifeDays: recoveryHalf,
    innovationReboundPotential: rebound, planetaryMacroResilienceScore: resilienceScore,
  };
}
