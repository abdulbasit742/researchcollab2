/**
 * Public Transparency Control — controls what data is publicly visible.
 */

import { isPhaseActive } from "./phaseManager";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("publicExposure");

export interface ExposureConfig {
  globalCapitalIndex: boolean;
  creditRatings: boolean;
  capitalMetrics: boolean;
  reserveData: boolean;
  innovationSignals: boolean;
  marketStability: boolean;
  bondIssuance: boolean;
  settlementVolume: boolean;
}

export async function getPublicExposureConfig(): Promise<ExposureConfig> {
  const p5 = await isPhaseActive(5);
  const p7 = await isPhaseActive(7);
  const p9 = await isPhaseActive(9);

  return {
    globalCapitalIndex: p9,
    creditRatings: p5,       // Aggregated only
    capitalMetrics: p5,      // Aggregated only
    reserveData: p9,         // Aggregated only
    innovationSignals: p5,
    marketStability: p5,
    bondIssuance: p7,        // Aggregated only
    settlementVolume: p9,
  };
}

export async function isDataPubliclyVisible(dataType: keyof ExposureConfig): Promise<boolean> {
  const config = await getPublicExposureConfig();
  const visible = config[dataType];
  if (!visible) log.info("Data not publicly visible", { dataType });
  return visible;
}

export async function getPublicDataSummary(): Promise<Record<string, string>> {
  const config = await getPublicExposureConfig();
  const summary: Record<string, string> = {};
  for (const [key, visible] of Object.entries(config)) {
    summary[key] = visible ? "public (aggregated)" : "restricted";
  }
  return summary;
}
