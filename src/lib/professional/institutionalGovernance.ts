/**
 * Institutional & Government Integration Architecture
 * University governance, accreditation reporting, government innovation,
 * institutional trust scoring, and compliance/audit infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { calculateEconomicHealthIndex } from "./financialInfrastructure";

const log = createLogger("institutionalGovernance");

// ─── Institutional Trust Score ───

export interface InstitutionalTrustScore {
  completionReliability: number;
  disputeRatio: number;
  sponsorRetention: number;
  escrowInvariantCompliance: number;
  facultyOversightParticipation: number;
  financialReconciliationConsistency: number;
  overallITS: number;
  tier: "unrated" | "developing" | "competent" | "trusted" | "exemplary";
}

const ITS_WEIGHTS = {
  completionReliability: 0.25,
  disputeRatio: -0.15,
  sponsorRetention: 0.20,
  escrowInvariantCompliance: 0.15,
  facultyOversightParticipation: 0.10,
  financialReconciliationConsistency: 0.15,
} as const;

function classifyITSTier(score: number): InstitutionalTrustScore["tier"] {
  if (score >= 85) return "exemplary";
  if (score >= 70) return "trusted";
  if (score >= 50) return "competent";
  if (score >= 20) return "developing";
  return "unrated";
}

export async function calculateInstitutionalTrustScore(institutionId: string): Promise<InstitutionalTrustScore> {
  const { data: userRecords } = await supabase
    .from("academic_records")
    .select("user_id")
    .eq("institution_id", institutionId)
    .eq("verification_status", "verified");

  const userIds = [...new Set((userRecords ?? []).map((r) => r.user_id))];

  if (userIds.length === 0) {
    return {
      completionReliability: 0, disputeRatio: 0, sponsorRetention: 0,
      escrowInvariantCompliance: 100, facultyOversightParticipation: 0,
      financialReconciliationConsistency: 100, overallITS: 0, tier: "unrated",
    };
  }

  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .in("executor_id", userIds.slice(0, 100));

  const all = records ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const totalPaid = completed.reduce((s, r) => s + (r.total_paid ?? 0), 0);

  const completionReliability = all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0;
  const disputeRatio = all.length > 0 ? Math.round((disputed.length / all.length) * 100) : 0;

  const sponsors = all.map((r) => r.funder_id).filter(Boolean);
  const uniqueSponsors = new Set(sponsors);
  const repeatSponsors = sponsors.length - uniqueSponsors.size;
  const sponsorRetention = uniqueSponsors.size > 0 ? Math.min(100, Math.round((repeatSponsors / uniqueSponsors.size) * 100)) : 0;

  const escrowInvariantCompliance = totalEscrow > 0 ? Math.min(100, Math.round((totalPaid / totalEscrow) * 100)) : 100;

  const verifiedRecords = all.filter((r) => r.verified_by);
  const facultyOversightParticipation = all.length > 0 ? Math.round((verifiedRecords.length / all.length) * 100) : 0;

  const financialReconciliationConsistency = escrowInvariantCompliance;

  const overallITS = Math.min(100, Math.max(0, Math.round(
    completionReliability * ITS_WEIGHTS.completionReliability +
    disputeRatio * ITS_WEIGHTS.disputeRatio +
    sponsorRetention * ITS_WEIGHTS.sponsorRetention +
    escrowInvariantCompliance * ITS_WEIGHTS.escrowInvariantCompliance +
    facultyOversightParticipation * ITS_WEIGHTS.facultyOversightParticipation +
    financialReconciliationConsistency * ITS_WEIGHTS.financialReconciliationConsistency
  )));

  const tier = classifyITSTier(overallITS);
  log.info("ITS calculated", { institutionId, overallITS, tier });

  return {
    completionReliability, disputeRatio, sponsorRetention,
    escrowInvariantCompliance, facultyOversightParticipation,
    financialReconciliationConsistency, overallITS, tier,
  };
}

// ─── Institutional Governance Dashboard ───

export interface InstitutionalGovernanceDashboard {
  academic: {
    activeProjects: number;
    milestoneCompletionPct: number;
    facultyParticipation: number;
    slaCompliancePct: number;
    disputeRatePct: number;
    studentReliability: number;
  };
  financial: {
    totalEscrowLocked: number;
    departmentDistribution: Record<string, number>;
    sponsorDiversity: number;
    refundRate: number;
    reconciliationHealth: number;
  };
  its: InstitutionalTrustScore;
}

export async function buildGovernanceDashboard(institutionId: string): Promise<InstitutionalGovernanceDashboard> {
  const its = await calculateInstitutionalTrustScore(institutionId);

  const { data: userRecords } = await supabase
    .from("academic_records")
    .select("user_id")
    .eq("institution_id", institutionId);

  const userIds = [...new Set((userRecords ?? []).map((r) => r.user_id))];

  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .in("executor_id", userIds.slice(0, 100));

  const all = records ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const active = all.filter((r) => r.outcome_status === "in_progress");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const sponsors = new Set(all.map((r) => r.funder_id).filter(Boolean));
  const verified = all.filter((r) => r.verified_by);

  return {
    academic: {
      activeProjects: active.length,
      milestoneCompletionPct: all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0,
      facultyParticipation: all.length > 0 ? Math.round((verified.length / all.length) * 100) : 0,
      slaCompliancePct: its.completionReliability,
      disputeRatePct: its.disputeRatio,
      studentReliability: its.completionReliability,
    },
    financial: {
      totalEscrowLocked: totalEscrow,
      departmentDistribution: {},
      sponsorDiversity: sponsors.size,
      refundRate: 0,
      reconciliationHealth: its.financialReconciliationConsistency,
    },
    its,
  };
}

// ─── Accreditation Report Generation ───

export async function generateAccreditationReport(institutionId: string, periodStart: string, periodEnd: string) {
  const dashboard = await buildGovernanceDashboard(institutionId);

  const { data: commercialization } = await supabase
    .from("research_commercialization")
    .select("*")
    .eq("institution_id", institutionId);

  const { data: agreements } = await supabase
    .from("cross_institution_agreements")
    .select("*")
    .or(`institution_a_id.eq.${institutionId},institution_b_id.eq.${institutionId}`);

  const report = {
    studentIndustryEngagementPct: dashboard.academic.milestoneCompletionPct,
    fundedFypParticipationRate: dashboard.academic.activeProjects,
    projectCompletionReliability: dashboard.academic.milestoneCompletionPct,
    industryCollaborationFrequency: dashboard.financial.sponsorDiversity,
    crossInstitutionCollaborationIndex: (agreements ?? []).length,
    economicContributionAmount: dashboard.financial.totalEscrowLocked,
    researchCommercializationCount: (commercialization ?? []).filter((c) => c.conversion_status === "completed").length,
  };

  const { data, error } = await supabase
    .from("accreditation_reports")
    .insert({
      institution_id: institutionId,
      report_period_start: periodStart,
      report_period_end: periodEnd,
      ...report,
      report_data: report as any,
    })
    .select("id")
    .single();

  if (error) throw error;
  log.info("Accreditation report generated", { institutionId, reportId: data.id });
  return { id: data.id, ...report };
}

// ─── Government Innovation Dashboard ───

export async function getGovernmentInnovationSnapshot(region?: string) {
  let query = supabase
    .from("government_innovation_snapshots")
    .select("*")
    .order("snapshot_at", { ascending: false })
    .limit(20);

  if (region) query = query.eq("region", region);

  const { data } = await query;
  return data ?? [];
}

// ─── Grant Funding Management ───

export async function getGrantFundingRecords(institutionId?: string) {
  let query = supabase.from("grant_funding_records").select("*").order("created_at", { ascending: false });
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data } = await query;
  return data ?? [];
}

// ─── Cross-Institution Agreements ───

export async function getCrossInstitutionAgreements(institutionId: string) {
  const { data } = await supabase
    .from("cross_institution_agreements")
    .select("*")
    .or(`institution_a_id.eq.${institutionId},institution_b_id.eq.${institutionId}`)
    .eq("status", "active");
  return data ?? [];
}

// ─── Compliance Audit Export ───

export async function generateComplianceAuditPackage(institutionId: string) {
  const [dashboard, grants, agreements] = await Promise.all([
    buildGovernanceDashboard(institutionId),
    getGrantFundingRecords(institutionId),
    getCrossInstitutionAgreements(institutionId),
  ]);

  return {
    governanceDashboard: dashboard,
    grantFunding: grants,
    crossInstitutionAgreements: agreements,
    exportedAt: new Date().toISOString(),
    format: "json",
  };
}

// ─── Transparency ───

export const INSTITUTIONAL_GOVERNANCE_TRANSPARENCY = {
  itsFormula: "ITS = CompletionReliability(25%) - DisputeRatio(15%) + SponsorRetention(20%) + EscrowCompliance(15%) + FacultyOversight(10%) + ReconciliationConsistency(15%)",
  governanceCapabilities: [
    "Academic oversight dashboard",
    "Financial oversight with escrow tracking",
    "Compliance audit export",
    "Accreditation report generation",
    "Cross-institution collaboration management",
    "Grant funding escrow management",
    "Government innovation dashboards",
    "Institutional Trust Score (ITS)",
  ],
  complianceExports: [
    "Escrow lifecycle logs",
    "Milestone timestamps",
    "Ledger mutation logs",
    "Access logs",
    "Security event logs",
    "Financial reconciliation report",
  ],
  dataSovereignty: [
    "Country-level data localization ready",
    "Regional storage partitioning",
    "GDPR, FERPA, UK academic compliance adaptable",
    "Regional legal audit logs",
  ],
} as const;
