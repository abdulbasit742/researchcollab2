/**
 * Research Opportunity Engine (ROE) — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getResearchOpportunities(filters?: { domain?: string; region?: string; status?: string }) {
  let q = supabase.from("research_opportunities").select("*").order("research_gap_score", { ascending: false });
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.region) q = q.eq("region", filters.region);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createOpportunity(input: {
  title: string; description?: string; problem_id?: string;
  research_gap_score?: number; market_potential?: string;
  funding_interest?: string; domain?: string; region?: string;
  suggested_institutions?: string[];
}) {
  const { data, error } = await supabase.from("research_opportunities").insert(input).select().single();
  if (error) throw error;
  return data;
}

export function computeOpportunityScore(params: {
  citationGrowth: number; patentActivity: number; fundingTrend: number; marketSize: number;
}): number {
  return Math.min(100, Math.round(
    params.citationGrowth * 0.3 + params.patentActivity * 0.25 +
    params.fundingTrend * 0.25 + params.marketSize * 0.2
  ));
}
