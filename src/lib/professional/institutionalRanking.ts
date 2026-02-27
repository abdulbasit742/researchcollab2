/**
 * Global Institutional Execution & Innovation Ranking Engine (GIEIRE)
 * Superior to QS + Times Higher Education + ARWU.
 * 15-dimension execution-based institutional ranking.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const GIEIRE_TRANSPARENCY = {
  philosophy: "Performance-based infrastructure intelligence — not reputation surveys",
  dimensions: "15 execution dimensions replace citation + survey dominance",
  normalization: "Field-normalized to prevent STEM-heavy bias",
  anti_manipulation: "Detects citation inflation, grant cycling, collaboration rings",
};

export const RANKING_WEIGHTS = {
  research_impact: 0.08,
  grant_execution: 0.08,
  funding_efficiency: 0.08,
  commercialization_impact: 0.08,
  collaboration_strength: 0.07,
  institutional_reliability: 0.08,
  innovation_yield: 0.07,
  policy_societal_influence: 0.06,
  global_collaboration_diversity: 0.06,
  longitudinal_stability: 0.06,
  graduate_industry_placement: 0.07,
  escrow_integrity: 0.06,
  research_to_market_velocity: 0.06,
  cross_discipline_integration: 0.05,
  compliance_audit_integrity: 0.04,
};

export const MANIPULATION_TYPES = [
  "citation_inflation", "grant_cycling", "collaboration_ring",
  "budget_inflation", "self_dealing_commercialization", "patent_stacking",
] as const;

// =====================================================
// TYPES
// =====================================================

export interface InstitutionalRankingInput {
  institution_id: string;
  institution_name: string;
  research_impact_score: number;
  grant_execution_score: number;
  funding_efficiency_score: number;
  commercialization_impact_score: number;
  collaboration_strength_index: number;
  institutional_reliability_index: number;
  innovation_yield_ratio: number;
  policy_societal_influence: number;
  global_collaboration_diversity: number;
  longitudinal_stability: number;
  graduate_industry_placement: number;
  escrow_integrity_score: number;
  research_to_market_velocity: number;
  cross_discipline_integration: number;
  compliance_audit_integrity: number;
  ranking_period?: string;
}

export interface RankingResult {
  institution_id: string;
  institution_name: string;
  overall_rank: number;
  weight_breakdown: Record<string, number>;
  dimensions: Record<string, number>;
}

export interface ManipulationFlag {
  institution_id: string;
  manipulation_type: string;
  evidence: Record<string, unknown>;
  severity: string;
  ai_confidence: number;
}

// =====================================================
// RANKING COMPUTATION
// =====================================================

export function computeInstitutionalRank(input: InstitutionalRankingInput): RankingResult {
  const dimensions: Record<string, number> = {
    research_impact: input.research_impact_score,
    grant_execution: input.grant_execution_score,
    funding_efficiency: input.funding_efficiency_score,
    commercialization_impact: input.commercialization_impact_score,
    collaboration_strength: input.collaboration_strength_index,
    institutional_reliability: input.institutional_reliability_index,
    innovation_yield: input.innovation_yield_ratio,
    policy_societal_influence: input.policy_societal_influence,
    global_collaboration_diversity: input.global_collaboration_diversity,
    longitudinal_stability: input.longitudinal_stability,
    graduate_industry_placement: input.graduate_industry_placement,
    escrow_integrity: input.escrow_integrity_score,
    research_to_market_velocity: input.research_to_market_velocity,
    cross_discipline_integration: input.cross_discipline_integration,
    compliance_audit_integrity: input.compliance_audit_integrity,
  };

  const breakdown: Record<string, number> = {};
  let overall = 0;
  for (const [key, weight] of Object.entries(RANKING_WEIGHTS)) {
    const contribution = (dimensions[key] ?? 0) * weight;
    breakdown[key] = Math.round(contribution * 1000) / 1000;
    overall += contribution;
  }

  return {
    institution_id: input.institution_id,
    institution_name: input.institution_name,
    overall_rank: Math.round(overall * 100) / 100,
    weight_breakdown: breakdown,
    dimensions,
  };
}

export async function saveInstitutionalRanking(input: InstitutionalRankingInput): Promise<RankingResult> {
  const result = computeInstitutionalRank(input);
  const { error } = await supabase
    .from("institutional_execution_ranking" as any)
    .insert({
      ...input,
      overall_rank: result.overall_rank,
      weight_breakdown: result.weight_breakdown,
    });
  if (error) throw error;
  return result;
}

export async function getInstitutionalRankings(period?: string) {
  let query = supabase.from("institutional_execution_ranking" as any).select("*");
  if (period) query = query.eq("ranking_period", period);
  const { data, error } = await query.order("overall_rank", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getInstitutionRankingHistory(institutionId: string) {
  const { data, error } = await supabase
    .from("institutional_execution_ranking" as any)
    .select("*")
    .eq("institution_id", institutionId)
    .order("computed_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// FIELD NORMALIZATION
// =====================================================

export function applyFieldNormalization(
  rawScores: Record<string, number>,
  fieldBaselines: Record<string, number>
): Record<string, number> {
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawScores)) {
    const baseline = fieldBaselines[key] ?? 1;
    normalized[key] = Math.round((value / Math.max(0.01, baseline)) * 100) / 100;
  }
  return normalized;
}

// =====================================================
// MANIPULATION DETECTION
// =====================================================

export function detectRankingManipulation(params: {
  citationGrowthRate: number;
  grantCyclingFrequency: number;
  collaborationConcentration: number;
  budgetVariance: number;
  selfDealingIndicators: number;
  patentWithoutAdoption: number;
}): ManipulationFlag[] {
  const flags: ManipulationFlag[] = [];

  if (params.citationGrowthRate > 3.0) {
    flags.push({
      institution_id: "",
      manipulation_type: "citation_inflation",
      evidence: { growth_rate: params.citationGrowthRate },
      severity: params.citationGrowthRate > 5 ? "critical" : "high",
      ai_confidence: Math.min(0.95, params.citationGrowthRate / 6),
    });
  }

  if (params.grantCyclingFrequency > 0.5) {
    flags.push({
      institution_id: "",
      manipulation_type: "grant_cycling",
      evidence: { frequency: params.grantCyclingFrequency },
      severity: "high",
      ai_confidence: Math.min(0.9, params.grantCyclingFrequency),
    });
  }

  if (params.collaborationConcentration > 0.7) {
    flags.push({
      institution_id: "",
      manipulation_type: "collaboration_ring",
      evidence: { concentration: params.collaborationConcentration },
      severity: "medium",
      ai_confidence: Math.min(0.85, params.collaborationConcentration),
    });
  }

  if (params.patentWithoutAdoption > 0.6) {
    flags.push({
      institution_id: "",
      manipulation_type: "patent_stacking",
      evidence: { ratio: params.patentWithoutAdoption },
      severity: "medium",
      ai_confidence: Math.min(0.8, params.patentWithoutAdoption),
    });
  }

  return flags;
}

export async function saveManipulationFlags(institutionId: string, flags: ManipulationFlag[]): Promise<void> {
  if (flags.length === 0) return;
  const entries = flags.map(f => ({ ...f, institution_id: institutionId }));
  const { error } = await supabase
    .from("ranking_manipulation_flags" as any)
    .insert(entries);
  if (error) throw error;
}

// =====================================================
// GOVERNMENT EXPORT
// =====================================================

export async function getGovernmentRankingExport(country?: string) {
  let query = supabase.from("institutional_execution_ranking" as any).select("*");
  const { data, error } = await query.order("overall_rank", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
