/**
 * AI Research Discovery Engine Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getDiscoveries(filters?: { discovery_type?: string; research_domain?: string; status?: string }) {
  let q = (supabase as any).from("omni_research_discoveries").select("*").order("relevance_score", { ascending: false });
  if (filters?.discovery_type) q = q.eq("discovery_type", filters.discovery_type);
  if (filters?.research_domain) q = q.eq("research_domain", filters.research_domain);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createDiscovery(input: {
  title: string; discovery_type?: string; source_type?: string;
  source_url?: string; summary?: string; relevance_score?: number;
  research_domain?: string; keywords?: string[]; metadata?: Record<string, unknown>;
}) {
  const { data, error } = await (supabase as any).from("omni_research_discoveries").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateDiscovery(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_research_discoveries").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export const DISCOVERY_TYPES = ["trend", "paper", "patent", "technology", "funding_opportunity", "collaboration"];
export const RESEARCH_DOMAINS = ["ai_ml", "biotech", "climate", "energy", "materials", "quantum", "space", "social_science", "health", "fintech"];
