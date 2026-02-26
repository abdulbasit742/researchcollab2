/**
 * Global Stability Transparency Report — anonymized bands, zero sensitive data.
 */

import { calculateCivilizationalHealth } from "./civilizationalHealthIndex";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("stabilityTransparency");

export interface StabilityTransparencyReport {
  systemStabilityBand: string;
  capitalResilienceBand: string;
  innovationGrowthBand: string;
  governanceStabilityBand: string;
  riskExposureBand: string;
  overallHealthBand: string;
  timestamp: string;
}

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export async function generateStabilityTransparencyReport(): Promise<StabilityTransparencyReport> {
  const health = await calculateCivilizationalHealth();

  const report: StabilityTransparencyReport = {
    systemStabilityBand: toBand(health.civilizationalStabilityScore),
    capitalResilienceBand: toBand(health.economicResilience),
    innovationGrowthBand: toBand(health.innovationGrowth),
    governanceStabilityBand: toBand(health.governanceStability),
    riskExposureBand: toBand(health.riskDistribution),
    overallHealthBand: toBand(health.civilizationalStabilityScore),
    timestamp: new Date().toISOString(),
  };

  log.info("Stability transparency report generated", { overall: report.overallHealthBand });
  return report;
}
