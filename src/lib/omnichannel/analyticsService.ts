/**
 * Omnichannel Analytics Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getAnalyticsEvents(filters?: { event_type?: string; channel?: string; days?: number }) {
  const since = new Date();
  since.setDate(since.getDate() - (filters?.days || 30));
  let q = (supabase as any).from("omni_analytics_events").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false });
  if (filters?.event_type) q = q.eq("event_type", filters.event_type);
  if (filters?.channel) q = q.eq("channel", filters.channel);
  const { data, error } = await q.limit(1000);
  if (error) throw error;
  return data ?? [];
}

export async function logAnalyticsEvent(event: {
  event_type: string; channel?: string; contact_id?: string; conversation_id?: string; metadata?: Record<string, unknown>;
}) {
  const { error } = await (supabase as any).from("omni_analytics_events").insert(event);
  if (error) throw error;
}

export async function getConversationStats() {
  const { data: conversations, error } = await (supabase as any).from("omni_conversations").select("channel_type, status, assigned_agent, sales_stage");
  if (error) throw error;
  const stats = {
    total: conversations?.length || 0,
    byChannel: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    aiHandled: 0,
    humanHandled: 0,
    escalated: 0,
  };
  conversations?.forEach((c: any) => {
    stats.byChannel[c.channel_type] = (stats.byChannel[c.channel_type] || 0) + 1;
    stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
    if (c.assigned_agent === "ai") stats.aiHandled++;
    else stats.humanHandled++;
    if (c.status === "escalated") stats.escalated++;
  });
  return stats;
}
