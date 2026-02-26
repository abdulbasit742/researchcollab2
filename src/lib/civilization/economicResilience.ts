/**
 * Economic Resilience Engine — models global recession, funding drops, capital freezes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("economicResilience");

export type ResilienceScenario =
  | "global_recession"
  | "sponsor_funding_drop"
  | "capital_freeze"
  | "government_withdrawal"
  | "cross_border_sanctions"
  | "currency_collapse";

export interface ResilienceResult {
  scenario: ResilienceScenario;
  magnitude: number;
  capitalSurvivalRatio: number;
  liquiditySufficiencyIndex: number;
  nodeBankruptcyProbability: number;
  trustErosionSpeed: number;
  recoveryTimeDays: number;
  economicResilienceScore: number;
}

export async function modelEconomicResilience(scenario: ResilienceScenario, magnitude: number = 70): Promise<ResilienceResult> {
  const mag = Math.min(100, Math.max(0, magnitude)) / 100;

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const reserves = totalCapital - totalAllocated;

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score, total_network_capital_contributed");
  const nodeCount = (nodes ?? []).length || 1;
  const avgTrust = (nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 50), 0) / nodeCount;

  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const activeDeals = (deals ?? []).filter((d) => ["active", "in_progress"].includes(d.status ?? "")).length;

  // Scenario-specific impact
  const impacts: Record<ResilienceScenario, { capitalLoss: number; trustDecay: number; recoveryBase: number }> = {
    global_recession: { capitalLoss: 0.5, trustDecay: 0.2, recoveryBase: 365 },
    sponsor_funding_drop: { capitalLoss: 0.7, trustDecay: 0.15, recoveryBase: 180 },
    capital_freeze: { capitalLoss: 0.8, trustDecay: 0.3, recoveryBase: 90 },
    government_withdrawal: { capitalLoss: 0.4, trustDecay: 0.25, recoveryBase: 270 },
    cross_border_sanctions: { capitalLoss: 0.35, trustDecay: 0.4, recoveryBase: 540 },
    currency_collapse: { capitalLoss: 0.6, trustDecay: 0.35, recoveryBase: 450 },
  };

  const impact = impacts[scenario];
  const capitalLost = totalCapital * impact.capitalLoss * mag;
  const surviving = totalCapital - capitalLost;
  const capitalSurvivalRatio = totalCapital > 0 ? Math.round((surviving / totalCapital) * 100) : 0;
  const liquiditySufficiency = reserves > 0 ? Math.min(100, Math.round((reserves / (capitalLost || 1)) * 100)) : 0;
  const bankruptcyProb = Math.min(100, Math.round(mag * impact.capitalLoss * 100 * (1 - avgTrust / 100)));
  const trustErosion = Math.round(impact.trustDecay * mag * 100);
  const recoveryDays = Math.round(impact.recoveryBase * mag * (1 + (100 - avgTrust) / 200));
  const resilienceScore = Math.max(0, Math.min(100, Math.round(
    capitalSurvivalRatio * 0.3 + liquiditySufficiency * 0.25 + (100 - bankruptcyProb) * 0.25 + (100 - trustErosion) * 0.2
  )));

  log.info("Economic resilience modeled", { scenario, resilienceScore });

  return {
    scenario, magnitude, capitalSurvivalRatio, liquiditySufficiencyIndex: liquiditySufficiency,
    nodeBankruptcyProbability: bankruptcyProb, trustErosionSpeed: trustErosion,
    recoveryTimeDays: recoveryDays, economicResilienceScore: resilienceScore,
  };
}
