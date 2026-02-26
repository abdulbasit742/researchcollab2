/**
 * Platform Equilibrium Monitor — checks trust symmetry, capital concentration,
 * fee elasticity, growth stability, and reputation volatility spread.
 * Logs recommendation events on equilibrium drift.
 */

import { supabase } from "@/integrations/supabase/client";

export interface EquilibriumReport {
  inEquilibrium: boolean;
  equilibriumScore: number;
  dimensions: Record<string, { value: number; threshold: number; inRange: boolean }>;
  driftEvents: string[];
  computedAt: string;
}

export async function checkEquilibrium(): Promise<EquilibriumReport> {
  const [trustRes, poolsRes, feesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, trust_velocity_24h, trust_tier"),
    supabase.from("funding_pools").select("total_capital, deployed_capital"),
    supabase.from("platform_fees").select("platform_fee_percentage").order("created_at", { ascending: false }).limit(100),
  ]);

  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const fees = feesRes.data ?? [];
  const driftEvents: string[] = [];

  // 1. Trust distribution symmetry
  const scores = trusts.map(t => t.trust_score);
  const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  const median = scores.length > 0 ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)] : 50;
  const skew = Math.abs(mean - median);
  const trustSymmetry = { value: Math.round(skew * 10) / 10, threshold: 10, inRange: skew <= 10 };
  if (!trustSymmetry.inRange) driftEvents.push(`Trust distribution skew: mean-median gap of ${trustSymmetry.value}`);

  // 2. Capital concentration (Herfindahl)
  const capitals = pools.map(p => p.total_capital ?? 0);
  const totalCap = capitals.reduce((a, b) => a + b, 0) || 1;
  const hhi = capitals.reduce((s, c) => s + Math.pow(c / totalCap, 2), 0) * 100;
  const capitalConcentration = { value: Math.round(hhi), threshold: 50, inRange: hhi <= 50 };
  if (!capitalConcentration.inRange) driftEvents.push(`Capital HHI concentration: ${capitalConcentration.value}`);

  // 3. Fee elasticity
  const feeValues = fees.map(f => f.platform_fee_percentage ?? 8);
  const feeStdDev = feeValues.length > 2
    ? Math.sqrt(feeValues.reduce((s, v) => s + Math.pow(v - (feeValues.reduce((a, b) => a + b, 0) / feeValues.length), 2), 0) / feeValues.length)
    : 0;
  const feeElasticity = { value: Math.round(feeStdDev * 10) / 10, threshold: 3, inRange: feeStdDev <= 3 };
  if (!feeElasticity.inRange) driftEvents.push(`Fee volatility std dev: ${feeElasticity.value}`);

  // 4. Growth stability (velocity spread)
  const velocities = trusts.map(t => Math.abs(t.trust_velocity_24h ?? 0));
  const avgVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;
  const growthStability = { value: Math.round(avgVelocity * 10) / 10, threshold: 3, inRange: avgVelocity <= 3 };
  if (!growthStability.inRange) driftEvents.push(`Average trust velocity: ${growthStability.value}/24h`);

  // 5. Reputation volatility spread
  const highVolUsers = trusts.filter(t => Math.abs(t.trust_velocity_24h ?? 0) > 5).length;
  const volSpread = trusts.length > 0 ? Math.round((highVolUsers / trusts.length) * 100) : 0;
  const reputationVolatility = { value: volSpread, threshold: 15, inRange: volSpread <= 15 };
  if (!reputationVolatility.inRange) driftEvents.push(`${volSpread}% of users experiencing high reputation volatility`);

  const dimensions = { trustSymmetry, capitalConcentration, feeElasticity, growthStability, reputationVolatility };
  const inRangeCount = Object.values(dimensions).filter(d => d.inRange).length;
  const equilibriumScore = Math.round((inRangeCount / 5) * 100);

  if (driftEvents.length > 0) {
    await supabase.from("admin_audit_logs").insert({
      admin_id: "system",
      action: "equilibrium_drift_detected",
      entity_type: "system",
      details: { equilibriumScore, driftEvents } as any,
    });
  }

  return { inEquilibrium: driftEvents.length === 0, equilibriumScore, dimensions, driftEvents, computedAt: new Date().toISOString() };
}
