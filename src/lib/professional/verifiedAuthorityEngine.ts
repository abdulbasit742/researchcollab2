/**
 * Verified Authority & Credibility Engine (VACE)
 * Replaces influencer culture with credibility infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const AUTHORITY_MANIPULATION_TYPES = [
  "follower_inflation", "engagement_ring", "authority_trading",
  "fake_institutional_endorsement", "artificial_peer_validation",
  "low_value_stacking", "paid_influence_scheme",
] as const;
export type AuthorityManipulationType = typeof AUTHORITY_MANIPULATION_TYPES[number];

export const AUTHORITY_IMPACT_BADGE_TYPES = [
  "multi_grant_leader", "patent_innovator", "startup_founder",
  "industry_deployment_contributor", "reproducibility_champion",
  "compliance_excellence", "cross_border_collaborator",
  "institutional_leader", "long_term_stability",
] as const;
export type AuthorityBadgeType = typeof AUTHORITY_IMPACT_BADGE_TYPES[number];

export const DECAY_REASONS = [
  "inactivity", "compliance_issue", "funding_failure",
  "reputation_volatility", "integrity_flag",
] as const;

export const VACE_PHILOSOPHY = {
  category: "Execution credibility, not attention authority",
  builtOn: "Reliability + innovation + impact",
  verification: "Data-verified professional legitimacy",
  rules: [
    "No authority based solely on followers",
    "No purchasable verification",
    "No hidden authority scoring",
    "No global popularity leaderboards by default",
    "Authority must be domain-specific",
    "Authority must decay if inactive or unreliable",
    "All authority scores must be explainable",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface DomainAuthorityInput {
  user_id: string;
  domain: string;
  skill_depth: number;
  verified_projects: number;
  grant_participation: number;
  patent_contribution: number;
  startup_involvement: number;
  collaboration_trust: number;
  peer_validation: number;
  compliance_integrity: number;
  longitudinal_consistency: number;
  innovation_yield: number;
}

export interface ExecutionAuthorityInput {
  user_id: string;
  on_time_milestone_pct: number;
  deliverable_acceptance_rate: number;
  budget_compliance: number;
  sponsor_retention: number;
  repeat_collaboration: number;
  escrow_integrity: number;
  dispute_frequency: number;
}

export interface KnowledgeAuthorityInput {
  user_id: string;
  open_science_contribution: number;
  replication_success_rate: number;
  peer_validation_quality: number;
  educational_content_value: number;
  code_dataset_reuse: number;
  domain_insight_recognition: number;
  long_term_usefulness: number;
}

export interface CollabTrustAuthorityInput {
  user_id: string;
  multi_grant_continuity: number;
  cross_institution_partnerships: number;
  industry_integration: number;
  co_execution_success: number;
  network_resilience: number;
  dispute_free_collaborations: number;
  team_leadership_credibility: number;
}

export interface PeerValidationInput {
  subject_user_id: string;
  endorser_user_id: string;
  domain: string;
  endorser_authority_weight: number;
  domain_alignment: number;
  collaboration_depth: number;
  verified_project_overlap?: boolean;
  institutional_backing?: boolean;
}

export interface AuthorityDecayInput {
  user_id: string;
  domain?: string;
  decay_reason: string;
  decay_amount: number;
  previous_score?: number;
  new_score?: number;
}

export interface AuthorityBadgeInput {
  user_id: string;
  badge_type: string;
  badge_name: string;
  evidence_summary?: string;
  data_backing?: Record<string, unknown>;
}

export interface AuthorityManipFlagInput {
  user_id: string;
  flag_type: string;
  description?: string;
  evidence?: Record<string, unknown>;
  severity?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const DSAI_WEIGHTS = {
  skill_depth: 0.12, verified_projects: 0.12, grant_participation: 0.10,
  patent_contribution: 0.08, startup_involvement: 0.08, collaboration_trust: 0.12,
  peer_validation: 0.10, compliance_integrity: 0.10, longitudinal_consistency: 0.10,
  innovation_yield: 0.08,
};

export function computeDomainAuthority(input: Omit<DomainAuthorityInput, "user_id" | "domain">): number {
  return Math.round(
    input.skill_depth * DSAI_WEIGHTS.skill_depth +
    input.verified_projects * DSAI_WEIGHTS.verified_projects +
    input.grant_participation * DSAI_WEIGHTS.grant_participation +
    input.patent_contribution * DSAI_WEIGHTS.patent_contribution +
    input.startup_involvement * DSAI_WEIGHTS.startup_involvement +
    input.collaboration_trust * DSAI_WEIGHTS.collaboration_trust +
    input.peer_validation * DSAI_WEIGHTS.peer_validation +
    input.compliance_integrity * DSAI_WEIGHTS.compliance_integrity +
    input.longitudinal_consistency * DSAI_WEIGHTS.longitudinal_consistency +
    input.innovation_yield * DSAI_WEIGHTS.innovation_yield
  );
}

const EAS_WEIGHTS = {
  on_time: 0.18, acceptance: 0.16, budget: 0.14, sponsor: 0.12,
  repeat: 0.12, escrow: 0.14, dispute: -0.14,
};

export function computeExecutionAuthority(input: Omit<ExecutionAuthorityInput, "user_id">): number {
  return Math.round(
    input.on_time_milestone_pct * EAS_WEIGHTS.on_time +
    input.deliverable_acceptance_rate * EAS_WEIGHTS.acceptance +
    input.budget_compliance * EAS_WEIGHTS.budget +
    input.sponsor_retention * EAS_WEIGHTS.sponsor +
    input.repeat_collaboration * EAS_WEIGHTS.repeat +
    input.escrow_integrity * EAS_WEIGHTS.escrow +
    input.dispute_frequency * EAS_WEIGHTS.dispute
  );
}

const KCA_WEIGHTS = {
  open_science: 0.16, replication: 0.16, peer_validation: 0.14,
  educational: 0.14, reuse: 0.14, recognition: 0.12, usefulness: 0.14,
};

export function computeKnowledgeAuthority(input: Omit<KnowledgeAuthorityInput, "user_id">): number {
  return Math.round(
    input.open_science_contribution * KCA_WEIGHTS.open_science +
    input.replication_success_rate * KCA_WEIGHTS.replication +
    input.peer_validation_quality * KCA_WEIGHTS.peer_validation +
    input.educational_content_value * KCA_WEIGHTS.educational +
    input.code_dataset_reuse * KCA_WEIGHTS.reuse +
    input.domain_insight_recognition * KCA_WEIGHTS.recognition +
    input.long_term_usefulness * KCA_WEIGHTS.usefulness
  );
}

const CTA_WEIGHTS = {
  multi_grant: 0.16, cross_inst: 0.14, industry: 0.14,
  co_exec: 0.16, resilience: 0.14, dispute_free: 0.14, leadership: 0.12,
};

export function computeCollabTrustAuthority(input: Omit<CollabTrustAuthorityInput, "user_id">): number {
  return Math.round(
    input.multi_grant_continuity * CTA_WEIGHTS.multi_grant +
    input.cross_institution_partnerships * CTA_WEIGHTS.cross_inst +
    input.industry_integration * CTA_WEIGHTS.industry +
    input.co_execution_success * CTA_WEIGHTS.co_exec +
    input.network_resilience * CTA_WEIGHTS.resilience +
    input.dispute_free_collaborations * CTA_WEIGHTS.dispute_free +
    input.team_leadership_credibility * CTA_WEIGHTS.leadership
  );
}

export function computePeerValidationWeight(input: Omit<PeerValidationInput, "subject_user_id" | "endorser_user_id" | "domain">): number {
  let w = input.endorser_authority_weight * 0.30 + input.domain_alignment * 0.25 + input.collaboration_depth * 0.25;
  if (input.verified_project_overlap) w += 10;
  if (input.institutional_backing) w += 10;
  return Math.round(w);
}

// =====================================================
// DOMAIN AUTHORITY (Section 1)
// =====================================================

export async function saveDomainAuthority(input: DomainAuthorityInput): Promise<void> {
  const composite = computeDomainAuthority(input);
  const { error } = await supabase.from("domain_authority_index" as any)
    .upsert({ ...input, composite_authority: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id,domain" });
  if (error) throw error;
}

export async function getDomainAuthority(userId: string, domain?: string) {
  let query = supabase.from("domain_authority_index" as any).select("*").eq("user_id", userId);
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("composite_authority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// EXECUTION AUTHORITY (Section 2)
// =====================================================

export async function saveExecutionAuthority(input: ExecutionAuthorityInput): Promise<void> {
  const composite = computeExecutionAuthority(input);
  const { error } = await supabase.from("execution_authority_scores" as any).insert({ ...input, composite_eas: composite });
  if (error) throw error;
}

export async function getExecutionAuthority(userId: string) {
  const { data, error } = await supabase.from("execution_authority_scores" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// KNOWLEDGE AUTHORITY (Section 3)
// =====================================================

export async function saveKnowledgeAuthority(input: KnowledgeAuthorityInput): Promise<void> {
  const composite = computeKnowledgeAuthority(input);
  const { error } = await supabase.from("knowledge_authority_scores" as any).insert({ ...input, composite_kca: composite });
  if (error) throw error;
}

export async function getKnowledgeAuthority(userId: string) {
  const { data, error } = await supabase.from("knowledge_authority_scores" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// COLLABORATION TRUST AUTHORITY (Section 4)
// =====================================================

export async function saveCollabTrustAuth(input: CollabTrustAuthorityInput): Promise<void> {
  const composite = computeCollabTrustAuthority(input);
  const { error } = await supabase.from("collaboration_trust_authority" as any).insert({ ...input, composite_cta: composite });
  if (error) throw error;
}

export async function getCollabTrustAuth(userId: string) {
  const { data, error } = await supabase.from("collaboration_trust_authority" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// AUTHORITY DECAY (Section 6)
// =====================================================

export async function recordAuthorityDecay(input: AuthorityDecayInput): Promise<void> {
  const { error } = await supabase.from("authority_decay_records" as any).insert(input);
  if (error) throw error;
}

export async function getAuthorityDecayHistory(userId: string) {
  const { data, error } = await supabase.from("authority_decay_records" as any).select("*")
    .eq("user_id", userId).order("applied_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// PEER VALIDATION (Section 12)
// =====================================================

export async function submitPeerValidation(input: PeerValidationInput): Promise<void> {
  const weighted = computePeerValidationWeight(input);
  const { error } = await supabase.from("authority_peer_validations" as any).insert({ ...input, weighted_endorsement: weighted });
  if (error) throw error;
}

export async function getPeerValidations(userId: string) {
  const { data, error } = await supabase.from("authority_peer_validations" as any).select("*")
    .eq("subject_user_id", userId).order("weighted_endorsement", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// MANIPULATION FLAGS (Section 8)
// =====================================================

export async function flagAuthorityManipulation(input: AuthorityManipFlagInput): Promise<string> {
  const { data, error } = await supabase.from("authority_manipulation_flags" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getAuthorityManipFlags(userId: string) {
  const { data, error } = await supabase.from("authority_manipulation_flags" as any).select("*")
    .eq("user_id", userId).eq("resolved", false);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// IMPACT BADGES (Section 9)
// =====================================================

export async function awardAuthorityBadge(input: AuthorityBadgeInput): Promise<string> {
  const { data, error } = await supabase.from("authority_impact_badges" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getAuthorityBadges(userId: string) {
  const { data, error } = await supabase.from("authority_impact_badges" as any).select("*")
    .eq("user_id", userId).eq("is_active", true).order("earned_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
