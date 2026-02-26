/**
 * Reserve Transparency Report — anonymized, no raw wallet exposure.
 */

import { calculateGlobalReserveIndex } from "./reserveIndex";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface ReserveTransparencyReport {
  totalReserveSupply: number;
  backingCoverageBand: string;
  stabilityBand: string;
  crossBorderUtilizationBand: string;
  riskExposureBand: string;
  trustStabilityBand: string;
  globalReserveIndex: number;
  timestamp: string;
}

export async function generateReserveTransparencyReport(): Promise<ReserveTransparencyReport> {
  const index = await calculateGlobalReserveIndex();

  log.info("Reserve transparency report generated");

  return {
    totalReserveSupply: index.totalReserveUnits,
    backingCoverageBand: toBand(Math.min(100, index.backingRatio)),
    stabilityBand: toBand(index.stabilityScore),
    crossBorderUtilizationBand: toBand(index.crossBorderSettlementPercent + 30),
    riskExposureBand: toBand(100 - index.redemptionVelocity),
    trustStabilityBand: toBand(index.stabilityScore + 5),
    globalReserveIndex: index.globalAcademicReserveIndex,
    timestamp: new Date().toISOString(),
  };
}
