/**
 * Global Academic Collaboration Intelligence Graph (GACIG)
 * Superior to Google Scholar + ResearchGate + Scopus co-author maps.
 * Weighted, funding-aware, execution-backed collaboration infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS & TRANSPARENCY
// =====================================================

export const NODE_TYPES = [
  "pi", "co_pi", "researcher", "institution", "research_center",
  "sponsor", "industry_partner", "government_agency", "grant_program", "domain_cluster",
] as const;

export type CollaborationNodeType = typeof NODE_TYPES[number];

export const EVOLUTION_EVENT_TYPES = [
  "first_grant", "milestone_breakthrough", "renewal", "domain_expansion",
  "funding_growth", "decline_detected",
] as const;

export type EvolutionEventType = typeof EVOLUTION_EVENT_TYPES[number];

export const GACIG_TRANSPARENCY = {
  philosophy: "Execution-backed collaboration, not paper-based popularity",
  edge_weighting: "Edges weighted by funding, execution, reliability — not co-authorship count",
  trust: "Collaboration Trust Score reflects milestone + budget + compliance performance",
  diversity: "CDI rewards geographic, institutional, domain, and funding diversity",
  anti_gaming: "Disputes reduce trust; collusion detected and flagged",
};

export const CTS_WEIGHTS = {
  milestone_performance: 0.15,
  budget_efficiency: 0.13,
  renewal_success: 0.12,
  deliverable_acceptance: 0.13,
  compliance_clean: 0.12,
  multi_year_continuity: 0.10,
  sponsor_feedback: 0.10,
  cross_domain_effectiveness: 0.15,
};

export const EDGE_STRENGTH_WEIGHTS = {
  total_joint_funding: 0.15,
  shared_grant_count: 0.10,
  milestone_punctuality_rate: 0.12,
  budget_compliance_rate: 0.10,
  publication_yield: 0.08,
  patent_output: 0.08,
  renewal_rate: 0.10,
  collaboration_years: 0.10,
  cross_discipline_depth: 0.09,
  industry_engagement: 0.08,
};

// =====================================================
// TYPES
// =====================================================

export interface CollaborationNode {
  node_type: CollaborationNodeType;
  entity_id?: string;
  entity_name: string;
  metadata?: Record<string, unknown>;
}

export interface CollaborationEdgeInput {
  source_node_id: string;
  target_node_id: string;
  total_joint_funding: number;
  shared_grant_count: number;
  milestone_punctuality_rate: number;
  budget_compliance_rate: number;
  publication_yield: number;
  patent_output: number;
  renewal_rate: number;
  cross_institution_distance: number;
  dispute_history_flag: boolean;
  collaboration_years: number;
  cross_discipline_depth: number;
  industry_engagement: number;
}

export interface CollaborationTrustScoreInput {
  user_a_id: string;
  user_b_id: string;
  milestone_performance: number;
  budget_efficiency: number;
  renewal_success: number;
  deliverable_acceptance: number;
  compliance_clean: number;
  multi_year_continuity: number;
  sponsor_feedback: number;
  cross_domain_effectiveness: number;
}

export interface CollaborationDiversityInput {
  user_id: string;
  geographic_diversity: number;
  institutional_diversity: number;
  domain_diversity: number;
  funding_body_diversity: number;
  industry_inclusion: number;
}

export interface CollaborationStabilityInput {
  user_a_id: string;
  user_b_id: string;
  avg_years_active: number;
  grant_renewal_continuity: number;
  publication_frequency_stability: number;
  budget_deviation_trend: number;
  punctuality_improvement: number;
}

export interface CollaborationRiskSignal {
  type: "over_reliance" | "grant_concentration" | "funding_dependency" | "collusion_pattern" | "author_inflation" | "citation_ring";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: Record<string, unknown>;
}

export interface DomainCluster {
  cluster_name: string;
  domains: string[];
  institution_ids: string[];
  total_funding: number;
  avg_performance: number;
  growth_rate: number;
  trust_density: number;
  is_emerging: boolean;
}

// =====================================================
// COLLABORATION NODE MANAGEMENT
// =====================================================

export async function createCollaborationNode(node: CollaborationNode): Promise<string> {
  const { data, error } = await supabase
    .from("collaboration_nodes" as any)
    .insert(node)
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCollaborationNodes(nodeType?: CollaborationNodeType) {
  let query = supabase.from("collaboration_nodes" as any).select("*");
  if (nodeType) query = query.eq("node_type", nodeType);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// EDGE STRENGTH CALCULATION
// =====================================================

export function computeEdgeStrength(edge: Omit<CollaborationEdgeInput, "source_node_id" | "target_node_id">): number {
  const normalize = (val: number, max: number) => Math.min(1, val / max);

  const fundingNorm = normalize(edge.total_joint_funding, 10_000_000);
  const grantsNorm = normalize(edge.shared_grant_count, 20);
  const disputePenalty = edge.dispute_history_flag ? 0.8 : 1.0;

  const raw =
    fundingNorm * EDGE_STRENGTH_WEIGHTS.total_joint_funding +
    grantsNorm * EDGE_STRENGTH_WEIGHTS.shared_grant_count +
    edge.milestone_punctuality_rate * EDGE_STRENGTH_WEIGHTS.milestone_punctuality_rate +
    edge.budget_compliance_rate * EDGE_STRENGTH_WEIGHTS.budget_compliance_rate +
    edge.publication_yield * EDGE_STRENGTH_WEIGHTS.publication_yield +
    normalize(edge.patent_output, 10) * EDGE_STRENGTH_WEIGHTS.patent_output +
    edge.renewal_rate * EDGE_STRENGTH_WEIGHTS.renewal_rate +
    normalize(edge.collaboration_years, 20) * EDGE_STRENGTH_WEIGHTS.collaboration_years +
    edge.cross_discipline_depth * EDGE_STRENGTH_WEIGHTS.cross_discipline_depth +
    edge.industry_engagement * EDGE_STRENGTH_WEIGHTS.industry_engagement;

  return Math.round(raw * disputePenalty * 100) / 100;
}

export async function saveCollaborationEdge(edge: CollaborationEdgeInput): Promise<void> {
  const strength = computeEdgeStrength(edge);
  const { error } = await supabase
    .from("collaboration_edges" as any)
    .insert({ ...edge, edge_strength: strength });
  if (error) throw error;
}

export async function getCollaborationEdges(nodeId: string) {
  const { data, error } = await supabase
    .from("collaboration_edges" as any)
    .select("*")
    .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`)
    .order("edge_strength", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COLLABORATION TRUST SCORE (CTS)
// =====================================================

export function computeCTS(input: Omit<CollaborationTrustScoreInput, "user_a_id" | "user_b_id">): number {
  const score =
    input.milestone_performance * CTS_WEIGHTS.milestone_performance +
    input.budget_efficiency * CTS_WEIGHTS.budget_efficiency +
    input.renewal_success * CTS_WEIGHTS.renewal_success +
    input.deliverable_acceptance * CTS_WEIGHTS.deliverable_acceptance +
    input.compliance_clean * CTS_WEIGHTS.compliance_clean +
    input.multi_year_continuity * CTS_WEIGHTS.multi_year_continuity +
    input.sponsor_feedback * CTS_WEIGHTS.sponsor_feedback +
    input.cross_domain_effectiveness * CTS_WEIGHTS.cross_domain_effectiveness;

  return Math.round(score * 100) / 100;
}

export async function saveCTS(input: CollaborationTrustScoreInput): Promise<void> {
  const overall = computeCTS(input);
  const { error } = await supabase
    .from("collaboration_trust_scores" as any)
    .upsert({ ...input, overall_cts: overall }, { onConflict: "user_a_id,user_b_id" as any });
  if (error) throw error;
}

export async function getCTS(userAId: string, userBId: string) {
  const { data, error } = await supabase
    .from("collaboration_trust_scores" as any)
    .select("*")
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// COLLABORATION STABILITY INDEX
// =====================================================

export function computeCSI(input: Omit<CollaborationStabilityInput, "user_a_id" | "user_b_id">): { stability: number; decline_risk: number } {
  const stability =
    Math.min(1, input.avg_years_active / 10) * 0.25 +
    input.grant_renewal_continuity * 0.25 +
    input.publication_frequency_stability * 0.2 +
    (1 - Math.min(1, input.budget_deviation_trend)) * 0.15 +
    input.punctuality_improvement * 0.15;

  const declineRisk = Math.max(0, 1 - stability);

  return {
    stability: Math.round(stability * 100) / 100,
    decline_risk: Math.round(declineRisk * 100) / 100,
  };
}

export async function saveCSI(input: CollaborationStabilityInput): Promise<void> {
  const { stability, decline_risk } = computeCSI(input);
  const { error } = await supabase
    .from("collaboration_stability_index" as any)
    .insert({ ...input, decline_risk });
  if (error) throw error;
}

// =====================================================
// COLLABORATION DIVERSITY INDEX (CDI)
// =====================================================

export function computeCDI(input: Omit<CollaborationDiversityInput, "user_id">): number {
  const cdi =
    input.geographic_diversity * 0.25 +
    input.institutional_diversity * 0.20 +
    input.domain_diversity * 0.25 +
    input.funding_body_diversity * 0.15 +
    input.industry_inclusion * 0.15;

  return Math.round(cdi * 100) / 100;
}

export async function saveCDI(input: CollaborationDiversityInput): Promise<void> {
  const overall = computeCDI(input);
  const { error } = await supabase
    .from("collaboration_diversity_index" as any)
    .insert({ ...input, overall_cdi: overall });
  if (error) throw error;
}

export async function getCDI(userId: string) {
  const { data, error } = await supabase
    .from("collaboration_diversity_index" as any)
    .select("*")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// COLLABORATION EVOLUTION TIMELINE
// =====================================================

export async function recordEvolutionEvent(params: {
  user_a_id: string;
  user_b_id: string;
  event_type: EvolutionEventType;
  event_data?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase
    .from("collaboration_evolution_events" as any)
    .insert({
      user_a_id: params.user_a_id,
      user_b_id: params.user_b_id,
      event_type: params.event_type,
      event_data: params.event_data ?? {},
    });
  if (error) throw error;
}

export async function getCollaborationTimeline(userAId: string, userBId: string) {
  const { data, error } = await supabase
    .from("collaboration_evolution_events" as any)
    .select("*")
    .eq("user_a_id", userAId)
    .eq("user_b_id", userBId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COLLABORATION RISK DETECTION
// =====================================================

export function detectCollaborationRisks(params: {
  topCollaboratorFundingPct: number;
  grantConcentrationHHI: number;
  fundingDependencyRatio: number;
  mutualCitationRate: number;
  coAuthorCount: number;
  actualCollaboratorCount: number;
}): CollaborationRiskSignal[] {
  const signals: CollaborationRiskSignal[] = [];

  if (params.topCollaboratorFundingPct > 0.6) {
    signals.push({
      type: "over_reliance",
      severity: params.topCollaboratorFundingPct > 0.8 ? "high" : "medium",
      description: "Over-reliance on single collaborator for funding",
      evidence: { top_pct: params.topCollaboratorFundingPct },
    });
  }

  if (params.grantConcentrationHHI > 0.5) {
    signals.push({
      type: "grant_concentration",
      severity: params.grantConcentrationHHI > 0.7 ? "high" : "medium",
      description: "Grant funding concentrated in too few sources",
      evidence: { hhi: params.grantConcentrationHHI },
    });
  }

  if (params.fundingDependencyRatio > 0.7) {
    signals.push({
      type: "funding_dependency",
      severity: "high",
      description: "Funding dependency imbalance detected",
      evidence: { ratio: params.fundingDependencyRatio },
    });
  }

  if (params.mutualCitationRate > 0.4) {
    signals.push({
      type: "citation_ring",
      severity: params.mutualCitationRate > 0.6 ? "critical" : "high",
      description: "Mutual citation clustering detected",
      evidence: { rate: params.mutualCitationRate },
    });
  }

  if (params.coAuthorCount > params.actualCollaboratorCount * 2) {
    signals.push({
      type: "author_inflation",
      severity: "medium",
      description: "Artificial author inflation suspected",
      evidence: { coauthors: params.coAuthorCount, actual: params.actualCollaboratorCount },
    });
  }

  return signals;
}

// =====================================================
// DOMAIN CLUSTER INTELLIGENCE
// =====================================================

export async function saveDomainCluster(cluster: DomainCluster): Promise<void> {
  const { error } = await supabase
    .from("domain_cluster_intelligence" as any)
    .insert(cluster);
  if (error) throw error;
}

export async function getDomainClusters(emerging?: boolean) {
  let query = supabase.from("domain_cluster_intelligence" as any).select("*");
  if (emerging !== undefined) query = query.eq("is_emerging", emerging);
  const { data, error } = await query.order("total_funding", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// AI COLLABORATION SUGGESTION ENGINE
// =====================================================

export function suggestCollaborations(params: {
  userDomains: string[];
  userInstitution: string;
  userFundingSources: string[];
  availableResearchers: Array<{
    userId: string;
    name: string;
    domains: string[];
    institution: string;
    fundingSources: string[];
    milestonePerformance: number;
    crossDisciplineScore: number;
  }>;
}): Array<{ userId: string; name: string; score: number; reasons: string[] }> {
  return params.availableResearchers
    .map((r) => {
      const reasons: string[] = [];
      let score = 0;

      // Domain complementarity
      const sharedDomains = r.domains.filter(d => params.userDomains.includes(d)).length;
      const uniqueDomains = r.domains.filter(d => !params.userDomains.includes(d)).length;
      if (uniqueDomains > 0) {
        score += uniqueDomains * 0.15;
        reasons.push(`${uniqueDomains} complementary domain(s)`);
      }

      // Cross-institution bridge
      if (r.institution !== params.userInstitution) {
        score += 0.2;
        reasons.push("Cross-institution bridge potential");
      }

      // Funding alignment
      const sharedFunding = r.fundingSources.filter(f => params.userFundingSources.includes(f)).length;
      if (sharedFunding > 0) {
        score += sharedFunding * 0.1;
        reasons.push(`${sharedFunding} shared funding source(s)`);
      }

      // Performance compatibility
      if (r.milestonePerformance > 0.7) {
        score += r.milestonePerformance * 0.2;
        reasons.push("High milestone performance");
      }

      // Cross-discipline strength
      if (r.crossDisciplineScore > 0.5) {
        score += r.crossDisciplineScore * 0.15;
        reasons.push("Strong cross-discipline record");
      }

      return { userId: r.userId, name: r.name, score: Math.round(score * 100) / 100, reasons };
    })
    .filter(s => s.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
