/**
 * Risk-Aware Allocation Recommender — blocks recommendations exceeding risk thresholds.
 */

import { generateAllocationRecommendations, type AllocationRecommendation } from "./allocationOptimizer";
import { calculateMarketStability } from "@/lib/markets/marketStability";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskAwareRecommender");

const SYSTEMIC_RISK_THRESHOLD = 65;

export interface RiskAwareRecommendation extends AllocationRecommendation {
  riskCleared: boolean;
  systemicRiskDelta: number;
  blockReason: string | null;
}

export async function generateRiskAwareRecommendations(): Promise<RiskAwareRecommendation[]> {
  const [rawRecs, stability] = await Promise.all([
    generateAllocationRecommendations(),
    calculateMarketStability(),
  ]);

  const currentRisk = 100 - stability.academicCapitalMarketStabilityIndex;
  const results: RiskAwareRecommendation[] = [];

  for (const rec of rawRecs) {
    const riskDelta = Math.round(rec.recommendedAmount / 50000 * 3);
    const projectedRisk = currentRisk + riskDelta;
    const cleared = projectedRisk <= SYSTEMIC_RISK_THRESHOLD;

    let blockReason: string | null = null;
    if (!cleared) blockReason = `Projected systemic risk ${projectedRisk} exceeds threshold ${SYSTEMIC_RISK_THRESHOLD}`;

    results.push({ ...rec, riskCleared: cleared, systemicRiskDelta: riskDelta, blockReason });
  }

  const approvedCount = results.filter(r => r.riskCleared).length;
  log.info("Risk-aware recommendations generated", { total: results.length, approved: approvedCount });
  return results;
}
