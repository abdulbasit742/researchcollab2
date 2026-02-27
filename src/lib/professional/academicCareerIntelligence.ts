/**
 * Academic Career Intelligence & Reputation OS (ACIRO)
 * Superior to Google Scholar profiles.
 * Multi-dimensional reputation, execution reliability, career risk, AI advisor.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const CAREER_STAGES = ["early", "mid", "senior", "distinguished", "emeritus"] as const;
export type CareerStage = typeof CAREER_STAGES[number];

export const ACIRO_TRANSPARENCY = {
  philosophy: "Multi-dimensional professional operating system — not citation summary",
  mdrs: "12-dimension reputation score with transparent weight breakdown",
  execution: "9-metric execution reliability profile influencing hiring & funding",
  adaptability: "7-dimension adaptability index rewarding modern research flexibility",
  risk: "8-dimension early warning system for career risk detection",
  export: "Portable, verifiable academic identity with verification hash",
};

export const MDRS_WEIGHTS = {
  citation_quality_index: 0.10,
  grant_reliability_score: 0.10,
  funding_efficiency_score: 0.08,
  commercialization_impact_score: 0.08,
  reproducibility_reliability_index: 0.08,
  collaboration_trust_score: 0.10,
  institutional_contribution_score: 0.08,
  policy_influence_score: 0.06,
  open_science_contribution_score: 0.08,
  compliance_integrity_score: 0.08,
  longitudinal_stability_score: 0.08,
  cross_discipline_influence_score: 0.08,
};

export const ADAPTABILITY_WEIGHTS = {
  cross_domain_participation: 0.16,
  interdisciplinary_grants: 0.16,
  collaboration_diversity: 0.14,
  funding_body_diversity: 0.14,
  geographic_spread: 0.12,
  skill_evolution_rate: 0.14,
  innovation_pivot_frequency: 0.14,
};

// =====================================================
// TYPES
// =====================================================

export interface CareerProfileInput {
  user_id: string;
  current_institution_id?: string;
  historical_affiliations?: unknown[];
  institutional_leadership_roles?: unknown[];
  policy_advisory_roles?: unknown[];
  industry_engagements?: unknown[];
  mentorship_completions?: number;
  graduate_supervisions_completed?: number;
  grant_committee_participations?: number;
  career_start_date?: string;
  career_stage?: CareerStage;
}

export interface MDRSInput {
  citation_quality_index: number;
  grant_reliability_score: number;
  funding_efficiency_score: number;
  commercialization_impact_score: number;
  reproducibility_reliability_index: number;
  collaboration_trust_score: number;
  institutional_contribution_score: number;
  policy_influence_score: number;
  open_science_contribution_score: number;
  compliance_integrity_score: number;
  longitudinal_stability_score: number;
  cross_discipline_influence_score: number;
}

export interface ExecutionReliabilityInput {
  on_time_milestone_pct: number;
  budget_variance_pct: number;
  grant_renewal_rate: number;
  deliverable_acceptance_pct: number;
  sponsor_satisfaction: number;
  escrow_integrity_compliance: number;
  dispute_count: number;
  reporting_punctuality: number;
  audit_pass_rate: number;
}

export interface AdaptabilityInput {
  cross_domain_participation: number;
  interdisciplinary_grants: number;
  collaboration_diversity: number;
  funding_body_diversity: number;
  geographic_spread: number;
  skill_evolution_rate: number;
  innovation_pivot_frequency: number;
}

export interface CareerRiskInput {
  funding_dependency_risk: number;
  collaboration_concentration_risk: number;
  compliance_instability: number;
  publication_stagnation: number;
  innovation_decline: number;
  domain_obsolescence: number;
  high_grant_failure_cluster: number;
  reputation_volatility: number;
}

export interface CareerRiskResult {
  overall_risk_level: string;
  early_warnings: Array<{ risk: string; severity: string; suggestion: string }>;
}

export interface CareerAdvisorSuggestion {
  category: string;
  suggestion: string;
  reasoning: string;
  priority: string;
}

// =====================================================
// CAREER PROFILES
// =====================================================

export async function upsertCareerProfile(input: CareerProfileInput): Promise<void> {
  const { error } = await supabase
    .from("academic_career_profiles" as any)
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "user_id" } as any);
  if (error) throw error;
}

export async function getCareerProfile(userId: string) {
  const { data, error } = await supabase
    .from("academic_career_profiles" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// MULTI-DIMENSIONAL REPUTATION SCORE (MDRS)
// =====================================================

export function computeMDRS(input: MDRSInput): { overall: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let overall = 0;
  for (const [key, weight] of Object.entries(MDRS_WEIGHTS)) {
    const val = (input as any)[key] ?? 0;
    const weighted = val * weight;
    breakdown[key] = Math.round(weighted * 1000) / 1000;
    overall += weighted;
  }
  return { overall: Math.round(overall * 100) / 100, breakdown };
}

export async function saveMDRS(userId: string, input: MDRSInput): Promise<number> {
  const { overall, breakdown } = computeMDRS(input);
  const { error } = await supabase
    .from("multi_dimensional_reputation_scores" as any)
    .insert({ user_id: userId, ...input, overall_mdrs: overall, weight_breakdown: breakdown });
  if (error) throw error;
  return overall;
}

export async function getMDRS(userId: string) {
  const { data, error } = await supabase
    .from("multi_dimensional_reputation_scores" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// EXECUTION RELIABILITY
// =====================================================

export async function saveExecutionReliability(userId: string, input: ExecutionReliabilityInput): Promise<void> {
  const { error } = await supabase
    .from("execution_reliability_profiles" as any)
    .insert({ user_id: userId, ...input });
  if (error) throw error;
}

export async function getExecutionReliability(userId: string) {
  const { data, error } = await supabase
    .from("execution_reliability_profiles" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// ADAPTABILITY INDEX
// =====================================================

export function computeAdaptability(input: AdaptabilityInput): number {
  let score = 0;
  for (const [key, weight] of Object.entries(ADAPTABILITY_WEIGHTS)) {
    score += ((input as any)[key] ?? 0) * weight;
  }
  return Math.round(score * 100) / 100;
}

export async function saveAdaptability(userId: string, input: AdaptabilityInput): Promise<number> {
  const overall = computeAdaptability(input);
  const { error } = await supabase
    .from("adaptability_index" as any)
    .insert({ user_id: userId, ...input, overall_adaptability: overall });
  if (error) throw error;
  return overall;
}

export async function getAdaptability(userId: string) {
  const { data, error } = await supabase
    .from("adaptability_index" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// CAREER RISK DETECTION
// =====================================================

export function detectCareerRisks(input: CareerRiskInput): CareerRiskResult {
  const warnings: Array<{ risk: string; severity: string; suggestion: string }> = [];
  const threshold = 0.6;

  if (input.funding_dependency_risk > threshold) warnings.push({ risk: "funding_dependency", severity: input.funding_dependency_risk > 0.8 ? "critical" : "high", suggestion: "Diversify funding sources across multiple bodies and grant types" });
  if (input.collaboration_concentration_risk > threshold) warnings.push({ risk: "collaboration_concentration", severity: "high", suggestion: "Expand collaboration network across institutions and disciplines" });
  if (input.compliance_instability > threshold) warnings.push({ risk: "compliance_instability", severity: "high", suggestion: "Address compliance gaps and improve reporting punctuality" });
  if (input.publication_stagnation > threshold) warnings.push({ risk: "publication_stagnation", severity: "medium", suggestion: "Increase research output or explore new publication venues" });
  if (input.innovation_decline > threshold) warnings.push({ risk: "innovation_decline", severity: "high", suggestion: "Explore patent opportunities and commercialization pathways" });
  if (input.domain_obsolescence > threshold) warnings.push({ risk: "domain_obsolescence", severity: "medium", suggestion: "Consider cross-discipline research or emerging domain pivots" });
  if (input.high_grant_failure_cluster > threshold) warnings.push({ risk: "grant_failure_cluster", severity: "critical", suggestion: "Review proposal strategy and seek grant writing support" });
  if (input.reputation_volatility > threshold) warnings.push({ risk: "reputation_volatility", severity: "high", suggestion: "Stabilize output consistency and maintain compliance standards" });

  const riskCount = warnings.filter(w => w.severity === "critical").length;
  const overall = riskCount >= 2 ? "critical" : warnings.length >= 4 ? "high" : warnings.length >= 2 ? "medium" : "low";

  return { overall_risk_level: overall, early_warnings: warnings };
}

export async function saveCareerRisks(userId: string, input: CareerRiskInput): Promise<CareerRiskResult> {
  const result = detectCareerRisks(input);
  const { error } = await supabase
    .from("career_risk_indicators" as any)
    .insert({ user_id: userId, ...input, overall_risk_level: result.overall_risk_level, early_warnings: result.early_warnings });
  if (error) throw error;
  return result;
}

export async function getCareerRisks(userId: string) {
  const { data, error } = await supabase
    .from("career_risk_indicators" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// CAREER TRAJECTORY
// =====================================================

export async function saveTrajectorySnapshot(userId: string, snapshot: {
  funding_total?: number; active_grants?: number; publications_count?: number;
  patents_count?: number; startups_count?: number; collaboration_count?: number;
  domains?: string[]; industry_engagements?: number; compliance_score?: number; overall_mdrs?: number;
}): Promise<void> {
  const { error } = await supabase
    .from("career_trajectory_snapshots" as any)
    .insert({ user_id: userId, snapshot_date: new Date().toISOString().split("T")[0], ...snapshot });
  if (error) throw error;
}

export async function getCareerTrajectory(userId: string) {
  const { data, error } = await supabase
    .from("career_trajectory_snapshots" as any)
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// AI CAREER ADVISOR
// =====================================================

export function generateCareerAdvice(params: {
  mdrs?: MDRSInput;
  risks?: CareerRiskInput;
  adaptability?: AdaptabilityInput;
  executionReliability?: ExecutionReliabilityInput;
}): CareerAdvisorSuggestion[] {
  const suggestions: CareerAdvisorSuggestion[] = [];

  if (params.mdrs) {
    if (params.mdrs.funding_efficiency_score < 0.4) suggestions.push({ category: "funding", suggestion: "Target smaller, high-efficiency grants to improve funding yield ratio", reasoning: "Funding efficiency below 40% indicates resource underutilization", priority: "high" });
    if (params.mdrs.commercialization_impact_score < 0.3) suggestions.push({ category: "commercialization", suggestion: "Explore patent filing for current research with commercial potential", reasoning: "Low commercialization score limits economic impact visibility", priority: "medium" });
    if (params.mdrs.open_science_contribution_score < 0.3) suggestions.push({ category: "open_science", suggestion: "Publish datasets and code repositories to boost open science contribution", reasoning: "Open science score below threshold; sharing increases community impact", priority: "medium" });
    if (params.mdrs.collaboration_trust_score < 0.5) suggestions.push({ category: "collaboration", suggestion: "Strengthen existing collaborations through multi-grant partnerships", reasoning: "Collaboration trust below 50% signals network fragility", priority: "high" });
  }

  if (params.risks) {
    if (params.risks.domain_obsolescence > 0.5) suggestions.push({ category: "domain_expansion", suggestion: "Explore emerging interdisciplinary research areas adjacent to your expertise", reasoning: "Domain obsolescence risk detected; cross-discipline pivots recommended", priority: "high" });
  }

  if (params.adaptability) {
    if (params.adaptability.geographic_spread < 0.3) suggestions.push({ category: "global_reach", suggestion: "Seek cross-border grant collaborations to expand geographic footprint", reasoning: "Geographic concentration limits international visibility", priority: "medium" });
  }

  if (params.executionReliability) {
    if (params.executionReliability.on_time_milestone_pct < 0.7) suggestions.push({ category: "execution", suggestion: "Implement milestone tracking tools to improve on-time delivery", reasoning: "Below 70% on-time milestone rate affects grant reliability score", priority: "critical" });
    if (params.executionReliability.audit_pass_rate < 0.8) suggestions.push({ category: "compliance", suggestion: "Conduct internal audit reviews before formal compliance submissions", reasoning: "Audit pass rate below 80% signals compliance vulnerability", priority: "high" });
  }

  return suggestions;
}

// =====================================================
// PORTABLE IDENTITY EXPORT
// =====================================================

export async function exportAcademicIdentity(userId: string, options: {
  includes_reputation?: boolean; includes_grants?: boolean;
  includes_innovation?: boolean; includes_collaboration?: boolean;
  includes_compliance?: boolean; format?: string;
}): Promise<string> {
  const exportData: Record<string, unknown> = { user_id: userId, exported_at: new Date().toISOString() };

  if (options.includes_reputation !== false) {
    exportData.mdrs = await getMDRS(userId);
    exportData.execution_reliability = await getExecutionReliability(userId);
  }
  if (options.includes_collaboration !== false) {
    exportData.adaptability = await getAdaptability(userId);
  }
  if (options.includes_compliance !== false) {
    exportData.career_risks = await getCareerRisks(userId);
  }
  exportData.career_profile = await getCareerProfile(userId);
  exportData.trajectory = await getCareerTrajectory(userId);

  // Simple verification hash
  const hashInput = JSON.stringify(exportData);
  const hash = btoa(hashInput.slice(0, 100));

  const { data, error } = await supabase
    .from("academic_identity_exports" as any)
    .insert({
      user_id: userId, export_format: options.format ?? "json",
      export_data: exportData, verification_hash: hash,
      includes_reputation: options.includes_reputation ?? true,
      includes_grants: options.includes_grants ?? true,
      includes_innovation: options.includes_innovation ?? true,
      includes_collaboration: options.includes_collaboration ?? true,
      includes_compliance: options.includes_compliance ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}
