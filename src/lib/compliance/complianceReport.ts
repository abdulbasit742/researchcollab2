/**
 * Compliance Report Generator — regulatory and investor-ready summaries.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("complianceReport");

export interface ComplianceReport {
  totalUsers: number;
  verifiedUsers: number;
  pendingKYC: number;
  rejectedKYC: number;
  highRiskUsers: number;
  flaggedUsers: number;
  suspiciousTransactionCount: number;
  unresolvedAlerts: number;
  capitalSourceVerificationRate: number;
  complianceAuditCoverage: number;
  timestamp: string;
}

export async function generateComplianceReport(): Promise<ComplianceReport> {
  // KYC stats
  const { data: kycStats } = await (supabase as any)
    .from("kyc_profiles")
    .select("verification_status");

  const kycs = kycStats ?? [];
  const verified = kycs.filter((k: any) => k.verification_status === "verified").length;
  const pending = kycs.filter((k: any) => k.verification_status === "pending").length;
  const rejected = kycs.filter((k: any) => k.verification_status === "rejected").length;

  // Risk profiles
  const { data: risks } = await (supabase as any)
    .from("compliance_risk_profiles")
    .select("compliance_risk_score, flagged");

  const riskProfiles = risks ?? [];
  const highRisk = riskProfiles.filter((r: any) => (r.compliance_risk_score ?? 0) >= 60).length;
  const flagged = riskProfiles.filter((r: any) => r.flagged).length;

  // Suspicious transactions
  const { data: suspTxs } = await (supabase as any)
    .from("suspicious_transactions")
    .select("id, resolved");
  const suspCount = suspTxs?.length ?? 0;

  // Unresolved alerts
  const { data: alerts } = await (supabase as any)
    .from("compliance_alerts")
    .select("id")
    .eq("resolved", false);
  const unresolvedAlerts = alerts?.length ?? 0;

  // Capital source verification rate
  const { data: sources } = await (supabase as any)
    .from("capital_source_profiles")
    .select("source_verified");
  const totalSources = sources?.length ?? 0;
  const verifiedSources = (sources ?? []).filter((s: any) => s.source_verified).length;
  const sourceVerifRate = totalSources > 0 ? Math.round((verifiedSources / totalSources) * 100) : 100;

  // Audit log coverage
  const { data: auditLogs } = await (supabase as any)
    .from("compliance_audit_logs")
    .select("id");
  const auditCoverage = Math.min(100, (auditLogs?.length ?? 0) > 0 ? 100 : 0);

  // Total users approximation
  const totalUsers = kycs.length;

  log.info("Compliance report generated");

  return {
    totalUsers,
    verifiedUsers: verified,
    pendingKYC: pending,
    rejectedKYC: rejected,
    highRiskUsers: highRisk,
    flaggedUsers: flagged,
    suspiciousTransactionCount: suspCount,
    unresolvedAlerts,
    capitalSourceVerificationRate: sourceVerifRate,
    complianceAuditCoverage: auditCoverage,
    timestamp: new Date().toISOString(),
  };
}
