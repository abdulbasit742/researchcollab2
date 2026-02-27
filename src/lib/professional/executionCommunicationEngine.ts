/**
 * Execution Communication & Collaboration Engine (ECCE)
 * Milestone-aware, escrow-integrated, decision-logged communication.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const ECCE_ROOM_TYPES = [
  "direct_professional", "project_chat", "grant_coordination",
  "institutional_channel", "startup_team", "compliance_review",
  "initiative_coordination", "marketplace_transaction",
  "event_collaboration", "secure_confidential",
] as const;
export type ECCERoomType = typeof ECCE_ROOM_TYPES[number];

export const ECCE_DECISION_TYPES = [
  "decision", "action_item", "funding_approval", "compliance_notice",
  "technical_agreement", "scope_change", "risk_flag",
  "milestone_completion", "dispute_notification",
] as const;
export type ECCEDecisionType = typeof ECCE_DECISION_TYPES[number];

export const ECCE_MEMBER_ROLES = [
  "owner", "lead", "compliance_officer", "sponsor", "member", "observer",
] as const;

export const ECCE_ARCHIVE_TYPES = [
  "decision_log", "milestone_discussion", "funding_approval",
  "scope_change", "conflict_resolution", "compliance_notice",
  "institutional_approval", "brainstorming_summary",
] as const;

export const ECCE_PHILOSOPHY = {
  facebookMessenger: "Conversation tool",
  rcollabMessaging: "Execution infrastructure",
  facebookOptimizes: "Engagement",
  rcollabOptimizes: "Execution clarity",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface ChatRoomInput {
  room_type: string;
  title: string;
  description?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
  privacy_level?: string;
  is_confidential?: boolean;
  nda_required?: boolean;
  encryption_mode?: string;
  created_by: string;
  institution_id?: string;
}

export interface RoomMemberInput {
  room_id: string;
  user_id: string;
  role?: string;
  trust_weight?: number;
  is_domain_authority?: boolean;
  is_compliance_officer?: boolean;
}

export interface DecisionLogInput {
  room_id: string;
  message_id?: string;
  decision_type: string;
  summary: string;
  logged_by: string;
  linked_entity_id?: string;
  metadata?: Record<string, unknown>;
}

export interface ActionItemInput {
  room_id: string;
  message_id?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  deadline?: string;
  priority?: string;
  ai_extracted?: boolean;
  created_by: string;
}

export interface EscrowContextInput {
  room_id: string;
  escrow_id?: string;
  deal_id?: string;
  locked_amount?: number;
  next_release_condition?: string;
  milestone_status?: string;
  compliance_reminders?: string[];
  payment_timeline?: Record<string, unknown>;
}

export interface DisputeThreadInput {
  room_id: string;
  raised_by: string;
  dispute_type?: string;
  description?: string;
  evidence?: Record<string, unknown>[];
}

export interface MeetingInput {
  room_id: string;
  title: string;
  agenda?: Record<string, unknown>[];
  scheduled_at?: string;
  duration_minutes?: number;
  created_by: string;
}

export interface HealthAnalyticsInput {
  room_id: string;
  response_time_avg_hours?: number;
  unresolved_action_items?: number;
  conflict_frequency?: number;
  topic_drift_score?: number;
  execution_delay_risk?: number;
  communication_density?: number;
  leadership_balance?: number;
  alert_level?: string;
}

export interface ArchiveInput {
  room_id: string;
  archive_type: string;
  title: string;
  content?: string;
  metadata?: Record<string, unknown>;
  archived_by: string;
}

export interface RoomSearchFilters {
  room_type?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
  institution_id?: string;
  status?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeHealthAlertLevel(input: Omit<HealthAnalyticsInput, "room_id" | "alert_level">): string {
  const risk = (input.execution_delay_risk ?? 0) * 0.3
    + (input.conflict_frequency ?? 0) * 0.25
    + (input.topic_drift_score ?? 0) * 0.15
    + ((input.unresolved_action_items ?? 0) > 5 ? 30 : (input.unresolved_action_items ?? 0) * 5) * 0.15
    + ((input.response_time_avg_hours ?? 0) > 48 ? 30 : 0) * 0.15;
  if (risk > 60) return "critical";
  if (risk > 35) return "warning";
  return "healthy";
}

// =====================================================
// DATA ACCESS
// =====================================================

const S = supabase as any;

// --- Chat Rooms ---
export async function createChatRoom(input: ChatRoomInput): Promise<string> {
  const { data, error } = await S.from("ecce_chat_rooms").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getChatRooms(filters?: RoomSearchFilters) {
  let q = S.from("ecce_chat_rooms").select("*");
  if (filters?.room_type) q = q.eq("room_type", filters.room_type);
  if (filters?.linked_entity_type) q = q.eq("linked_entity_type", filters.linked_entity_type);
  if (filters?.linked_entity_id) q = q.eq("linked_entity_id", filters.linked_entity_id);
  if (filters?.institution_id) q = q.eq("institution_id", filters.institution_id);
  q = q.eq("status", filters?.status ?? "active");
  const { data, error } = await q.order("updated_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getChatRoom(id: string) {
  const { data, error } = await S.from("ecce_chat_rooms").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Members ---
export async function addRoomMember(input: RoomMemberInput): Promise<void> {
  const { error } = await S.from("ecce_room_members").upsert(input, { onConflict: "room_id,user_id" });
  if (error) throw error;
}

export async function getRoomMembers(roomId: string) {
  const { data, error } = await S.from("ecce_room_members").select("*").eq("room_id", roomId).order("trust_weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function removeRoomMember(roomId: string, userId: string): Promise<void> {
  const { error } = await S.from("ecce_room_members").delete().eq("room_id", roomId).eq("user_id", userId);
  if (error) throw error;
}

// --- Decision Logs ---
export async function logDecision(input: DecisionLogInput): Promise<string> {
  const { data, error } = await S.from("ecce_decision_logs").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getDecisionLogs(roomId: string) {
  const { data, error } = await S.from("ecce_decision_logs").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

// --- Action Items ---
export async function createActionItem(input: ActionItemInput): Promise<string> {
  const { data, error } = await S.from("ecce_action_items").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getActionItems(roomId: string, status?: string) {
  let q = S.from("ecce_action_items").select("*").eq("room_id", roomId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function updateActionItemStatus(id: string, status: string): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === "completed") updates.completed_at = new Date().toISOString();
  const { error } = await S.from("ecce_action_items").update(updates).eq("id", id);
  if (error) throw error;
}

// --- Escrow Context ---
export async function saveEscrowContext(input: EscrowContextInput): Promise<void> {
  const { error } = await S.from("ecce_escrow_context").upsert({ ...input, last_synced_at: new Date().toISOString() }, { onConflict: "room_id" });
  if (error) throw error;
}

export async function getEscrowContext(roomId: string) {
  const { data, error } = await S.from("ecce_escrow_context").select("*").eq("room_id", roomId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Disputes ---
export async function createDisputeThread(input: DisputeThreadInput): Promise<string> {
  const { data, error } = await S.from("ecce_dispute_threads").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getDisputeThreads(roomId: string) {
  const { data, error } = await S.from("ecce_dispute_threads").select("*").eq("room_id", roomId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function resolveDispute(id: string, resolution: string): Promise<void> {
  const { error } = await S.from("ecce_dispute_threads").update({ status: "resolved", resolution, resolved_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Meetings ---
export async function createMeeting(input: MeetingInput): Promise<string> {
  const { data, error } = await S.from("ecce_meetings").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getMeetings(roomId: string) {
  const { data, error } = await S.from("ecce_meetings").select("*").eq("room_id", roomId).order("scheduled_at", { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function updateMeetingSummary(id: string, updates: { transcription?: string; ai_summary?: string; decisions_extracted?: Record<string, unknown>[]; action_items_extracted?: Record<string, unknown>[]; status?: string }): Promise<void> {
  const { error } = await S.from("ecce_meetings").update(updates).eq("id", id);
  if (error) throw error;
}

// --- Health Analytics ---
export async function saveHealthAnalytics(input: HealthAnalyticsInput): Promise<void> {
  const alert_level = computeHealthAlertLevel(input);
  const { error } = await S.from("ecce_health_analytics").upsert({ ...input, alert_level, computed_at: new Date().toISOString() }, { onConflict: "room_id" });
  if (error) throw error;
}

export async function getHealthAnalytics(roomId: string) {
  const { data, error } = await S.from("ecce_health_analytics").select("*").eq("room_id", roomId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Archive ---
export async function archiveItem(input: ArchiveInput): Promise<string> {
  const { data, error } = await S.from("ecce_archive").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function getArchive(roomId: string, archiveType?: string) {
  let q = S.from("ecce_archive").select("*").eq("room_id", roomId);
  if (archiveType) q = q.eq("archive_type", archiveType);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}
