/**
 * Investor Data Room Generator — combines all analytics into a single exportable report.
 */

import { generateGMVBreakdown, type GMVBreakdown } from "./gmvBreakdown";
import { generateRevenueBreakdown, type RevenueBreakdown } from "./revenueBreakdown";
import { generateSubscriptionSnapshot, type SubscriptionSnapshot } from "./subscriptionAnalytics";
import { generateCohortAnalysis, type CohortReport } from "./cohortAnalysis";
import { generateSponsorRetentionCurve, type SponsorRetentionCurveData } from "./sponsorRetentionCurve";
import { generateUniversityGrowthReport, type UniversityGrowthReport } from "./universityGrowth";
import { generateFinancialIntegrityProof, type FinancialIntegrityProof } from "./financialIntegrityProof";
import { generateEscrowSafetySummary, type EscrowSafetySummary } from "./escrowSafetySummary";
import { generateOperationalMetrics, type OperationalMetrics } from "./operationalMetrics";
import { exportToCSV, type CSVColumn } from "@/lib/csvExport";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("dataRoomGenerator");

export interface InvestorReport {
  gmvBreakdown: GMVBreakdown;
  revenueBreakdown: RevenueBreakdown;
  subscriptionSnapshot: SubscriptionSnapshot;
  cohortAnalysis: CohortReport;
  sponsorRetention: SponsorRetentionCurveData;
  universityGrowth: UniversityGrowthReport;
  financialIntegrity: FinancialIntegrityProof;
  escrowSafety: EscrowSafetySummary;
  operationalMetrics: OperationalMetrics;
  generatedAt: string;
  version: string;
}

export async function generateInvestorReport(): Promise<InvestorReport> {
  log.info("Generating investor data room report...");

  const [
    gmvBreakdown,
    revenueBreakdown,
    subscriptionSnapshot,
    cohortAnalysis,
    sponsorRetention,
    universityGrowth,
    financialIntegrity,
    escrowSafety,
    operationalMetrics,
  ] = await Promise.all([
    generateGMVBreakdown(),
    generateRevenueBreakdown(),
    generateSubscriptionSnapshot(),
    generateCohortAnalysis(),
    generateSponsorRetentionCurve(),
    generateUniversityGrowthReport(),
    generateFinancialIntegrityProof(),
    generateEscrowSafetySummary(),
    generateOperationalMetrics(),
  ]);

  const report: InvestorReport = {
    gmvBreakdown,
    revenueBreakdown,
    subscriptionSnapshot,
    cohortAnalysis,
    sponsorRetention,
    universityGrowth,
    financialIntegrity,
    escrowSafety,
    operationalMetrics,
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
  };

  log.info("Investor report generated successfully");
  return report;
}

export function exportInvestorReportAsJSON(report: InvestorReport): string {
  return JSON.stringify(report, null, 2);
}

export function exportInvestorSummaryCSV(report: InvestorReport): void {
  const summaryData = [
    { metric: "Lifetime GMV", value: report.gmvBreakdown.lifetimeGMV, unit: "PKR" },
    { metric: "Total Deals", value: report.gmvBreakdown.totalDeals, unit: "count" },
    { metric: "Avg Deal Size", value: report.gmvBreakdown.avgDealSize, unit: "PKR" },
    { metric: "Platform Fee Revenue", value: report.revenueBreakdown.totalPlatformFeeRevenue, unit: "PKR" },
    { metric: "Subscription Revenue", value: report.revenueBreakdown.totalSubscriptionRevenue, unit: "PKR" },
    { metric: "Current MRR", value: report.subscriptionSnapshot.currentMRR, unit: "PKR" },
    { metric: "ARR", value: report.subscriptionSnapshot.arr, unit: "PKR" },
    { metric: "Active Subscriptions", value: report.subscriptionSnapshot.activeSubscriptions, unit: "count" },
    { metric: "Churn Rate", value: report.subscriptionSnapshot.churnRate, unit: "%" },
    { metric: "Net Revenue Retention", value: report.subscriptionSnapshot.netRevenueRetention, unit: "%" },
    { metric: "Sponsor LTV", value: report.sponsorRetention.avgSponsorLTV, unit: "PKR" },
    { metric: "1st→2nd Deal Conversion", value: report.sponsorRetention.firstToSecondConversionRate, unit: "%" },
    { metric: "Active Tenants", value: report.universityGrowth.totalActiveTenants, unit: "count" },
    { metric: "Financial Integrity Score", value: report.financialIntegrity.overallScore, unit: "/100" },
    { metric: "Dispute Rate", value: report.escrowSafety.disputeRate, unit: "%" },
    { metric: "Funded Deals", value: report.escrowSafety.totalFundedDeals, unit: "count" },
    { metric: "Deal Throughput/Month", value: report.operationalMetrics.dealThroughputPerMonth, unit: "deals" },
    { metric: "Avg Deal Completion Time", value: report.operationalMetrics.avgDealCompletionTimeHours, unit: "hours" },
    { metric: "Overall Retention 1m", value: report.cohortAnalysis.overallRetention1m, unit: "%" },
    { metric: "Overall Retention 3m", value: report.cohortAnalysis.overallRetention3m, unit: "%" },
  ];

  const columns: CSVColumn[] = [
    { key: "metric", header: "Metric" },
    { key: "value", header: "Value" },
    { key: "unit", header: "Unit" },
  ];

  exportToCSV(summaryData, `rcollab-investor-report-${new Date().toISOString().split("T")[0]}`, columns);
}
