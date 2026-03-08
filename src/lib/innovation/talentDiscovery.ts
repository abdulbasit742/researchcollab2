/**
 * Global Talent Discovery Engine — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTalentProfiles(filters?: { domain?: string; availability?: string }) {
  let q = supabase.from("talent_discovery_profiles").select("*").order("discovery_score", { ascending: false });
  if (filters?.availability) q = q.eq("availability", filters.availability);
  if (filters?.domain) q = q.contains("domains", [filters.domain]);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function upsertTalentProfile(input: {
  user_id: string; completed_milestones?: number;
  knowledge_contributions?: number; peer_endorsements?: number;
  cross_border_collaborations?: number; top_skills?: string[];
  domains?: string[]; discovery_score?: number; availability?: string;
}) {
  const { data, error } = await supabase.from("talent_discovery_profiles")
    .upsert(input, { onConflict: "user_id" }).select().single();
  if (error) throw error;
  return data;
}

export async function getTalentRecommendations(forType: string, forId: string) {
  const { data, error } = await supabase.from("talent_recommendations")
    .select("*").eq("recommended_for_type", forType).eq("recommended_for_id", forId)
    .order("match_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTalentRecommendation(input: {
  talent_user_id: string; recommended_for_type: string;
  recommended_for_id: string; match_score?: number; match_reasons?: string[];
}) {
  const { data, error } = await supabase.from("talent_recommendations").insert(input).select().single();
  if (error) throw error;
  return data;
}
