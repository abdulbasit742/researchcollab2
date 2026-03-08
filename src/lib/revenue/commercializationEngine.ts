/**
 * Research Commercialization Engine — recommends paths to convert research into ventures.
 * Advisory-only. Does NOT mutate financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

export type CommercializationPathType = "startup" | "licensing" | "industry_partnership" | "sponsored_project" | "consulting" | "product";

export async function getCommercializationPaths(filters?: {
  pathType?: CommercializationPathType;
  status?: string;
  userId?: string;
}) {
  let q = (supabase as any)
    .from("commercialization_paths")
    .select("*")
    .order("market_potential_score", { ascending: false });

  if (filters?.pathType) q = q.eq("path_type", filters.pathType);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.userId) q = q.eq("source_user_id", filters.userId);

  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createCommercializationPath(input: {
  source_project_id?: string;
  source_user_id?: string;
  path_type: CommercializationPathType;
  title: string;
  description?: string;
  market_potential_score?: number;
  readiness_score?: number;
  recommended_steps?: Array<{ step: string; priority: string }>;
}) {
  const { data, error } = await (supabase as any)
    .from("commercialization_paths")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCommercializationPath(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any)
    .from("commercialization_paths")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const PATH_TYPES: { value: CommercializationPathType; label: string; description: string }[] = [
  { value: "startup", label: "Startup Venture", description: "Convert research into a startup company" },
  { value: "licensing", label: "Technology Licensing", description: "License IP to industry partners" },
  { value: "industry_partnership", label: "Industry Partnership", description: "Joint venture with corporate partner" },
  { value: "sponsored_project", label: "Sponsored Project", description: "Attract sponsor funding for continued R&D" },
  { value: "consulting", label: "Consulting Services", description: "Offer expert consulting based on research" },
  { value: "product", label: "Product Development", description: "Build a commercial product from research" },
];
