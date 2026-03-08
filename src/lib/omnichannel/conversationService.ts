/**
 * Omnichannel Conversation Service
 */
import { supabase } from "@/integrations/supabase/client";

export type ChannelType = "webchat" | "whatsapp" | "instagram" | "linkedin" | "email";
export type ConversationStatus = "open" | "pending" | "escalated" | "resolved" | "closed";

export async function getConversations(filters?: { status?: string; channel?: string; assigned?: string }) {
  let q = (supabase as any).from("omni_conversations").select("*, omni_contacts(*)").order("last_message_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.channel) q = q.eq("channel_type", filters.channel);
  if (filters?.assigned) q = q.eq("assigned_agent", filters.assigned);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getConversation(id: string) {
  const { data, error } = await (supabase as any).from("omni_conversations").select("*, omni_contacts(*)").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await (supabase as any).from("omni_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(contactId: string, channel: ChannelType) {
  const { data, error } = await (supabase as any).from("omni_conversations").insert({
    contact_id: contactId, channel_type: channel, status: "open", assigned_agent: "ai",
  }).select().single();
  if (error) throw error;
  return data;
}

export async function sendMessage(input: {
  conversation_id: string; contact_id: string; content: string;
  direction: "inbound" | "outbound" | "system"; sender_type: string; channel_type: ChannelType;
  intent?: string; sentiment?: string; ai_confidence?: number;
}) {
  const { data, error } = await (supabase as any).from("omni_messages").insert(input).select().single();
  if (error) throw error;
  // Update conversation timestamp
  await (supabase as any).from("omni_conversations").update({
    last_message_at: new Date().toISOString(),
    ...(input.intent ? { current_intent: input.intent } : {}),
    ...(input.sentiment ? { sentiment: input.sentiment } : {}),
  }).eq("id", input.conversation_id);
  return data;
}

export async function updateConversation(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_conversations").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function escalateConversation(conversationId: string, reason: string, summary: string, intent?: string) {
  const conv = await getConversation(conversationId);
  await updateConversation(conversationId, { status: "escalated", assigned_agent: "human", escalated_at: new Date().toISOString() });
  const { data, error } = await (supabase as any).from("omni_escalations").insert({
    conversation_id: conversationId, contact_id: conv.contact_id,
    reason, ai_summary: summary, detected_intent: intent, priority: "high", status: "pending",
  }).select().single();
  if (error) throw error;
  return data;
}
