/**
 * Investor Data Room Module — unified exports.
 */

export { generateGMVBreakdown } from "./gmvBreakdown";
export { generateRevenueBreakdown } from "./revenueBreakdown";
export { generateSubscriptionSnapshot } from "./subscriptionAnalytics";
export { generateCohortAnalysis } from "./cohortAnalysis";
export { generateSponsorRetentionCurve } from "./sponsorRetentionCurve";
export { generateUniversityGrowthReport } from "./universityGrowth";
export { generateFinancialIntegrityProof } from "./financialIntegrityProof";
export { generateEscrowSafetySummary } from "./escrowSafetySummary";
export { generateOperationalMetrics } from "./operationalMetrics";
export { generateInvestorReport, exportInvestorReportAsJSON, exportInvestorSummaryCSV } from "./dataRoomGenerator";

export type { GMVBreakdown, GMVSegment, MonthlyGMV } from "./gmvBreakdown";
export type { RevenueBreakdown } from "./revenueBreakdown";
export type { SubscriptionSnapshot } from "./subscriptionAnalytics";
export type { CohortReport, CohortData } from "./cohortAnalysis";
export type { SponsorRetentionCurveData } from "./sponsorRetentionCurve";
export type { UniversityGrowthReport, TenantGrowthMetrics } from "./universityGrowth";
export type { FinancialIntegrityProof } from "./financialIntegrityProof";
export type { EscrowSafetySummary } from "./escrowSafetySummary";
export type { OperationalMetrics } from "./operationalMetrics";
export type { InvestorReport } from "./dataRoomGenerator";
