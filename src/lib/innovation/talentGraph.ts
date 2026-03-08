/**
 * Global Talent Graph — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTalentGraphEdges(userId?: string) {
  let q = (supabase as any).from("talent_graph_edges").select("*").order("trust_weighted_score", { ascending: false });
  if (userId) q = q.or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createTalentEdge(input: {
  source_user_id: string; target_user_id: string;
  relationship_type: string; shared_domains?: string[];
  shared_projects?: number; weight?: number;
}) {
  const { data, error } = await (supabase as any).from("talent_graph_edges")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export const RELATIONSHIP_TYPES = ["collaboration", "co_research", "mentorship", "endorsement"];
