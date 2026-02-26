/**
 * Economic Simulation Engine — models impact of trust shocks,
 * capital contraction, dispute spikes, liquidity drains, and growth acceleration.
 */

import { supabase } from "@/integrations/supabase/client";

export type ScenarioType = "trust_shock" | "capital_contraction" | "dispute_spike" | "liquidity_drain" | "growth_acceleration";

export interface SimulationScenario {
  type: ScenarioType;
  magnitude: number; // 0–100
  durationDays: number;
}

export interface SimulationResult {
  scenario: SimulationScenario;
  baseline: SimulationMetrics;
  projected: SimulationMetrics;
  impact: Record<string, number>;
  recoveryTimeDays: number;
  severity: "negligible" | "minor" | "moderate" | "severe" | "catastrophic";
  recommendations: string[];
  computedAt: string;
}

interface SimulationMetrics {
  avgTrustScore: number;
  activeDealCount: number;
  escrowVolume: number;
  disputeRate: number;
  capitalDeployed: number;
  platformRevenue: number;
}

export async function runSimulation(scenario: SimulationScenario): Promise<SimulationResult> {
  // Fetch baseline metrics
  const [trustRes, dealsRes, poolsRes, feesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate"),
    supabase.from("deal_rooms").select("id, escrow_amount, status").in("status", ["active", "in_progress"]),
    supabase.from("funding_pools").select("deployed_capital"),
    supabase.from("platform_fees").select("platform_fee_amount").order("created_at", { ascending: false }).limit(100),
  ]);

  const trusts = trustRes.data ?? [];
  const deals = dealsRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const fees = feesRes.data ?? [];

  const baseline: SimulationMetrics = {
    avgTrustScore: trusts.length > 0 ? Math.round(trusts.reduce((s, t) => s + t.trust_score, 0) / trusts.length) : 50,
    activeDealCount: deals.length,
    escrowVolume: deals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0),
    disputeRate: trusts.length > 0 ? Math.round(trusts.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) / trusts.length * 100) / 100 : 0.05,
    capitalDeployed: pools.reduce((s, p) => s + (p.deployed_capital ?? 0), 0),
    platformRevenue: fees.reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0),
  };

  const mag = scenario.magnitude / 100;
  const projected = { ...baseline };
  const recommendations: string[] = [];

  switch (scenario.type) {
    case "trust_shock":
      projected.avgTrustScore = Math.round(baseline.avgTrustScore * (1 - mag * 0.4));
      projected.activeDealCount = Math.round(baseline.activeDealCount * (1 - mag * 0.3));
      projected.disputeRate = Math.min(1, baseline.disputeRate + mag * 0.3);
      projected.platformRevenue = Math.round(baseline.platformRevenue * (1 - mag * 0.35));
      recommendations.push("Activate trust stabilization protocols", "Increase dispute mediation capacity");
      break;
    case "capital_contraction":
      projected.capitalDeployed = Math.round(baseline.capitalDeployed * (1 - mag * 0.6));
      projected.activeDealCount = Math.round(baseline.activeDealCount * (1 - mag * 0.2));
      projected.platformRevenue = Math.round(baseline.platformRevenue * (1 - mag * 0.25));
      recommendations.push("Reduce advance approval rates", "Activate emergency liquidity reserves");
      break;
    case "dispute_spike":
      projected.disputeRate = Math.min(1, baseline.disputeRate + mag * 0.5);
      projected.avgTrustScore = Math.round(baseline.avgTrustScore * (1 - mag * 0.2));
      projected.escrowVolume = Math.round(baseline.escrowVolume * (1 - mag * 0.15));
      recommendations.push("Deploy rapid dispute resolution", "Freeze high-risk escrows");
      break;
    case "liquidity_drain":
      projected.escrowVolume = Math.round(baseline.escrowVolume * (1 - mag * 0.5));
      projected.capitalDeployed = Math.round(baseline.capitalDeployed * (1 - mag * 0.4));
      projected.platformRevenue = Math.round(baseline.platformRevenue * (1 - mag * 0.4));
      recommendations.push("Restrict new capital advances", "Accelerate repayment collection");
      break;
    case "growth_acceleration":
      projected.activeDealCount = Math.round(baseline.activeDealCount * (1 + mag * 0.5));
      projected.platformRevenue = Math.round(baseline.platformRevenue * (1 + mag * 0.4));
      projected.avgTrustScore = Math.round(baseline.avgTrustScore * (1 + mag * 0.05));
      recommendations.push("Scale infrastructure capacity", "Monitor trust dilution from new users");
      break;
  }

  // Impact calculation
  const impact: Record<string, number> = {};
  for (const key of Object.keys(baseline) as (keyof SimulationMetrics)[]) {
    const b = baseline[key] as number;
    const p = projected[key] as number;
    impact[key] = b > 0 ? Math.round(((p - b) / b) * 100) : 0;
  }

  // Recovery time estimation
  const avgImpact = Math.abs(Object.values(impact).reduce((s, v) => s + v, 0) / Object.values(impact).length);
  const recoveryTimeDays = Math.round(scenario.durationDays * (1 + avgImpact / 50));

  const severity = avgImpact > 40 ? "catastrophic" : avgImpact > 25 ? "severe" : avgImpact > 15 ? "moderate" : avgImpact > 5 ? "minor" : "negligible";

  return { scenario, baseline, projected, impact, recoveryTimeDays, severity, recommendations, computedAt: new Date().toISOString() };
}
