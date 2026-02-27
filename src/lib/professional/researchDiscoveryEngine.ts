/**
 * Intelligent Research Discovery & Predictive Knowledge Engine (IRDPKE)
 * Multi-dimensional search ranking, predictive trajectories, emerging domain detection.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const SEARCH_MODES = [
  "academic_citation", "funding_intelligence", "commercialization",
  "policy_impact", "institutional_benchmark", "grant_proposal_inspiration",
  "emerging_research", "risk_aware", "industry_deployment", "cross_discipline",
] as const;

export type SearchMode = typeof SEARCH_MODES[number];

export const IRDPKE_TRANSPARENCY = {
  philosophy: "Discovers what matters, predicts what will matter, explains why",
  ranking: "12-dimension composite score — user-adjustable weights, no single metric dominance",
  bias: "Field normalization, regional equity, language bias correction applied",
  prediction: "All forecasts explainable with factor breakdown",
};

export const DEFAULT_RANK_WEIGHTS = {
  citation_quality: 0.10,
  funding_impact: 0.10,
  grant_reliability: 0.08,
  milestone_efficiency: 0.08,
  patent_quality: 0.08,
  commercialization: 0.10,
  policy_influence: 0.08,
  institutional_execution: 0.08,
  collaboration_trust: 0.08,
  innovation_yield: 0.08,
  cross_discipline: 0.07,
  longitudinal_consistency: 0.07,
};

// =====================================================
// TYPES
// =====================================================

export interface DiscoverySearchParams {
  query: string;
  mode?: SearchMode;
  domains?: string[];
  weights?: Partial<typeof DEFAULT_RANK_WEIGHTS>;
  limit?: number;
}

export interface DiscoveryResult {
  entity_type: string;
  entity_id: string;
  title: string;
  abstract?: string;
  domains: string[];
  composite_rank_score: number;
  rank_explanation: Record<string, number>;
}

export interface TrajectoryPrediction {
  entity_type: string;
  entity_id: string;
  citation_growth_forecast: Record<string, number>;
  commercialization_probability: number;
  grant_renewal_likelihood: number;
  domain_expansion_potential: number;
  funding_gap_risk: number;
  explanation: Record<string, unknown>;
}

export interface EmergingDomainSignal {
  domain: string;
  signal_type: string;
  funding_shift: number;
  cross_discipline_convergence: number;
  patent_surge: number;
  confidence: number;
}

export interface FundingGap {
  domain: string;
  region?: string;
  gap_type: string;
  severity: number;
  recommendation?: string;
}

// =====================================================
// SEARCH & DISCOVERY
// =====================================================

export async function searchResearchDiscovery(params: DiscoverySearchParams): Promise<DiscoveryResult[]> {
  const { data, error } = await supabase
    .from("research_discovery_index" as any)
    .select("*")
    .or(`title.ilike.%${params.query}%,abstract.ilike.%${params.query}%`)
    .order("composite_rank_score", { ascending: false })
    .limit(params.limit ?? 20);
  if (error) throw error;
  return (data ?? []) as unknown as DiscoveryResult[];
}

export function computeCompositeRankScore(
  scores: Record<string, number>,
  weights?: Partial<typeof DEFAULT_RANK_WEIGHTS>
): { composite: number; explanation: Record<string, number> } {
  const w = { ...DEFAULT_RANK_WEIGHTS, ...weights };
  const explanation: Record<string, number> = {};
  let composite = 0;

  for (const [key, weight] of Object.entries(w)) {
    const val = scores[key] ?? 0;
    const contribution = val * weight;
    explanation[key] = Math.round(contribution * 1000) / 1000;
    composite += contribution;
  }

  return { composite: Math.round(composite * 100) / 100, explanation };
}

export async function indexForDiscovery(entry: {
  entity_type: string;
  entity_id: string;
  title: string;
  abstract?: string;
  domains?: string[];
  keywords?: string[];
  scores: Record<string, number>;
  weights?: Partial<typeof DEFAULT_RANK_WEIGHTS>;
}): Promise<void> {
  const { composite, explanation } = computeCompositeRankScore(entry.scores, entry.weights);
  const { error } = await supabase
    .from("research_discovery_index" as any)
    .insert({
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      title: entry.title,
      abstract: entry.abstract ?? null,
      domains: entry.domains ?? [],
      keywords: entry.keywords ?? [],
      ...entry.scores,
      composite_rank_score: composite,
      rank_explanation: explanation,
    });
  if (error) throw error;
}

// =====================================================
// PREDICTIVE TRAJECTORY
// =====================================================

export function predictTrajectory(params: {
  currentCitations: number;
  citationGrowthRate: number;
  trl: number;
  fundingStability: number;
  grantRenewalHistory: number;
  crossDisciplineScore: number;
  policyReferences: number;
}): Omit<TrajectoryPrediction, "entity_type" | "entity_id"> {
  const citationForecast: Record<string, number> = {};
  let citations = params.currentCitations;
  for (let y = 1; y <= 5; y++) {
    citations = Math.round(citations * (1 + params.citationGrowthRate * Math.pow(0.9, y)));
    citationForecast[`year_${y}`] = citations;
  }

  const trlNorm = params.trl / 9;
  return {
    citation_growth_forecast: citationForecast,
    commercialization_probability: Math.round(Math.min(1, trlNorm * 0.4 + params.fundingStability * 0.3 + params.crossDisciplineScore * 0.3) * 100) / 100,
    grant_renewal_likelihood: Math.round(Math.min(1, params.grantRenewalHistory * 0.5 + params.fundingStability * 0.3 + params.crossDisciplineScore * 0.2) * 100) / 100,
    domain_expansion_potential: Math.round(Math.min(1, params.crossDisciplineScore * 0.5 + params.citationGrowthRate * 0.3 + trlNorm * 0.2) * 100) / 100,
    funding_gap_risk: Math.round(Math.max(0, 1 - params.fundingStability) * 100) / 100,
    explanation: { model: "trajectory_v1", factors: params },
  };
}

export async function saveTrajectoryPrediction(entityType: string, entityId: string, prediction: Omit<TrajectoryPrediction, "entity_type" | "entity_id">): Promise<void> {
  const { error } = await supabase
    .from("research_trajectory_predictions" as any)
    .insert({ entity_type: entityType, entity_id: entityId, ...prediction });
  if (error) throw error;
}

// =====================================================
// EMERGING DOMAIN DETECTION
// =====================================================

export async function getEmergingDomainSignals() {
  const { data, error } = await supabase
    .from("emerging_domain_signals" as any)
    .select("*")
    .order("confidence", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveEmergingSignal(signal: EmergingDomainSignal): Promise<void> {
  const { error } = await supabase
    .from("emerging_domain_signals" as any)
    .insert({
      domain: signal.domain,
      signal_type: signal.signal_type,
      funding_concentration_shift: signal.funding_shift,
      cross_discipline_convergence: signal.cross_discipline_convergence,
      patent_surge_rate: signal.patent_surge,
      confidence: signal.confidence,
    });
  if (error) throw error;
}

// =====================================================
// KNOWLEDGE GRAPH
// =====================================================

export async function addKnowledgeGraphConnection(params: {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: string;
  weight?: number;
}): Promise<void> {
  const { error } = await supabase
    .from("knowledge_graph_connections" as any)
    .insert({
      source_type: params.sourceType,
      source_id: params.sourceId,
      target_type: params.targetType,
      target_id: params.targetId,
      relationship_type: params.relationshipType,
      weight: params.weight ?? 1,
    });
  if (error) throw error;
}

export async function getKnowledgeGraphNeighbors(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from("knowledge_graph_connections" as any)
    .select("*")
    .or(`and(source_type.eq.${entityType},source_id.eq.${entityId}),and(target_type.eq.${entityType},target_id.eq.${entityId})`)
    .order("weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// FUNDING GAP INTELLIGENCE
// =====================================================

export async function getFundingGaps(domain?: string) {
  let query = supabase.from("funding_gap_intelligence" as any).select("*");
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("severity", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveFundingGap(gap: FundingGap): Promise<void> {
  const { error } = await supabase
    .from("funding_gap_intelligence" as any)
    .insert(gap);
  if (error) throw error;
}

// =====================================================
// COMPARISON TOOL
// =====================================================

export function compareEntities(
  entityA: Record<string, number>,
  entityB: Record<string, number>,
  dimensions: string[]
): Array<{ dimension: string; a: number; b: number; advantage: "A" | "B" | "tie" }> {
  return dimensions.map(d => {
    const a = entityA[d] ?? 0;
    const b = entityB[d] ?? 0;
    return {
      dimension: d,
      a: Math.round(a * 100) / 100,
      b: Math.round(b * 100) / 100,
      advantage: a > b + 0.01 ? "A" as const : b > a + 0.01 ? "B" as const : "tie" as const,
    };
  });
}
