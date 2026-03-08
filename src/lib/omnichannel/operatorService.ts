/**
 * Operator & Agent Performance Service — Systems 23, 39, 40
 */
import { supabase } from "@/integrations/supabase/client";

export async function getAgentRuns(filters?: { agent_type?: string; limit?: number }) {
  let q = (supabase as any).from("omni_agent_runs").select("*").order("created_at", { ascending: false });
  if (filters?.agent_type) q = q.eq("agent_type", filters.agent_type);
  const { data, error } = await q.limit(filters?.limit || 100);
  if (error) throw error;
  return data ?? [];
}

export async function getAgentPerformance() {
  const { data, error } = await (supabase as any).from("omni_agent_performance").select("*").order("period_start", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getChannelHealth() {
  const { data, error } = await (supabase as any).from("omni_channel_health").select("*").order("checked_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOperatorNotes(contactId: string) {
  const { data, error } = await (supabase as any).from("omni_operator_notes").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addOperatorNote(input: {
  conversation_id?: string; contact_id?: string; lead_id?: string;
  note_text: string; note_type?: string; created_by?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_operator_notes").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getPolicyFlags(filters?: { resolved?: boolean }) {
  let q = (supabase as any).from("omni_policy_flags").select("*, omni_contacts(display_name), omni_conversations(channel_type)").order("created_at", { ascending: false });
  if (filters?.resolved !== undefined) q = q.eq("resolved", filters.resolved);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getDeliveryLogs(conversationId?: string) {
  let q = (supabase as any).from("omni_delivery_logs").select("*").order("created_at", { ascending: false });
  if (conversationId) q = q.eq("conversation_id", conversationId);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getConversationSummaries(conversationId: string) {
  const { data, error } = await (supabase as any).from("omni_conversation_summaries").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
