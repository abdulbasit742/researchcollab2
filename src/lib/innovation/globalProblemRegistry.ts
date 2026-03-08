/**
 * Global Problem Registry (GPR) — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getGlobalProblems(category?: string) {
  let q = supabase.from("global_problems").select("*").order("severity_score", { ascending: false });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getGlobalProblem(id: string) {
  const { data, error } = await supabase.from("global_problems").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function proposeProblem(input: {
  title: string; category: string; description?: string;
  severity_score?: number; affected_population?: string;
  tags?: string[]; proposed_by?: string; institution_id?: string;
}) {
  const { data, error } = await supabase.from("global_problems").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function linkProjectToProblem(problem_id: string, project_id: string, linked_by?: string) {
  const { data, error } = await supabase.from("problem_project_links").insert({ problem_id, project_id, linked_by }).select().single();
  if (error) throw error;
  return data;
}

export async function getProblemProjectLinks(problem_id: string) {
  const { data, error } = await supabase.from("problem_project_links").select("*").eq("problem_id", problem_id);
  if (error) throw error;
  return data;
}

export async function voteProblem(problem_id: string, voter_id: string) {
  const { data, error } = await supabase.from("problem_votes").insert({ problem_id, voter_id }).select().single();
  if (error) throw error;
  return data;
}

export async function getProblemVotes(problem_id: string) {
  const { data, error } = await supabase.from("problem_votes").select("*").eq("problem_id", problem_id);
  if (error) throw error;
  return data;
}

export const PROBLEM_CATEGORIES = [
  "Climate Resilience", "Food Security", "AI Safety", "Water Purification",
  "Disease Detection", "Renewable Energy", "Education Accessibility",
  "Cybersecurity", "Mental Health", "Space Exploration", "Biodiversity",
  "Urban Planning", "Financial Inclusion", "Digital Divide",
];
