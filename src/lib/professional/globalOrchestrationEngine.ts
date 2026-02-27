/**
 * Global Professional Orchestration Engine (GPOE)
 * Transforms RCollab from social platform into global coordination infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const PARTICIPANT_ROLES = [
  "lead_institution", "co_institution", "domain_specialist", "technical_contributor",
  "funding_sponsor", "industry_deployment_partner", "policy_advisor",
  "compliance_auditor", "data_contributor", "innovation_analyst",
] as const;
export type ParticipantRole = typeof PARTICIPANT_ROLES[number];

export const INITIATIVE_STATUSES = ["draft", "recruiting", "active", "executing", "completed", "archived"] as const;

export const MEMORY_EVENT_TYPES = [
  "milestone_change", "funding_shift", "participant_joined", "participant_left",
  "outcome_realized", "risk_escalation", "phase_transition", "lesson_learned",
] as const;

export const GPOE_PHILOSOPHY = {
  organizes: "Execution movements, not attention movements",
  mobilizes: "Professionals, not hashtags",
  coordinates: "Innovation waves, not engagement waves",
  builds: "Economic transformation, not cultural trends",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface InitiativeInput {
  created_by: string;
  title: string;
  problem_statement?: string;
  domain_classification?: string[];
  geographic_scope?: string[];
  required_skills?: string[];
  funding_structure?: Record<string, unknown>;
  milestone_roadmap?: Record<string, unknown>[];
  compliance_requirements?: string[];
  institutional_partners?: string[];
  execution_phases?: Record<string, unknown>[];
  expected_outcomes?: Record<string, unknown>[];
  impact_metrics?: Record<string, unknown>;
  governance_structure?: Record<string, unknown>;
  status?: string;
}

export interface ParticipantInput {
  initiative_id: string;
  user_id?: string;
  institution_id?: string;
  role: string;
  responsibilities?: string[];
}

export interface EcosystemAlignmentInput {
  initiative_id: string;
  existing_grants_alignment: number;
  institutional_strategy_alignment: number;
  industry_demand_alignment: number;
  startup_ecosystem_alignment: number;
  patent_cluster_alignment: number;
  national_priority_alignment: number;
  skill_supply_alignment: number;
  innovation_velocity: number;
}

export interface MobilizationInput {
  initiative_id: string;
  active_participants?: number;
  geographic_distribution?: Record<string, unknown>;
  funding_secured?: number;
  milestones_completed?: number;
  skill_coverage_pct?: number;
  trust_density?: number;
  cross_border_diversity?: number;
  risk_exposure?: number;
  timeline_progress_pct?: number;
  industry_engagement_status?: string;
}

export interface CrossBorderInitInput {
  initiative_id: string;
  regulatory_compatibility: number;
  funding_jurisdiction_rules?: Record<string, unknown>;
  ip_ownership_structure?: string;
  compliance_obligations?: string[];
  currency_flows?: Record<string, unknown>;
  data_localization?: string[];
  cultural_friction: number;
  institutional_trust_strength: number;
}

export interface InitiativeFundingInput {
  initiative_id: string;
  source_type: string;
  source_id?: string;
  amount: number;
  currency?: string;
  escrow_protected?: boolean;
  milestone_linked?: string;
  status?: string;
}

export interface GovernanceInput {
  initiative_id: string;
  governance_board_members?: string[];
  compliance_officer_id?: string;
  reporting_cadence?: string;
  dispute_resolution_method?: string;
  conflict_disclosures?: Record<string, unknown>[];
  appeal_mechanism?: string;
}

export interface MovementIndexInput {
  initiative_id: string;
  execution_progress: number;
  funding_efficiency: number;
  innovation_output: number;
  collaboration_density: number;
  compliance_stability: number;
  cross_border_reach: number;
  economic_impact: number;
  long_term_sustainability: number;
}

export interface CoordinationMemoryInput {
  initiative_id: string;
  event_type: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeEcosystemReadiness(input: Omit<EcosystemAlignmentInput, "initiative_id">): number {
  return Math.round(
    input.existing_grants_alignment * 0.15 +
    input.institutional_strategy_alignment * 0.12 +
    input.industry_demand_alignment * 0.14 +
    input.startup_ecosystem_alignment * 0.10 +
    input.patent_cluster_alignment * 0.10 +
    input.national_priority_alignment * 0.12 +
    input.skill_supply_alignment * 0.14 +
    input.innovation_velocity * 0.13
  );
}

export function computeCrossBorderViability(input: Omit<CrossBorderInitInput, "initiative_id" | "funding_jurisdiction_rules" | "ip_ownership_structure" | "compliance_obligations" | "currency_flows" | "data_localization">): number {
  return Math.round(
    input.regulatory_compatibility * 0.30 +
    (100 - input.cultural_friction) * 0.30 +
    input.institutional_trust_strength * 0.40
  );
}

export function computeMovementScore(input: Omit<MovementIndexInput, "initiative_id">): number {
  return Math.round(
    input.execution_progress * 0.18 +
    input.funding_efficiency * 0.14 +
    input.innovation_output * 0.14 +
    input.collaboration_density * 0.12 +
    input.compliance_stability * 0.10 +
    input.cross_border_reach * 0.10 +
    input.economic_impact * 0.12 +
    input.long_term_sustainability * 0.10
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Initiatives (Section 1) ---
export async function createInitiative(input: InitiativeInput): Promise<string> {
  const { data, error } = await supabase.from("global_initiatives" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInitiatives(status?: string) {
  let query = supabase.from("global_initiatives" as any).select("*");
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getInitiative(id: string) {
  const { data, error } = await supabase.from("global_initiatives" as any).select("*")
    .eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Participants (Section 2) ---
export async function addParticipant(input: ParticipantInput): Promise<string> {
  const { data, error } = await supabase.from("initiative_participants" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getParticipants(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_participants" as any).select("*")
    .eq("initiative_id", initiativeId).order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Ecosystem Alignment (Section 3) ---
export async function saveEcosystemAlignment(input: EcosystemAlignmentInput): Promise<void> {
  const score = computeEcosystemReadiness(input);
  const { error } = await supabase.from("ecosystem_alignment_analytics" as any)
    .insert({ ...input, ecosystem_readiness_score: score });
  if (error) throw error;
}

export async function getEcosystemAlignment(initiativeId: string) {
  const { data, error } = await supabase.from("ecosystem_alignment_analytics" as any).select("*")
    .eq("initiative_id", initiativeId).order("computed_at", { ascending: false }).limit(5);
  if (error) throw error;
  return data ?? [];
}

// --- Mobilization (Section 4) ---
export async function saveMobilizationMetrics(input: MobilizationInput): Promise<void> {
  const { error } = await supabase.from("initiative_mobilization_metrics" as any)
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "initiative_id" });
  if (error) throw error;
}

export async function getMobilizationMetrics(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_mobilization_metrics" as any).select("*")
    .eq("initiative_id", initiativeId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Cross-Border (Section 5) ---
export async function saveCrossBorderInit(input: CrossBorderInitInput): Promise<void> {
  const score = computeCrossBorderViability(input);
  const { error } = await supabase.from("initiative_cross_border" as any)
    .insert({ ...input, cross_border_viability: score });
  if (error) throw error;
}

export async function getCrossBorderInit(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_cross_border" as any).select("*")
    .eq("initiative_id", initiativeId).order("computed_at", { ascending: false }).limit(5);
  if (error) throw error;
  return data ?? [];
}

// --- Funding (Section 7) ---
export async function addInitiativeFunding(input: InitiativeFundingInput): Promise<string> {
  const { data, error } = await supabase.from("initiative_funding" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInitiativeFunding(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_funding" as any).select("*")
    .eq("initiative_id", initiativeId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Governance (Section 8) ---
export async function saveInitiativeGovernance(input: GovernanceInput): Promise<string> {
  const { data, error } = await supabase.from("initiative_governance" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInitiativeGovernance(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_governance" as any).select("*")
    .eq("initiative_id", initiativeId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Startup Tracking (Section 12) ---
export async function addStartupTracking(input: { initiative_id: string; startup_name: string; [k: string]: unknown }): Promise<string> {
  const { data, error } = await supabase.from("initiative_startup_tracking" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getStartupTracking(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_startup_tracking" as any).select("*")
    .eq("initiative_id", initiativeId).order("tracked_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Movement Index (Section 13) ---
export async function saveMovementIndex(input: MovementIndexInput): Promise<void> {
  const composite = computeMovementScore(input);
  const { error } = await supabase.from("initiative_movement_index" as any)
    .upsert({ ...input, composite_movement_score: composite, computed_at: new Date().toISOString() }, { onConflict: "initiative_id" });
  if (error) throw error;
}

export async function getMovementIndex(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_movement_index" as any).select("*")
    .eq("initiative_id", initiativeId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMovementRankings(limit = 20) {
  const { data, error } = await supabase.from("initiative_movement_index" as any).select("*")
    .order("composite_movement_score", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// --- Coordination Memory (Section 14) ---
export async function addCoordinationMemory(input: CoordinationMemoryInput): Promise<string> {
  const { data, error } = await supabase.from("initiative_coordination_memory" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCoordinationMemory(initiativeId: string) {
  const { data, error } = await supabase.from("initiative_coordination_memory" as any).select("*")
    .eq("initiative_id", initiativeId).order("recorded_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}
