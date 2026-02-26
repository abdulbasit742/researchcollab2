/**
 * Technical Debt Tracker — surfaces and quantifies accumulated technical debt.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("technicalDebt");

export interface DebtItem {
  id: string;
  category: "todo" | "invariant_bypass" | "stale_feature_flag" | "deprecated_api" | "high_risk_path";
  description: string;
  module: string;
  severity: "low" | "medium" | "high";
  ageInDays: number;
  detectedAt: string;
}

export interface TechnicalDebtReport {
  index: number; // 0-100, higher = more debt
  items: DebtItem[];
  breakdown: Record<DebtItem["category"], number>;
  evaluatedAt: string;
}

/**
 * Calculate the Technical Debt Index from a set of detected debt items.
 */
export function calculateDebtIndex(items: DebtItem[]): TechnicalDebtReport {
  const weights: Record<DebtItem["category"], number> = {
    todo: 1,
    invariant_bypass: 5,
    stale_feature_flag: 2,
    deprecated_api: 2,
    high_risk_path: 4,
  };

  const severityMultiplier: Record<DebtItem["severity"], number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  let totalWeight = 0;
  const breakdown: Record<DebtItem["category"], number> = {
    todo: 0,
    invariant_bypass: 0,
    stale_feature_flag: 0,
    deprecated_api: 0,
    high_risk_path: 0,
  };

  for (const item of items) {
    const w = weights[item.category] * severityMultiplier[item.severity];
    // Age amplifier — older debt is more costly
    const ageAmplifier = Math.min(1 + (item.ageInDays / 180), 3);
    totalWeight += w * ageAmplifier;
    breakdown[item.category] += 1;
  }

  // Normalize to 0-100 scale (50 items at max weight ≈ 100)
  const index = Math.min(Math.round(totalWeight / 7.5), 100);

  const report: TechnicalDebtReport = {
    index,
    items,
    breakdown,
    evaluatedAt: new Date().toISOString(),
  };

  if (index > 60) {
    log.warn("High technical debt", { index, items: items.length });
  } else {
    log.info("Technical debt evaluated", { index });
  }

  return report;
}

/**
 * Detect stale feature flags older than the given threshold (days).
 */
export function detectStaleFeatureFlags(
  flags: Array<{ key: string; createdAt: string; module: string }>,
  thresholdDays = 90
): DebtItem[] {
  const now = Date.now();
  return flags
    .filter(f => {
      const age = (now - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return age > thresholdDays;
    })
    .map(f => {
      const ageInDays = Math.round((now - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: `stale_flag_${f.key}`,
        category: "stale_feature_flag" as const,
        description: `Feature flag "${f.key}" is ${ageInDays} days old (threshold: ${thresholdDays})`,
        module: f.module,
        severity: ageInDays > 180 ? "high" as const : "medium" as const,
        ageInDays,
        detectedAt: new Date().toISOString(),
      };
    });
}
