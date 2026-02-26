/**
 * Dynamic Deal Pricing Engine — suggests optimal deal pricing.
 *
 * Factors: skill demand index, supply saturation, historical median,
 * region economic multiplier, complexity weight.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PricingGuidance {
  optimalPriceRange: { low: number; mid: number; high: number };
  marketMedian: number;
  demandIndex: number;
  supplyIndex: number;
  complexityMultiplier: number;
  regionMultiplier: number;
  confidence: number;
  factors: Record<string, number>;
  computedAt: string;
}

export async function computeOptimalPricing(params: {
  skillDomain?: string;
  region?: string;
  complexity?: "low" | "medium" | "high" | "expert";
  budgetHint?: number;
}): Promise<PricingGuidance> {
  // Fetch recent deal pricing for market median
  const { data: recentDeals } = await supabase
    .from("deal_rooms")
    .select("agreed_amount, status")
    .in("status", ["completed", "active", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(200);

  const deals = (recentDeals ?? []).filter(d => (d.agreed_amount ?? 0) > 0);
  const amounts = deals.map(d => d.agreed_amount ?? 0).sort((a, b) => a - b);

  const marketMedian = amounts.length > 0 ? amounts[Math.floor(amounts.length / 2)] : 50000;

  // Supply/demand indices (simplified deterministic)
  const totalDeals = deals.length || 1;
  const completedDeals = deals.filter(d => d.status === "completed").length;
  const demandIndex = Math.min(100, Math.round((totalDeals / 100) * 100));
  const supplyIndex = Math.min(100, Math.round((completedDeals / totalDeals) * 100));

  // Complexity multiplier
  const complexityMap = { low: 0.7, medium: 1.0, high: 1.4, expert: 2.0 };
  const complexityMultiplier = complexityMap[params.complexity ?? "medium"];

  // Region multiplier
  const regionMultipliers: Record<string, number> = {
    "pk-south": 1.0, "us-east": 3.5, "eu-west": 3.0, "ap-southeast": 2.0, "me-central": 2.5,
  };
  const regionMultiplier = regionMultipliers[params.region ?? "pk-south"] ?? 1.0;

  // Demand-supply adjustment
  const dsRatio = demandIndex > 0 ? supplyIndex / demandIndex : 1;
  const dsAdjustment = dsRatio < 0.5 ? 1.2 : dsRatio > 1.5 ? 0.85 : 1.0;

  // Compute optimal range
  const base = (params.budgetHint ?? marketMedian) * complexityMultiplier * dsAdjustment;
  const low = Math.round(base * 0.75 * regionMultiplier);
  const mid = Math.round(base * regionMultiplier);
  const high = Math.round(base * 1.35 * regionMultiplier);

  // Confidence based on data volume
  const confidence = Math.min(95, Math.round(30 + amounts.length * 0.3));

  return {
    optimalPriceRange: { low, mid, high },
    marketMedian,
    demandIndex,
    supplyIndex,
    complexityMultiplier,
    regionMultiplier,
    confidence,
    factors: { dsAdjustment, totalDeals, completedDeals, base: Math.round(base) },
    computedAt: new Date().toISOString(),
  };
}
