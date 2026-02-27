/**
 * Global Grant Lifecycle Intelligence System (GGLIS)
 * Superior to Google Scholar, NIH Reporter, Dimensions grant databases.
 * Tracks full funding execution infrastructure: proposal → commercialization → audit.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS & TRANSPARENCY
// =====================================================

export const GRANT_LIFECYCLE_STAGES = [
  "proposal_submission",
  "peer_review",
  "approval",
  "escrow_lock",
  "milestone_planning",
  "active_execution",
  "deliverable_submission",
  "compliance_review",
  "publication_output",
  "commercialization",
  "closure_audit",
] as const;

export type GrantLifecycleStage = typeof GRANT_LIFECYCLE_STAGES[number];

export const GGLIS_TRANSPARENCY = {
  philosophy: "Full funding execution infrastructure — not just grant listing",
  scoring: "All metrics explainable, no black-box ranking",
  lifecycle: "Tracks stages 1-11; Google Scholar only indexes stage 9 (publication)",
  escrow: "Financial-grade tracking with invariant enforcement",
  fraud: "AI-assisted anomaly detection with mandatory human review",
};

export const GRS_WEIGHTS = {
  milestone_punctuality: 0.15,
  budget_variance: 0.12,
  renewal_success: 0.12,
  deliverable_acceptance: 0.13,
  compliance_audit: 0.12,
  sponsor_satisfaction: 0.10,
  dispute_history: 0.10,
  reporting_consistency: 0.08,
  escrow_adherence: 0.08,
};

export const ANOMALY_TYPES = [
  "budget_inflation",
  "milestone_delay_loop",
  "compliance_repeat",
  "deliverable_inflation",
  "citation_without_deliverable",
  "sponsor_pi_collusion",
  "ghost_milestone",
] as const;

export type GrantAnomalyType = typeof ANOMALY_TYPES[number];

// =====================================================
// TYPES
// =====================================================

export interface GrantLifecycleEvent {
  grant_id: string;
  stage: GrantLifecycleStage;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface GrantPerformanceMetrics {
  grant_id: string;
  pi_user_id: string;
  milestone_completion_rate: number;
  on_time_delivery_pct: number;
  budget_efficiency_ratio: number;
  cost_to_output_ratio: number;
  publication_yield_ratio: number;
  patent_conversion_rate: number;
  commercialization_likelihood: number;
  compliance_reliability: number;
  cross_institution_strength: number;
  risk_exposure_index: number;
}

export interface GrantReliabilityScore {
  user_id: string;
  overall_grs: number;
  milestone_punctuality: number;
  budget_variance: number;
  renewal_success: number;
  deliverable_acceptance: number;
  compliance_audit_score: number;
  sponsor_satisfaction: number;
  dispute_history_score: number;
  reporting_consistency: number;
  escrow_adherence: number;
}

export interface GrantImpactForecast {
  grant_id: string;
  completion_probability: number;
  publication_yield_probability: number;
  commercialization_probability: number;
  budget_overrun_risk: number;
  renewal_success_probability: number;
  policy_adoption_probability: number;
  explanation: Record<string, unknown>;
}

export interface GrantAnomalyFlag {
  grant_id?: string;
  pi_user_id?: string;
  anomaly_type: GrantAnomalyType;
  severity: "low" | "medium" | "high" | "critical";
  evidence: Record<string, unknown>;
  ai_confidence: number;
}

export interface FundingToOutputEfficiency {
  grant_id: string;
  grant_amount: number;
  publications: number;
  patents: number;
  commercial_outputs: number;
  policy_citations: number;
  efficiency_index: number;
}

export interface InstitutionalFundingIntel {
  institution_id: string;
  total_active_grants: number;
  department_distribution: Record<string, number>;
  completion_pct_by_dept: Record<string, number>;
  sponsor_diversification_index: number;
  renewal_probability: number;
  funding_dependency_concentration: number;
  multi_year_stability_projection: number;
}

// =====================================================
// GRANT LIFECYCLE TRACKING
// =====================================================

export async function recordGrantLifecycleEvent(event: GrantLifecycleEvent): Promise<void> {
  const { error } = await supabase
    .from("grant_lifecycle_events" as any)
    .insert({
      grant_id: event.grant_id,
      stage: event.stage,
      title: event.title,
      description: event.description ?? null,
      metadata: event.metadata ?? {},
    });
  if (error) throw error;
}

export async function getGrantLifecycleTimeline(grantId: string) {
  const { data, error } = await supabase
    .from("grant_lifecycle_events" as any)
    .select("*")
    .eq("grant_id", grantId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GRANT PERFORMANCE METRICS
// =====================================================

export function computeGrantPerformance(params: {
  totalMilestones: number;
  completedMilestones: number;
  onTimeMilestones: number;
  totalBudget: number;
  spentBudget: number;
  publications: number;
  patents: number;
  commercialOutputs: number;
  complianceIssues: number;
  crossInstitutionPartners: number;
}): Omit<GrantPerformanceMetrics, "grant_id" | "pi_user_id"> {
  const mcr = params.totalMilestones > 0
    ? params.completedMilestones / params.totalMilestones
    : 0;

  const otd = params.totalMilestones > 0
    ? params.onTimeMilestones / params.totalMilestones
    : 0;

  const ber = params.totalBudget > 0
    ? Math.min(1, params.spentBudget / params.totalBudget)
    : 0;

  const cto = params.spentBudget > 0
    ? (params.publications + params.patents + params.commercialOutputs) / (params.spentBudget / 10000)
    : 0;

  const pyr = params.totalBudget > 0
    ? params.publications / (params.totalBudget / 100000)
    : 0;

  const pcr = params.publications > 0
    ? params.patents / params.publications
    : 0;

  const cl = Math.min(1, (params.patents * 0.3 + params.commercialOutputs * 0.7) / Math.max(1, params.totalMilestones));

  const cr = Math.max(0, 1 - (params.complianceIssues * 0.15));

  const cis = Math.min(1, params.crossInstitutionPartners * 0.2);

  const rei = Math.min(1, (1 - mcr) * 0.4 + (1 - otd) * 0.3 + (1 - ber) * 0.3);

  return {
    milestone_completion_rate: Math.round(mcr * 100) / 100,
    on_time_delivery_pct: Math.round(otd * 100) / 100,
    budget_efficiency_ratio: Math.round(ber * 100) / 100,
    cost_to_output_ratio: Math.round(cto * 100) / 100,
    publication_yield_ratio: Math.round(pyr * 100) / 100,
    patent_conversion_rate: Math.round(pcr * 100) / 100,
    commercialization_likelihood: Math.round(cl * 100) / 100,
    compliance_reliability: Math.round(cr * 100) / 100,
    cross_institution_strength: Math.round(cis * 100) / 100,
    risk_exposure_index: Math.round(rei * 100) / 100,
  };
}

export async function saveGrantPerformanceMetrics(metrics: GrantPerformanceMetrics): Promise<void> {
  const { error } = await supabase
    .from("grant_performance_metrics" as any)
    .upsert(metrics, { onConflict: "grant_id" as any });
  if (error) throw error;
}

// =====================================================
// GRANT RELIABILITY SCORE (GRS)
// =====================================================

export function computeGRS(dimensions: Omit<GrantReliabilityScore, "user_id" | "overall_grs">): GrantReliabilityScore & { breakdown: typeof GRS_WEIGHTS } {
  const overall =
    dimensions.milestone_punctuality * GRS_WEIGHTS.milestone_punctuality +
    dimensions.budget_variance * GRS_WEIGHTS.budget_variance +
    dimensions.renewal_success * GRS_WEIGHTS.renewal_success +
    dimensions.deliverable_acceptance * GRS_WEIGHTS.deliverable_acceptance +
    dimensions.compliance_audit_score * GRS_WEIGHTS.compliance_audit +
    dimensions.sponsor_satisfaction * GRS_WEIGHTS.sponsor_satisfaction +
    dimensions.dispute_history_score * GRS_WEIGHTS.dispute_history +
    dimensions.reporting_consistency * GRS_WEIGHTS.reporting_consistency +
    dimensions.escrow_adherence * GRS_WEIGHTS.escrow_adherence;

  return {
    ...dimensions,
    user_id: "",
    overall_grs: Math.round(overall * 100) / 100,
    breakdown: GRS_WEIGHTS,
  };
}

export async function saveGRS(userId: string, grs: GrantReliabilityScore): Promise<void> {
  const { error } = await supabase
    .from("grant_reliability_scores" as any)
    .insert({ ...grs, user_id: userId });
  if (error) throw error;
}

export async function getGRS(userId: string) {
  const { data, error } = await supabase
    .from("grant_reliability_scores" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// FUNDING-TO-OUTPUT EFFICIENCY
// =====================================================

export function computeFundingEfficiency(params: {
  grantAmount: number;
  publications: number;
  patents: number;
  commercialOutputs: number;
  policyCitations: number;
}): FundingToOutputEfficiency {
  const totalOutputs = params.publications + params.patents + params.commercialOutputs + params.policyCitations;
  const efficiency = params.grantAmount > 0 ? totalOutputs / (params.grantAmount / 100000) : 0;

  return {
    grant_id: "",
    grant_amount: params.grantAmount,
    publications: params.publications,
    patents: params.patents,
    commercial_outputs: params.commercialOutputs,
    policy_citations: params.policyCitations,
    efficiency_index: Math.round(efficiency * 100) / 100,
  };
}

// =====================================================
// GRANT IMPACT FORECASTING
// =====================================================

export function forecastGrantImpact(params: {
  milestoneCompletionRate: number;
  budgetEfficiency: number;
  piReliabilityScore: number;
  domainPatentLikelihood: number;
  sponsorSatisfaction: number;
  complianceHistory: number;
}): Omit<GrantImpactForecast, "grant_id"> {
  const completionProb = params.milestoneCompletionRate * 0.4 + params.piReliabilityScore * 0.3 + params.budgetEfficiency * 0.3;
  const pubYield = params.milestoneCompletionRate * 0.5 + params.piReliabilityScore * 0.3 + params.complianceHistory * 0.2;
  const commProb = params.domainPatentLikelihood * 0.4 + params.milestoneCompletionRate * 0.3 + params.budgetEfficiency * 0.3;
  const overrunRisk = Math.max(0, 1 - params.budgetEfficiency) * 0.5 + Math.max(0, 1 - params.milestoneCompletionRate) * 0.5;
  const renewalProb = params.sponsorSatisfaction * 0.4 + params.milestoneCompletionRate * 0.3 + params.complianceHistory * 0.3;
  const policyProb = params.piReliabilityScore * 0.3 + params.milestoneCompletionRate * 0.3 + params.complianceHistory * 0.4;

  return {
    completion_probability: Math.round(Math.min(1, completionProb) * 100) / 100,
    publication_yield_probability: Math.round(Math.min(1, pubYield) * 100) / 100,
    commercialization_probability: Math.round(Math.min(1, commProb) * 100) / 100,
    budget_overrun_risk: Math.round(Math.min(1, overrunRisk) * 100) / 100,
    renewal_success_probability: Math.round(Math.min(1, renewalProb) * 100) / 100,
    policy_adoption_probability: Math.round(Math.min(1, policyProb) * 100) / 100,
    explanation: {
      model: "weighted_linear_v1",
      factors: params,
      note: "All predictions explainable — no opaque risk scoring",
    },
  };
}

export async function saveGrantForecast(grantId: string, forecast: Omit<GrantImpactForecast, "grant_id">): Promise<void> {
  const { error } = await supabase
    .from("grant_impact_forecasts" as any)
    .insert({ ...forecast, grant_id: grantId });
  if (error) throw error;
}

// =====================================================
// GRANT ANOMALY DETECTION
// =====================================================

export function detectGrantAnomalies(params: {
  budgetVariance: number;
  milestoneDelayCount: number;
  complianceFlagCount: number;
  deliverableCount: number;
  citationCount: number;
  sponsorOverlapWithPI: boolean;
  ghostMilestoneCount: number;
}): GrantAnomalyFlag[] {
  const flags: GrantAnomalyFlag[] = [];

  if (params.budgetVariance > 0.3) {
    flags.push({
      anomaly_type: "budget_inflation",
      severity: params.budgetVariance > 0.5 ? "high" : "medium",
      evidence: { budget_variance: params.budgetVariance },
      ai_confidence: Math.min(0.95, params.budgetVariance),
    });
  }

  if (params.milestoneDelayCount > 3) {
    flags.push({
      anomaly_type: "milestone_delay_loop",
      severity: params.milestoneDelayCount > 5 ? "high" : "medium",
      evidence: { delay_count: params.milestoneDelayCount },
      ai_confidence: Math.min(0.9, params.milestoneDelayCount * 0.15),
    });
  }

  if (params.complianceFlagCount > 2) {
    flags.push({
      anomaly_type: "compliance_repeat",
      severity: params.complianceFlagCount > 4 ? "critical" : "high",
      evidence: { flag_count: params.complianceFlagCount },
      ai_confidence: Math.min(0.92, params.complianceFlagCount * 0.2),
    });
  }

  if (params.citationCount > 5 && params.deliverableCount === 0) {
    flags.push({
      anomaly_type: "citation_without_deliverable",
      severity: "high",
      evidence: { citations: params.citationCount, deliverables: params.deliverableCount },
      ai_confidence: 0.85,
    });
  }

  if (params.sponsorOverlapWithPI) {
    flags.push({
      anomaly_type: "sponsor_pi_collusion",
      severity: "critical",
      evidence: { overlap_detected: true },
      ai_confidence: 0.7,
    });
  }

  if (params.ghostMilestoneCount > 0) {
    flags.push({
      anomaly_type: "ghost_milestone",
      severity: params.ghostMilestoneCount > 2 ? "critical" : "high",
      evidence: { ghost_count: params.ghostMilestoneCount },
      ai_confidence: Math.min(0.95, params.ghostMilestoneCount * 0.3),
    });
  }

  return flags;
}

export async function saveAnomalyFlags(flags: GrantAnomalyFlag[]): Promise<void> {
  if (flags.length === 0) return;
  const { error } = await supabase
    .from("grant_anomaly_flags" as any)
    .insert(flags);
  if (error) throw error;
}

// =====================================================
// DISCIPLINE NORMALIZATION
// =====================================================

export async function getGrantDisciplineNorms(discipline: string) {
  const { data, error } = await supabase
    .from("grant_discipline_norms" as any)
    .select("*")
    .eq("discipline", discipline)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function applyDisciplineNormalization(
  rawMetrics: GrantPerformanceMetrics,
  norms: { avg_funding_amount: number; avg_publication_cycle_months: number; patent_likelihood: number; regulatory_burden_factor: number }
): GrantPerformanceMetrics {
  return {
    ...rawMetrics,
    publication_yield_ratio: rawMetrics.publication_yield_ratio / Math.max(0.1, norms.avg_publication_cycle_months / 12),
    patent_conversion_rate: rawMetrics.patent_conversion_rate / Math.max(0.01, norms.patent_likelihood),
    compliance_reliability: rawMetrics.compliance_reliability * norms.regulatory_burden_factor,
  };
}

// =====================================================
// INSTITUTIONAL FUNDING INTELLIGENCE
// =====================================================

export async function getInstitutionalFundingIntel(institutionId: string) {
  const { data, error } = await supabase
    .from("institutional_funding_intelligence" as any)
    .select("*")
    .eq("institution_id", institutionId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveInstitutionalFundingIntel(intel: InstitutionalFundingIntel): Promise<void> {
  const { error } = await supabase
    .from("institutional_funding_intelligence" as any)
    .insert({
      ...intel,
      budget_variance_heatmap: {},
      risk_cluster_alerts: [],
    });
  if (error) throw error;
}
