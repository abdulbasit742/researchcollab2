/**
 * Autonomous Research Labs — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getResearchLabs(domain?: string) {
  let q = supabase.from("research_labs").select("*").order("created_at", { ascending: false });
  if (domain) q = q.eq("domain", domain);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createResearchLab(input: {
  name: string; description?: string; domain: string;
  governance_type?: string; created_by?: string; institution_id?: string; tags?: string[];
}) {
  const { data, error } = await supabase.from("research_labs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getLabMembers(lab_id: string) {
  const { data, error } = await supabase.from("research_lab_members").select("*").eq("lab_id", lab_id);
  if (error) throw error;
  return data;
}

export async function joinLab(lab_id: string, user_id: string, role?: string) {
  const { data, error } = await supabase.from("research_lab_members").insert({ lab_id, user_id, role: role || "member" }).select().single();
  if (error) throw error;
  return data;
}
