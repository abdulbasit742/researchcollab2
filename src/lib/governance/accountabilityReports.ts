/**
 * Accountability Reporting Engine — structured reports for governance bodies.
 */

import { supabase } from "@/integrations/supabase/client";
import { getNationalMetrics } from "./nationalMetrics";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("accountabilityReports");

export interface AccountabilityReport {
  reportType: string;
  regionId: string;
  period: string;
  metrics: {
    totalGMV: number;
    completedProjects: number;
    fundedProjects: number;
    completionRate: number;
    disputeRate: number;
    grantUtilization: number;
    capitalDeployed: number;
    institutionCount: number;
  };
  complianceSummary: {
    verifiedUsers: number;
    highRiskUsers: number;
    unresolvedAlerts: number;
  };
  generatedAt: string;
}

export async function generateQuarterlyReport(regionId: string): Promise<AccountabilityReport> {
  const metrics = await getNationalMetrics(regionId);

  // Grant utilization
  const { data: pools } = await (supabase as any).from("public_grant_pools").select("total_committed, total_allocated").eq("region_id", regionId);
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  // Compliance summary
  const { data: kycs } = await (supabase as any).from("kyc_profiles").select("verification_status").eq("region_id", regionId);
  const verified = (kycs ?? []).filter((k: any) => k.verification_status === "verified").length;

  const { data: risks } = await (supabase as any).from("compliance_risk_profiles").select("compliance_risk_score, flagged");
  const highRisk = (risks ?? []).filter((r: any) => (r.compliance_risk_score ?? 0) >= 60).length;

  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("id").eq("resolved", false).eq("region_id", regionId);

  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

  log.info("Quarterly report generated", { regionId, quarter });

  return {
    reportType: "quarterly_innovation",
    regionId,
    period: quarter,
    metrics: {
      totalGMV: metrics.totalGMV,
      completedProjects: metrics.totalCompletedProjects,
      fundedProjects: metrics.totalFundedProjects,
      completionRate: metrics.completionRate,
      disputeRate: metrics.disputeRate,
      grantUtilization: totalCommitted > 0 ? Math.round((totalAllocated / totalCommitted) * 100) : 0,
      capitalDeployed: metrics.totalCapitalDeployed,
      institutionCount: metrics.institutionCount,
    },
    complianceSummary: { verifiedUsers: verified, highRiskUsers: highRisk, unresolvedAlerts: alerts?.length ?? 0 },
    generatedAt: new Date().toISOString(),
  };
}
