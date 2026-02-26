/**
 * Crisis Simulation Engine — models regulatory bans, dispute spikes, institutional exits.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("crisisSimulator");

export type CrisisScenario =
  | "regulatory_ban"
  | "compliance_mass_failure"
  | "dispute_spike"
  | "capital_pool_collapse"
  | "coordinated_malicious_actors"
  | "institutional_exit_cascade";

export interface CrisisResult {
  scenario: CrisisScenario;
  containmentEffectiveness: number;
  cascadeProbability: number;
  liquidityDrainRate: number;
  recoveryStrategies: string[];
  severityBand: string;
  estimatedDamage: number;
}

export async function simulateCrisis(scenario: CrisisScenario, magnitude: number = 60): Promise<CrisisResult> {
  const mag = Math.min(100, Math.max(0, magnitude)) / 100;

  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount");
  const allDeals = deals ?? [];
  const totalEscrow = allDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const activeCount = allDeals.filter((d) => ["active", "in_progress"].includes(d.status ?? "")).length;

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, node_trust_score");
  const nodeCount = (nodes ?? []).length || 1;

  const scenarioModels: Record<CrisisScenario, { containBase: number; cascadeBase: number; drainBase: number; strategies: string[] }> = {
    regulatory_ban: { containBase: 60, cascadeBase: 40, drainBase: 20, strategies: ["Activate regional compliance override", "Freeze affected region capital", "Reroute to compliant regions"] },
    compliance_mass_failure: { containBase: 40, cascadeBase: 55, drainBase: 30, strategies: ["Emergency KYC re-verification", "Temporary capital freeze", "Activate manual review queue"] },
    dispute_spike: { containBase: 70, cascadeBase: 30, drainBase: 15, strategies: ["Deploy rapid mediation teams", "Increase arbitration capacity", "Freeze high-risk escrows"] },
    capital_pool_collapse: { containBase: 35, cascadeBase: 65, drainBase: 60, strategies: ["Activate reserve funds", "Cross-node liquidity injection", "Emergency governance vote"] },
    coordinated_malicious_actors: { containBase: 55, cascadeBase: 45, drainBase: 25, strategies: ["Activate trust velocity caps", "Freeze suspicious accounts", "Deploy anomaly detection"] },
    institutional_exit_cascade: { containBase: 45, cascadeBase: 70, drainBase: 50, strategies: ["Capital settlement protocol", "Cross-border fallback partners", "Emergency liquidity pool"] },
  };

  const model = scenarioModels[scenario];
  const containment = Math.max(0, Math.round(model.containBase * (1 - mag * 0.5)));
  const cascade = Math.min(100, Math.round(model.cascadeBase * (1 + mag * 0.6)));
  const drain = Math.min(100, Math.round(model.drainBase * (1 + mag * 0.8)));
  const damage = Math.round(totalEscrow * mag * (model.drainBase / 100));

  const severity = cascade > 60 ? "critical" : cascade > 40 ? "severe" : cascade > 20 ? "moderate" : "contained";

  log.info("Crisis simulated", { scenario, severity, containment });

  return {
    scenario, containmentEffectiveness: containment, cascadeProbability: cascade,
    liquidityDrainRate: drain, recoveryStrategies: model.strategies,
    severityBand: severity, estimatedDamage: damage,
  };
}
