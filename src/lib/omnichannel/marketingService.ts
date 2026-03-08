/**
 * AI Marketing Engine — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getMarketingContent(filters?: { status?: string; channel?: string; content_type?: string }) {
  let q = (supabase as any).from("omni_marketing_content").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.channel) q = q.eq("channel", filters.channel);
  if (filters?.content_type) q = q.eq("content_type", filters.content_type);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createMarketingContent(input: {
  content_type: string; channel: string; title?: string; body: string;
  hashtags?: string[]; target_audience?: string; scheduled_at?: string; created_by?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_marketing_content").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateMarketingContent(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_marketing_content").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getContentCalendar(month?: string) {
  let q = (supabase as any).from("omni_content_calendar").select("*, omni_marketing_content(title, channel, content_type)").order("scheduled_date", { ascending: true });
  if (month) {
    const start = `${month}-01`;
    const end = `${month}-31`;
    q = q.gte("scheduled_date", start).lte("scheduled_date", end);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function scheduleContent(contentId: string, date: string, channel: string, slotTime?: string) {
  const { data, error } = await (supabase as any).from("omni_content_calendar").insert({ content_id: contentId, scheduled_date: date, channel, slot_time: slotTime }).select().single();
  if (error) throw error;
  return data;
}

export const CONTENT_TYPES = ["linkedin_post", "instagram_post", "research_announcement", "success_story", "platform_update", "blog_article", "email_newsletter"];
export const MARKETING_CHANNELS = ["linkedin", "instagram", "email", "blog", "twitter"];
