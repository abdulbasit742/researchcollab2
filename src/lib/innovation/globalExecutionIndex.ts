/**
 * Global Execution Index — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getExecutionRankings(filters?: { entity_type?: string; domain?: string; region?: string }) {
  let q = (supabase as any).from("global_execution_rankings").select("*").order("composite_rank_score", { ascending: false });
  if (filters?.entity_type) q = q.eq("entity_type", filters.entity_type);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.region) q = q.eq("region", filters.region);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export function computeCompositeRank(params: {
  milestoneReliability: number; researchImpact: number;
  fundingReliability: number; collaborationSuccess: number;
}): number {
  return Math.min(100, Math.round(
    params.milestoneReliability * 0.35 + params.researchImpact * 0.25 +
    params.fundingReliability * 0.2 + params.collaborationSuccess * 0.2
  ));
}

export const ENTITY_TYPES = ["researcher", "institution", "lab", "project"];
