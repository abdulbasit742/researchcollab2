/**
 * Knowledge Base & Retrieval Service — System 25
 */
import { supabase } from "@/integrations/supabase/client";

export async function getKnowledgeArticles(filters?: { category?: string; search?: string }) {
  let q = (supabase as any).from("omni_knowledge_base").select("*").eq("is_active", true).order("usage_count", { ascending: false });
  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.search) q = q.ilike("title", `%${filters.search}%`);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createKnowledgeArticle(input: {
  category: string; title: string; content: string; tags?: string[]; channel_types?: string[];
}) {
  const { data, error } = await (supabase as any).from("omni_knowledge_base").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateKnowledgeArticle(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_knowledge_base").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function incrementUsage(id: string) {
  const { data } = await (supabase as any).from("omni_knowledge_base").select("usage_count").eq("id", id).single();
  if (data) await (supabase as any).from("omni_knowledge_base").update({ usage_count: (data.usage_count || 0) + 1 }).eq("id", id);
}

export const KB_CATEGORIES = ["faq", "product", "pricing", "onboarding", "institution", "sponsor", "dataset", "events", "campaign", "sales_playbook"];
