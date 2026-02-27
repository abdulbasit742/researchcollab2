/**
 * Professional Longitudinal Memory System (PLMS)
 * Career compounding intelligence — growth, not nostalgia.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const FUNDING_MILESTONE_TYPES = [
  "first_micro_grant", "first_co_investigator", "first_lead_investigator",
  "cross_border_grant", "multi_year_funding", "institutional_leadership",
  "venture_participation", "capital_diversification",
] as const;

export const ANNIVERSARY_TYPES = [
  "first_grant", "first_patent", "first_startup", "collaboration_5yr",
  "domain_contribution_10yr", "institutional_partnership",
] as const;

export const INSTITUTIONAL_MEMORY_TYPES = [
  "grant_cycle", "innovation_wave", "startup_spinoff", "leadership_shift",
  "compliance_performance", "collaboration_corridor", "domain_evolution", "economic_contribution",
] as const;

export const PLMS_PHILOSOPHY = {
  facebookResurfaces: "Old photos",
  rcollabResurfaces: "Growth patterns",
  facebookTracks: "Moments",
  rcollabTracks: "Trajectory",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface CareerSnapshotInput {
  user_id: string; snapshot_year: number; skill_count?: number; funding_total?: number;
  trust_index?: number; domain_count?: number; collaboration_count?: number;
  startup_equity_changes?: Record<string, unknown>; patent_filings?: number;
  industry_deployments?: number; institutional_affiliations?: number;
  execution_stability?: number; summary?: string;
}

export interface ProjectMemoryInput {
  project_id?: string; user_id: string; title: string; initial_proposal?: string;
  team_composition?: Record<string, unknown>[]; funding_structure?: Record<string, unknown>;
  milestone_timeline?: Record<string, unknown>[]; deliverables?: string[];
  disputes?: Record<string, unknown>[]; outcomes?: string[]; long_term_impact?: string;
  startup_conversion?: boolean; patent_filings?: number; industry_adoption?: string;
  completed_at?: string;
}

export interface TrustHistoryInput {
  user_id: string; trust_index: number; high_trust_collaborations?: number;
  trust_declines?: number; trust_recoveries?: number;
  institutional_trust_shifts?: Record<string, unknown>;
  domain_trust?: Record<string, unknown>; conflict_resolutions?: number; stability_score?: number;
}

export interface FundingProgressionInput {
  user_id: string; milestone_type: string; title: string; amount?: number;
  currency?: string; role?: string; cross_border?: boolean;
  institution_id?: string; achieved_at?: string; metadata?: Record<string, unknown>;
}

export interface GlobalMobilityInput {
  user_id: string; country_code: string; collaboration_type?: string;
  project_id?: string; institution_id?: string; regulatory_exposure?: string;
  cultural_depth_score?: number; started_at?: string; ended_at?: string;
}

export interface SkillCompoundingInput {
  user_id: string; skill_name: string; application_count?: number; domain?: string;
  specialization_depth?: number; cross_domain_stacks?: string[];
  obsolescence_risk?: number; mastery_level?: number;
}

export interface CollaborationEvolutionInput {
  user_id: string; collaborator_id: string; first_collaboration_at?: string;
  collaboration_count?: number; trust_level?: number; is_institutional_bridge?: boolean;
  is_cross_domain?: boolean; domains?: string[];
}

export interface DisputeRecoveryInput {
  user_id: string; dispute_id?: string; dispute_type?: string; resolution_outcome?: string;
  lessons_applied?: string; trust_before?: number; trust_after?: number;
  recovery_duration_days?: number; resolved_at?: string;
}

export interface InstitutionalMemoryInput {
  institution_id: string; memory_type: string; title: string; description?: string;
  period_start?: string; period_end?: string; metrics?: Record<string, unknown>;
  participants?: Record<string, unknown>[]; outcomes?: string[];
}

export interface AnniversaryInput {
  user_id: string; anniversary_type: string; title: string; description?: string;
  original_date: string; years_milestone?: number; linked_entity_id?: string;
  linked_entity_type?: string;
}

export interface DataExportInput {
  user_id: string; export_format?: string; export_scope?: string[];
  export_data?: Record<string, unknown>; successor_account_id?: string;
  is_legacy_preservation?: boolean; verification_hash?: string;
}

export interface InitiativeArchiveInput {
  initiative_id?: string; title: string; participant_evolution?: Record<string, unknown>[];
  funding_progression?: Record<string, unknown>[]; milestone_completion_rate?: number;
  economic_impact?: number; policy_alignment?: Record<string, unknown>;
  innovation_adoption?: Record<string, unknown>; startup_pipeline?: Record<string, unknown>[];
}

// =====================================================
// DATA ACCESS
// =====================================================

const S = supabase as any;

// --- Career Snapshots ---
export async function saveCareerSnapshot(input: CareerSnapshotInput): Promise<void> {
  const { error } = await S.from("plms_career_snapshots").upsert(input, { onConflict: "user_id,snapshot_year" });
  if (error) throw error;
}
export async function getCareerSnapshots(userId: string) {
  const { data, error } = await S.from("plms_career_snapshots").select("*").eq("user_id", userId).order("snapshot_year", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Project Memory ---
export async function saveProjectMemory(input: ProjectMemoryInput): Promise<string> {
  const { data, error } = await S.from("plms_project_memory").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function getProjectMemories(userId: string) {
  const { data, error } = await S.from("plms_project_memory").select("*").eq("user_id", userId).order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Trust History ---
export async function recordTrustHistory(input: TrustHistoryInput): Promise<void> {
  const { error } = await S.from("plms_trust_history").insert(input);
  if (error) throw error;
}
export async function getTrustHistory(userId: string) {
  const { data, error } = await S.from("plms_trust_history").select("*").eq("user_id", userId).order("recorded_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Funding Progression ---
export async function recordFundingMilestone(input: FundingProgressionInput): Promise<void> {
  const { error } = await S.from("plms_funding_progression").insert(input);
  if (error) throw error;
}
export async function getFundingProgression(userId: string) {
  const { data, error } = await S.from("plms_funding_progression").select("*").eq("user_id", userId).order("achieved_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Global Mobility ---
export async function recordGlobalMobility(input: GlobalMobilityInput): Promise<void> {
  const { error } = await S.from("plms_global_mobility").insert(input);
  if (error) throw error;
}
export async function getGlobalMobility(userId: string) {
  const { data, error } = await S.from("plms_global_mobility").select("*").eq("user_id", userId).order("started_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Skill Compounding ---
export async function upsertSkillCompounding(input: SkillCompoundingInput): Promise<void> {
  const { error } = await S.from("plms_skill_compounding").upsert({ ...input, last_applied_at: new Date().toISOString() }, { onConflict: "user_id,skill_name" });
  if (error) throw error;
}
export async function getSkillCompounding(userId: string) {
  const { data, error } = await S.from("plms_skill_compounding").select("*").eq("user_id", userId).order("mastery_level", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Collaboration Evolution ---
export async function upsertCollaborationEvolution(input: CollaborationEvolutionInput): Promise<void> {
  const { error } = await S.from("plms_collaboration_evolution").upsert({ ...input, last_collaboration_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "user_id,collaborator_id" });
  if (error) throw error;
}
export async function getCollaborationEvolution(userId: string) {
  const { data, error } = await S.from("plms_collaboration_evolution").select("*").eq("user_id", userId).order("collaboration_count", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Dispute Recovery ---
export async function recordDisputeRecovery(input: DisputeRecoveryInput): Promise<void> {
  const { error } = await S.from("plms_dispute_recovery").insert(input);
  if (error) throw error;
}
export async function getDisputeRecovery(userId: string) {
  const { data, error } = await S.from("plms_dispute_recovery").select("*").eq("user_id", userId).order("occurred_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Institutional Memory ---
export async function saveInstitutionalMemory(input: InstitutionalMemoryInput): Promise<string> {
  const { data, error } = await S.from("plms_institutional_memory").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function getInstitutionalMemory(institutionId: string) {
  const { data, error } = await S.from("plms_institutional_memory").select("*").eq("institution_id", institutionId).order("period_start", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Anniversaries ---
export async function createAnniversary(input: AnniversaryInput): Promise<string> {
  const { data, error } = await S.from("plms_anniversaries").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function getAnniversaries(userId: string) {
  const { data, error } = await S.from("plms_anniversaries").select("*").eq("user_id", userId).order("original_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function markAnniversaryCelebrated(id: string): Promise<void> {
  const { error } = await S.from("plms_anniversaries").update({ celebrated: true, resurfaced_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Data Exports ---
export async function createDataExport(input: DataExportInput): Promise<string> {
  const { data, error } = await S.from("plms_data_exports").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function getDataExports(userId: string) {
  const { data, error } = await S.from("plms_data_exports").select("*").eq("user_id", userId).order("exported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Initiative Archive ---
export async function archiveInitiative(input: InitiativeArchiveInput): Promise<string> {
  const { data, error } = await S.from("plms_initiative_archive").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}
export async function getInitiativeArchives() {
  const { data, error } = await S.from("plms_initiative_archive").select("*").order("archived_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}
