/**
 * Structured Discourse & Debate Engine (SDDE)
 * Beyond Facebook Comments — evidence-driven professional discourse.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const DISCUSSION_TYPES = ["technical_debate", "evidence_review", "grant_critique", "startup_architecture", "industry_feasibility", "policy_debate", "compliance_review", "cross_domain_synthesis", "institutional_strategy", "open_qa"] as const;
export type DiscussionType = typeof DISCUSSION_TYPES[number];

export const CONTRIBUTION_TYPES = ["claim", "evidence", "counterargument", "clarification", "question", "proposal", "risk_flag", "data_reference", "policy_implication", "conclusion"] as const;
export type ContributionType = typeof CONTRIBUTION_TYPES[number];

export const EVIDENCE_TYPES = ["citation", "data_reference", "project_reference", "patent_reference", "grant_documentation", "industry_case"] as const;
export const TOXICITY_FLAG_TYPES = ["personal_attack", "topic_drift", "low_signal_repeat", "unsupported_emotional", "manipulative_language", "argument_flooding", "authority_impersonation"] as const;
export const EXTRACT_TYPES = ["document", "knowledge_archive", "project_memory", "institutional_report", "policy_brief", "grant_proposal"] as const;
export const TONE_SUGGESTION_TYPES = ["clarity", "evidence_inclusion", "misunderstanding_risk", "tone_adjustment", "logical_gap", "citation_needed"] as const;
export const DISPUTE_OUTCOMES = ["resolved", "ongoing", "split_opinion"] as const;

export const SDDE_PHILOSOPHY = {
  category: "Structured Discourse & Debate",
  contrast: "Facebook comments are reaction threads; SDDE is structured intellectual exchange",
  principle: "Evidence determines weight, not popularity",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface ThreadInput {
  discussion_type: string;
  title: string;
  description?: string;
  domain?: string;
  expected_outcome?: string;
  evidence_requirement?: string;
  moderator_id?: string;
  linked_entity_id?: string;
  linked_entity_type?: string;
  is_institutional?: boolean;
  institution_id?: string;
  region_tags?: string[];
  created_by?: string;
}

export interface ContributionInput {
  thread_id: string;
  parent_id?: string;
  author_id: string;
  contribution_type: string;
  content: string;
  citations?: unknown[];
  data_references?: unknown[];
  project_references?: unknown[];
  domain_authority_score?: number;
  trust_index?: number;
  evidence_backed?: boolean;
}

export interface EvidenceInput {
  contribution_id: string;
  evidence_type: string;
  title: string;
  url?: string;
  description?: string;
  source_credibility?: number;
}

export interface SDDEAISummaryInput {
  thread_id: string;
  key_claims?: unknown[];
  strongest_evidence?: unknown[];
  unresolved_questions?: unknown[];
  consensus_areas?: unknown[];
  disagreement_zones?: unknown[];
  risk_highlights?: unknown[];
  actionable_conclusions?: unknown[];
  suggested_next_steps?: unknown[];
  linked_projects?: unknown[];
}

export interface DisputeInput {
  thread_id: string;
  initiated_by: string;
  dispute_summary: string;
  rebuttal_format?: Record<string, unknown>;
  evidence_comparison?: Record<string, unknown>;
  moderator_id?: string;
}

export interface ToxicityFlagInput {
  contribution_id: string;
  flag_type: string;
  description?: string;
  severity?: string;
  flagged_by?: string;
}

export interface KnowledgeExtractInput {
  thread_id: string;
  extract_type: string;
  title: string;
  content?: string;
  linked_project_id?: string;
  linked_institution_id?: string;
  linked_grant_id?: string;
  extracted_by?: string;
}

export interface ImpactIndexInput {
  thread_id: string;
  evidence_density?: number;
  authority_participation?: number;
  outcome_clarity?: number;
  action_items_generated?: number;
  institutional_integration?: boolean;
  citation_growth?: number;
  long_term_reference_rate?: number;
  implementation_influence?: number;
}

export interface ArchiveInput {
  thread_id: string;
  argument_tree?: Record<string, unknown>;
  evidence_links?: unknown[];
  resolution_outcome?: string;
  moderator_notes?: string;
  citation_growth?: number;
  related_projects?: unknown[];
  versioned_summaries?: unknown[];
}

export interface ToneAssistInput {
  user_id: string;
  thread_id?: string;
  original_text: string;
  suggested_text?: string;
  suggestion_type: string;
  accepted?: boolean;
}

export interface ThreadSearchFilters {
  discussion_type?: string;
  domain?: string;
  status?: string;
  is_institutional?: boolean;
  limit?: number;
}

// ─── Threads ────────────────────────────────────────────────
export async function createThread(input: ThreadInput) {
  const { data, error } = await (supabase as any).from("sdde_threads").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getThreads(filters: ThreadSearchFilters = {}) {
  let q = (supabase as any).from("sdde_threads").select("*").order("created_at", { ascending: false });
  if (filters.discussion_type) q = q.eq("discussion_type", filters.discussion_type);
  if (filters.domain) q = q.eq("domain", filters.domain);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.is_institutional !== undefined) q = q.eq("is_institutional", filters.is_institutional);
  q = q.limit(filters.limit ?? 50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getThread(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_threads").select("*").eq("id", threadId).single();
  if (error) throw error;
  return data;
}

export async function updateThread(threadId: string, updates: Partial<ThreadInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("sdde_threads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", threadId).select().single();
  if (error) throw error;
  return data;
}

// ─── Contributions ──────────────────────────────────────────
export async function addContribution(input: ContributionInput) {
  const weight = 1 + (input.domain_authority_score ?? 0) * 0.3 + (input.trust_index ?? 0) * 0.2 + (input.evidence_backed ? 0.5 : 0);
  const { data, error } = await (supabase as any).from("sdde_contributions").insert({ ...input, visibility_weight: Math.round(weight * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getContributions(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_contributions").select("*").eq("thread_id", threadId).order("visibility_weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function flagContribution(contributionId: string, reason: string) {
  const { data, error } = await (supabase as any).from("sdde_contributions").update({ is_flagged: true, flag_reason: reason, updated_at: new Date().toISOString() }).eq("id", contributionId).select().single();
  if (error) throw error;
  return data;
}

// ─── Evidence ───────────────────────────────────────────────
export async function addEvidence(input: EvidenceInput) {
  const { data, error } = await (supabase as any).from("sdde_evidence").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getEvidence(contributionId: string) {
  const { data, error } = await (supabase as any).from("sdde_evidence").select("*").eq("contribution_id", contributionId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function verifyEvidence(evidenceId: string, verifiedBy: string) {
  const { data, error } = await (supabase as any).from("sdde_evidence").update({ verified: true, verified_by: verifiedBy }).eq("id", evidenceId).select().single();
  if (error) throw error;
  return data;
}

// ─── AI Summaries ───────────────────────────────────────────
export async function saveAISummary(input: SDDEAISummaryInput) {
  const { data, error } = await (supabase as any).from("sdde_ai_summaries").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAISummary(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_ai_summaries").select("*").eq("thread_id", threadId).order("generated_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Disputes ───────────────────────────────────────────────
export async function createDispute(input: DisputeInput) {
  const { data, error } = await (supabase as any).from("sdde_disputes").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getDisputes(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_disputes").select("*").eq("thread_id", threadId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function resolveDispute(disputeId: string, outcome: string, summary: string) {
  const { data, error } = await (supabase as any).from("sdde_disputes").update({ outcome_label: outcome, resolution_summary: summary, resolved_at: new Date().toISOString() }).eq("id", disputeId).select().single();
  if (error) throw error;
  return data;
}

// ─── Toxicity Flags ─────────────────────────────────────────
export async function flagToxicity(input: ToxicityFlagInput) {
  const { data, error } = await (supabase as any).from("sdde_toxicity_flags").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getToxicityFlags(contributionId: string) {
  const { data, error } = await (supabase as any).from("sdde_toxicity_flags").select("*").eq("contribution_id", contributionId);
  if (error) throw error;
  return data ?? [];
}

export async function reviewToxicityFlag(flagId: string, reviewedBy: string, action: string) {
  const { data, error } = await (supabase as any).from("sdde_toxicity_flags").update({ reviewed: true, reviewed_by: reviewedBy, action_taken: action, reviewed_at: new Date().toISOString() }).eq("id", flagId).select().single();
  if (error) throw error;
  return data;
}

// ─── Knowledge Extracts ────────────────────────────────────
export async function extractKnowledge(input: KnowledgeExtractInput) {
  const { data, error } = await (supabase as any).from("sdde_knowledge_extracts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getKnowledgeExtracts(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_knowledge_extracts").select("*").eq("thread_id", threadId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Impact Index ───────────────────────────────────────────
export async function saveImpactIndex(input: ImpactIndexInput) {
  const composite = (input.evidence_density ?? 0) * 0.2 + (input.authority_participation ?? 0) * 0.15 + (input.outcome_clarity ?? 0) * 0.15 + (input.action_items_generated ?? 0) * 3 + (input.citation_growth ?? 0) * 2 + (input.long_term_reference_rate ?? 0) * 0.1 + (input.implementation_influence ?? 0) * 0.15 + (input.institutional_integration ? 10 : 0);
  const { data, error } = await (supabase as any).from("sdde_impact_index").insert({ ...input, composite_impact: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getImpactIndex(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_impact_index").select("*").eq("thread_id", threadId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Archives ───────────────────────────────────────────────
export async function archiveThread(input: ArchiveInput) {
  const { data, error } = await (supabase as any).from("sdde_archives").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getArchive(threadId: string) {
  const { data, error } = await (supabase as any).from("sdde_archives").select("*").eq("thread_id", threadId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Tone Assists ───────────────────────────────────────────
export async function saveToneAssist(input: ToneAssistInput) {
  const { data, error } = await (supabase as any).from("sdde_tone_assists").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getToneAssists(userId: string) {
  const { data, error } = await (supabase as any).from("sdde_tone_assists").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// ─── Composite Scoring ─────────────────────────────────────
export function computeVisibilityWeight(authorityScore: number, trustIndex: number, evidenceBacked: boolean): number {
  return Math.round((1 + authorityScore * 0.3 + trustIndex * 0.2 + (evidenceBacked ? 0.5 : 0)) * 100) / 100;
}

export function computeDiscussionImpact(metrics: {
  evidence_density: number;
  authority_participation: number;
  outcome_clarity: number;
  action_items_generated: number;
  citation_growth: number;
  long_term_reference_rate: number;
  implementation_influence: number;
  institutional_integration: boolean;
}): number {
  return Math.round((
    metrics.evidence_density * 0.2 +
    metrics.authority_participation * 0.15 +
    metrics.outcome_clarity * 0.15 +
    metrics.action_items_generated * 3 +
    metrics.citation_growth * 2 +
    metrics.long_term_reference_rate * 0.1 +
    metrics.implementation_influence * 0.15 +
    (metrics.institutional_integration ? 10 : 0)
  ) * 100) / 100;
}
