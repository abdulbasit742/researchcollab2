/**
 * Strategic Drift Detection Engine — compares current trajectory against discipline plans.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("strategicDrift");

export interface DriftFactors {
  stabilityBudgetUtilization: number; // 0-100%
  expansionPushScore: number; // 0-100
  riskProfileDelta: number; // change from baseline
  capitalGrowthSpeed: number; // 0-100
  regulatoryExposureLevel: number; // 0-100
  narrativeShiftFrequency: number; // count in last quarter
  disciplinePlanAdherence: number; // 0-100%
}

export interface StrategicDriftReport {
  index: number; // 0-100, higher = more drift
  healthy: boolean;
  factors: DriftFactors;
  warnings: string[];
  evaluatedAt: string;
}

const DRIFT_THRESHOLD = 40;

/**
 * Calculate the Strategic Drift Index.
 */
export function calculateStrategicDrift(factors: DriftFactors): StrategicDriftReport {
  const warnings: string[] = [];
  let index = 0;

  // High stability budget usage signals aggressive expansion
  if (factors.stabilityBudgetUtilization > 80) {
    index += 15;
    warnings.push(`Stability budget ${factors.stabilityBudgetUtilization}% utilized — near limit`);
  }

  // Expansion push vs discipline plan
  if (factors.expansionPushScore > 60) {
    index += 15;
    warnings.push(`Expansion push score ${factors.expansionPushScore} — exceeds discipline threshold`);
  }

  // Risk profile divergence
  if (factors.riskProfileDelta > 20) {
    index += 15;
    warnings.push(`Risk profile shifted ${factors.riskProfileDelta} points from baseline`);
  }

  // Capital growth outpacing maturity
  if (factors.capitalGrowthSpeed > 70 && factors.disciplinePlanAdherence < 80) {
    index += 20;
    warnings.push("Capital growth outpacing institutional maturity");
  }

  // Regulatory exposure climbing
  if (factors.regulatoryExposureLevel > 60) {
    index += 10;
    warnings.push(`Regulatory exposure at ${factors.regulatoryExposureLevel}%`);
  }

  // Frequent narrative shifts signal strategic instability
  if (factors.narrativeShiftFrequency > 3) {
    index += 10;
    warnings.push(`${factors.narrativeShiftFrequency} narrative shifts this quarter`);
  }

  // Low discipline plan adherence
  if (factors.disciplinePlanAdherence < 70) {
    index += 15;
    warnings.push(`Discipline plan adherence at ${factors.disciplinePlanAdherence}%`);
  }

  index = Math.min(index, 100);
  const healthy = index < DRIFT_THRESHOLD;

  if (!healthy) {
    log.warn("Strategic drift detected", { index, warnings: warnings.length });
  } else {
    log.info("Strategic alignment stable", { index });
  }

  return { index, healthy, factors, warnings, evaluatedAt: new Date().toISOString() };
}
