/**
 * GIAB Transparency Report — anonymized, no raw capital data.
 */

import { calculateGlobalInnovationEfficiency } from "./globalInnovationEfficiency";
import { detectCapitalScarcity } from "./scarcityDetector";
import { forecastInnovationROI } from "./innovationROI";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("giabTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface GIABTransparencyReport {
  allocationRecommendationVolume: number;
  innovationEfficiencyBand: string;
  riskAdjustmentBand: string;
  capitalScarcityBand: string;
  trustStabilityBand: string;
  roiForecastBand: string;
  globalEfficiencyIndex: number;
  timestamp: string;
}

export async function generateGIABTransparencyReport(): Promise<GIABTransparencyReport> {
  const [efficiency, scarcity, roi] = await Promise.all([
    calculateGlobalInnovationEfficiency(),
    detectCapitalScarcity(),
    forecastInnovationROI(),
  ]);

  log.info("GIAB transparency report generated");

  return {
    allocationRecommendationVolume: 0, // populated when recommendations run
    innovationEfficiencyBand: toBand(efficiency.globalInnovationEfficiencyIndex),
    riskAdjustmentBand: toBand(Math.min(100, roi.riskAdjustedROI * 15)),
    capitalScarcityBand: toBand(100 - scarcity.capitalScarcityIndex),
    trustStabilityBand: toBand(efficiency.trustStability),
    roiForecastBand: toBand(roi.forecastedInnovationROIScore),
    globalEfficiencyIndex: efficiency.globalInnovationEfficiencyIndex,
    timestamp: new Date().toISOString(),
  };
}
