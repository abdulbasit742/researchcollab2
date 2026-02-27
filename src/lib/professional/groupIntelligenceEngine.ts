/**
 * Professional Group Intelligence System (PGIS)
 * Execution-first, non-toxic collaboration infrastructure replacing Facebook Groups.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const GROUP_TYPES = [
  "domain", "funding", "institutional", "consortium", "startup_builder",
  "skill_exchange", "compliance_policy", "regional_innovation",
  "project_specific", "initiative_based",
] as const;
export type GroupType = typeof GROUP_TYPES[number];

export const GROUP_POST_TYPES = [
  "execution_update", "funding_opportunity", "collaboration_request",
  "skill_request", "research_discussion", "technical_problem",
  "grant_strategy", "industry_integration", "policy_discussion",
  "resource_sharing",
] as const;
export type GroupPostType = typeof GROUP_POST_TYPES[number];

export const GROUP_MEMBER_ROLES = [
  "lead_moderator", "co_moderator", "compliance_overseer", "member", "observer",
] as const;
export type GroupMemberRole = typeof GROUP_MEMBER_ROLES[number];

export const TOXICITY_FLAG_TYPES = [
  "emotional_escalation", "misinformation", "spam_burst",
  "coordinated_manipulation", "authority_impersonation",
  "political_derailment", "engagement_bait",
] as const;

export const OUTCOME_TYPES = [
  "project_formed", "grant_submitted", "grant_awarded", "patent_filed",
  "startup_launched", "industry_pilot", "skill_certification",
  "cross_border_collaboration",
] as const;

export const MEMORY_EVENT_TYPES_PGIS = [
  "decision_log", "milestone_summary", "action_item",
  "key_contributor_recognition", "outcome_tracked", "thread_archived",
] as const;

export const PGIS_PHILOSOPHY = {
  organizes: "Execution ecosystems, not discussion spaces",
  optimizes: "Outcomes, not engagement",
  creates: "Innovation clusters, not conversation clusters",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface GroupInput {
  created_by: string;
  name: string;
  description?: string;
  group_type: string;
  purpose?: string;
  execution_focus?: string;
  governance_model?: string;
  moderation_structure?: Record<string, unknown>;
  expected_outcomes?: string[];
  membership_criteria?: Record<string, unknown>;
  posting_rules?: string[];
  privacy_level?: string;
  nda_protected?: boolean;
  escrow_protected?: boolean;
  institution_id?: string;
}

export interface GroupMemberInput {
  group_id: string;
  user_id: string;
  role?: string;
}

export interface GroupPostInput {
  group_id: string;
  author_id: string;
  post_type: string;
  title?: string;
  content?: string;
  linked_project_id?: string;
  linked_grant_id?: string;
  metadata?: Record<string, unknown>;
}

export interface ThreadReplyInput {
  post_id: string;
  parent_reply_id?: string;
  author_id: string;
  content: string;
}

export interface TrustDensityInput {
  group_id: string;
  avg_member_trust: number;
  execution_reliability_density: number;
  funding_success_density: number;
  collaboration_stability_density: number;
  integrity_confidence_density: number;
}

export interface GroupOutcomeInput {
  group_id: string;
  outcome_type: string;
  description?: string;
  linked_entity_id?: string;
}

export interface IntelligenceMetricsInput {
  group_id: string;
  active_members?: number;
  execution_threads?: number;
  collaboration_success_rate?: number;
  funding_conversion?: number;
  skill_exchange_frequency?: number;
  knowledge_retention_depth?: number;
  topic_growth_signals?: Record<string, unknown>;
}

export interface ToxicityFlagInput {
  group_id: string;
  post_id?: string;
  flagged_user_id?: string;
  flag_type: string;
  severity?: string;
  description?: string;
  evidence?: Record<string, unknown>;
}

export interface GroupMemoryInput {
  group_id: string;
  event_type: string;
  title?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface GroupDiscoveryFilters {
  group_type?: string;
  domain?: string;
  min_trust_density?: number;
  region?: string;
  institution_id?: string;
  privacy_level?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeGroupCredibility(input: Omit<TrustDensityInput, "group_id">): number {
  return Math.round(
    input.avg_member_trust * 0.25 +
    input.execution_reliability_density * 0.25 +
    input.funding_success_density * 0.15 +
    input.collaboration_stability_density * 0.15 +
    input.integrity_confidence_density * 0.20
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Groups (Section 1) ---
export async function createGroup(input: GroupInput): Promise<string> {
  const { data, error } = await supabase.from("professional_groups" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGroups(filters?: GroupDiscoveryFilters) {
  let query = supabase.from("professional_groups" as any).select("*");
  if (filters?.group_type) query = query.eq("group_type", filters.group_type);
  if (filters?.privacy_level) query = query.eq("privacy_level", filters.privacy_level);
  if (filters?.institution_id) query = query.eq("institution_id", filters.institution_id);
  const { data, error } = await query.eq("status", "active").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getGroup(id: string) {
  const { data, error } = await supabase.from("professional_groups" as any).select("*")
    .eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateGroup(id: string, updates: Partial<GroupInput>): Promise<void> {
  const { error } = await supabase.from("professional_groups" as any)
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Members (Section 2) ---
export async function joinGroup(input: GroupMemberInput): Promise<string> {
  const { data, error } = await supabase.from("group_members" as any)
    .upsert(input, { onConflict: "group_id,user_id" }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase.from("group_members" as any).select("*")
    .eq("group_id", groupId).eq("status", "active").order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
  const { error } = await supabase.from("group_members" as any)
    .update({ role }).eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("group_members" as any)
    .update({ status: "inactive" }).eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

// --- Posts (Section 3) ---
export async function createGroupPost(input: GroupPostInput): Promise<string> {
  const { data, error } = await supabase.from("group_posts" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGroupPosts(groupId: string, postType?: string) {
  let query = supabase.from("group_posts" as any).select("*").eq("group_id", groupId);
  if (postType) query = query.eq("post_type", postType);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markPostAsSolution(postId: string): Promise<void> {
  const { error } = await supabase.from("group_posts" as any)
    .update({ is_solution_marked: true }).eq("id", postId);
  if (error) throw error;
}

// --- Thread Replies (Section 6) ---
export async function addThreadReply(input: ThreadReplyInput): Promise<string> {
  const { data, error } = await supabase.from("group_thread_replies" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getThreadReplies(postId: string) {
  const { data, error } = await supabase.from("group_thread_replies" as any).select("*")
    .eq("post_id", postId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function markReplyAsSolution(replyId: string): Promise<void> {
  const { error } = await supabase.from("group_thread_replies" as any)
    .update({ is_solution: true }).eq("id", replyId);
  if (error) throw error;
}

// --- Trust Density (Section 4) ---
export async function saveGroupTrustDensity(input: TrustDensityInput): Promise<void> {
  const composite = computeGroupCredibility(input);
  const { error } = await supabase.from("group_trust_density" as any)
    .upsert({ ...input, composite_credibility: composite, computed_at: new Date().toISOString() }, { onConflict: "group_id" });
  if (error) throw error;
}

export async function getGroupTrustDensity(groupId: string) {
  const { data, error } = await supabase.from("group_trust_density" as any).select("*")
    .eq("group_id", groupId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Outcomes (Section 5) ---
export async function addGroupOutcome(input: GroupOutcomeInput): Promise<string> {
  const { data, error } = await supabase.from("group_outcomes" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGroupOutcomes(groupId: string) {
  const { data, error } = await supabase.from("group_outcomes" as any).select("*")
    .eq("group_id", groupId).order("achieved_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Intelligence Metrics (Section 9) ---
export async function saveGroupIntelligence(input: IntelligenceMetricsInput): Promise<void> {
  const { error } = await supabase.from("group_intelligence_metrics" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "group_id" });
  if (error) throw error;
}

export async function getGroupIntelligence(groupId: string) {
  const { data, error } = await supabase.from("group_intelligence_metrics" as any).select("*")
    .eq("group_id", groupId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Toxicity Flags (Section 8) ---
export async function flagToxicity(input: ToxicityFlagInput): Promise<string> {
  const { data, error } = await supabase.from("group_toxicity_flags" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getToxicityFlags(groupId: string) {
  const { data, error } = await supabase.from("group_toxicity_flags" as any).select("*")
    .eq("group_id", groupId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function resolveToxicityFlag(flagId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.from("group_toxicity_flags" as any)
    .update({ status: "resolved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }).eq("id", flagId);
  if (error) throw error;
}

// --- Group Memory (Section 14) ---
export async function addGroupMemory(input: GroupMemoryInput): Promise<string> {
  const { data, error } = await supabase.from("group_memory" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGroupMemory(groupId: string) {
  const { data, error } = await supabase.from("group_memory" as any).select("*")
    .eq("group_id", groupId).order("recorded_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}
