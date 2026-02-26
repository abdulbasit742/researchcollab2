/**
 * Innovation Impact Prediction Engine — 12-month forecasting based on historical trends.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("innovationPredictor");

export interface InnovationPrediction {
  projectedInnovationOutput: number;
  fundingEfficiencyGain: number;
  crossBorderGrowthPercent: number;
  completionRateTrend: string;
  researchCapitalROI: number;
  nationalInnovationUplift: number;
  confidenceLevel: number;
  timestamp: string;
}

export async function predictInnovationImpact(): Promise<InnovationPrediction> {
  // Current state
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount, created_at");
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed");
  const completionRate = allDeals.length > 0 ? (completed.length / allDeals.length) * 100 : 0;
  const totalGMV = allDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const completedGMV = completed.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);

  // Capital efficiency
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const utilization = totalCommitted > 0 ? (totalAllocated / totalCommitted) * 100 : 0;

  // Cross-border
  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id").eq("active", true);
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id").eq("sovereign_status", true);

  // Projections (linear extrapolation + growth assumptions)
  const growthMultiplier = 1.15; // 15% growth assumption
  const projectedOutput = Math.round(completed.length * growthMultiplier * 4); // 12-month projection
  const fundingEfficiency = utilization > 0 ? Math.round(utilization * growthMultiplier) : 50;
  const crossBorderGrowth = Math.round((agreements?.length ?? 0) * 25); // % growth
  const completionTrend = completionRate > 60 ? "improving" : completionRate > 40 ? "stable" : "declining";
  const roi = completedGMV > 0 && totalCommitted > 0 ? Math.round((completedGMV / totalCommitted) * 100) : 0;
  const innovationUplift = Math.min(50, Math.round(projectedOutput * 0.5 + crossBorderGrowth * 0.3));

  const confidence = Math.max(30, Math.min(90,
    50 + (allDeals.length > 50 ? 20 : allDeals.length * 0.4) + ((nodes?.length ?? 0) > 5 ? 15 : (nodes?.length ?? 0) * 3)
  ));

  log.info("Innovation prediction generated", { projectedOutput, confidence });

  return {
    projectedInnovationOutput: projectedOutput,
    fundingEfficiencyGain: fundingEfficiency,
    crossBorderGrowthPercent: crossBorderGrowth,
    completionRateTrend: completionTrend,
    researchCapitalROI: roi,
    nationalInnovationUplift: innovationUplift,
    confidenceLevel: Math.round(confidence),
    timestamp: new Date().toISOString(),
  };
}
