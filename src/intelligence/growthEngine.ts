/**
 * Strategic Growth Intelligence — analyzes user growth velocity,
 * capital growth, institutional onboarding, trust distribution, and liquidity.
 */

import { supabase } from "@/integrations/supabase/client";

export interface GrowthHealthReport {
  growthHealthScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  metrics: Record<string, { value: number; trend: "up" | "down" | "flat"; weight: number }>;
  strategicRecommendations: string[];
  computedAt: string;
}

export async function computeGrowthHealth(): Promise<GrowthHealthReport> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

  const [recentDealsRes, prevDealsRes, trustRes, poolsRes, orgsRes, feesRecentRes, feesPrevRes] = await Promise.all([
    supabase.from("deal_rooms").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("deal_rooms").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabase.from("user_trust_profiles").select("trust_score, trust_tier"),
    supabase.from("funding_pools").select("total_capital, available_capital, deployed_capital"),
    supabase.from("organizations").select("id, created_at"),
    supabase.from("platform_fees").select("platform_fee_amount").gte("created_at", thirtyDaysAgo),
    supabase.from("platform_fees").select("platform_fee_amount").gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
  ]);

  const recentDeals = recentDealsRes.count ?? 0;
  const prevDeals = prevDealsRes.count ?? 0;
  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const orgs = orgsRes.data ?? [];

  const recentRevenue = (feesRecentRes.data ?? []).reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);
  const prevRevenue = (feesPrevRes.data ?? []).reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);

  function trendCalc(current: number, prev: number): "up" | "down" | "flat" {
    if (prev === 0) return current > 0 ? "up" : "flat";
    const change = (current - prev) / prev;
    return change > 0.05 ? "up" : change < -0.05 ? "down" : "flat";
  }

  // Deal velocity
  const dealGrowth = prevDeals > 0 ? ((recentDeals - prevDeals) / prevDeals) * 100 : recentDeals > 0 ? 100 : 0;
  const dealScore = Math.min(100, Math.max(0, 50 + dealGrowth));

  // Revenue growth
  const revenueGrowth = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : recentRevenue > 0 ? 100 : 0;
  const revenueScore = Math.min(100, Math.max(0, 50 + revenueGrowth));

  // Trust distribution health
  const avgTrust = trusts.length > 0 ? trusts.reduce((s, t) => s + t.trust_score, 0) / trusts.length : 50;
  const trustScore = Math.min(100, avgTrust);

  // Institutional onboarding
  const recentOrgs = orgs.filter(o => o.created_at >= thirtyDaysAgo).length;
  const institutionalScore = Math.min(100, recentOrgs * 20);

  // Liquidity efficiency
  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const deployed = pools.reduce((s, p) => s + (p.deployed_capital ?? 0), 0);
  const utilization = totalCapital > 0 ? (deployed / totalCapital) * 100 : 0;
  const liquidityScore = utilization > 80 ? 60 : utilization > 40 ? 90 : utilization > 10 ? 70 : 30;

  // Weighted composite
  const growthHealthScore = Math.round(
    dealScore * 0.25 + revenueScore * 0.25 + trustScore * 0.20 + institutionalScore * 0.15 + liquidityScore * 0.15
  );

  const grade = growthHealthScore >= 80 ? "A" : growthHealthScore >= 65 ? "B" : growthHealthScore >= 50 ? "C" : growthHealthScore >= 35 ? "D" : "F";

  const strategicRecommendations: string[] = [];
  if (dealScore < 50) strategicRecommendations.push("Deal velocity declining — activate user engagement campaigns");
  if (revenueScore < 40) strategicRecommendations.push("Revenue growth stalling — review pricing and fee optimization");
  if (trustScore < 60) strategicRecommendations.push("Average trust below target — invest in verification and dispute resolution");
  if (institutionalScore < 30) strategicRecommendations.push("Institutional onboarding slow — activate enterprise outreach");
  if (liquidityScore < 50) strategicRecommendations.push("Capital utilization suboptimal — rebalance pool allocations");

  return {
    growthHealthScore,
    grade,
    metrics: {
      deal_velocity: { value: Math.round(dealGrowth), trend: trendCalc(recentDeals, prevDeals), weight: 0.25 },
      revenue_growth: { value: Math.round(revenueGrowth), trend: trendCalc(recentRevenue, prevRevenue), weight: 0.25 },
      trust_health: { value: Math.round(avgTrust), trend: "flat", weight: 0.20 },
      institutional_onboarding: { value: recentOrgs, trend: recentOrgs > 0 ? "up" : "flat", weight: 0.15 },
      liquidity_efficiency: { value: Math.round(utilization), trend: "flat", weight: 0.15 },
    },
    strategicRecommendations,
    computedAt: new Date().toISOString(),
  };
}
