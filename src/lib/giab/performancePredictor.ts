/**
 * Institutional Performance Predictor — 12-month forecasts.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("performancePredictor");

export interface PerformanceForecast {
  tenantId: string;
  completionProbability12m: number;
  defaultProbability12m: number;
  trustTrajectory: "improving" | "stable" | "declining";
  creditTrajectory: "improving" | "stable" | "declining";
  capitalEfficiencyGrowth: number;
  performanceForecastScore: number;
}

export async function predictInstitutionalPerformance(tenantId: string): Promise<PerformanceForecast> {
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount").eq("tenant_id", tenantId) as { data: any[] | null };
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d: any) => d.status === "completed").length;
  const disputed = allDeals.filter((d: any) => d.status === "disputed").length;
  const total = allDeals.length;

  const completionRate = total > 0 ? completed / total : 0;
  const disputeRate = total > 0 ? disputed / total : 0;

  // Simple trend projection
  const completionProb = Math.min(95, Math.round(completionRate * 100 * 1.1));
  const defaultProb = Math.min(80, Math.round(disputeRate * 100 * 1.5));

  const trustTrend = completionRate > 0.7 && disputeRate < 0.1 ? "improving" : completionRate < 0.4 ? "declining" : "stable";
  const creditTrend = completionRate > 0.6 && disputeRate < 0.15 ? "improving" : disputeRate > 0.3 ? "declining" : "stable";

  const capitalEff = total > 0 ? Math.round(completionRate * 80) : 0;

  const score = Math.max(0, Math.min(100, Math.round(
    completionProb * 0.3 + (100 - defaultProb) * 0.25 +
    (trustTrend === "improving" ? 25 : trustTrend === "stable" ? 15 : 5) * 0.2 +
    capitalEff * 0.25
  )));

  log.info("Performance forecast generated", { tenantId, score });

  return {
    tenantId, completionProbability12m: completionProb, defaultProbability12m: defaultProb,
    trustTrajectory: trustTrend, creditTrajectory: creditTrend,
    capitalEfficiencyGrowth: capitalEff, performanceForecastScore: score,
  };
}
