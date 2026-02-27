/**
 * Capital Mobilization & Escrow Intelligence Engine (CMEIE)
 * Escrow-protected, trust-weighted, compliance-integrated funding.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const CAMPAIGN_CATEGORIES = [
  "research_funding", "prototype_development", "startup_pre_seed",
  "institutional_infrastructure", "cross_border_initiative", "industry_pilot",
  "grant_matching", "skill_development", "compliance_modernization", "public_policy",
] as const;
export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];

export const CONTRIBUTION_TYPES = [
  "monetary", "recurring", "skill_based", "in_kind_service",
  "institutional_cofund", "matching_pool", "milestone_specific", "impact_specific",
] as const;

export const FRAUD_FLAG_TYPES_CMEIE = [
  "unrealistic_target", "duplicate_campaign", "trust_inflation",
  "coordinated_backing", "milestone_misrepresentation", "budget_misuse",
  "conflict_of_interest", "compliance_evasion",
] as const;

export const STARTUP_ROUND_TYPES = [
  "pre_seed", "seed", "equity_linked", "convertible",
] as const;

export const CMEIE_PHILOSOPHY = {
  facebookMeasures: "Amount raised",
  rcollabMeasures: "Impact delivered",
  facebookAmplifies: "Emotional appeal",
  rcollabEnforces: "Milestone accountability",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface CampaignInput {
  organizer_id: string;
  category: string;
  title: string;
  problem_statement?: string;
  domain?: string;
  geographic_scope?: string;
  funding_goal: number;
  currency?: string;
  milestone_breakdown?: Record<string, unknown>[];
  timeline_start?: string;
  timeline_end?: string;
  deliverables?: string[];
  governance_structure?: Record<string, unknown>;
  compliance_requirements?: string[];
  escrow_release_structure?: Record<string, unknown>;
  risk_factors?: string[];
  expected_outcomes?: string[];
  institutional_backing?: string;
  privacy_level?: string;
}

export interface ContributionInput {
  campaign_id: string;
  contributor_id: string;
  amount: number;
  currency?: string;
  contribution_type?: string;
  milestone_specific_id?: string;
  is_recurring?: boolean;
  recurrence_interval?: string;
  institutional_cofund?: boolean;
  matching_pool_id?: string;
}

export interface DonorIntelligenceInput {
  campaign_id: string;
  organizer_trust_index: number;
  execution_reliability: number;
  past_completion_rate: number;
  dispute_history_score: number;
  institutional_backing_score: number;
  domain_authority: number;
  risk_assessment?: Record<string, unknown>;
  compliance_status?: string;
  cross_border_eligible?: boolean;
}

export interface RiskAssessmentInput {
  campaign_id: string;
  execution_risk: number;
  funding_volatility_risk: number;
  compliance_risk: number;
  institutional_stability_risk: number;
  cross_border_regulatory_risk: number;
  deliverable_feasibility: number;
  team_trust_density: number;
  milestone_punctuality: number;
  domain_maturity: number;
}

export interface PerformanceIndexInput {
  campaign_id: string;
  milestone_punctuality: number;
  budget_adherence: number;
  deliverable_validation_rate: number;
  donor_satisfaction: number;
  institutional_endorsement: number;
  long_term_impact: number;
  cross_border_stability: number;
  economic_multiplier: number;
}

export interface StartupRoundInput {
  campaign_id: string;
  round_type?: string;
  target_raise?: number;
  equity_offered?: number;
  convertible_structure?: Record<string, unknown>;
  investor_accreditation_required?: boolean;
  governance_rights?: Record<string, unknown>;
}

export interface ImpactTrackingInput {
  campaign_id: string;
  deliverables_completed?: number;
  innovation_output?: number;
  patent_filings?: number;
  startup_survival_rate?: number;
  industry_deployments?: number;
  economic_impact_estimate?: number;
  policy_influence_score?: number;
  cross_border_expansions?: number;
}

export interface CampaignSearchFilters {
  category?: string;
  domain?: string;
  geographic_scope?: string;
  organizer_id?: string;
  status?: string;
  min_goal?: number;
  max_goal?: number;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeDonorConfidence(input: Omit<DonorIntelligenceInput, "campaign_id">): number {
  return Math.round(
    input.organizer_trust_index * 0.20 +
    input.execution_reliability * 0.20 +
    input.past_completion_rate * 0.15 +
    input.dispute_history_score * 0.10 +
    input.institutional_backing_score * 0.15 +
    input.domain_authority * 0.10 +
    (input.cross_border_eligible ? 10 : 0) * 0.10
  );
}

export function computeCompositeRisk(input: Omit<RiskAssessmentInput, "campaign_id">): number {
  return Math.round(
    input.execution_risk * 0.20 +
    input.funding_volatility_risk * 0.10 +
    input.compliance_risk * 0.15 +
    input.institutional_stability_risk * 0.10 +
    input.cross_border_regulatory_risk * 0.10 +
    input.deliverable_feasibility * 0.10 +
    input.team_trust_density * 0.10 +
    input.milestone_punctuality * 0.10 +
    input.domain_maturity * 0.05
  );
}

export function computeCampaignPerformance(input: Omit<PerformanceIndexInput, "campaign_id">): number {
  return Math.round(
    input.milestone_punctuality * 0.20 +
    input.budget_adherence * 0.15 +
    input.deliverable_validation_rate * 0.15 +
    input.donor_satisfaction * 0.10 +
    input.institutional_endorsement * 0.10 +
    input.long_term_impact * 0.10 +
    input.cross_border_stability * 0.10 +
    input.economic_multiplier * 0.10
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

const S = supabase as any;

// --- Campaigns ---
export async function createCampaign(input: CampaignInput): Promise<string> {
  const { data, error } = await S.from("cmeie_campaigns").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getCampaigns(filters?: CampaignSearchFilters) {
  let q = S.from("cmeie_campaigns").select("*");
  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.geographic_scope) q = q.eq("geographic_scope", filters.geographic_scope);
  if (filters?.organizer_id) q = q.eq("organizer_id", filters.organizer_id);
  if (filters?.status) q = q.eq("status", filters.status);
  else q = q.neq("status", "cancelled");
  if (filters?.min_goal) q = q.gte("funding_goal", filters.min_goal);
  if (filters?.max_goal) q = q.lte("funding_goal", filters.max_goal);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getCampaign(id: string) {
  const { data, error } = await S.from("cmeie_campaigns").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, updates: Partial<CampaignInput> & { status?: string; funds_pledged?: number; funds_escrowed?: number; funds_released?: number }): Promise<void> {
  const { error } = await S.from("cmeie_campaigns").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Contributions ---
export async function createContribution(input: ContributionInput): Promise<string> {
  const { data, error } = await S.from("cmeie_contributions").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getContributions(campaignId: string) {
  const { data, error } = await S.from("cmeie_contributions").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Donor Intelligence ---
export async function saveDonorIntelligence(input: DonorIntelligenceInput): Promise<void> {
  const composite = computeDonorConfidence(input);
  const { error } = await S.from("cmeie_donor_intelligence").upsert({ ...input, composite_confidence: composite, computed_at: new Date().toISOString() }, { onConflict: "campaign_id" });
  if (error) throw error;
}

export async function getDonorIntelligence(campaignId: string) {
  const { data, error } = await S.from("cmeie_donor_intelligence").select("*").eq("campaign_id", campaignId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Risk Assessment ---
export async function saveRiskAssessment(input: RiskAssessmentInput): Promise<void> {
  const composite = computeCompositeRisk(input);
  const { error } = await S.from("cmeie_risk_assessment").upsert({ ...input, composite_risk: composite, computed_at: new Date().toISOString() }, { onConflict: "campaign_id" });
  if (error) throw error;
}

export async function getRiskAssessment(campaignId: string) {
  const { data, error } = await S.from("cmeie_risk_assessment").select("*").eq("campaign_id", campaignId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Cross-Border ---
export async function saveCrossBorderCheckCMEIE(input: { campaign_id: string; contributor_jurisdiction?: string; funding_restrictions?: string[]; currency_regulation_status?: string; sanction_screening_clear?: boolean; export_control_clear?: boolean; data_transfer_compliant?: boolean; institutional_approval_required?: boolean; flags?: string[]; overall_clearance?: number }): Promise<void> {
  const { error } = await S.from("cmeie_cross_border").insert(input);
  if (error) throw error;
}

export async function getCrossBorderChecksCMEIE(campaignId: string) {
  const { data, error } = await S.from("cmeie_cross_border").select("*").eq("campaign_id", campaignId).order("checked_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Fraud Flags ---
export async function flagCampaignFraud(input: { campaign_id?: string; contribution_id?: string; flagged_user_id?: string; flag_type: string; severity?: string; description?: string; evidence?: Record<string, unknown> }): Promise<string> {
  const { data, error } = await S.from("cmeie_fraud_flags").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getCampaignFraudFlags(campaignId: string) {
  const { data, error } = await S.from("cmeie_fraud_flags").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function resolveCampaignFraud(id: string, reviewerId: string): Promise<void> {
  const { error } = await S.from("cmeie_fraud_flags").update({ status: "resolved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Performance Index ---
export async function savePerformanceIndex(input: PerformanceIndexInput): Promise<void> {
  const composite = computeCampaignPerformance(input);
  const { error } = await S.from("cmeie_performance_index").upsert({ ...input, composite_performance: composite, computed_at: new Date().toISOString() }, { onConflict: "campaign_id" });
  if (error) throw error;
}

export async function getPerformanceIndex(campaignId: string) {
  const { data, error } = await S.from("cmeie_performance_index").select("*").eq("campaign_id", campaignId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Startup Rounds ---
export async function createStartupRound(input: StartupRoundInput): Promise<string> {
  const { data, error } = await S.from("cmeie_startup_rounds").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getStartupRounds(campaignId: string) {
  const { data, error } = await S.from("cmeie_startup_rounds").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateStartupRound(id: string, updates: Partial<StartupRoundInput> & { raised_amount?: number; status?: string }): Promise<void> {
  const { error } = await S.from("cmeie_startup_rounds").update(updates).eq("id", id);
  if (error) throw error;
}

// --- Impact Tracking ---
export async function saveImpactTracking(input: ImpactTrackingInput): Promise<void> {
  const { error } = await S.from("cmeie_impact_tracking").upsert({ ...input, tracked_at: new Date().toISOString() }, { onConflict: "campaign_id" });
  if (error) throw error;
}

export async function getImpactTracking(campaignId: string) {
  const { data, error } = await S.from("cmeie_impact_tracking").select("*").eq("campaign_id", campaignId).maybeSingle();
  if (error) throw error;
  return data;
}
