/**
 * Capital Impact Simulator — projects capital-specific policy changes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalImpactSimulator");

export interface CapitalImpactReport {
  scenario: string;
  projectedGMV: number;
  projectedCapitalUtilization: number;
  projectedDefaultExposure: number;
  projectedDisputeChange: number;
  capitalVelocityImpact: string;
  riskLevel: string;
}

export async function simulateCapitalImpact(scenario: {
  capitalLimitChange?: number;
  disputeToleranceChange?: number;
  riskThresholdChange?: number;
  autonomousFundingExpansion?: boolean;
}): Promise<CapitalImpactReport> {
  // Fetch baseline
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount");

  const allPools = pools ?? [];
  const allDeals = deals ?? [];
  const totalCommitted = allPools.reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = allPools.reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const gmv = allDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const disputeRate = allDeals.length > 0 ? (disputed / allDeals.length) * 100 : 0;
  const utilization = totalCommitted > 0 ? (totalAllocated / totalCommitted) * 100 : 0;

  // Apply scenario
  const limitMult = 1 + ((scenario.capitalLimitChange ?? 0) / 100);
  const projectedGMV = Math.round(gmv * limitMult);
  const projectedUtilization = Math.round(utilization / limitMult);
  const defaultExposure = Math.round(totalCommitted * limitMult * 0.05); // 5% default assumption
  const disputeChange = (scenario.disputeToleranceChange ?? 0) > 0 ? 2 : (scenario.disputeToleranceChange ?? 0) < 0 ? -2 : 0;

  let velocityImpact = "neutral";
  if (scenario.autonomousFundingExpansion) velocityImpact = "accelerated";
  if ((scenario.riskThresholdChange ?? 0) < 0) velocityImpact = "decelerated";

  const riskLevel = defaultExposure > totalCommitted * 0.1 ? "high" : defaultExposure > totalCommitted * 0.05 ? "medium" : "low";

  log.info("Capital impact simulated", { riskLevel, velocityImpact });

  return {
    scenario: JSON.stringify(scenario),
    projectedGMV, projectedCapitalUtilization: projectedUtilization,
    projectedDefaultExposure: defaultExposure,
    projectedDisputeChange: disputeChange,
    capitalVelocityImpact: velocityImpact, riskLevel,
  };
}
