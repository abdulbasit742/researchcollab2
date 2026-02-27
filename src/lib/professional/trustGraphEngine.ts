/**
 * Professional Trust Graph Engine (PTGE)
 * Replaces follower graph with trust-based professional network.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const TRUST_MANIPULATION_TYPES = [
  "artificial_collab_loop", "trust_stacking", "coordinated_endorsement",
  "low_value_inflation", "institutional_favoritism", "reciprocal_rating",
] as const;

export const TRUST_EVENT_TYPES = [
  "milestone_completed", "funding_managed", "dispute_resolved",
  "project_renewed", "repeat_collaboration", "industry_deployment",
  "repeated_delay", "budget_deviation", "integrity_flag",
  "compliance_failure", "project_abandonment", "unresolved_dispute",
] as const;

export const PTGE_PHILOSOPHY = {
  graph: "Trust network, not follower network",
  connections: "Reliability, not visibility",
  amplifies: "Who can be trusted",
  relationships: "Operational, not symbolic",
  rules: [
    "No trust based on follower count",
    "No automatic trust inheritance",
    "Trust earned through execution",
    "Trust decays if performance declines",
    "Trust must be explainable",
    "Negative signals must be reviewable",
    "Trust must be contextual (domain-specific)",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface TrustEdgeInput {
  source_user_id: string;
  target_user_id: string;
  domain?: string;
  joint_projects?: number;
  grant_collab_history?: number;
  milestone_punctuality?: number;
  budget_compliance?: number;
  deliverable_acceptance?: number;
  dispute_resolution?: number;
  industry_deployment?: number;
  cross_border_stability?: number;
  peer_validation_overlap?: number;
  compliance_alignment?: number;
}

export interface DomainTrustInput {
  user_id: string;
  domain: string;
  domain_trust: number;
  collaboration_stability: number;
  funding_integrity: number;
  execution_reliability: number;
}

export interface GlobalTrustInput {
  user_id: string;
  global_trust: number;
  collaboration_stability: number;
  funding_integrity: number;
  execution_reliability: number;
  trust_breakdown?: Record<string, unknown>;
}

export interface TrustEventInput {
  user_id: string;
  event_type: string;
  direction: "increase" | "decrease";
  domain?: string;
  delta: number;
  reason: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface TrustCompatInput {
  user_a_id: string;
  user_b_id: string;
  trust_compat_pct: number;
  domain_overlap_pct: number;
  reliability_alignment_pct: number;
  funding_risk_compat: number;
  collaboration_probability: number;
}

export interface TeamTrustInput {
  project_id?: string;
  team_name?: string;
  member_ids: string[];
  cohesion_score: number;
  historical_success: number;
  repeat_funding_rate: number;
  milestone_punctuality: number;
  conflict_frequency: number;
  innovation_consistency: number;
}

export interface InstitutionalTrustInput {
  institution_a_id: string;
  institution_b_id?: string;
  grant_reliability: number;
  compliance_alignment: number;
  partnership_stability: number;
  patent_co_ownership: number;
  funding_continuity: number;
  industry_co_deployment: number;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const EDGE_WEIGHTS = {
  joint_projects: 0.12, grant_collab: 0.10, milestone: 0.12,
  budget: 0.10, deliverable: 0.12, dispute: 0.10,
  industry: 0.10, cross_border: 0.08, peer_val: 0.08, compliance: 0.08,
};

export function computeEdgeWeight(input: Omit<TrustEdgeInput, "source_user_id" | "target_user_id" | "domain">): number {
  return Math.round(
    (input.joint_projects ?? 0) * EDGE_WEIGHTS.joint_projects +
    (input.grant_collab_history ?? 0) * EDGE_WEIGHTS.grant_collab +
    (input.milestone_punctuality ?? 0) * EDGE_WEIGHTS.milestone +
    (input.budget_compliance ?? 0) * EDGE_WEIGHTS.budget +
    (input.deliverable_acceptance ?? 0) * EDGE_WEIGHTS.deliverable +
    (input.dispute_resolution ?? 0) * EDGE_WEIGHTS.dispute +
    (input.industry_deployment ?? 0) * EDGE_WEIGHTS.industry +
    (input.cross_border_stability ?? 0) * EDGE_WEIGHTS.cross_border +
    (input.peer_validation_overlap ?? 0) * EDGE_WEIGHTS.peer_val +
    (input.compliance_alignment ?? 0) * EDGE_WEIGHTS.compliance
  );
}

const TEAM_WEIGHTS = {
  cohesion: 0.18, success: 0.18, funding: 0.14,
  punctuality: 0.16, conflict: -0.16, innovation: 0.18,
};

export function computeTeamTrust(input: Omit<TeamTrustInput, "project_id" | "team_name" | "member_ids">): number {
  return Math.round(
    input.cohesion_score * TEAM_WEIGHTS.cohesion +
    input.historical_success * TEAM_WEIGHTS.success +
    input.repeat_funding_rate * TEAM_WEIGHTS.funding +
    input.milestone_punctuality * TEAM_WEIGHTS.punctuality +
    input.conflict_frequency * TEAM_WEIGHTS.conflict +
    input.innovation_consistency * TEAM_WEIGHTS.innovation
  );
}

const INST_WEIGHTS = {
  grant: 0.18, compliance: 0.16, partnership: 0.18,
  patent: 0.14, funding: 0.18, industry: 0.16,
};

export function computeInstitutionalTrust(input: Omit<InstitutionalTrustInput, "institution_a_id" | "institution_b_id">): number {
  return Math.round(
    input.grant_reliability * INST_WEIGHTS.grant +
    input.compliance_alignment * INST_WEIGHTS.compliance +
    input.partnership_stability * INST_WEIGHTS.partnership +
    input.patent_co_ownership * INST_WEIGHTS.patent +
    input.funding_continuity * INST_WEIGHTS.funding +
    input.industry_co_deployment * INST_WEIGHTS.industry
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Trust Edges (Section 1) ---
export async function saveTrustEdge(input: TrustEdgeInput): Promise<void> {
  const weight = computeEdgeWeight(input);
  const { error } = await supabase.from("trust_edges" as any)
    .upsert({ ...input, edge_weight: weight, updated_at: new Date().toISOString() }, { onConflict: "source_user_id,target_user_id,domain" });
  if (error) throw error;
}

export async function getTrustEdges(userId: string) {
  const { data, error } = await supabase.from("trust_edges" as any).select("*")
    .or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`)
    .order("edge_weight", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

// --- Domain Trust (Section 2) ---
export async function saveDomainTrust(input: DomainTrustInput): Promise<void> {
  const { error } = await supabase.from("domain_trust_index" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "user_id,domain" });
  if (error) throw error;
}

export async function getDomainTrust(userId: string, domain?: string) {
  let query = supabase.from("domain_trust_index" as any).select("*").eq("user_id", userId);
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("domain_trust", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Global Trust (Section 3) ---
export async function saveGlobalTrust(input: GlobalTrustInput): Promise<void> {
  const { error } = await supabase.from("global_trust_index" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getGlobalTrust(userId: string) {
  const { data, error } = await supabase.from("global_trust_index" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Trust Events (Section 4) ---
export async function recordTrustEvent(input: TrustEventInput): Promise<void> {
  const { error } = await supabase.from("trust_evolution_events" as any).insert(input);
  if (error) throw error;
}

export async function getTrustEvents(userId: string, limit = 30) {
  const { data, error } = await supabase.from("trust_evolution_events" as any).select("*")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Trust Compatibility (Section 6) ---
export async function saveTrustCompat(input: TrustCompatInput): Promise<void> {
  const { error } = await supabase.from("trust_compatibility_checks" as any).insert(input);
  if (error) throw error;
}

export async function getTrustCompat(userAId: string, userBId: string) {
  const { data, error } = await supabase.from("trust_compatibility_checks" as any).select("*")
    .eq("user_a_id", userAId).eq("user_b_id", userBId)
    .order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Trust Manipulation Flags (Section 8) ---
export async function flagTrustManipulation(input: { user_id: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string }): Promise<string> {
  const { data, error } = await supabase.from("trust_manipulation_flags" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTrustManipFlags(userId: string) {
  const { data, error } = await supabase.from("trust_manipulation_flags" as any).select("*")
    .eq("user_id", userId).eq("resolved", false);
  if (error) throw error;
  return data ?? [];
}

// --- Team Trust (Section 9) ---
export async function saveTeamTrust(input: TeamTrustInput): Promise<string> {
  const composite = computeTeamTrust(input);
  const { data, error } = await supabase.from("team_trust_index" as any)
    .insert({ ...input, composite_team_trust: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTeamTrust(projectId: string) {
  const { data, error } = await supabase.from("team_trust_index" as any).select("*")
    .eq("project_id", projectId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Institutional Trust (Section 11) ---
export async function saveInstitutionalTrust(input: InstitutionalTrustInput): Promise<string> {
  const composite = computeInstitutionalTrust(input);
  const { data, error } = await supabase.from("institutional_trust_scores" as any)
    .insert({ ...input, composite_inst_trust: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInstitutionalTrust(institutionId: string) {
  const { data, error } = await supabase.from("institutional_trust_scores" as any).select("*")
    .or(`institution_a_id.eq.${institutionId},institution_b_id.eq.${institutionId}`)
    .order("composite_inst_trust", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}
