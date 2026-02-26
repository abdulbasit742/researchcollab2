/**
 * Revenue Forecasting — simple trend-based projection.
 */

import { calculateRollingGMV } from "./gmvTracker";
import { calculateSubscriptionMetrics } from "./subscriptionTracker";
import { calculateSponsorRetention } from "./sponsorRetention";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("forecasting");

export interface RevenueForecast {
  nextMonthGMV: number;
  quarterGMV: number;
  projectedMRR: number;
  growthRate: number;
  confidence: "low" | "medium" | "high";
}

export async function forecastRevenue(tenantId?: string): Promise<RevenueForecast> {
  const [gmv30, gmv60, gmv90, subs, retention] = await Promise.all([
    calculateRollingGMV(30, tenantId),
    calculateRollingGMV(60, tenantId),
    calculateRollingGMV(90, tenantId),
    calculateSubscriptionMetrics(tenantId),
    calculateSponsorRetention(tenantId),
  ]);

  // Growth rate from 60-day vs 30-day GMV
  const firstHalf = gmv60 - gmv30;
  const growthRate = firstHalf > 0 ? Math.round(((gmv30 - firstHalf) / firstHalf) * 100) : 0;
  const growthMultiplier = 1 + growthRate / 100;

  // Repeat sponsor boost
  const retentionBoost = 1 + (retention.repeatRate / 200); // Max 50% boost

  const nextMonthGMV = Math.round(gmv30 * growthMultiplier * retentionBoost);
  const quarterGMV = Math.round(nextMonthGMV * 3 * (1 + growthRate / 300));
  const projectedMRR = Math.round(subs.mrr * (1 - subs.churnRate / 100) * 1.05); // 5% organic growth

  // Confidence based on sample size
  const confidence = gmv90 > 100000 ? "high" : gmv90 > 10000 ? "medium" : "low";

  const forecast: RevenueForecast = {
    nextMonthGMV,
    quarterGMV,
    projectedMRR,
    growthRate,
    confidence,
  };

  log.info("Revenue forecast generated", { ...forecast });
  return forecast;
}
