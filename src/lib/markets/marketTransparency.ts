/**
 * Capital Market Transparency Report — anonymized, no raw wallet exposure.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateGlobalCapitalIndex } from "./globalCapitalIndex";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("marketTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface MarketTransparencyReport {
  totalBondsIssued: number;
  averageCreditBand: string;
  liquidityStabilityBand: string;
  riskAdjustedReturnBand: string;
  defaultContainmentBand: string;
  innovationYieldBand: string;
  globalCapitalIndex: number;
  timestamp: string;
}

export async function generateMarketTransparencyReport(): Promise<MarketTransparencyReport> {
  const index = await calculateGlobalCapitalIndex();

  const { data: bonds } = await (supabase as any).from("research_bonds").select("id");
  const totalBonds = (bonds ?? []).length;

  log.info("Market transparency report generated");

  return {
    totalBondsIssued: totalBonds,
    averageCreditBand: toBand(index.averageCreditRating),
    liquidityStabilityBand: toBand(index.crossBorderLiquidityPercent + 30),
    riskAdjustedReturnBand: toBand(Math.min(100, index.riskAdjustedReturn * 12)),
    defaultContainmentBand: toBand(100 - index.defaultRate),
    innovationYieldBand: toBand(Math.min(100, index.innovationGrowthRate * 10)),
    globalCapitalIndex: index.globalAcademicCapitalIndex,
    timestamp: new Date().toISOString(),
  };
}
