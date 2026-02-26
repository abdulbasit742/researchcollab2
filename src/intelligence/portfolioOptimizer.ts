/**
 * Institutional Portfolio Optimization — capital pool distribution,
 * sector/region exposure, and risk-adjusted return optimization.
 *
 * Uses mean-risk tradeoff deterministic logic.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PortfolioAllocation {
  poolId: string;
  poolName: string;
  currentAllocation: number;
  recommendedAllocation: number;
  riskScore: number;
  returnEstimate: number;
}

export interface PortfolioOptimizationResult {
  institutionId: string;
  totalCapital: number;
  allocations: PortfolioAllocation[];
  diversificationScore: number;
  expectedPortfolioReturn: number;
  portfolioRisk: number;
  recommendations: string[];
  computedAt: string;
}

export async function optimizePortfolio(institutionId: string): Promise<PortfolioOptimizationResult> {
  const { data: pools } = await supabase
    .from("funding_pools")
    .select("id, name, total_capital, deployed_capital, available_capital, risk_tier")
    .eq("institution_id", institutionId);

  const poolList = pools ?? [];
  const totalCapital = poolList.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const recommendations: string[] = [];

  // Risk weights by tier
  const riskWeights: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };

  const allocations: PortfolioAllocation[] = poolList.map(pool => {
    const deployed = pool.deployed_capital ?? 0;
    const total = pool.total_capital ?? 1;
    const risk = riskWeights[pool.risk_tier ?? "medium"] ?? 0.5;
    const utilization = deployed / Math.max(1, total);

    // Return estimate: inverse risk relationship + utilization bonus
    const returnEstimate = Math.round((1 - risk * 0.5) * 15 + utilization * 5);

    // Recommended allocation using mean-risk optimization
    const riskPenalty = risk * 0.3;
    const returnBonus = returnEstimate / 20;
    const optimalWeight = Math.max(0.05, Math.min(0.5, (returnBonus - riskPenalty + 0.3)));

    return {
      poolId: pool.id,
      poolName: pool.name ?? "Unnamed Pool",
      currentAllocation: Math.round((total / Math.max(1, totalCapital)) * 100),
      recommendedAllocation: Math.round(optimalWeight * 100),
      riskScore: Math.round(risk * 100),
      returnEstimate,
    };
  });

  // Normalize recommended allocations to 100%
  const totalRecommended = allocations.reduce((s, a) => s + a.recommendedAllocation, 0) || 1;
  allocations.forEach(a => { a.recommendedAllocation = Math.round((a.recommendedAllocation / totalRecommended) * 100); });

  // Diversification score (Herfindahl index inverse)
  const shares = allocations.map(a => a.currentAllocation / 100);
  const hhi = shares.reduce((s, sh) => s + sh * sh, 0);
  const diversificationScore = Math.round((1 - hhi) * 100);

  // Portfolio metrics
  const expectedReturn = Math.round(allocations.reduce((s, a) => s + a.returnEstimate * (a.recommendedAllocation / 100), 0) * 10) / 10;
  const portfolioRisk = Math.round(allocations.reduce((s, a) => s + a.riskScore * (a.recommendedAllocation / 100), 0));

  // Generate recommendations
  if (diversificationScore < 40) recommendations.push("Portfolio is concentrated — consider diversifying across more pools");
  if (portfolioRisk > 60) recommendations.push("High overall risk — shift allocation toward lower-risk pools");
  const underutilized = allocations.filter(a => a.currentAllocation < a.recommendedAllocation * 0.5);
  if (underutilized.length > 0) recommendations.push(`${underutilized.length} pool(s) underallocated relative to optimal`);

  return {
    institutionId,
    totalCapital,
    allocations,
    diversificationScore,
    expectedPortfolioReturn: expectedReturn,
    portfolioRisk,
    recommendations,
    computedAt: new Date().toISOString(),
  };
}
