/**
 * Professional Civilization Network Architecture (PCNA)
 * Capstone layer unifying all subsystems into a coherent civilization network.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const FIVE_PILLARS = [
  { name: "identity_trust", label: "Identity & Trust" },
  { name: "execution_funding", label: "Execution & Funding" },
  { name: "innovation_knowledge", label: "Innovation & Knowledge" },
  { name: "institutional_ecosystem", label: "Institutional & Ecosystem" },
  { name: "intelligence_growth", label: "Intelligence & Growth" },
] as const;
export type PillarName = typeof FIVE_PILLARS[number]["name"];

export const GRAPH_ENTITY_TYPES = [
  "user", "institution", "grant", "project", "milestone", "escrow",
  "patent", "startup", "industry_deployment", "skill", "domain",
  "funding_source", "compliance_record", "initiative", "movement", "career",
] as const;
export type GraphEntityType = typeof GRAPH_ENTITY_TYPES[number];

export const SCORING_DIMENSIONS = [
  "execution_reliability", "trust_index", "innovation_index",
  "funding_impact", "skill_mastery", "collaboration_stability",
  "integrity_confidence", "institutional_influence",
  "economic_contribution", "longitudinal_stability",
] as const;
export type ScoringDimension = typeof SCORING_DIMENSIONS[number];

export const INTEGRITY_SIGNAL_TYPES = [
  "engagement_manipulation", "trust_inflation", "citation_ring",
  "funding_misuse", "patent_inflation", "collaboration_cartel",
  "institutional_gaming", "reputation_volatility",
] as const;

export const ARCHIVAL_RECORD_TYPES = [
  "audit_log", "career_snapshot", "initiative_history",
  "innovation_wave", "funding_regime", "institutional_trajectory",
  "knowledge_preservation", "trust_evolution",
] as const;

export const DESIGN_PRINCIPLES = {
  noAddictiveMechanics: true,
  noEngagementDominance: true,
  noFollowerAuthority: true,
  noAlgorithmicOpacity: true,
  noVanityPrioritization: true,
  allScoresExplainable: true,
  escrowProtectsFlow: true,
  integrityEmbedded: true,
  trustMeasurable: true,
  infrastructureGrade: true,
} as const;

export const STRATEGIC_POSITIONING = {
  is: "Infrastructure, not platform",
  engine: "Trust engine, not attention engine",
  network: "Execution network, not entertainment network",
  os: "Professional operating system, not content feed",
  memory: "Civilization memory, not ephemeral content stream",
  designedToLast: "50+ years",
} as const;

export const CATEGORY_DEFINITION = {
  instagram: "Social media",
  rcollab: "Professional civilization infrastructure",
  instagramOptimizes: "Engagement",
  rcollabOptimizes: "Execution",
  instagramRewards: "Visibility",
  rcollabRewards: "Capability",
  instagramBuilds: "Attention networks",
  rcollabBuilds: "Trust networks",
  instagramCreates: "Influencers",
  rcollabCreates: "Leverage",
  instagramDrives: "Cultural trends",
  rcollabDrives: "Economic & innovation impact",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface GraphNodeInput {
  entity_type: string;
  entity_id: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdgeInput {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface DimensionScoreInput {
  user_id: string;
  dimension: string;
  score: number;
  breakdown?: Record<string, unknown>;
  domain_context?: string;
}

export interface DiscoveryIndexInput {
  user_id: string;
  capability_score: number;
  depth_score: number;
  emerging_excellence: number;
  cross_domain_synergy: number;
  innovation_cluster_membership?: Record<string, unknown>[];
  trust_weighted_exposure: number;
  discovery_explanation?: Record<string, unknown>;
}

export interface IntegritySignalInput {
  target_user_id?: string;
  target_entity_id?: string;
  signal_type: string;
  severity?: string;
  description?: string;
  evidence?: Record<string, unknown>;
}

export interface SessionWellnessInput {
  user_id: string;
  total_session_minutes: number;
  intentional_sessions: number;
  deep_interactions: number;
  reflection_prompted?: boolean;
  focus_mode_minutes?: number;
}

export interface PlatformMetricsInput {
  metric_period: string;
  funding_efficiency: number;
  execution_reliability: number;
  innovation_output: number;
  trust_density: number;
  career_compounding: number;
  institutional_stability: number;
  cross_border_collaboration: number;
  economic_impact: number;
}

export interface ArchivalRecordInput {
  record_type: string;
  entity_type?: string;
  entity_id?: string;
  snapshot_data?: Record<string, unknown>;
  retention_years?: number;
  export_format?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeCivilizationScore(input: Omit<PlatformMetricsInput, "metric_period">): number {
  return Math.round(
    input.funding_efficiency * 0.14 +
    input.execution_reliability * 0.16 +
    input.innovation_output * 0.13 +
    input.trust_density * 0.13 +
    input.career_compounding * 0.10 +
    input.institutional_stability * 0.12 +
    input.cross_border_collaboration * 0.10 +
    input.economic_impact * 0.12
  );
}

export function computeDiscoveryScore(input: Omit<DiscoveryIndexInput, "user_id" | "innovation_cluster_membership" | "discovery_explanation">): number {
  return Math.round(
    input.capability_score * 0.25 +
    input.depth_score * 0.20 +
    input.emerging_excellence * 0.20 +
    input.cross_domain_synergy * 0.15 +
    input.trust_weighted_exposure * 0.20
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- System Pillars (Section 1) ---
export async function savePillarHealth(pillar: PillarName, healthScore: number, subsystemCount: number, integrationDensity: number): Promise<void> {
  const { error } = await supabase.from("pcna_system_pillars" as any)
    .upsert({ pillar_name: pillar, pillar_category: pillar, health_score: healthScore, subsystem_count: subsystemCount, integration_density: integrationDensity, last_assessed_at: new Date().toISOString() }, { onConflict: "pillar_name" });
  if (error) throw error;
}

export async function getPillarHealth() {
  const { data, error } = await supabase.from("pcna_system_pillars" as any).select("*");
  if (error) throw error;
  return data ?? [];
}

// --- Professional Graph (Section 2) ---
export async function addGraphNode(input: GraphNodeInput): Promise<string> {
  const { data, error } = await supabase.from("professional_graph_nodes" as any)
    .upsert(input, { onConflict: "entity_type,entity_id" }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGraphNodes(entityType?: string) {
  let query = supabase.from("professional_graph_nodes" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  const { data, error } = await query.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function addGraphEdge(input: GraphEdgeInput): Promise<string> {
  const { data, error } = await supabase.from("professional_graph_edges" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGraphEdges(entityType?: string, entityId?: string) {
  let query = supabase.from("professional_graph_edges" as any).select("*");
  if (entityType && entityId) {
    query = query.or(`source_type.eq.${entityType},target_type.eq.${entityType}`);
  }
  const { data, error } = await query.limit(500);
  if (error) throw error;
  return data ?? [];
}

// --- Dimension Scores (Section 3) ---
export async function saveDimensionScore(input: DimensionScoreInput): Promise<void> {
  const { error } = await supabase.from("professional_dimension_scores" as any).insert(input);
  if (error) throw error;
}

export async function getDimensionScores(userId: string) {
  const { data, error } = await supabase.from("professional_dimension_scores" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

// --- Discovery Index (Section 5) ---
export async function saveDiscoveryIndex(input: DiscoveryIndexInput): Promise<void> {
  const { error } = await supabase.from("professional_discovery_index" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getDiscoveryIndex(userId: string) {
  const { data, error } = await supabase.from("professional_discovery_index" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Integrity Signals (Section 8) ---
export async function flagIntegritySignal(input: IntegritySignalInput): Promise<string> {
  const { data, error } = await supabase.from("pcna_integrity_signals" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getIntegritySignals(userId?: string) {
  let query = supabase.from("pcna_integrity_signals" as any).select("*");
  if (userId) query = query.eq("target_user_id", userId);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function resolveIntegritySignal(id: string, resolution: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.from("pcna_integrity_signals" as any)
    .update({ resolution, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Session Wellness (Section 13) ---
export async function saveSessionWellness(input: SessionWellnessInput): Promise<void> {
  const { error } = await supabase.from("pcna_session_wellness" as any).insert(input);
  if (error) throw error;
}

export async function getSessionWellness(userId: string, limit = 30) {
  const { data, error } = await supabase.from("pcna_session_wellness" as any).select("*")
    .eq("user_id", userId).order("session_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Platform Metrics (Section 15) ---
export async function savePlatformMetrics(input: PlatformMetricsInput): Promise<void> {
  const composite = computeCivilizationScore(input);
  const { error } = await supabase.from("pcna_platform_metrics" as any)
    .upsert({ ...input, composite_civilization_score: composite, computed_at: new Date().toISOString() }, { onConflict: "metric_period" });
  if (error) throw error;
}

export async function getPlatformMetrics(limit = 12) {
  const { data, error } = await supabase.from("pcna_platform_metrics" as any).select("*")
    .order("computed_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Archival Records (Section 12) ---
export async function createArchivalRecord(input: ArchivalRecordInput): Promise<string> {
  const { data, error } = await supabase.from("pcna_archival_records" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getArchivalRecords(recordType?: string, limit = 50) {
  let query = supabase.from("pcna_archival_records" as any).select("*");
  if (recordType) query = query.eq("record_type", recordType);
  const { data, error } = await query.order("archived_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
