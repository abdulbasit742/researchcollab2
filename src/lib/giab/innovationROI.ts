/**
 * Innovation ROI Forecast Engine — FORECASTED_INNOVATION_ROI_SCORE.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("innovationROI");

export interface InnovationROIForecast {
  expectedInnovationOutput: number;
  researchYieldMultiplier: number;
  capitalToOutputROI: number;
  trustAdjustedROI: number;
  riskAdjustedROI: number;
  forecastedInnovationROIScore: number;
}

export async function forecastInnovationROI(tenantId?: string): Promise<InnovationROIForecast> {
  let dealQuery = supabase.from("deal_rooms").select("status, escrow_amount") as any;
  if (tenantId) dealQuery = dealQuery.eq("tenant_id", tenantId);
  const { data: deals } = await dealQuery;

  const allDeals = deals ?? [];
  const completed = allDeals.filter((d: any) => d.status === "completed");
  const totalCapital = allDeals.reduce((s: number, d: any) => s + (d.escrow_amount ?? 0), 0);
  const completedCapital = completed.reduce((s: number, d: any) => s + (d.escrow_amount ?? 0), 0);

  const expectedOutput = completed.length;
  const yieldMultiplier = totalCapital > 0 ? Math.round((completedCapital / totalCapital) * 100) / 100 : 0;
  const capitalToOutput = totalCapital > 0 ? Math.round((expectedOutput / (totalCapital / 10000)) * 100) / 100 : 0;

  const disputed = allDeals.filter((d: any) => d.status === "disputed").length;
  const disputeRate = allDeals.length > 0 ? disputed / allDeals.length : 0;
  const trustAdj = Math.round(capitalToOutput * (1 - disputeRate * 0.5) * 100) / 100;
  const riskAdj = Math.round(trustAdj * yieldMultiplier * 100) / 100;

  const score = Math.max(0, Math.min(100, Math.round(
    Math.min(30, expectedOutput * 3) + yieldMultiplier * 30 + Math.min(20, capitalToOutput * 5) + (1 - disputeRate) * 20
  )));

  log.info("Innovation ROI forecasted", { score });

  return {
    expectedInnovationOutput: expectedOutput, researchYieldMultiplier: yieldMultiplier,
    capitalToOutputROI: capitalToOutput, trustAdjustedROI: trustAdj,
    riskAdjustedROI: riskAdj, forecastedInnovationROIScore: score,
  };
}
