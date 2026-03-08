/**
 * Sponsor Matching Engine — AI-generated sponsor-project matches.
 * Advisory-only. Does NOT mutate financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

export type MatchTargetType = "project" | "researcher" | "institution" | "problem" | "lab";

export async function getSponsorMatches(filters?: {
  sponsorId?: string;
  targetType?: MatchTargetType;
  status?: string;
  minScore?: number;
}) {
  let q = (supabase as any)
    .from("sponsor_matches")
    .select("*")
    .order("match_score", { ascending: false });

  if (filters?.sponsorId) q = q.eq("sponsor_id", filters.sponsorId);
  if (filters?.targetType) q = q.eq("target_type", filters.targetType);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.minScore) q = q.gte("match_score", filters.minScore);

  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createSponsorMatch(input: {
  sponsor_id?: string;
  target_type: MatchTargetType;
  target_id: string;
  match_score?: number;
  match_reasons?: string[];
  domain_alignment?: number;
  funding_fit?: number;
  execution_fit?: number;
}) {
  const { data, error } = await (supabase as any)
    .from("sponsor_matches")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMatchStatus(id: string, status: string) {
  const { data, error } = await (supabase as any)
    .from("sponsor_matches")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
