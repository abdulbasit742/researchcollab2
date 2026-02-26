/**
 * Revenue Module — unified exports.
 */

export { calculateTotalGMV, calculateMonthlyGMV, calculateDailyGMV, calculateRollingGMV, snapshotGMV } from "./gmvTracker";
export { calculateEscrowVelocity } from "./escrowVelocity";
export { calculateSponsorRetention, getSponsorMetrics } from "./sponsorRetention";
export { calculateCompletionMetrics } from "./dealCompletionMetrics";
export { calculateSubscriptionMetrics } from "./subscriptionTracker";
export { forecastRevenue } from "./forecasting";
export { scoreSponsor } from "./sponsorScoring";
export { findReEngagementCandidates, triggerReEngagementNotifications } from "./reEngagementEngine";
export { calculateUniversityScore } from "./universityScore";
export { getRevenueDashboardData } from "./revenueDashboardService";

export type { GMVSnapshot } from "./gmvTracker";
export type { EscrowVelocityMetrics } from "./escrowVelocity";
export type { RetentionSummary, SponsorMetrics } from "./sponsorRetention";
export type { CompletionMetrics } from "./dealCompletionMetrics";
export type { SubscriptionMetrics } from "./subscriptionTracker";
export type { RevenueForecast } from "./forecasting";
export type { SponsorScore } from "./sponsorScoring";
export type { ReEngagementCandidate } from "./reEngagementEngine";
export type { UniversityScore } from "./universityScore";
export type { RevenueDashboardData } from "./revenueDashboardService";
