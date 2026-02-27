/**
 * AI Collaboration & Team Intelligence Engine (ACTIE)
 * Replaces social networking with intelligent execution team architecture.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const TEAM_ROLES = [
  "principal_investigator", "technical_lead", "grant_strategist",
  "compliance_officer", "industry_liaison", "innovation_architect",
  "data_lead", "prototype_lead", "startup_conversion_lead",
] as const;
export type TeamRole = typeof TEAM_ROLES[number];

export const EVOLUTION_EVENT_TYPES_ACTIE = [
  "trust_shift", "role_misalignment", "execution_delay", "budget_variance",
  "communication_breakdown", "collaboration_fatigue", "risk_escalation",
  "member_departure", "skill_gap_emerged", "milestone_missed",
] as const;
export type TeamEvolutionEventType = typeof EVOLUTION_EVENT_TYPES_ACTIE[number];

export const ACTIE_PHILOSOPHY = {
  identity: "Operational and predictive team construction",
  suggests: "Teams that will succeed, not people you may know",
  builds: "Execution capability clusters, not social proximity",
  networking: "Operational and predictive, not surface-level",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface TeamCompatibilityInput {
  team_id?: string;
  project_id?: string;
  member_ids: string[];
  skill_coverage: number;
  skill_overlap_efficiency: number;
  domain_complementarity: number;
  execution_reliability_alignment: number;
  funding_experience_alignment: number;
  collaboration_history: number;
  trust_edge_strength: number;
  institutional_diversity: number;
  geographic_compatibility: number;
  risk_tolerance_alignment: number;
  time_availability_overlap: number;
  communication_stability: number;
}

export interface SkillComplementarityInput {
  project_id?: string;
  team_id?: string;
  missing_skills: string[];
  redundant_skills: string[];
  underrepresented_domains: string[];
  cross_domain_synergy: number;
  patent_capability: number;
  industry_deployment_expertise: number;
  grant_writing_experience: number;
  compliance_expertise: number;
  recommended_additions?: Record<string, unknown>[];
}

export interface ExecutionPredictionInput {
  team_id?: string;
  project_id?: string;
  milestone_completion_prob: number;
  budget_compliance_prob: number;
  grant_renewal_prob: number;
  patent_filing_prob: number;
  startup_formation_prob: number;
  industry_adoption_prob: number;
  dispute_risk: number;
  collaboration_longevity_prob: number;
  risk_breakdown?: Record<string, unknown>;
}

export interface FundingEligibilityInput {
  team_id?: string;
  grant_id?: string;
  grant_eligible: boolean;
  institutional_rules_met: boolean;
  cross_border_restrictions: string[];
  compliance_requirements_met: boolean;
  budget_category_compat: number;
  funding_history_credibility: number;
  sponsor_trust_threshold_met: boolean;
  alerts: string[];
  analysis_details?: Record<string, unknown>;
}

export interface CrossBorderIntelInput {
  team_id?: string;
  jurisdiction_compatibility: number;
  regulatory_conflicts: string[];
  ip_ownership_implications?: string;
  currency_exposure_risk: number;
  timezone_friction: number;
  cultural_stability: number;
  historical_success_rate: number;
}

export interface InnovationSynergyInput {
  team_id?: string;
  cross_domain_overlap: number;
  historical_breakthroughs: number;
  patent_synergy: number;
  startup_formation_prob: number;
  industry_cross_pollination: number;
  emerging_convergence: number;
}

export interface TeamRiskInput {
  team_id?: string;
  execution_risk: number;
  funding_volatility: number;
  compliance_risk: number;
  reputation_instability: number;
  collaboration_fragility: number;
  single_member_reliance: number;
  institutional_dependency: number;
  vulnerabilities?: Record<string, unknown>[];
}

export interface RoleAssignmentInput {
  team_id: string;
  user_id: string;
  assigned_role: string;
  role_fit_score: number;
  alternative_roles?: string[];
  strengths?: Record<string, unknown>;
}

export interface TeamFormationRequest {
  requested_by: string;
  project_description?: string;
  required_skills?: string[];
  ideal_team_size?: number;
  domain_diversity?: number;
  funding_alignment?: number;
  trust_threshold?: number;
  institutional_composition?: Record<string, unknown>;
  geographic_diversity?: number;
  commercialization_potential?: number;
  suggested_members?: Record<string, unknown>[];
  reasoning?: Record<string, unknown>;
}

export interface TeamEvolutionInput {
  team_id: string;
  event_type: string;
  severity?: string;
  description?: string;
  metrics?: Record<string, unknown>;
  intervention_recommended?: boolean;
  intervention_details?: string;
}

export interface HistoricalPerformanceInput {
  team_id?: string;
  project_id?: string;
  member_ids: string[];
  skill_composition?: Record<string, unknown>;
  domain_diversity_score: number;
  execution_success: boolean;
  cross_border_stable?: boolean;
  grant_renewed?: boolean;
  patent_converted?: boolean;
  completion_time_days?: number;
  budget_variance?: number;
  dispute_count?: number;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const COMPAT_WEIGHTS = {
  skill_coverage: 0.12, skill_overlap: 0.06, domain: 0.10,
  execution: 0.12, funding: 0.08, history: 0.10,
  trust: 0.12, institutional: 0.06, geographic: 0.06,
  risk_tolerance: 0.06, time: 0.06, communication: 0.06,
};

export function computeTeamCompatibility(input: Omit<TeamCompatibilityInput, "team_id" | "project_id" | "member_ids">): number {
  return Math.round(
    input.skill_coverage * COMPAT_WEIGHTS.skill_coverage +
    input.skill_overlap_efficiency * COMPAT_WEIGHTS.skill_overlap +
    input.domain_complementarity * COMPAT_WEIGHTS.domain +
    input.execution_reliability_alignment * COMPAT_WEIGHTS.execution +
    input.funding_experience_alignment * COMPAT_WEIGHTS.funding +
    input.collaboration_history * COMPAT_WEIGHTS.history +
    input.trust_edge_strength * COMPAT_WEIGHTS.trust +
    input.institutional_diversity * COMPAT_WEIGHTS.institutional +
    input.geographic_compatibility * COMPAT_WEIGHTS.geographic +
    input.risk_tolerance_alignment * COMPAT_WEIGHTS.risk_tolerance +
    input.time_availability_overlap * COMPAT_WEIGHTS.time +
    input.communication_stability * COMPAT_WEIGHTS.communication
  );
}

export function computeExecutionSuccessProb(input: Omit<ExecutionPredictionInput, "team_id" | "project_id" | "risk_breakdown">): number {
  return Math.round(
    input.milestone_completion_prob * 0.20 +
    input.budget_compliance_prob * 0.15 +
    input.grant_renewal_prob * 0.10 +
    input.patent_filing_prob * 0.08 +
    input.startup_formation_prob * 0.08 +
    input.industry_adoption_prob * 0.10 +
    (100 - input.dispute_risk) * 0.14 +
    input.collaboration_longevity_prob * 0.15
  );
}

export function computeTeamRiskScore(input: Omit<TeamRiskInput, "team_id" | "vulnerabilities">): number {
  return Math.round(
    input.execution_risk * 0.20 +
    input.funding_volatility * 0.15 +
    input.compliance_risk * 0.15 +
    input.reputation_instability * 0.10 +
    input.collaboration_fragility * 0.15 +
    input.single_member_reliance * 0.15 +
    input.institutional_dependency * 0.10
  );
}

export function computeInnovationMultiplier(input: Omit<InnovationSynergyInput, "team_id">): number {
  const base =
    input.cross_domain_overlap * 0.20 +
    input.patent_synergy * 0.20 +
    input.startup_formation_prob * 0.15 +
    input.industry_cross_pollination * 0.15 +
    input.emerging_convergence * 0.15 +
    (input.historical_breakthroughs * 5);
  return Math.min(3, Math.max(1, 1 + base / 100));
}

export function computeCrossBorderScore(input: Omit<CrossBorderIntelInput, "team_id" | "regulatory_conflicts" | "ip_ownership_implications">): number {
  return Math.round(
    input.jurisdiction_compatibility * 0.20 +
    input.cultural_stability * 0.20 +
    input.historical_success_rate * 0.25 +
    (100 - input.currency_exposure_risk) * 0.15 +
    (100 - input.timezone_friction) * 0.20
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Team Compatibility (Section 1) ---
export async function saveTeamCompatibility(input: TeamCompatibilityInput): Promise<string> {
  const composite = computeTeamCompatibility(input);
  const { data, error } = await supabase.from("team_compatibility_matrix" as any)
    .insert({ ...input, composite_compatibility: composite, explanation: { weights: COMPAT_WEIGHTS } })
    .select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTeamCompatibility(teamId?: string, projectId?: string) {
  let query = supabase.from("team_compatibility_matrix" as any).select("*");
  if (teamId) query = query.eq("team_id", teamId);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query.order("composite_compatibility", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Skill Complementarity (Section 2) ---
export async function saveSkillComplementarity(input: SkillComplementarityInput): Promise<string> {
  const { data, error } = await supabase.from("skill_complementarity_analysis" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getSkillComplementarity(teamId?: string, projectId?: string) {
  let query = supabase.from("skill_complementarity_analysis" as any).select("*");
  if (teamId) query = query.eq("team_id", teamId);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query.order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Execution Predictions (Section 3) ---
export async function saveExecutionPrediction(input: ExecutionPredictionInput): Promise<string> {
  const composite = computeExecutionSuccessProb(input);
  const { data, error } = await supabase.from("execution_success_predictions" as any)
    .insert({ ...input, composite_success_prob: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getExecutionPredictions(teamId?: string) {
  const { data, error } = await supabase.from("execution_success_predictions" as any).select("*")
    .eq("team_id", teamId).order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Funding Eligibility (Section 4) ---
export async function saveFundingEligibility(input: FundingEligibilityInput): Promise<string> {
  const { data, error } = await supabase.from("funding_eligibility_analysis" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getFundingEligibility(teamId?: string) {
  const { data, error } = await supabase.from("funding_eligibility_analysis" as any).select("*")
    .eq("team_id", teamId).order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Cross-Border Intel (Section 5) ---
export async function saveCrossBorderIntel(input: CrossBorderIntelInput): Promise<string> {
  const composite = computeCrossBorderScore(input);
  const { data, error } = await supabase.from("cross_border_team_intel" as any)
    .insert({ ...input, composite_cross_border: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCrossBorderIntel(teamId?: string) {
  const { data, error } = await supabase.from("cross_border_team_intel" as any).select("*")
    .eq("team_id", teamId).order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Innovation Synergy (Section 7) ---
export async function saveInnovationSynergy(input: InnovationSynergyInput): Promise<string> {
  const multiplier = computeInnovationMultiplier(input);
  const { data, error } = await supabase.from("innovation_synergy_analysis" as any)
    .insert({ ...input, innovation_multiplier: multiplier }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInnovationSynergy(teamId?: string) {
  const { data, error } = await supabase.from("innovation_synergy_analysis" as any).select("*")
    .eq("team_id", teamId).order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Team Risk (Section 8) ---
export async function saveTeamRisk(input: TeamRiskInput): Promise<string> {
  const composite = computeTeamRiskScore(input);
  const { data, error } = await supabase.from("team_risk_analysis" as any)
    .insert({ ...input, composite_risk: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTeamRisk(teamId?: string) {
  const { data, error } = await supabase.from("team_risk_analysis" as any).select("*")
    .eq("team_id", teamId).order("computed_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Role Assignments (Section 9) ---
export async function saveRoleAssignment(input: RoleAssignmentInput): Promise<string> {
  const { data, error } = await supabase.from("team_role_assignments" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getRoleAssignments(teamId: string) {
  const { data, error } = await supabase.from("team_role_assignments" as any).select("*")
    .eq("team_id", teamId).order("role_fit_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- AI Team Formation (Section 10) ---
export async function saveTeamFormation(input: TeamFormationRequest): Promise<string> {
  const { data, error } = await supabase.from("ai_team_formation_suggestions" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTeamFormations(requestedBy: string) {
  const { data, error } = await supabase.from("ai_team_formation_suggestions" as any).select("*")
    .eq("requested_by", requestedBy).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Historical Performance (Section 12) ---
export async function saveHistoricalPerformance(input: HistoricalPerformanceInput): Promise<string> {
  const { data, error } = await supabase.from("historical_team_performance" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getHistoricalPerformance(teamId?: string) {
  let query = supabase.from("historical_team_performance" as any).select("*");
  if (teamId) query = query.eq("team_id", teamId);
  const { data, error } = await query.order("recorded_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

// --- Team Evolution (Section 14) ---
export async function recordTeamEvolution(input: TeamEvolutionInput): Promise<string> {
  const { data, error } = await supabase.from("team_evolution_events" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTeamEvolution(teamId: string) {
  const { data, error } = await supabase.from("team_evolution_events" as any).select("*")
    .eq("team_id", teamId).order("recorded_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}
