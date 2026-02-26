/**
 * Network State Evolution Model — tracks network topology metrics
 * and simulates growth/shock/contraction scenarios.
 */

import { supabase } from "@/integrations/supabase/client";

export interface NetworkStateVector {
  activeUsers: number;
  institutionalDensity: number;
  capitalDensity: number;
  trustDispersion: number;
  volatilityClusters: number;
  networkHealthScore: number;
  computedAt: string;
}

export type EvolutionScenario = "growth" | "shock" | "capital_contraction" | "dispute_surge" | "institutional_expansion";

export interface EvolutionProjection {
  scenario: EvolutionScenario;
  magnitude: number;
  baseline: NetworkStateVector;
  projected: NetworkStateVector;
  deltaPercent: Record<string, number>;
  computedAt: string;
}

export async function computeNetworkState(): Promise<NetworkStateVector> {
  const [trustRes, orgsRes, poolsRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, trust_velocity_24h"),
    supabase.from("organizations").select("id"),
    supabase.from("funding_pools").select("total_capital, deployed_capital"),
  ]);

  const trusts = trustRes.data ?? [];
  const orgs = orgsRes.data ?? [];
  const pools = poolsRes.data ?? [];

  const activeUsers = trusts.length;
  const institutionalDensity = orgs.length > 0 ? Math.min(100, orgs.length * 5) : 0;

  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const capitalDensity = activeUsers > 0 ? Math.min(100, Math.round(totalCapital / Math.max(1, activeUsers) / 1000)) : 0;

  const scores = trusts.map(t => t.trust_score);
  const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  const variance = scores.length > 2 ? Math.sqrt(scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length) : 0;
  const trustDispersion = Math.round(variance * 10) / 10;

  const volatilityClusters = trusts.filter(t => Math.abs(t.trust_velocity_24h ?? 0) > 5).length;

  const networkHealthScore = Math.round(
    Math.min(100, activeUsers > 0 ? 20 : 0) +
    Math.min(20, institutionalDensity * 0.2) +
    Math.min(20, capitalDensity * 0.2) +
    Math.min(20, Math.max(0, 20 - trustDispersion)) +
    Math.min(20, Math.max(0, 20 - volatilityClusters * 2))
  );

  return { activeUsers, institutionalDensity, capitalDensity, trustDispersion, volatilityClusters, networkHealthScore, computedAt: new Date().toISOString() };
}

export async function simulateEvolution(scenario: EvolutionScenario, magnitude: number = 50): Promise<EvolutionProjection> {
  const baseline = await computeNetworkState();
  const mag = magnitude / 100;
  const projected = { ...baseline };

  switch (scenario) {
    case "growth":
      projected.activeUsers = Math.round(baseline.activeUsers * (1 + mag * 0.5));
      projected.capitalDensity = Math.round(baseline.capitalDensity * (1 + mag * 0.3));
      projected.institutionalDensity = Math.round(Math.min(100, baseline.institutionalDensity * (1 + mag * 0.4)));
      break;
    case "shock":
      projected.trustDispersion = Math.round((baseline.trustDispersion + mag * 15) * 10) / 10;
      projected.volatilityClusters = Math.round(baseline.volatilityClusters * (1 + mag * 2));
      projected.networkHealthScore = Math.round(baseline.networkHealthScore * (1 - mag * 0.4));
      break;
    case "capital_contraction":
      projected.capitalDensity = Math.round(baseline.capitalDensity * (1 - mag * 0.6));
      projected.networkHealthScore = Math.round(baseline.networkHealthScore * (1 - mag * 0.25));
      break;
    case "dispute_surge":
      projected.volatilityClusters = Math.round(baseline.volatilityClusters + mag * 20);
      projected.trustDispersion = Math.round((baseline.trustDispersion + mag * 10) * 10) / 10;
      projected.networkHealthScore = Math.round(baseline.networkHealthScore * (1 - mag * 0.35));
      break;
    case "institutional_expansion":
      projected.institutionalDensity = Math.round(Math.min(100, baseline.institutionalDensity * (1 + mag * 0.8)));
      projected.capitalDensity = Math.round(baseline.capitalDensity * (1 + mag * 0.4));
      projected.networkHealthScore = Math.round(Math.min(100, baseline.networkHealthScore * (1 + mag * 0.15)));
      break;
  }

  const deltaPercent: Record<string, number> = {};
  for (const key of ["activeUsers", "institutionalDensity", "capitalDensity", "trustDispersion", "volatilityClusters", "networkHealthScore"] as const) {
    const b = baseline[key] as number;
    deltaPercent[key] = b > 0 ? Math.round(((projected[key] as number) - b) / b * 100) : 0;
  }

  return { scenario, magnitude, baseline, projected, deltaPercent, computedAt: new Date().toISOString() };
}
