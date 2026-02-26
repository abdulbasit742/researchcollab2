/**
 * Adaptive Economic Balancer — detects imbalances in liquidity,
 * capital concentration, trust distribution, and fee volatility.
 * Recommends corrective actions, all logged.
 */

import { supabase } from "@/integrations/supabase/client";

export interface BalancerRecommendation {
  type: "fee_adjustment" | "capital_shift" | "risk_tightening" | "liquidity_injection";
  severity: "low" | "medium" | "high";
  description: string;
  suggestedAction: string;
  metrics: Record<string, number>;
}

export interface EconomicBalanceReport {
  isBalanced: boolean;
  balanceScore: number;
  imbalances: string[];
  recommendations: BalancerRecommendation[];
  metrics: Record<string, number>;
  computedAt: string;
}

export async function analyzeEconomicBalance(): Promise<EconomicBalanceReport> {
  const [trustRes, poolsRes, dealsRes, feesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, trust_tier, dispute_rate"),
    supabase.from("funding_pools").select("total_capital, available_capital, deployed_capital"),
    supabase.from("deal_rooms").select("escrow_amount, status").in("status", ["active", "in_progress"]),
    supabase.from("platform_fees").select("platform_fee_percentage").order("created_at", { ascending: false }).limit(50),
  ]);

  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const deals = dealsRes.data ?? [];
  const fees = feesRes.data ?? [];

  const imbalances: string[] = [];
  const recommendations: BalancerRecommendation[] = [];

  // 1. Trust distribution skew
  const scores = trusts.map(t => t.trust_score);
  const avgTrust = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  const highTrust = scores.filter(s => s > 80).length;
  const lowTrust = scores.filter(s => s < 30).length;
  const trustSkew = scores.length > 0 ? Math.abs(highTrust - lowTrust) / scores.length * 100 : 0;

  if (trustSkew > 30) {
    imbalances.push("Trust distribution heavily skewed");
    recommendations.push({ type: "risk_tightening", severity: "medium", description: "Trust distribution skew detected", suggestedAction: "Review trust formula coefficients", metrics: { trustSkew, highTrust, lowTrust } });
  }

  // 2. Capital concentration
  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const maxPool = Math.max(...pools.map(p => p.total_capital ?? 0), 0);
  const concentrationIndex = totalCapital > 0 ? (maxPool / totalCapital) * 100 : 0;

  if (concentrationIndex > 60) {
    imbalances.push("Capital overly concentrated in single pool");
    recommendations.push({ type: "capital_shift", severity: "high", description: `Single pool holds ${Math.round(concentrationIndex)}% of capital`, suggestedAction: "Redistribute capital across pools", metrics: { concentrationIndex } });
  }

  // 3. Liquidity check
  const available = pools.reduce((s, p) => s + (p.available_capital ?? 0), 0);
  const liquidityRatio = totalCapital > 0 ? available / totalCapital : 1;

  if (liquidityRatio < 0.15) {
    imbalances.push("Dangerously low liquidity reserves");
    recommendations.push({ type: "liquidity_injection", severity: "high", description: `Only ${Math.round(liquidityRatio * 100)}% liquidity remaining`, suggestedAction: "Restrict new advances and accelerate repayments", metrics: { liquidityRatio: Math.round(liquidityRatio * 100) } });
  }

  // 4. Fee volatility
  const feeValues = fees.map(f => f.platform_fee_percentage ?? 8);
  const avgFee = feeValues.length > 0 ? feeValues.reduce((a, b) => a + b, 0) / feeValues.length : 8;
  const feeVariance = feeValues.length > 2 ? Math.sqrt(feeValues.reduce((s, v) => s + Math.pow(v - avgFee, 2), 0) / feeValues.length) : 0;

  if (feeVariance > 2) {
    imbalances.push("High fee volatility detected");
    recommendations.push({ type: "fee_adjustment", severity: "medium", description: `Fee variance: ${Math.round(feeVariance * 10) / 10}`, suggestedAction: "Stabilize fee structure", metrics: { feeVariance: Math.round(feeVariance * 10) / 10, avgFee: Math.round(avgFee * 10) / 10 } });
  }

  // 5. Dispute clustering
  const avgDispute = trusts.length > 0 ? trusts.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) / trusts.length : 0;
  if (avgDispute > 0.12) {
    imbalances.push("Elevated systemic dispute rate");
    recommendations.push({ type: "risk_tightening", severity: "high", description: `Average dispute rate: ${Math.round(avgDispute * 100)}%`, suggestedAction: "Activate enhanced dispute prevention protocols", metrics: { avgDisputeRate: Math.round(avgDispute * 100) } });
  }

  const balanceScore = Math.max(0, 100 - imbalances.length * 15 - recommendations.filter(r => r.severity === "high").length * 10);

  // Audit
  await supabase.from("admin_audit_logs").insert({
    admin_id: "system",
    action: "economic_balance_analysis",
    entity_type: "system",
    details: { balanceScore, imbalances: imbalances.length, recommendations: recommendations.length } as any,
  });

  return {
    isBalanced: imbalances.length === 0,
    balanceScore,
    imbalances,
    recommendations,
    metrics: { avgTrust: Math.round(avgTrust), trustSkew: Math.round(trustSkew), concentrationIndex: Math.round(concentrationIndex), liquidityRatio: Math.round(liquidityRatio * 100), avgFee: Math.round(avgFee * 10) / 10, avgDisputeRate: Math.round(avgDispute * 100) },
    computedAt: new Date().toISOString(),
  };
}
