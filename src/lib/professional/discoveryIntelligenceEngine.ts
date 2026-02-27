/**
 * Global Capability Discovery & Network Intelligence Engine
 * Replaces Instagram Explore with capability intelligence.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const DISCOVERY_MODES = [
  "emerging_talent", "innovation_breakthrough", "funding_aligned",
  "skill_demand", "cross_domain", "institutional_network",
  "industry_deployment", "startup_innovation", "research_integrity",
  "global_trend",
] as const;
export type DiscoveryMode = typeof DISCOVERY_MODES[number];

export const DISCOVERY_INTEGRITY_FLAG_TYPES = [
  "engagement_manipulation", "artificial_spike", "coordinated_visibility",
  "paid_discoverability", "clickbait_exploitation", "emotional_manipulation",
] as const;

export const GROWTH_FEED_TYPES = [
  "skill_gap", "adjacent_domain", "funding_trend", "expanding_network",
  "innovation_signal", "industry_shift",
] as const;

export const DISCOVERY_PHILOSOPHY = {
  surfaces: "What's promising, not what's popular",
  amplifies: "Innovation and reliability",
  drives: "Opportunity and collaboration",
  rules: [
    "No trending tab based purely on engagement",
    "No viral-first amplification",
    "No algorithmic black box discovery",
    "Discovery must be intent-driven",
    "Emerging talent must receive visibility",
    "Institutional dominance must not crowd ecosystem",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface DiscoverySessionInput {
  user_id: string;
  discovery_mode: string;
  intent_declaration?: string;
}

export interface EmergingTalentInput {
  user_id: string;
  skill_improvement_rate: number;
  execution_reliability: number;
  project_quality: number;
  domain_emergence: number;
  innovation_depth: number;
  integrity_stability: number;
  follower_count: number;
  capability_score: number;
}

export interface InnovationClusterInput {
  cluster_name: string;
  domain: string;
  region?: string;
  grant_acceleration: number;
  patent_activity: number;
  startup_formation: number;
  industry_adoption: number;
  collaboration_density: number;
  research_to_market: number;
  member_count?: number;
}

export interface CapabilityIndexInput {
  user_id: string;
  skills: string[];
  domains: string[];
  execution_depth: number;
  funding_experience: number;
  patent_involvement: number;
  startup_experience: number;
  compliance_reliability: number;
  collaboration_strength: number;
  geographic_presence: string[];
  institutional_affiliation?: string;
}

export interface DiscoveryExplanation {
  discovery_session_id?: string;
  surfaced_user_id?: string;
  viewer_user_id: string;
  domain_overlap_pct: number;
  skill_alignment_pct: number;
  funding_relevance_pct: number;
  collaboration_probability_pct: number;
  innovation_signal_pct: number;
  geographic_proximity_pct: number;
  explanation_summary?: string;
}

export interface CapabilitySearchFilters {
  skills?: string[];
  domain?: string;
  min_execution_depth?: number;
  min_funding_experience?: number;
  has_patents?: boolean;
  has_startup_experience?: boolean;
  region?: string;
  institution?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const EMERGING_WEIGHTS = {
  skill_improvement: 0.18, execution: 0.16, project_quality: 0.14,
  domain_emergence: 0.12, innovation: 0.14, integrity: 0.12,
  capability: 0.14,
};

export function computeEmergingTalent(input: Omit<EmergingTalentInput, "user_id" | "follower_count">): number {
  return Math.round(
    input.skill_improvement_rate * EMERGING_WEIGHTS.skill_improvement +
    input.execution_reliability * EMERGING_WEIGHTS.execution +
    input.project_quality * EMERGING_WEIGHTS.project_quality +
    input.domain_emergence * EMERGING_WEIGHTS.domain_emergence +
    input.innovation_depth * EMERGING_WEIGHTS.innovation +
    input.integrity_stability * EMERGING_WEIGHTS.integrity +
    input.capability_score * EMERGING_WEIGHTS.capability
  );
}

const CLUSTER_WEIGHTS = {
  grant: 0.18, patent: 0.16, startup: 0.16,
  industry: 0.16, collab: 0.16, r2m: 0.18,
};

export function computeClusterIntensity(input: Omit<InnovationClusterInput, "cluster_name" | "domain" | "region" | "member_count">): number {
  return Math.round(
    input.grant_acceleration * CLUSTER_WEIGHTS.grant +
    input.patent_activity * CLUSTER_WEIGHTS.patent +
    input.startup_formation * CLUSTER_WEIGHTS.startup +
    input.industry_adoption * CLUSTER_WEIGHTS.industry +
    input.collaboration_density * CLUSTER_WEIGHTS.collab +
    input.research_to_market * CLUSTER_WEIGHTS.r2m
  );
}

export function computeCapabilityIndex(input: Omit<CapabilityIndexInput, "user_id" | "skills" | "domains" | "geographic_presence" | "institutional_affiliation">): number {
  return Math.round(
    input.execution_depth * 0.20 +
    input.funding_experience * 0.15 +
    input.patent_involvement * 5 +
    input.startup_experience * 5 +
    input.compliance_reliability * 0.15 +
    input.collaboration_strength * 0.15
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Discovery Sessions (Section 1) ---
export async function startDiscoverySession(input: DiscoverySessionInput): Promise<string> {
  const { data, error } = await supabase.from("discovery_sessions" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getDiscoverySessions(userId: string) {
  const { data, error } = await supabase.from("discovery_sessions" as any).select("*")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Emerging Talent (Section 2) ---
export async function saveEmergingTalent(input: EmergingTalentInput): Promise<void> {
  const composite = computeEmergingTalent(input);
  const { error } = await supabase.from("emerging_talent_signals" as any)
    .upsert({ ...input, composite_emerging: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getEmergingTalent(limit = 20) {
  const { data, error } = await supabase.from("emerging_talent_signals" as any).select("*")
    .order("composite_emerging", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Innovation Clusters (Section 3) ---
export async function saveInnovationCluster(input: InnovationClusterInput): Promise<string> {
  const composite = computeClusterIntensity(input);
  const { data, error } = await supabase.from("innovation_clusters" as any)
    .insert({ ...input, composite_intensity: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInnovationClusters(domain?: string) {
  let query = supabase.from("innovation_clusters" as any).select("*")
    .order("composite_intensity", { ascending: false });
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

// --- Capability Search (Section 4) ---
export async function saveCapabilityIndex(input: CapabilityIndexInput): Promise<void> {
  const composite = computeCapabilityIndex(input);
  const { error } = await supabase.from("capability_search_index" as any)
    .upsert({ ...input, composite_capability: composite, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function searchCapabilities(filters: CapabilitySearchFilters) {
  let query = supabase.from("capability_search_index" as any).select("*")
    .order("composite_capability", { ascending: false });
  if (filters.domain) query = query.contains("domains", [filters.domain]);
  if (filters.min_execution_depth) query = query.gte("execution_depth", filters.min_execution_depth);
  if (filters.min_funding_experience) query = query.gte("funding_experience", filters.min_funding_experience);
  if (filters.has_patents) query = query.gt("patent_involvement", 0);
  if (filters.has_startup_experience) query = query.gt("startup_experience", 0);
  if (filters.region) query = query.contains("geographic_presence", [filters.region]);
  if (filters.institution) query = query.eq("institutional_affiliation", filters.institution);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

// --- Fairness Config (Section 7) ---
export async function getFairnessConfig() {
  const { data, error } = await supabase.from("discovery_fairness_config" as any).select("*")
    .eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}

// --- Discovery Integrity Flags (Section 8) ---
export async function flagDiscoveryIntegrity(input: { user_id: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string }): Promise<string> {
  const { data, error } = await supabase.from("discovery_integrity_flags" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

// --- Growth Feed (Section 9) ---
export async function getCapabilityGrowthFeed(userId: string) {
  const { data, error } = await supabase.from("capability_growth_feed" as any).select("*")
    .eq("user_id", userId).eq("is_read", false).order("relevance_score", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function addGrowthFeedItem(input: { user_id: string; feed_type: string; title: string; description?: string; domain?: string; relevance_score?: number; metadata?: Record<string, unknown> }): Promise<void> {
  const { error } = await supabase.from("capability_growth_feed" as any).insert(input);
  if (error) throw error;
}

// --- Explanations (Section 14) ---
export async function saveDiscoveryExplanation(input: DiscoveryExplanation): Promise<void> {
  const { error } = await supabase.from("discovery_explanations" as any).insert(input);
  if (error) throw error;
}

export async function getDiscoveryExplanations(viewerUserId: string, sessionId?: string) {
  let query = supabase.from("discovery_explanations" as any).select("*")
    .eq("viewer_user_id", viewerUserId).order("created_at", { ascending: false });
  if (sessionId) query = query.eq("discovery_session_id", sessionId);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}
