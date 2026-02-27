/**
 * Global Research Governance & Compliance System (GRGCS)
 * Superior to Google Scholar + NIH RePORTER + EU CORDIS + National Audit Systems.
 * Compliance scoring, ethics monitoring, cross-border governance, risk forecasting.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const COMPLIANCE_CHECKPOINT_TYPES = [
  "funding_approval", "escrow_lock", "milestone_submission", "deliverable_verification",
  "budget_reconciliation", "reporting_submission", "ethical_approval", "data_governance",
  "ip_declaration", "final_audit",
] as const;

export type ComplianceCheckpointType = typeof COMPLIANCE_CHECKPOINT_TYPES[number];

export const ETHICS_RECORD_TYPES = [
  "irb_approval", "ethical_review", "human_subject_compliance", "data_consent",
  "conflict_of_interest", "dual_use_research", "ai_ethics", "biosafety_clearance",
] as const;

export type EthicsRecordType = typeof ETHICS_RECORD_TYPES[number];

export const COMPLIANCE_ANOMALY_TYPES = [
  "budget_inflation", "milestone_delay_cluster", "repeated_compliance_failure",
  "grant_misuse", "collusion_pattern", "self_reporting_inconsistency",
  "deliverable_duplication", "ghost_milestone",
] as const;

export const GRGCS_TRANSPARENCY = {
  philosophy: "Research governance backbone — not publication indexing",
  scoring: "Compliance Integrity Score (CIS) is 10-dimensional, fully explainable",
  audit: "Every action generates immutable, time-stamped log with responsible party",
  ethics: "8 ethics dimensions tracked; non-compliance flagged early",
  forecasting: "AI predicts compliance risks with factor breakdown",
};

export const CIS_WEIGHTS = {
  on_time_reporting: 0.12,
  budget_variance: 0.12,
  audit_pass_rate: 0.12,
  escrow_adherence: 0.10,
  dispute_frequency: 0.10,
  regulatory_violations: 0.10,
  ethical_breach_flags: 0.10,
  documentation_completeness: 0.08,
  renewal_trust_factor: 0.08,
  cross_border_stability: 0.08,
};

// =====================================================
// TYPES
// =====================================================

export interface ComplianceCheckpoint {
  grant_id: string;
  checkpoint_type: ComplianceCheckpointType;
  title: string;
  description?: string;
  responsible_user_id?: string;
  institution_id?: string;
  evidence?: Record<string, unknown>;
}

export interface ComplianceIntegrityInput {
  entity_type: string;
  entity_id: string;
  on_time_reporting: number;
  budget_variance: number;
  audit_pass_rate: number;
  escrow_adherence: number;
  dispute_frequency: number;
  regulatory_violations: number;
  ethical_breach_flags: number;
  documentation_completeness: number;
  renewal_trust_factor: number;
  cross_border_stability: number;
}

export interface EthicsRecord {
  grant_id?: string;
  project_id?: string;
  researcher_id?: string;
  institution_id?: string;
  record_type: EthicsRecordType;
  status: string;
  approval_reference?: string;
  expiry_date?: string;
  review_body?: string;
  notes?: string;
}

export interface CrossBorderAssessment {
  grant_id?: string;
  country_a: string;
  country_b: string;
  regulatory_conflicts: string[];
  reporting_mismatches: string[];
  ip_ownership_clarity: string;
  export_control_conflicts: boolean;
  sanction_risk_detected: boolean;
  funding_body_compatible: boolean;
}

export interface ComplianceForecast {
  entity_type: string;
  entity_id: string;
  compliance_failure_risk: number;
  budget_overrun_risk: number;
  reporting_delay_risk: number;
  regulatory_breach_risk: number;
  audit_failure_risk: number;
  ethics_review_delay_risk: number;
  explanation: Record<string, unknown>;
}

export interface DataGovernanceAssessment {
  grant_id?: string;
  project_id?: string;
  institution_id?: string;
  data_storage_compliant: boolean;
  access_control_validated: boolean;
  data_sharing_approved: boolean;
  retention_period_compliant: boolean;
  cross_border_transfer_flagged: boolean;
  encryption_verified: boolean;
  sensitive_classification?: string;
  access_violations: number;
}

// =====================================================
// COMPLIANCE CHECKPOINTS
// =====================================================

export async function createComplianceCheckpoint(cp: ComplianceCheckpoint): Promise<void> {
  const { error } = await supabase
    .from("grant_compliance_checkpoints" as any)
    .insert({ ...cp, status: "pending" });
  if (error) throw error;
}

export async function getGrantComplianceCheckpoints(grantId: string) {
  const { data, error } = await supabase
    .from("grant_compliance_checkpoints" as any)
    .select("*")
    .eq("grant_id", grantId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function verifyCheckpoint(checkpointId: string, verifiedBy: string): Promise<void> {
  const { error } = await supabase
    .from("grant_compliance_checkpoints" as any)
    .update({ status: "verified", verified_at: new Date().toISOString(), verified_by: verifiedBy })
    .eq("id", checkpointId);
  if (error) throw error;
}

// =====================================================
// COMPLIANCE INTEGRITY SCORE (CIS)
// =====================================================

export function computeCIS(input: Omit<ComplianceIntegrityInput, "entity_type" | "entity_id">): number {
  // Invert negative metrics (lower is better for variance, disputes, violations, breaches)
  const score =
    input.on_time_reporting * CIS_WEIGHTS.on_time_reporting +
    (1 - Math.min(1, input.budget_variance)) * CIS_WEIGHTS.budget_variance +
    input.audit_pass_rate * CIS_WEIGHTS.audit_pass_rate +
    input.escrow_adherence * CIS_WEIGHTS.escrow_adherence +
    (1 - Math.min(1, input.dispute_frequency)) * CIS_WEIGHTS.dispute_frequency +
    (1 - Math.min(1, input.regulatory_violations * 0.2)) * CIS_WEIGHTS.regulatory_violations +
    (1 - Math.min(1, input.ethical_breach_flags * 0.25)) * CIS_WEIGHTS.ethical_breach_flags +
    input.documentation_completeness * CIS_WEIGHTS.documentation_completeness +
    input.renewal_trust_factor * CIS_WEIGHTS.renewal_trust_factor +
    input.cross_border_stability * CIS_WEIGHTS.cross_border_stability;

  return Math.round(score * 100) / 100;
}

export async function saveCIS(input: ComplianceIntegrityInput): Promise<number> {
  const overall = computeCIS(input);
  const { error } = await supabase
    .from("compliance_integrity_scores" as any)
    .insert({ ...input, overall_cis: overall });
  if (error) throw error;
  return overall;
}

export async function getCIS(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from("compliance_integrity_scores" as any)
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// ETHICS & RESEARCH INTEGRITY
// =====================================================

export async function createEthicsRecord(record: EthicsRecord): Promise<void> {
  const { error } = await supabase
    .from("research_ethics_records" as any)
    .insert(record);
  if (error) throw error;
}

export async function getEthicsRecords(grantId?: string, institutionId?: string) {
  let query = supabase.from("research_ethics_records" as any).select("*");
  if (grantId) query = query.eq("grant_id", grantId);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function flagEthicsRecord(recordId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("research_ethics_records" as any)
    .update({ flagged: true, flag_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", recordId);
  if (error) throw error;
}

// =====================================================
// CROSS-BORDER COMPLIANCE
// =====================================================

export async function assessCrossBorderCompliance(assessment: CrossBorderAssessment): Promise<string> {
  let riskLevel = "low";
  const riskFactors = [
    assessment.regulatory_conflicts.length > 0,
    assessment.reporting_mismatches.length > 0,
    assessment.export_control_conflicts,
    assessment.sanction_risk_detected,
    !assessment.funding_body_compatible,
    assessment.ip_ownership_clarity === "unclear",
  ].filter(Boolean).length;

  if (riskFactors >= 4) riskLevel = "critical";
  else if (riskFactors >= 3) riskLevel = "high";
  else if (riskFactors >= 1) riskLevel = "medium";

  const { error } = await supabase
    .from("cross_border_compliance_matrix" as any)
    .insert({ ...assessment, overall_risk_level: riskLevel });
  if (error) throw error;
  return riskLevel;
}

export async function getCrossBorderAssessments(grantId: string) {
  const { data, error } = await supabase
    .from("cross_border_compliance_matrix" as any)
    .select("*")
    .eq("grant_id", grantId)
    .order("assessed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COMPLIANCE ANOMALY DETECTION
// =====================================================

export function detectComplianceAnomalies(params: {
  budgetVariance: number;
  milestoneDelayCluster: number;
  complianceFailureCount: number;
  grantMisuseSignals: number;
  collusionIndicators: number;
  reportingInconsistencies: number;
  deliverableDuplication: number;
  ghostMilestones: number;
}): Array<{ anomaly_type: string; severity: string; evidence: Record<string, unknown>; ai_confidence: number }> {
  const flags: Array<{ anomaly_type: string; severity: string; evidence: Record<string, unknown>; ai_confidence: number }> = [];

  if (params.budgetVariance > 0.3) flags.push({ anomaly_type: "budget_inflation", severity: params.budgetVariance > 0.5 ? "high" : "medium", evidence: { variance: params.budgetVariance }, ai_confidence: Math.min(0.95, params.budgetVariance) });
  if (params.milestoneDelayCluster > 3) flags.push({ anomaly_type: "milestone_delay_cluster", severity: "high", evidence: { count: params.milestoneDelayCluster }, ai_confidence: 0.8 });
  if (params.complianceFailureCount > 2) flags.push({ anomaly_type: "repeated_compliance_failure", severity: "high", evidence: { count: params.complianceFailureCount }, ai_confidence: 0.85 });
  if (params.grantMisuseSignals > 0) flags.push({ anomaly_type: "grant_misuse", severity: "critical", evidence: { signals: params.grantMisuseSignals }, ai_confidence: 0.7 });
  if (params.collusionIndicators > 0.4) flags.push({ anomaly_type: "collusion_pattern", severity: "critical", evidence: { score: params.collusionIndicators }, ai_confidence: 0.75 });
  if (params.deliverableDuplication > 0) flags.push({ anomaly_type: "deliverable_duplication", severity: "medium", evidence: { count: params.deliverableDuplication }, ai_confidence: 0.8 });
  if (params.ghostMilestones > 0) flags.push({ anomaly_type: "ghost_milestone", severity: "critical", evidence: { count: params.ghostMilestones }, ai_confidence: 0.9 });

  return flags;
}

export async function saveComplianceAnomalies(entityType: string, entityId: string, flags: ReturnType<typeof detectComplianceAnomalies>): Promise<void> {
  if (flags.length === 0) return;
  const entries = flags.map(f => ({ ...f, entity_type: entityType, entity_id: entityId }));
  const { error } = await supabase.from("compliance_anomaly_flags" as any).insert(entries);
  if (error) throw error;
}

// =====================================================
// COMPLIANCE FORECASTING
// =====================================================

export function forecastCompliance(params: {
  currentCIS: number;
  budgetTrend: number;
  reportingHistory: number;
  regulatoryLoad: number;
  auditHistory: number;
  ethicsBacklog: number;
}): Omit<ComplianceForecast, "entity_type" | "entity_id"> {
  const baseRisk = Math.max(0, 1 - params.currentCIS);
  return {
    compliance_failure_risk: Math.round(Math.min(1, baseRisk * 0.5 + (1 - params.reportingHistory) * 0.3 + (1 - params.auditHistory) * 0.2) * 100) / 100,
    budget_overrun_risk: Math.round(Math.min(1, (1 - params.budgetTrend) * 0.6 + baseRisk * 0.4) * 100) / 100,
    reporting_delay_risk: Math.round(Math.min(1, (1 - params.reportingHistory) * 0.7 + baseRisk * 0.3) * 100) / 100,
    regulatory_breach_risk: Math.round(Math.min(1, params.regulatoryLoad * 0.5 + baseRisk * 0.5) * 100) / 100,
    audit_failure_risk: Math.round(Math.min(1, (1 - params.auditHistory) * 0.6 + baseRisk * 0.4) * 100) / 100,
    ethics_review_delay_risk: Math.round(Math.min(1, params.ethicsBacklog * 0.6 + baseRisk * 0.4) * 100) / 100,
    explanation: { model: "compliance_forecast_v1", factors: params },
  };
}

export async function saveComplianceForecast(entityType: string, entityId: string, forecast: Omit<ComplianceForecast, "entity_type" | "entity_id">): Promise<void> {
  const { error } = await supabase.from("compliance_forecasts" as any).insert({ entity_type: entityType, entity_id: entityId, ...forecast });
  if (error) throw error;
}

// =====================================================
// DATA GOVERNANCE
// =====================================================

export async function saveDataGovernanceAssessment(assessment: DataGovernanceAssessment): Promise<void> {
  const { error } = await supabase.from("research_data_governance" as any).insert(assessment);
  if (error) throw error;
}

export async function getDataGovernance(grantId?: string, institutionId?: string) {
  let query = supabase.from("research_data_governance" as any).select("*");
  if (grantId) query = query.eq("grant_id", grantId);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("assessed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// REGULATORY TEMPLATES
// =====================================================

export async function getRegulatoryTemplates(jurisdiction?: string) {
  let query = supabase.from("regulatory_templates" as any).select("*").eq("is_active", true);
  if (jurisdiction) query = query.eq("jurisdiction", jurisdiction);
  const { data, error } = await query.order("regulation_name");
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GOVERNMENT OVERSIGHT
// =====================================================

export async function getGovernmentOversight(country: string) {
  const { data, error } = await supabase
    .from("government_oversight_snapshots" as any)
    .select("*")
    .eq("country", country)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
