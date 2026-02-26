/**
 * Capital Sustainability Model — evaluates long-term capital health
 * based on repayment reliability, recycling velocity, default clustering,
 * return consistency, and institutional funding resilience.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CapitalSustainabilityReport {
  sustainabilityScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  metrics: Record<string, number>;
  risks: string[];
  computedAt: string;
}

export async function computeCapitalSustainability(): Promise<CapitalSustainabilityReport> {
  const [advancesRes, poolsRes, yieldRes] = await Promise.all([
    supabase.from("capital_advances").select("approved_amount, repaid_amount, status"),
    supabase.from("funding_pools").select("total_capital, available_capital, deployed_capital, status"),
    supabase.from("yield_tracking").select("annualized_return").order("period_start", { ascending: false }).limit(24),
  ]);

  const advances = advancesRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const yields = yieldRes.data ?? [];
  const risks: string[] = [];

  // 1. Repayment reliability (0–100)
  const totalApproved = advances.reduce((s, a) => s + (a.approved_amount ?? 0), 0);
  const totalRepaid = advances.reduce((s, a) => s + (a.repaid_amount ?? 0), 0);
  const repaymentRate = totalApproved > 0 ? Math.round((totalRepaid / totalApproved) * 100) : 100;
  if (repaymentRate < 70) risks.push("Repayment rate below 70%");

  // 2. Capital recycling velocity
  const activePools = pools.filter(p => p.status === "active");
  const totalCapital = activePools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const deployed = activePools.reduce((s, p) => s + (p.deployed_capital ?? 0), 0);
  const recyclingVelocity = totalCapital > 0 ? Math.round((deployed / totalCapital) * 100) : 0;
  const velocityScore = recyclingVelocity > 80 ? 60 : recyclingVelocity > 40 ? 90 : recyclingVelocity > 10 ? 70 : 30;
  if (recyclingVelocity > 85) risks.push("Capital recycling velocity dangerously high");

  // 3. Default clustering
  const defaulted = advances.filter(a => a.status === "defaulted").length;
  const defaultRate = advances.length > 0 ? Math.round((defaulted / advances.length) * 100) : 0;
  const defaultScore = Math.max(0, 100 - defaultRate * 5);
  if (defaultRate > 10) risks.push(`Default rate at ${defaultRate}%`);

  // 4. Return consistency
  const returns = yields.map(y => y.annualized_return ?? 0);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const returnVariance = returns.length > 2 ? Math.sqrt(returns.reduce((s, v) => s + Math.pow(v - avgReturn, 2), 0) / returns.length) : 0;
  const returnScore = Math.max(0, Math.min(100, 80 - returnVariance * 5 + (avgReturn > 0 ? 20 : 0)));
  if (returnVariance > 5) risks.push("High return variance — inconsistent yields");

  // 5. Institutional funding resilience
  const poolCount = activePools.length;
  const resilienceScore = Math.min(100, poolCount * 15 + (totalCapital > 1000000 ? 30 : totalCapital > 100000 ? 15 : 0));
  if (poolCount < 3) risks.push("Low pool diversity — institutional resilience weak");

  // Weighted composite
  const sustainabilityScore = Math.round(
    repaymentRate * 0.25 + velocityScore * 0.20 + defaultScore * 0.20 + returnScore * 0.15 + resilienceScore * 0.20
  );

  const grade = sustainabilityScore >= 80 ? "A" : sustainabilityScore >= 65 ? "B" : sustainabilityScore >= 50 ? "C" : sustainabilityScore >= 35 ? "D" : "F";

  return {
    sustainabilityScore,
    grade,
    metrics: { repaymentRate, recyclingVelocity, defaultRate, avgReturn: Math.round(avgReturn * 10) / 10, returnVariance: Math.round(returnVariance * 10) / 10, poolCount, totalCapital },
    risks,
    computedAt: new Date().toISOString(),
  };
}
