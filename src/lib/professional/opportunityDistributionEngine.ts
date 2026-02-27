/**
 * Trust-Weighted Opportunity Distribution Engine (TWODE)
 * Beyond Facebook Ads — capability-aligned opportunity distribution.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const OPPORTUNITY_TYPES = ["grant", "research_collaboration", "startup_cofounder", "corporate_rfp", "institutional_hiring", "industry_pilot", "cross_border_partnership", "funding_campaign", "skill_micro_task", "civic_initiative", "policy_consultation", "innovation_hackathon", "institutional_fellowship", "patent_licensing", "procurement_vendor"] as const;
export type OpportunityType = typeof OPPORTUNITY_TYPES[number];

export const MANIPULATION_FLAG_TYPES = ["profile_boosting", "coordinated_rings", "institutional_favoritism", "trust_inflation", "bid_circumvention", "spam_flooding", "fake_listing", "funding_misrepresentation"] as const;
export const AI_SUGGESTION_TYPES = ["skill_clarity", "trust_threshold", "milestone_breakdown", "cross_border_compliance", "funding_structure", "diversity_reach", "risk_reduction"] as const;

export const TWODE_PHILOSOPHY = {
  category: "Trust-Weighted Opportunity Distribution",
  contrast: "Facebook Ads monetize attention; TWODE aligns capability with opportunity",
  principle: "Best capability match wins, not highest bidder",
  noAdPolicy: ["No paid visibility manipulation", "No bidding wars", "No engagement amplification", "No hidden promotion flags", "No algorithmic emotional targeting", "No behavioral micro-targeting"],
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface OpportunityInput {
  opportunity_type: string;
  title: string;
  description?: string;
  domain?: string;
  required_skills?: string[];
  trust_threshold?: number;
  geographic_scope?: string[];
  funding_structure?: Record<string, unknown>;
  timeline?: Record<string, unknown>;
  compliance_requirements?: unknown[];
  expected_deliverables?: unknown[];
  evaluation_criteria?: unknown[];
  institutional_sponsor_id?: string;
  is_institutional?: boolean;
  compliance_documents?: unknown[];
  escrow_linked?: boolean;
  require_domain_authority?: boolean;
  require_funding_experience?: boolean;
  require_institutional_verification?: boolean;
  require_compliance_history?: boolean;
  require_cross_border_clearance?: boolean;
  created_by?: string;
}

export interface DistributionMatchInput {
  opportunity_id: string;
  user_id: string;
  skill_alignment_pct?: number;
  domain_expertise_overlap?: number;
  execution_reliability?: number;
  funding_experience_match?: number;
  trust_density_compatibility?: number;
  institutional_affiliation_fit?: number;
  cross_border_eligibility?: number;
  collaboration_history_strength?: number;
  past_outcome_performance?: number;
  risk_compatibility?: number;
}

export interface MatchExplanationInput {
  match_id: string;
  reason_summary: string;
  skill_match_detail?: Record<string, unknown>;
  trust_threshold_met?: boolean;
  domain_alignment_detail?: string;
  funding_compatibility_detail?: string;
  geographic_relevance?: string;
  institutional_fit_detail?: string;
  risk_exposure_level?: string;
}

export interface CrossBorderCheckInput {
  opportunity_id: string;
  target_region: string;
  jurisdiction_compatible?: boolean;
  funding_eligible?: boolean;
  export_control_clear?: boolean;
  data_sharing_restrictions?: Record<string, unknown>;
  ip_legal_considerations?: string;
  currency_constraints?: string;
}

export interface FairDistributionInput {
  opportunity_id: string;
  emerging_talent_exposure?: number;
  regional_diversity_score?: number;
  institutional_balance?: number;
  domain_diversity?: number;
  anti_monopoly_cap_applied?: boolean;
  anti_elite_clustering?: boolean;
  newcomer_access_pct?: number;
}

export interface PerformanceInput {
  opportunity_id: string;
  application_quality_rate?: number;
  milestone_success_rate?: number;
  funding_completion?: number;
  collaboration_longevity?: number;
  startup_formation?: number;
  patent_conversion?: number;
  industry_deployment?: number;
  cross_border_success?: number;
  trust_growth_impact?: number;
}

export interface ManipulationFlagInput {
  flag_type: string;
  description?: string;
  severity?: string;
  target_user_id?: string;
  target_opportunity_id?: string;
  evidence?: Record<string, unknown>;
}

export interface TWODEImpactInput {
  opportunity_id: string;
  execution_success?: number;
  funding_efficiency?: number;
  economic_multiplier?: number;
  innovation_output?: number;
  cross_border_collaboration?: number;
  institutional_integration?: number;
  long_term_stability?: number;
  trust_growth_impact?: number;
}

export interface AISuggestionInput {
  opportunity_id: string;
  suggestion_type: string;
  suggestion_text: string;
  reasoning?: string;
}

export interface UserDashboardInput {
  user_id: string;
  skill_gap_suggestions?: unknown[];
  trust_upgrade_suggestions?: unknown[];
  funding_readiness_alerts?: unknown[];
  institutional_compatibility?: unknown[];
  cross_border_alerts?: unknown[];
  risk_warnings?: unknown[];
}

export interface GlobalMapInput {
  region: string;
  opportunity_density?: number;
  funding_corridor_strength?: number;
  domain_clusters?: unknown[];
  cross_border_routes?: unknown[];
  institutional_hiring_concentration?: number;
  startup_cofounder_hotspots?: unknown[];
}

export interface OpportunitySearchFilters {
  opportunity_type?: string;
  domain?: string;
  status?: string;
  is_institutional?: boolean;
  limit?: number;
}

// ─── Opportunities ──────────────────────────────────────────
export async function createOpportunity(input: OpportunityInput) {
  const { data, error } = await (supabase as any).from("twode_opportunities").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getOpportunities(filters: OpportunitySearchFilters = {}) {
  let q = (supabase as any).from("twode_opportunities").select("*").order("created_at", { ascending: false });
  if (filters.opportunity_type) q = q.eq("opportunity_type", filters.opportunity_type);
  if (filters.domain) q = q.eq("domain", filters.domain);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.is_institutional !== undefined) q = q.eq("is_institutional", filters.is_institutional);
  q = q.limit(filters.limit ?? 50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getOpportunity(id: string) {
  const { data, error } = await (supabase as any).from("twode_opportunities").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateOpportunity(id: string, updates: Partial<OpportunityInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("twode_opportunities").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── Distribution Matches ───────────────────────────────────
export async function createDistributionMatch(input: DistributionMatchInput) {
  const composite = (input.skill_alignment_pct ?? 0) * 0.2 + (input.domain_expertise_overlap ?? 0) * 0.15 + (input.execution_reliability ?? 0) * 0.15 + (input.funding_experience_match ?? 0) * 0.1 + (input.trust_density_compatibility ?? 0) * 0.1 + (input.institutional_affiliation_fit ?? 0) * 0.05 + (input.cross_border_eligibility ?? 0) * 0.05 + (input.collaboration_history_strength ?? 0) * 0.1 + (input.past_outcome_performance ?? 0) * 0.05 + (input.risk_compatibility ?? 0) * 0.05;
  const { data, error } = await (supabase as any).from("twode_distribution_matches").insert({ ...input, composite_rank: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getUserMatches(userId: string) {
  const { data, error } = await (supabase as any).from("twode_distribution_matches").select("*").eq("user_id", userId).order("composite_rank", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOpportunityMatches(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_distribution_matches").select("*").eq("opportunity_id", opportunityId).order("composite_rank", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Match Explanations ────────────────────────────────────
export async function saveMatchExplanation(input: MatchExplanationInput) {
  const { data, error } = await (supabase as any).from("twode_match_explanations").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getMatchExplanation(matchId: string) {
  const { data, error } = await (supabase as any).from("twode_match_explanations").select("*").eq("match_id", matchId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Cross-Border Checks ───────────────────────────────────
export async function saveCrossBorderCheck(input: CrossBorderCheckInput) {
  const { data, error } = await (supabase as any).from("twode_cross_border_checks").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCrossBorderChecks(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_cross_border_checks").select("*").eq("opportunity_id", opportunityId);
  if (error) throw error;
  return data ?? [];
}

// ─── Fair Distribution ─────────────────────────────────────
export async function saveFairDistribution(input: FairDistributionInput) {
  const { data, error } = await (supabase as any).from("twode_fair_distribution").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getFairDistribution(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_fair_distribution").select("*").eq("opportunity_id", opportunityId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Performance ────────────────────────────────────────────
export async function savePerformance(input: PerformanceInput) {
  const { data, error } = await (supabase as any).from("twode_performance").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getPerformance(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_performance").select("*").eq("opportunity_id", opportunityId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Manipulation Flags ────────────────────────────────────
export async function flagManipulation(input: ManipulationFlagInput) {
  const { data, error } = await (supabase as any).from("twode_manipulation_flags").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getManipulationFlags(status?: string) {
  let q = (supabase as any).from("twode_manipulation_flags").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function reviewManipulationFlag(flagId: string, reviewedBy: string) {
  const { data, error } = await (supabase as any).from("twode_manipulation_flags").update({ status: "reviewed", reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq("id", flagId).select().single();
  if (error) throw error;
  return data;
}

// ─── Impact Index ───────────────────────────────────────────
export async function saveTWODEImpact(input: TWODEImpactInput) {
  const composite = (input.execution_success ?? 0) * 0.2 + (input.funding_efficiency ?? 0) * 0.15 + (input.economic_multiplier ?? 0) * 0.15 + (input.innovation_output ?? 0) * 0.15 + (input.cross_border_collaboration ?? 0) * 0.1 + (input.institutional_integration ?? 0) * 0.1 + (input.long_term_stability ?? 0) * 0.05 + (input.trust_growth_impact ?? 0) * 0.1;
  const { data, error } = await (supabase as any).from("twode_impact_index").insert({ ...input, composite_impact: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getTWODEImpact(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_impact_index").select("*").eq("opportunity_id", opportunityId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── AI Suggestions ────────────────────────────────────────
export async function saveAISuggestion(input: AISuggestionInput) {
  const { data, error } = await (supabase as any).from("twode_ai_suggestions").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAISuggestions(opportunityId: string) {
  const { data, error } = await (supabase as any).from("twode_ai_suggestions").select("*").eq("opportunity_id", opportunityId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function acceptAISuggestion(suggestionId: string) {
  const { data, error } = await (supabase as any).from("twode_ai_suggestions").update({ accepted: true }).eq("id", suggestionId).select().single();
  if (error) throw error;
  return data;
}

// ─── User Dashboard ────────────────────────────────────────
export async function saveUserDashboard(input: UserDashboardInput) {
  const { data, error } = await (supabase as any).from("twode_user_dashboard").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserDashboard(userId: string) {
  const { data, error } = await (supabase as any).from("twode_user_dashboard").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Global Map ─────────────────────────────────────────────
export async function saveGlobalMapEntry(input: GlobalMapInput) {
  const { data, error } = await (supabase as any).from("twode_global_map").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getGlobalMap() {
  const { data, error } = await (supabase as any).from("twode_global_map").select("*").order("opportunity_density", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Composite Scoring ─────────────────────────────────────
export function computeCapabilityRank(metrics: {
  skill_alignment_pct: number;
  domain_expertise_overlap: number;
  execution_reliability: number;
  funding_experience_match: number;
  trust_density_compatibility: number;
  institutional_affiliation_fit: number;
  cross_border_eligibility: number;
  collaboration_history_strength: number;
  past_outcome_performance: number;
  risk_compatibility: number;
}): number {
  return Math.round((
    metrics.skill_alignment_pct * 0.2 +
    metrics.domain_expertise_overlap * 0.15 +
    metrics.execution_reliability * 0.15 +
    metrics.funding_experience_match * 0.1 +
    metrics.trust_density_compatibility * 0.1 +
    metrics.institutional_affiliation_fit * 0.05 +
    metrics.cross_border_eligibility * 0.05 +
    metrics.collaboration_history_strength * 0.1 +
    metrics.past_outcome_performance * 0.05 +
    metrics.risk_compatibility * 0.05
  ) * 100) / 100;
}

export function computeOpportunityImpact(metrics: {
  execution_success: number;
  funding_efficiency: number;
  economic_multiplier: number;
  innovation_output: number;
  cross_border_collaboration: number;
  institutional_integration: number;
  long_term_stability: number;
  trust_growth_impact: number;
}): number {
  return Math.round((
    metrics.execution_success * 0.2 +
    metrics.funding_efficiency * 0.15 +
    metrics.economic_multiplier * 0.15 +
    metrics.innovation_output * 0.15 +
    metrics.cross_border_collaboration * 0.1 +
    metrics.institutional_integration * 0.1 +
    metrics.long_term_stability * 0.05 +
    metrics.trust_growth_impact * 0.1
  ) * 100) / 100;
}
