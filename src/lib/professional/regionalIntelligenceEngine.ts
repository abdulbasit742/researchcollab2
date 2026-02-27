/**
 * Regional Professional Intelligence Engine (RPIE)
 * Beyond Facebook Local — regional innovation coordination infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const HUB_TYPES = ["city", "state_province", "country", "economic_zone", "innovation_district", "university_cluster", "startup_ecosystem", "cross_border_corridor"] as const;
export type HubType = typeof HUB_TYPES[number];

export const SKILL_GAP_SEVERITY = ["none", "low", "moderate", "high", "critical"] as const;
export const BRAIN_DRAIN_RISK = ["low", "moderate", "high", "critical"] as const;

export const MEMORY_TYPES = ["innovation_wave", "funding_cycle", "startup_boom", "policy_shift", "institutional_growth", "economic_transformation", "cross_border_expansion"] as const;
export type MemoryType = typeof MEMORY_TYPES[number];

export const MATCH_TYPES = ["collaborator", "co_founder", "grant_team", "cross_institution", "skill_complement", "innovation_cluster"] as const;
export type MatchType = typeof MATCH_TYPES[number];

export const RPIE_PHILOSOPHY = {
  category: "Regional Professional Intelligence",
  contrast: "Facebook Local shows neighborhood activity; RPIE coordinates innovation ecosystems",
  principle: "Regional data drives economic transformation, not engagement",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface RegionalHubInput {
  hub_name: string;
  hub_type: HubType;
  country_code?: string;
  state_province?: string;
  city?: string;
  economic_zone?: string;
  parent_hub_id?: string;
  domain_specializations?: unknown[];
  managed_by_institution_id?: string;
}

export interface SkillMappingInput {
  hub_id: string;
  skill_name: string;
  concentration_score?: number;
  gap_severity?: string;
  growth_rate?: number;
  saturation_index?: number;
  talent_import_ratio?: number;
  talent_export_ratio?: number;
  institutional_specialization?: unknown[];
  cross_domain_integration?: unknown[];
}

export interface FundingClusterInput {
  hub_id: string;
  period: string;
  grant_volume?: number;
  venture_funding_density?: number;
  institutional_funding_performance?: number;
  cross_border_capital_flow?: number;
  industry_rd_spending?: number;
  public_funding_concentration?: number;
  domain_specific_acceleration?: Record<string, unknown>;
  trend_data?: unknown[];
}

export interface StartupAnalyticsInput {
  hub_id: string;
  period: string;
  formation_rate?: number;
  survival_rate?: number;
  funding_stage_progression?: Record<string, unknown>;
  patent_to_product_conversion?: number;
  industry_pilot_success?: number;
  founder_trust_density?: number;
  cross_border_scaling_rate?: number;
  exit_events?: number;
}

export interface CrossBorderCorridorInput {
  source_hub_id: string;
  target_hub_id: string;
  collaboration_strength?: number;
  funding_exchange_volume?: number;
  institutional_bridges?: number;
  startup_scaling_pathways?: number;
  skill_mobility_flow?: number;
  policy_alignment_score?: number;
  trust_weighted_strength?: number;
  metadata?: Record<string, unknown>;
}

export interface TrustDensityInput {
  hub_id: string;
  period: string;
  avg_trust_index?: number;
  execution_reliability_rate?: number;
  funding_compliance_stability?: number;
  collaboration_longevity?: number;
  dispute_frequency?: number;
  institutional_integrity_score?: number;
}

export interface IndustryIntegrationInput {
  hub_id: string;
  period: string;
  corporate_rd_presence?: unknown[];
  industry_academia_collaboration?: number;
  patent_commercialization_rate?: number;
  pilot_deployment_activity?: number;
  industry_funding_inflow?: number;
  innovation_adoption_velocity?: number;
}

export interface PerformanceIndexInput {
  hub_id: string;
  period: string;
  innovation_output_score?: number;
  funding_efficiency_score?: number;
  startup_survival_score?: number;
  trust_density_score?: number;
  cross_border_connectivity_score?: number;
  skill_specialization_depth?: number;
  institutional_collaboration_strength?: number;
  economic_impact_multiplier?: number;
}

export interface TalentMobilityInput {
  hub_id: string;
  period: string;
  talent_inflow?: number;
  talent_outflow?: number;
  brain_drain_risk?: string;
  institutional_transfers?: number;
  cross_border_migration?: number;
  domain_specialization_migration?: Record<string, unknown>;
  funding_relocation_volume?: number;
}

export interface RegionalMemoryInput {
  hub_id: string;
  memory_type: MemoryType;
  title: string;
  description?: string;
  event_date?: string;
  impact_data?: Record<string, unknown>;
  related_entities?: unknown[];
  archived_by?: string;
}

export interface CollaborationMatchInput {
  hub_id: string;
  match_type: MatchType;
  entity_a_id: string;
  entity_a_type: string;
  entity_b_id: string;
  entity_b_type: string;
  compatibility_score?: number;
  skill_complementarity?: Record<string, unknown>;
  trust_alignment?: number;
}

export interface HubSearchFilters {
  hub_type?: HubType;
  country_code?: string;
  status?: string;
  limit?: number;
}

// ─── Regional Hubs ──────────────────────────────────────────
export async function createRegionalHub(input: RegionalHubInput) {
  const { data, error } = await (supabase as any).from("rpie_regional_hubs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getRegionalHubs(filters: HubSearchFilters = {}) {
  let q = (supabase as any).from("rpie_regional_hubs").select("*").eq("status", "active").order("trust_density", { ascending: false });
  if (filters.hub_type) q = q.eq("hub_type", filters.hub_type);
  if (filters.country_code) q = q.eq("country_code", filters.country_code);
  if (filters.limit) q = q.limit(filters.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getRegionalHub(hubId: string) {
  const { data, error } = await (supabase as any).from("rpie_regional_hubs").select("*").eq("id", hubId).single();
  if (error) throw error;
  return data;
}

export async function updateRegionalHub(hubId: string, updates: Partial<RegionalHubInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("rpie_regional_hubs").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", hubId).select().single();
  if (error) throw error;
  return data;
}

// ─── Skill Mapping ──────────────────────────────────────────
export async function saveSkillMapping(input: SkillMappingInput) {
  const { data, error } = await (supabase as any).from("rpie_skill_mapping").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSkillMapping(hubId: string) {
  const { data, error } = await (supabase as any).from("rpie_skill_mapping").select("*").eq("hub_id", hubId).order("concentration_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Funding Clusters ──────────────────────────────────────
export async function saveFundingCluster(input: FundingClusterInput) {
  const { data, error } = await (supabase as any).from("rpie_funding_clusters").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getFundingClusters(hubId?: string, period?: string) {
  let q = (supabase as any).from("rpie_funding_clusters").select("*").order("grant_volume", { ascending: false });
  if (hubId) q = q.eq("hub_id", hubId);
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Startup Analytics ─────────────────────────────────────
export async function saveStartupAnalytics(input: StartupAnalyticsInput) {
  const { data, error } = await (supabase as any).from("rpie_startup_analytics").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getStartupAnalytics(hubId?: string, period?: string) {
  let q = (supabase as any).from("rpie_startup_analytics").select("*").order("formation_rate", { ascending: false });
  if (hubId) q = q.eq("hub_id", hubId);
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Cross-Border Corridors ────────────────────────────────
export async function saveCrossBorderCorridor(input: CrossBorderCorridorInput) {
  const { data, error } = await (supabase as any).from("rpie_cross_border_corridors").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCrossBorderCorridors(hubId?: string) {
  let q = (supabase as any).from("rpie_cross_border_corridors").select("*").order("trust_weighted_strength", { ascending: false });
  if (hubId) q = q.or(`source_hub_id.eq.${hubId},target_hub_id.eq.${hubId}`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Trust Density ─────────────────────────────────────────
export async function saveTrustDensity(input: TrustDensityInput) {
  const { data, error } = await (supabase as any).from("rpie_trust_density").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getTrustDensity(hubId: string, period?: string) {
  let q = (supabase as any).from("rpie_trust_density").select("*").eq("hub_id", hubId).order("computed_at", { ascending: false });
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Industry Integration ──────────────────────────────────
export async function saveIndustryIntegrationRPIE(input: IndustryIntegrationInput) {
  const { data, error } = await (supabase as any).from("rpie_industry_integration").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getIndustryIntegrationRPIE(hubId: string, period?: string) {
  let q = (supabase as any).from("rpie_industry_integration").select("*").eq("hub_id", hubId).order("computed_at", { ascending: false });
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Performance Index ─────────────────────────────────────
export async function savePerformanceIndexRPIE(input: PerformanceIndexInput) {
  const composite = (
    (input.innovation_output_score ?? 0) * 0.2 +
    (input.funding_efficiency_score ?? 0) * 0.15 +
    (input.startup_survival_score ?? 0) * 0.15 +
    (input.trust_density_score ?? 0) * 0.15 +
    (input.cross_border_connectivity_score ?? 0) * 0.1 +
    (input.skill_specialization_depth ?? 0) * 0.1 +
    (input.institutional_collaboration_strength ?? 0) * 0.1 +
    (input.economic_impact_multiplier ?? 1) * 5
  );
  const { data, error } = await (supabase as any).from("rpie_performance_index").insert({ ...input, composite_score: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getPerformanceIndexRPIE(period?: string) {
  let q = (supabase as any).from("rpie_performance_index").select("*").order("composite_score", { ascending: false });
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Talent Mobility ───────────────────────────────────────
export async function saveTalentMobility(input: TalentMobilityInput) {
  const { data, error } = await (supabase as any).from("rpie_talent_mobility").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getTalentMobility(hubId: string, period?: string) {
  let q = (supabase as any).from("rpie_talent_mobility").select("*").eq("hub_id", hubId).order("computed_at", { ascending: false });
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Regional Memory ───────────────────────────────────────
export async function saveRegionalMemory(input: RegionalMemoryInput) {
  const { data, error } = await (supabase as any).from("rpie_regional_memory").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getRegionalMemory(hubId: string, memoryType?: string) {
  let q = (supabase as any).from("rpie_regional_memory").select("*").eq("hub_id", hubId).order("event_date", { ascending: false });
  if (memoryType) q = q.eq("memory_type", memoryType);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Collaboration Matching ────────────────────────────────
export async function saveCollaborationMatch(input: CollaborationMatchInput) {
  const { data, error } = await (supabase as any).from("rpie_collaboration_matches").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCollaborationMatches(hubId: string, matchType?: string) {
  let q = (supabase as any).from("rpie_collaboration_matches").select("*").eq("hub_id", hubId).order("compatibility_score", { ascending: false });
  if (matchType) q = q.eq("match_type", matchType);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function acceptCollaborationMatch(matchId: string) {
  const { data, error } = await (supabase as any).from("rpie_collaboration_matches").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("id", matchId).select().single();
  if (error) throw error;
  return data;
}

// ─── Composite Scoring ─────────────────────────────────────
export function computeRegionalCompetitiveness(perf: {
  innovation_output_score: number;
  funding_efficiency_score: number;
  startup_survival_score: number;
  trust_density_score: number;
  cross_border_connectivity_score: number;
  skill_specialization_depth: number;
  institutional_collaboration_strength: number;
  economic_impact_multiplier: number;
}): number {
  return Math.round((
    perf.innovation_output_score * 0.2 +
    perf.funding_efficiency_score * 0.15 +
    perf.startup_survival_score * 0.15 +
    perf.trust_density_score * 0.15 +
    perf.cross_border_connectivity_score * 0.1 +
    perf.skill_specialization_depth * 0.1 +
    perf.institutional_collaboration_strength * 0.1 +
    perf.economic_impact_multiplier * 5
  ) * 100) / 100;
}
