/**
 * Revenue Dashboard Data Source — aggregates all revenue intelligence for admin consumption.
 */

import { calculateTotalGMV, calculateRollingGMV } from "./gmvTracker";
import { calculateEscrowVelocity, type EscrowVelocityMetrics } from "./escrowVelocity";
import { calculateSponsorRetention, type RetentionSummary } from "./sponsorRetention";
import { calculateCompletionMetrics, type CompletionMetrics } from "./dealCompletionMetrics";
import { calculateSubscriptionMetrics, type SubscriptionMetrics } from "./subscriptionTracker";
import { forecastRevenue, type RevenueForecast } from "./forecasting";
import { calculateUniversityScore, type UniversityScore } from "./universityScore";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("revenueDashboard");

export interface RevenueDashboardData {
  totalGMV: number;
  gmv30d: number;
  gmv7d: number;
  escrowVelocity: EscrowVelocityMetrics;
  sponsorRetention: RetentionSummary;
  completionMetrics: CompletionMetrics;
  subscriptionMetrics: SubscriptionMetrics;
  forecast: RevenueForecast;
  universityScore?: UniversityScore;
  timestamp: string;
}

export async function getRevenueDashboardData(tenantId?: string): Promise<RevenueDashboardData> {
  log.info("Loading revenue dashboard data...");

  const [totalGMV, gmv30d, gmv7d, escrowVelocity, sponsorRetention, completionMetrics, subscriptionMetrics, forecast] =
    await Promise.all([
      calculateTotalGMV(tenantId),
      calculateRollingGMV(30, tenantId),
      calculateRollingGMV(7, tenantId),
      calculateEscrowVelocity(tenantId),
      calculateSponsorRetention(tenantId),
      calculateCompletionMetrics(tenantId),
      calculateSubscriptionMetrics(tenantId),
      forecastRevenue(tenantId),
    ]);

  let universityScore: UniversityScore | undefined;
  if (tenantId) {
    universityScore = await calculateUniversityScore(tenantId);
  }

  return {
    totalGMV,
    gmv30d,
    gmv7d,
    escrowVelocity,
    sponsorRetention,
    completionMetrics,
    subscriptionMetrics,
    forecast,
    universityScore,
    timestamp: new Date().toISOString(),
  };
}
