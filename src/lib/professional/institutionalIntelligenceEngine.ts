/**
 * Institutional Intelligence & Media Engine (IIME)
 * Replaces Instagram brand pages with institutional operating channels.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const CHANNEL_TYPES = [
  "department", "lab", "research_center", "innovation_hub", "startup_incubator",
] as const;
export type ChannelType = typeof CHANNEL_TYPES[number];

export const TIMELINE_EVENT_TYPES = [
  "grant_awarded", "research_breakthrough", "patent_filing", "industry_deployment",
  "startup_launch", "global_partnership", "policy_advisory", "compliance_milestone",
  "leadership_appointment",
] as const;

export const MEDIA_POST_TYPES = [
  "project_highlight", "innovation_breakdown", "funding_strategy",
  "policy_commentary", "startup_case_study", "lab_walkthrough", "collaboration_invite",
] as const;

export const IIME_PHILOSOPHY = {
  identity: "Operational intelligence hub, not brand marketing channel",
  competesFor: "Innovation performance, not attention",
  shows: "Data-backed capability, not aesthetic presence",
  is: "Infrastructure, not marketing",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface InstitutionalProfileInput {
  institution_id: string;
  research_domains?: string[];
  active_grants?: number;
  grant_success_rate?: number;
  funding_diversity_index?: number;
  patent_output?: number;
  startup_spinoffs?: number;
  industry_partnerships?: number;
  compliance_record?: number;
  execution_reliability_index?: number;
  institutional_trust_score?: number;
  innovation_velocity_index?: number;
  cross_border_collab_density?: number;
}

export interface SubChannelInput {
  institution_id: string;
  channel_type: string;
  channel_name: string;
  domain_focus?: string[];
  active_projects?: number;
  grant_portfolio_size?: number;
  milestone_completion_rate?: number;
  collaboration_network_size?: number;
  talent_needs?: string[];
  funding_calls?: number;
}

export interface TimelineEventInput {
  institution_id: string;
  event_type: string;
  title: string;
  description?: string;
  evidence_url?: string;
  event_date?: string;
  metadata?: Record<string, unknown>;
}

export interface ImpactIndexInput {
  institution_id: string;
  funding_efficiency: number;
  execution_reliability: number;
  patent_to_product: number;
  startup_survival_rate: number;
  industry_adoption: number;
  cross_domain_innovation: number;
  research_reproducibility: number;
  compliance_integrity: number;
  talent_retention: number;
  international_collaboration: number;
}

export interface TalentFlowInput {
  institution_id: string;
  incoming_diversity: number;
  outgoing_brain_drain: number;
  alumni_startup_formation: number;
  alumni_grant_success: number;
  alumni_industry_placement: number;
  cross_institution_mobility: number;
  domain_specialization_concentration: number;
}

export interface IndustryIntegrationInput {
  institution_id: string;
  corporate_partnerships: number;
  co_developed_patents: number;
  joint_rd_labs: number;
  pilot_deployments: number;
  licensing_revenue: number;
  long_term_collaborations: number;
  corporate_funding_dependence: number;
}

export interface MediaPostInput {
  institution_id: string;
  sub_channel_id?: string;
  post_type: string;
  title: string;
  content?: string;
  media_url?: string;
  linked_project_id?: string;
  linked_grant_id?: string;
  operational_data_ref?: Record<string, unknown>;
}

export interface CompatibilityInput {
  institution_a_id: string;
  institution_b_id: string;
  domain_overlap_pct: number;
  funding_alignment_pct: number;
  compliance_compat_pct: number;
  collab_history_score: number;
  startup_synergy: number;
  patent_co_ownership_compat: number;
  innovation_complementarity: number;
}

export interface StabilityInput {
  institution_id: string;
  funding_volatility: number;
  leadership_change_impact: number;
  domain_shift_stability: number;
  compliance_consistency: number;
  innovation_durability: number;
  startup_survival_rate: number;
  reputation_volatility: number;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const III_WEIGHTS = {
  funding_efficiency: 0.12, execution_reliability: 0.12, patent_to_product: 0.10,
  startup_survival: 0.10, industry_adoption: 0.10, cross_domain: 0.08,
  reproducibility: 0.10, compliance: 0.10, talent_retention: 0.10, international: 0.08,
};

export function computeImpactIndex(input: Omit<ImpactIndexInput, "institution_id">): number {
  return Math.round(
    input.funding_efficiency * III_WEIGHTS.funding_efficiency +
    input.execution_reliability * III_WEIGHTS.execution_reliability +
    input.patent_to_product * III_WEIGHTS.patent_to_product +
    input.startup_survival_rate * III_WEIGHTS.startup_survival +
    input.industry_adoption * III_WEIGHTS.industry_adoption +
    input.cross_domain_innovation * III_WEIGHTS.cross_domain +
    input.research_reproducibility * III_WEIGHTS.reproducibility +
    input.compliance_integrity * III_WEIGHTS.compliance +
    input.talent_retention * III_WEIGHTS.talent_retention +
    input.international_collaboration * III_WEIGHTS.international
  );
}

export function computeCompatibility(input: Omit<CompatibilityInput, "institution_a_id" | "institution_b_id">): number {
  return Math.round(
    input.domain_overlap_pct * 0.18 +
    input.funding_alignment_pct * 0.14 +
    input.compliance_compat_pct * 0.14 +
    input.collab_history_score * 0.14 +
    input.startup_synergy * 0.14 +
    input.patent_co_ownership_compat * 0.12 +
    input.innovation_complementarity * 0.14
  );
}

export function computeStability(input: Omit<StabilityInput, "institution_id">): number {
  const riskAvg = (
    input.funding_volatility + input.leadership_change_impact + input.reputation_volatility
  ) / 3;
  const stabilityAvg = (
    input.domain_shift_stability + input.compliance_consistency +
    input.innovation_durability + input.startup_survival_rate
  ) / 4;
  return Math.round(stabilityAvg * 0.6 + (100 - riskAvg) * 0.4);
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Operating Profile (Section 1) ---
export async function saveInstitutionalProfile(input: InstitutionalProfileInput): Promise<void> {
  const { error } = await supabase.from("institutional_operating_profiles" as any)
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "institution_id" });
  if (error) throw error;
}

export async function getInstitutionalProfile(institutionId: string) {
  const { data, error } = await supabase.from("institutional_operating_profiles" as any).select("*")
    .eq("institution_id", institutionId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Sub-Channels (Section 2) ---
export async function createSubChannel(input: SubChannelInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_sub_channels" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getSubChannels(institutionId: string) {
  const { data, error } = await supabase.from("institutional_sub_channels" as any).select("*")
    .eq("institution_id", institutionId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Timeline (Section 3) ---
export async function addTimelineEvent(input: TimelineEventInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_timeline_events" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTimeline(institutionId: string, limit = 50) {
  const { data, error } = await supabase.from("institutional_timeline_events" as any).select("*")
    .eq("institution_id", institutionId).order("event_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Impact Index (Section 4) ---
export async function saveImpactIndex(input: ImpactIndexInput): Promise<void> {
  const composite = computeImpactIndex(input);
  const { error } = await supabase.from("institutional_impact_index" as any)
    .upsert({ ...input, composite_iii: composite, computed_at: new Date().toISOString() }, { onConflict: "institution_id" });
  if (error) throw error;
}

export async function getImpactIndex(institutionId: string) {
  const { data, error } = await supabase.from("institutional_impact_index" as any).select("*")
    .eq("institution_id", institutionId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Talent Flow (Section 6) ---
export async function saveTalentFlow(input: TalentFlowInput): Promise<void> {
  const { error } = await supabase.from("institutional_talent_flow" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "institution_id" });
  if (error) throw error;
}

export async function getTalentFlow(institutionId: string) {
  const { data, error } = await supabase.from("institutional_talent_flow" as any).select("*")
    .eq("institution_id", institutionId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Industry Integration (Section 7) ---
export async function saveIndustryIntegration(input: IndustryIntegrationInput): Promise<void> {
  const { error } = await supabase.from("institutional_industry_integration" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "institution_id" });
  if (error) throw error;
}

export async function getIndustryIntegration(institutionId: string) {
  const { data, error } = await supabase.from("institutional_industry_integration" as any).select("*")
    .eq("institution_id", institutionId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Media Posts (Section 9) ---
export async function publishMediaPost(input: MediaPostInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_media_posts" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getMediaPosts(institutionId: string, postType?: string) {
  let query = supabase.from("institutional_media_posts" as any).select("*")
    .eq("institution_id", institutionId).order("published_at", { ascending: false });
  if (postType) query = query.eq("post_type", postType);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

// --- Compatibility (Section 13) ---
export async function saveInstitutionCompat(input: CompatibilityInput): Promise<void> {
  const composite = computeCompatibility(input);
  const { error } = await supabase.from("institution_compatibility_checks" as any)
    .insert({ ...input, composite_compat: composite });
  if (error) throw error;
}

export async function getInstitutionCompat(institutionAId: string, institutionBId?: string) {
  let query = supabase.from("institution_compatibility_checks" as any).select("*")
    .or(`institution_a_id.eq.${institutionAId},institution_b_id.eq.${institutionAId}`)
    .order("composite_compat", { ascending: false });
  if (institutionBId) query = query.or(`institution_a_id.eq.${institutionBId},institution_b_id.eq.${institutionBId}`);
  const { data, error } = await query.limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Stability (Section 14) ---
export async function saveInstitutionalStability(input: StabilityInput): Promise<void> {
  const composite = computeStability(input);
  const { error } = await supabase.from("institutional_stability_scores" as any)
    .upsert({ ...input, composite_stability: composite, computed_at: new Date().toISOString() }, { onConflict: "institution_id" });
  if (error) throw error;
}

export async function getInstitutionalStability(institutionId: string) {
  const { data, error } = await supabase.from("institutional_stability_scores" as any).select("*")
    .eq("institution_id", institutionId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Rankings (Section 11) ---
export async function getInstitutionalRankings(limit = 20) {
  const { data, error } = await supabase.from("institutional_impact_index" as any).select("*")
    .order("composite_iii", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
