/**
 * Verified Professional Visual Identity Engine
 * Reputation stack, identity timeline, skill matrix, verified badges,
 * global footprint, stability index, institutional verification.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const REPUTATION_DIMENSIONS = [
  "execution", "innovation", "collaboration", "integrity",
  "funding_impact", "open_contribution", "longitudinal_stability", "skill_diversity",
] as const;
export type ReputationDimension = typeof REPUTATION_DIMENSIONS[number];

export const IDENTITY_EVENT_TYPES = [
  "first_project", "first_grant", "first_publication", "first_patent",
  "startup_involvement", "industry_pilot", "institutional_leadership",
  "major_milestone", "domain_pivot", "global_collaboration_expansion",
] as const;
export type IdentityEventType = typeof IDENTITY_EVENT_TYPES[number];

export const VERIFIED_BADGE_TYPES = [
  "grant_completion", "patent_filing", "startup_formation", "milestone_punctuality",
  "industry_deployment", "institutional_leadership", "reproducibility_validation",
  "open_science_contribution", "compliance_excellence",
] as const;
export type VerifiedBadgeType = typeof VERIFIED_BADGE_TYPES[number];

export const FOOTPRINT_ENGAGEMENT_TYPES = [
  "collaboration", "funding_body", "industry_engagement", "research_deployment",
  "institutional_affiliation", "policy_advisory",
] as const;

export const INSTITUTIONAL_VERIFICATION_TYPES = [
  "employment_history", "project_participation", "grant_involvement",
  "patent_contribution", "leadership_role", "compliance_adherence",
] as const;

export const IDENTITY_PHILOSOPHY = {
  category: "Capability signaling, not lifestyle signaling",
  shows: "Who actually delivers",
  antiVanity: [
    "Follower count not primary visual element",
    "No purchasable verification",
    "All badges data-backed",
    "Reputation explainable",
    "Identity earned, not purchased",
  ],
  emphasis: [
    "Verified achievements", "Skill depth", "Execution reliability",
    "Innovation contribution", "Collaboration trust",
  ],
  deEmphasis: [
    "Follower count", "Like count", "Viral reach", "Aesthetic perfection",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface ReputationStackInput {
  user_id: string;
  execution_score: number;
  innovation_score: number;
  collaboration_score: number;
  integrity_score: number;
  funding_impact_score: number;
  open_contribution_score: number;
  longitudinal_stability_score: number;
  skill_diversity_score: number;
  breakdown?: Record<string, unknown>;
}

export interface IdentityTimelineEventInput {
  user_id: string;
  event_type: string;
  event_title: string;
  event_description?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
  institution_id?: string;
  event_date: string;
  metadata?: Record<string, unknown>;
}

export interface SkillMatrixEntryInput {
  user_id: string;
  skill_category: string;
  skill_name: string;
  depth_score?: number;
  application_count?: number;
  cross_domain_integration?: boolean;
  project_linkages?: string[];
  industry_validated?: boolean;
  grant_linked?: boolean;
  peer_endorsement_weight?: number;
}

export interface VerifiedBadgeInput {
  user_id: string;
  badge_type: string;
  badge_name: string;
  earned_reason?: string;
  evidence_entity_type?: string;
  evidence_entity_id?: string;
}

export interface GlobalFootprintInput {
  user_id: string;
  country_code: string;
  engagement_type: string;
  institution_name?: string;
  description?: string;
  started_at?: string;
  ended_at?: string;
}

export interface StabilityIndexInput {
  user_id: string;
  funding_continuity: number;
  output_consistency: number;
  collaboration_longevity: number;
  compliance_stability: number;
  innovation_durability: number;
}

export interface InstitutionalVerificationInput {
  user_id: string;
  institution_id: string;
  verification_type: string;
  verification_details?: string;
  verified_by_user_id?: string;
  expires_at?: string;
}

// =====================================================
// REPUTATION STACK (Section 2)
// =====================================================

const REPUTATION_WEIGHTS = {
  execution: 0.18, innovation: 0.14, collaboration: 0.14, integrity: 0.14,
  funding_impact: 0.10, open_contribution: 0.10, longitudinal_stability: 0.10, skill_diversity: 0.10,
};

export function computeCompositeReputation(input: Omit<ReputationStackInput, "user_id" | "breakdown">): number {
  return Math.round(
    input.execution_score * REPUTATION_WEIGHTS.execution +
    input.innovation_score * REPUTATION_WEIGHTS.innovation +
    input.collaboration_score * REPUTATION_WEIGHTS.collaboration +
    input.integrity_score * REPUTATION_WEIGHTS.integrity +
    input.funding_impact_score * REPUTATION_WEIGHTS.funding_impact +
    input.open_contribution_score * REPUTATION_WEIGHTS.open_contribution +
    input.longitudinal_stability_score * REPUTATION_WEIGHTS.longitudinal_stability +
    input.skill_diversity_score * REPUTATION_WEIGHTS.skill_diversity
  );
}

export async function saveReputationStack(input: ReputationStackInput): Promise<void> {
  const composite = computeCompositeReputation(input);
  const { error } = await supabase.from("reputation_stack_profiles" as any).insert({
    ...input, composite_reputation: composite,
  });
  if (error) throw error;
}

export async function getReputationStack(userId: string) {
  const { data, error } = await supabase.from("reputation_stack_profiles" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// IDENTITY TIMELINE (Section 3)
// =====================================================

export async function addIdentityTimelineEvent(input: IdentityTimelineEventInput): Promise<string> {
  const { data, error } = await supabase.from("identity_timeline_events" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getIdentityTimeline(userId: string) {
  const { data, error } = await supabase.from("identity_timeline_events" as any).select("*")
    .eq("user_id", userId).order("event_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// SKILL MATRIX (Section 4)
// =====================================================

export async function addSkillMatrixEntry(input: SkillMatrixEntryInput): Promise<string> {
  const { data, error } = await supabase.from("skill_matrix_entries" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getSkillMatrix(userId: string) {
  const { data, error } = await supabase.from("skill_matrix_entries" as any).select("*")
    .eq("user_id", userId).order("depth_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateSkillMatrixEntry(entryId: string, updates: Partial<SkillMatrixEntryInput>): Promise<void> {
  const { error } = await supabase.from("skill_matrix_entries" as any).update({ ...updates, updated_at: new Date().toISOString() }).eq("id", entryId);
  if (error) throw error;
}

// =====================================================
// VERIFIED BADGES (Section 6)
// =====================================================

export async function awardVerifiedBadge(input: VerifiedBadgeInput): Promise<string> {
  const { data, error } = await supabase.from("verified_identity_badges" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getUserVerifiedBadges(userId: string) {
  const { data, error } = await supabase.from("verified_identity_badges" as any).select("*")
    .eq("user_id", userId).eq("is_active", true).order("earned_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GLOBAL FOOTPRINT (Section 5)
// =====================================================

export async function addGlobalFootprint(input: GlobalFootprintInput): Promise<string> {
  const { data, error } = await supabase.from("professional_global_footprint" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGlobalFootprint(userId: string) {
  const { data, error } = await supabase.from("professional_global_footprint" as any).select("*")
    .eq("user_id", userId).eq("is_active", true).order("started_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// STABILITY INDEX (Section 12)
// =====================================================

export function computeStabilityComposite(input: Omit<StabilityIndexInput, "user_id">): number {
  return Math.round(
    input.funding_continuity * 0.25 + input.output_consistency * 0.20 +
    input.collaboration_longevity * 0.20 + input.compliance_stability * 0.20 +
    input.innovation_durability * 0.15
  );
}

export async function saveStabilityIndex(input: StabilityIndexInput): Promise<void> {
  const composite = computeStabilityComposite(input);
  const { error } = await supabase.from("professional_stability_index" as any).insert({
    ...input, composite_stability: composite,
  });
  if (error) throw error;
}

export async function getStabilityIndex(userId: string) {
  const { data, error } = await supabase.from("professional_stability_index" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// INSTITUTIONAL VERIFICATION (Section 11)
// =====================================================

export async function submitInstitutionalVerification(input: InstitutionalVerificationInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_identity_verifications" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function approveInstitutionalVerification(verificationId: string, verifiedByUserId: string): Promise<void> {
  const { error } = await supabase.from("institutional_identity_verifications" as any).update({
    status: "verified", verified_by_user_id: verifiedByUserId, verified_at: new Date().toISOString(),
  }).eq("id", verificationId);
  if (error) throw error;
}

export async function getUserInstitutionalVerifications(userId: string) {
  const { data, error } = await supabase.from("institutional_identity_verifications" as any).select("*")
    .eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
