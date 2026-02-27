/**
 * Real-Time Execution & Innovation Engine (REIE)
 * Beyond Facebook Live — structured professional live collaboration.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const SESSION_TYPES = ["project_sprint", "grant_cowriting", "startup_formation", "technical_debugging", "industry_roundtable", "institutional_strategy", "policy_drafting", "prototype_demo", "funding_milestone_review", "cross_border_coordination"] as const;
export type SessionType = typeof SESSION_TYPES[number];

export const PARTICIPANT_ROLES = ["project_lead", "technical_contributor", "funding_sponsor", "compliance_observer", "institutional_rep", "domain_expert", "moderator", "industry_liaison", "policy_advisor", "observer"] as const;
export type ParticipantRole = typeof PARTICIPANT_ROLES[number];

export const ACTION_TYPES = ["task", "milestone_tag", "decision", "funding_approval", "risk_flag", "scope_change", "compliance_note", "deliverable_definition"] as const;
export const DECISION_TYPES = ["general", "funding_approval", "scope_change", "risk_acceptance", "compliance_ruling", "technical_agreement", "milestone_completion"] as const;
export const RISK_TYPES = ["scope_creep", "budget_overcommitment", "compliance_risk", "ip_conflict", "trust_fragility", "skill_gap", "regulatory_mismatch", "execution_delay"] as const;
export const DOCUMENT_TYPES = ["proposal", "whiteboard", "code_snippet", "budget", "compliance_checklist", "technical_spec", "meeting_notes"] as const;

export const REIE_PHILOSOPHY = {
  category: "Real-Time Execution & Innovation",
  contrast: "Facebook Live broadcasts entertainment; REIE accelerates execution",
  principle: "Live sessions produce documented outcomes, not views",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface SessionInput {
  session_type: SessionType;
  title: string;
  description?: string;
  purpose?: string;
  linked_entity_id?: string;
  linked_entity_type?: string;
  expected_deliverables?: unknown[];
  compliance_context?: string;
  recording_policy?: string;
  scheduled_at?: string;
  created_by?: string;
  is_public?: boolean;
  domain_classification?: string;
  region?: string;
  funding_type?: string;
  institutional_host_id?: string;
}

export interface ParticipantInput {
  session_id: string;
  user_id: string;
  role: string;
  is_domain_authority?: boolean;
  is_moderator?: boolean;
}

export interface ActionItemInput {
  session_id: string;
  action_type?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  milestone_tag?: string;
  deadline?: string;
  priority?: string;
  linked_project_id?: string;
  compliance_note?: string;
  created_by?: string;
}

export interface DecisionInput {
  session_id: string;
  decision_type?: string;
  summary: string;
  rationale?: string;
  decided_by?: string;
  funding_implications?: Record<string, unknown>;
  compliance_notes?: string;
  risk_flags?: unknown[];
}

export interface EscrowPanelInput {
  session_id: string;
  escrow_balance?: number;
  milestone_status?: Record<string, unknown>;
  funding_release_conditions?: unknown[];
  sponsor_oversight?: boolean;
  budget_allocation?: Record<string, unknown>;
  compliance_checklist?: unknown[];
}

export interface CrossBorderInput {
  session_id: string;
  time_zones?: unknown[];
  jurisdictional_notes?: string;
  currency_references?: unknown[];
  regulatory_reminders?: unknown[];
  ip_disclosure_warnings?: string;
  cultural_guidance?: string;
}

export interface LiveDocumentInput {
  session_id: string;
  document_type?: string;
  title: string;
  content?: string;
  contributors?: unknown[];
  role_assignments?: Record<string, unknown>;
  citations?: unknown[];
  created_by?: string;
}

export interface ImpactIndexInput {
  session_id: string;
  tasks_created?: number;
  milestones_clarified?: number;
  funding_alignment_improved?: boolean;
  new_collaborators_added?: number;
  risk_factors_resolved?: number;
  deliverables_defined?: number;
  cross_border_established?: boolean;
  institutional_commitments?: number;
}

export interface AISummaryInput {
  session_id: string;
  executive_summary?: string;
  action_items?: unknown[];
  decision_log?: unknown[];
  risk_log?: unknown[];
  funding_implications?: Record<string, unknown>;
  compliance_notes?: unknown[];
  participant_contributions?: unknown[];
  next_steps?: unknown[];
  timeline_impact?: string;
  suggested_followup?: string;
}

export interface ArchiveInput {
  session_id: string;
  video_recording_url?: string;
  transcript?: string;
  linked_documents?: unknown[];
  versioned_edits?: unknown[];
  funding_references?: unknown[];
  search_keywords?: string[];
}

export interface RiskFlagInput {
  session_id: string;
  risk_type: string;
  description: string;
  severity?: string;
  flagged_by?: string;
}

export interface SessionSearchFilters {
  session_type?: SessionType;
  status?: string;
  is_public?: boolean;
  domain_classification?: string;
  region?: string;
  limit?: number;
}

// ─── Sessions ───────────────────────────────────────────────
export async function createSession(input: SessionInput) {
  const { data, error } = await (supabase as any).from("reie_sessions").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSessions(filters: SessionSearchFilters = {}) {
  let q = (supabase as any).from("reie_sessions").select("*").order("scheduled_at", { ascending: false });
  if (filters.session_type) q = q.eq("session_type", filters.session_type);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.is_public !== undefined) q = q.eq("is_public", filters.is_public);
  if (filters.domain_classification) q = q.eq("domain_classification", filters.domain_classification);
  if (filters.region) q = q.eq("region", filters.region);
  q = q.limit(filters.limit ?? 50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getSession(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_sessions").select("*").eq("id", sessionId).single();
  if (error) throw error;
  return data;
}

export async function updateSession(sessionId: string, updates: Partial<SessionInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("reie_sessions").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", sessionId).select().single();
  if (error) throw error;
  return data;
}

export async function startSession(sessionId: string) {
  return updateSession(sessionId, { status: "live", started_at: new Date().toISOString() });
}

export async function endSession(sessionId: string) {
  return updateSession(sessionId, { status: "ended", ended_at: new Date().toISOString() });
}

// ─── Participants ───────────────────────────────────────────
export async function addParticipant(input: ParticipantInput) {
  const { data, error } = await (supabase as any).from("reie_participants").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getParticipants(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_participants").select("*").eq("session_id", sessionId).order("joined_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Action Items ───────────────────────────────────────────
export async function createActionItem(input: ActionItemInput) {
  const { data, error } = await (supabase as any).from("reie_action_items").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getActionItems(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_action_items").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateActionItemStatus(itemId: string, status: string) {
  const updates: Record<string, unknown> = { status };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();
  const { data, error } = await (supabase as any).from("reie_action_items").update(updates).eq("id", itemId).select().single();
  if (error) throw error;
  return data;
}

// ─── Decisions ──────────────────────────────────────────────
export async function logDecision(input: DecisionInput) {
  const { data, error } = await (supabase as any).from("reie_decisions").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getDecisions(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_decisions").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Escrow Panel ───────────────────────────────────────────
export async function saveEscrowPanel(input: EscrowPanelInput) {
  const { data, error } = await (supabase as any).from("reie_escrow_panel").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getEscrowPanel(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_escrow_panel").select("*").eq("session_id", sessionId).order("updated_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

export async function updateEscrowPanel(panelId: string, updates: Partial<EscrowPanelInput>) {
  const { data, error } = await (supabase as any).from("reie_escrow_panel").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", panelId).select().single();
  if (error) throw error;
  return data;
}

// ─── Cross-Border ───────────────────────────────────────────
export async function saveCrossBorderContext(input: CrossBorderInput) {
  const { data, error } = await (supabase as any).from("reie_cross_border").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCrossBorderContext(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_cross_border").select("*").eq("session_id", sessionId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Live Documents ─────────────────────────────────────────
export async function createLiveDocument(input: LiveDocumentInput) {
  const { data, error } = await (supabase as any).from("reie_live_documents").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getLiveDocuments(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_live_documents").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateLiveDocument(docId: string, content: string, version: number) {
  const { data, error } = await (supabase as any).from("reie_live_documents").update({ content, version, updated_at: new Date().toISOString() }).eq("id", docId).select().single();
  if (error) throw error;
  return data;
}

// ─── Impact Index ───────────────────────────────────────────
export async function saveImpactIndex(input: ImpactIndexInput) {
  const composite = (input.tasks_created ?? 0) * 2 + (input.milestones_clarified ?? 0) * 5 + (input.new_collaborators_added ?? 0) * 3 + (input.risk_factors_resolved ?? 0) * 4 + (input.deliverables_defined ?? 0) * 3 + (input.institutional_commitments ?? 0) * 5 + (input.funding_alignment_improved ? 10 : 0) + (input.cross_border_established ? 8 : 0);
  const { data, error } = await (supabase as any).from("reie_impact_index").insert({ ...input, composite_impact_score: composite }).select().single();
  if (error) throw error;
  return data;
}

export async function getImpactIndex(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_impact_index").select("*").eq("session_id", sessionId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── AI Summaries ───────────────────────────────────────────
export async function saveAISummary(input: AISummaryInput) {
  const { data, error } = await (supabase as any).from("reie_ai_summaries").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAISummary(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_ai_summaries").select("*").eq("session_id", sessionId).order("generated_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Archives ───────────────────────────────────────────────
export async function archiveSession(input: ArchiveInput) {
  const { data, error } = await (supabase as any).from("reie_archives").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getArchive(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_archives").select("*").eq("session_id", sessionId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

export async function searchArchives(keyword: string) {
  const { data, error } = await (supabase as any).from("reie_archives").select("*").contains("search_keywords", [keyword]).limit(50);
  if (error) throw error;
  return data ?? [];
}

// ─── Risk Flags ─────────────────────────────────────────────
export async function flagRisk(input: RiskFlagInput) {
  const { data, error } = await (supabase as any).from("reie_risk_flags").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getRiskFlags(sessionId: string) {
  const { data, error } = await (supabase as any).from("reie_risk_flags").select("*").eq("session_id", sessionId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function resolveRiskFlag(flagId: string) {
  const { data, error } = await (supabase as any).from("reie_risk_flags").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", flagId).select().single();
  if (error) throw error;
  return data;
}

// ─── Composite Impact Score ─────────────────────────────────
export function computeSessionImpact(metrics: {
  tasks_created: number;
  milestones_clarified: number;
  funding_alignment_improved: boolean;
  new_collaborators_added: number;
  risk_factors_resolved: number;
  deliverables_defined: number;
  cross_border_established: boolean;
  institutional_commitments: number;
}): number {
  return metrics.tasks_created * 2 + metrics.milestones_clarified * 5 + metrics.new_collaborators_added * 3 + metrics.risk_factors_resolved * 4 + metrics.deliverables_defined * 3 + metrics.institutional_commitments * 5 + (metrics.funding_alignment_improved ? 10 : 0) + (metrics.cross_border_established ? 8 : 0);
}
