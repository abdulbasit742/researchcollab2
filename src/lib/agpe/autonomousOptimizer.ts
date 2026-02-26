/**
 * Autonomous Parameter Optimizer — analyzes trends, suggests policy adjustments.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("autonomousOptimizer");

export interface OptimizerRecommendation {
  type: string;
  currentValue: Record<string, unknown>;
  recommendedValue: Record<string, unknown>;
  rationale: string;
  confidence: number;
}

export async function generateOptimizationRecommendations(): Promise<OptimizerRecommendation[]> {
  const recommendations: OptimizerRecommendation[] = [];

  // Analyze completion rates
  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed").length;
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const completionRate = allDeals.length > 0 ? (completed / allDeals.length) * 100 : 0;
  const disputeRate = allDeals.length > 0 ? (disputed / allDeals.length) * 100 : 0;

  // Capital efficiency
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const utilization = totalCommitted > 0 ? (totalAllocated / totalCommitted) * 100 : 0;

  // Liquidity
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("status");
  const stagnant = (exchanges ?? []).filter((e: any) => e.status === "active").length;

  // Compliance
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("id").eq("resolved", false);

  // Generate recommendations
  if (disputeRate > 15) {
    recommendations.push({
      type: "risk_threshold", currentValue: { disputeRate }, recommendedValue: { riskThreshold: 40 },
      rationale: `Dispute rate at ${disputeRate.toFixed(1)}% exceeds 15%. Recommend tightening risk threshold.`,
      confidence: 75,
    });
  }

  if (utilization < 40 && totalCommitted > 0) {
    recommendations.push({
      type: "allocation_rule", currentValue: { utilization }, recommendedValue: { minAllocationPercent: 50 },
      rationale: `Capital utilization at ${utilization.toFixed(1)}% is below 40%. Recommend minimum allocation enforcement.`,
      confidence: 70,
    });
  }

  if (utilization > 90) {
    recommendations.push({
      type: "capital_limit", currentValue: { totalCommitted }, recommendedValue: { limitMultiplier: 1.25 },
      rationale: `Capital utilization at ${utilization.toFixed(1)}% near capacity. Recommend 25% limit increase.`,
      confidence: 80,
    });
  }

  if (stagnant > 5) {
    recommendations.push({
      type: "liquidity_rule", currentValue: { stagnantExchanges: stagnant },
      recommendedValue: { maxActiveDuration: 90 },
      rationale: `${stagnant} liquidity exchanges stagnant. Recommend 90-day max duration.`,
      confidence: 65,
    });
  }

  if ((alerts?.length ?? 0) > 10) {
    recommendations.push({
      type: "compliance_rule", currentValue: { unresolvedAlerts: alerts?.length },
      recommendedValue: { autoBlockThreshold: 5 },
      rationale: `${alerts?.length} unresolved compliance alerts. Recommend auto-block at 5 alerts.`,
      confidence: 85,
    });
  }

  // Store recommendations
  for (const rec of recommendations) {
    await (supabase as any).from("optimizer_recommendations").insert({
      recommendation_type: rec.type, current_value: rec.currentValue,
      recommended_value: rec.recommendedValue, rationale: rec.rationale,
      confidence_score: rec.confidence, status: "pending",
    });
  }

  log.info("Optimization recommendations generated", { count: recommendations.length });
  return recommendations;
}
