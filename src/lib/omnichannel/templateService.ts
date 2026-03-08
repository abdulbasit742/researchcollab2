/**
 * Message Template Service — System 18, 42
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTemplates(filters?: { channel_type?: string; category?: string; approved_only?: boolean }) {
  let q = (supabase as any).from("omni_message_templates").select("*").order("usage_count", { ascending: false });
  if (filters?.channel_type) q = q.eq("channel_type", filters.channel_type);
  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.approved_only) q = q.eq("is_approved", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createTemplate(input: {
  template_name: string; channel_type?: string; category?: string;
  content_template: string; variables?: string[];
}) {
  const { data, error } = await (supabase as any).from("omni_message_templates").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function approveTemplate(id: string, approvedBy: string) {
  const { data, error } = await (supabase as any).from("omni_message_templates").update({
    is_approved: true, approved_by: approvedBy, approved_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function renderTemplate(template: string, variables: Record<string, string>): Promise<string> {
  let rendered = template;
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return rendered;
}
