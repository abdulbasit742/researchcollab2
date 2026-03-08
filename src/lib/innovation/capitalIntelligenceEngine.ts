/**
 * Capital Intelligence Engine (CIE) — Advisory-only service layer
 */
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function getCapitalIntelligenceScores(projectId?: string) {
  let q = supabase.from("capital_intelligence_scores").select("*").order("computed_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function computeAndSaveScore(input: {
  project_id: string;
  success_probability: number;
  execution_reliability: number;
  commercialization_likelihood: number;
  team_trust_tier: string;
  recommendation_type: string;
  reasoning: Record<string, unknown>;
}) {
  const { data, error } = await supabase.from("capital_intelligence_scores").insert([{ ...input, reasoning: input.reasoning as unknown as Json }]).select().single();
  if (error) throw error;
  return data;
}

export function computeSuccessProbability(params: {
  milestoneCompletionRate: number; teamTrustScore: number;
  fundingAdequacy: number; domainExperience: number;
}): number {
  return Math.min(100, Math.round(
    params.milestoneCompletionRate * 0.35 + params.teamTrustScore * 0.3 +
    params.fundingAdequacy * 0.2 + params.domainExperience * 0.15
  ));
}
