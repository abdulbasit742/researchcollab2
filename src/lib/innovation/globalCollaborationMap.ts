/**
 * Global Collaboration Map (GCM) — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getCollaborationMapNodes(filters?: { domain?: string; country_code?: string }) {
  let q = supabase.from("collaboration_map_nodes").select("*").order("active_teams", { ascending: false });
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.country_code) q = q.eq("country_code", filters.country_code);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function addMapNode(input: {
  node_type: string; label: string; country_code?: string;
  domain?: string; active_teams?: number; active_projects?: number;
  latitude?: number; longitude?: number;
}) {
  const { data, error } = await supabase.from("collaboration_map_nodes").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCollaborationSuggestions(status?: string) {
  let q = supabase.from("collaboration_suggestions").select("*").order("compatibility_score", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createCollaborationSuggestion(input: {
  team_a_id?: string; team_b_id?: string; reason?: string;
  compatibility_score?: number; shared_domains?: string[];
}) {
  const { data, error } = await supabase.from("collaboration_suggestions").insert(input).select().single();
  if (error) throw error;
  return data;
}
