/**
 * Regulated Financial Compliance Layer — unified exports.
 */

export { submitKYC, verifyKYC, rejectKYC, getKYCStatus, assertVerifiedForFinancialAction } from "./kycService";
export { calculateAMLRiskScore } from "./amlEngine";
export { monitorUserTransactions } from "./transactionMonitor";
export { calculateComplianceRiskScore } from "./riskScoring";
export { runSuspiciousActivityScan } from "./suspiciousActivityEngine";
export { assertComplianceCleared, assertWithdrawalCompliant, assertPoolContributionCompliant } from "./complianceGates";
export { getRegionComplianceRules, isKYCRequired, getWithdrawalLimit, getReportingThreshold } from "./regionComplianceRules";
export { generateComplianceReport } from "./complianceReport";

export type { KYCProfile, KYCStatus, RiskLevel } from "./kycService";
export type { AMLAssessment } from "./amlEngine";
export type { SuspiciousTransaction } from "./transactionMonitor";
export type { ComplianceRiskAssessment } from "./riskScoring";
export type { ComplianceAlert } from "./suspiciousActivityEngine";
export type { RegionComplianceConfig } from "./regionComplianceRules";
export type { ComplianceReport } from "./complianceReport";
