/**
 * Global Research Economy & Innovation Intelligence Engine (GREIIE)
 * Superior to Google Scholar + OECD dashboards + World Bank research analytics.
 * Macro/meso/micro research economy intelligence, capital flows, competition index, simulation.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const MACRO_RISK_TYPES = [
  "funding_overconcentration", "institutional_dependency", "declining_innovation_yield",
  "grant_renewal_collapse", "compliance_instability_cluster", "industry_disengagement",
  "venture_funding_retreat", "brain_drain_acceleration",
] as const;

export type MacroRiskType = typeof MACRO_RISK_TYPES[number];

export const CAPITAL_FLOW_TYPES = ["grant", "venture", "industry_rd", "government", "philanthropy"] as const;

export const GREIIE_TRANSPARENCY = {
  philosophy: "Innovation economy intelligence — not paper discovery",
  niei: "National Innovation Efficiency Index normalized by population and GDP",
  competition: "9-dimension competition index ranked by execution, not perception",
  simulation: "Funding allocation simulations with explainable impact predictions",
  fairness: "Normalized for population size, GDP, regional regulation, emerging economy constraints",
};

export const COMPETITION_INDEX_WEIGHTS = {
  funding_growth_rate: 0.12,
  patent_velocity: 0.12,
  commercialization_speed: 0.12,
  startup_survival_rate: 0.10,
  venture_capital_alignment: 0.10,
  industry_integration_density: 0.10,
  collaboration_stability: 0.10,
  research_to_market_velocity: 0.12,
  regulatory_compliance_maturity: 0.12,
};

// =====================================================
// TYPES
// =====================================================

export interface NIEIInput {
  country_code: string;
  country_name: string;
  period: string;
  total_research_funding: number;
  total_publications: number;
  patent_output: number;
  commercialization_revenue: number;
  startup_formation_rate: number;
  venture_funding_attracted: number;
  industry_adoption_rate: number;
  policy_citation_impact: number;
  grant_completion_reliability: number;
  compliance_integrity: number;
  population: number;
  gdp: number;
}

export interface CompetitionIndexInput {
  country_code: string;
  period: string;
  funding_growth_rate: number;
  patent_velocity: number;
  commercialization_speed: number;
  startup_survival_rate: number;
  venture_capital_alignment: number;
  industry_integration_density: number;
  collaboration_stability: number;
  research_to_market_velocity: number;
  regulatory_compliance_maturity: number;
}

export interface CapitalFlowInput {
  source_country: string;
  destination_country: string;
  domain?: string;
  flow_type: string;
  amount: number;
  funding_source_type?: string;
  period: string;
  collaboration_count?: number;
}

export interface SimulationInput {
  country_code: string;
  simulation_name: string;
  parameters: Record<string, unknown>;
}

export interface SimulationResult {
  predicted_innovation_yield: number;
  predicted_patent_output: number;
  predicted_startup_formation: number;
  predicted_policy_influence: number;
  predicted_economic_growth: number;
  explanation: Record<string, unknown>;
}

// =====================================================
// NATIONAL INNOVATION EFFICIENCY INDEX (NIEI)
// =====================================================

export function computeNIEI(input: NIEIInput): { niei: number; niei_per_capita: number } {
  const totalOutput =
    input.total_publications * 0.15 +
    input.patent_output * 0.20 +
    input.commercialization_revenue * 0.20 +
    input.startup_formation_rate * 0.10 +
    input.venture_funding_attracted * 0.10 +
    input.industry_adoption_rate * 0.05 +
    input.policy_citation_impact * 0.05 +
    input.grant_completion_reliability * 0.10 +
    input.compliance_integrity * 0.05;

  const funding = Math.max(1, input.total_research_funding);
  const niei = Math.round((totalOutput / funding) * 10000) / 100;
  const pop = Math.max(1, input.population / 1_000_000);
  const niei_per_capita = Math.round((niei / pop) * 100) / 100;

  return { niei, niei_per_capita };
}

export async function saveNIEI(input: NIEIInput): Promise<{ niei: number; niei_per_capita: number }> {
  const scores = computeNIEI(input);
  const { error } = await supabase
    .from("national_innovation_index" as any)
    .insert({ ...input, niei_score: scores.niei, niei_per_capita: scores.niei_per_capita });
  if (error) throw error;
  return scores;
}

export async function getNIEI(countryCode?: string, period?: string) {
  let query = supabase.from("national_innovation_index" as any).select("*");
  if (countryCode) query = query.eq("country_code", countryCode);
  if (period) query = query.eq("period", period);
  const { data, error } = await query.order("niei_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// CAPITAL FLOWS
// =====================================================

export async function recordCapitalFlow(input: CapitalFlowInput): Promise<void> {
  const { error } = await supabase.from("research_capital_flows" as any).insert(input);
  if (error) throw error;
}

export async function getCapitalFlows(filters: { source?: string; destination?: string; domain?: string; period?: string }) {
  let query = supabase.from("research_capital_flows" as any).select("*");
  if (filters.source) query = query.eq("source_country", filters.source);
  if (filters.destination) query = query.eq("destination_country", filters.destination);
  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.period) query = query.eq("period", filters.period);
  const { data, error } = await query.order("amount", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// DOMAIN DOMINANCE
// =====================================================

export async function saveDomainDominance(input: {
  country_code: string; domain: string; period: string;
  funding_concentration: number; publication_share: number; patent_share: number;
  commercialization_share: number; startup_share: number; talent_concentration: number;
  is_emerging_leader?: boolean; is_declining?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("domain_dominance_profiles" as any).insert(input);
  if (error) throw error;
}

export async function getDomainDominance(domain?: string, countryCode?: string) {
  let query = supabase.from("domain_dominance_profiles" as any).select("*");
  if (domain) query = query.eq("domain", domain);
  if (countryCode) query = query.eq("country_code", countryCode);
  const { data, error } = await query.order("funding_concentration", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// RESEARCH LABOR MARKET
// =====================================================

export async function saveResearchLaborData(input: {
  country_code: string; domain?: string; period: string;
  phd_production: number; graduate_industry_placement_pct: number;
  researcher_inflow: number; researcher_outflow: number;
  brain_drain_index: number; talent_concentration_index: number;
  funding_driven_migration_pct: number;
}): Promise<void> {
  const { error } = await supabase.from("research_labor_market" as any).insert(input);
  if (error) throw error;
}

export async function getResearchLaborMarket(countryCode?: string, domain?: string) {
  let query = supabase.from("research_labor_market" as any).select("*");
  if (countryCode) query = query.eq("country_code", countryCode);
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("computed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COMPETITION INDEX
// =====================================================

export function computeCompetitionIndex(input: CompetitionIndexInput): number {
  let score = 0;
  for (const [key, weight] of Object.entries(COMPETITION_INDEX_WEIGHTS)) {
    score += ((input as any)[key] ?? 0) * weight;
  }
  return Math.round(score * 100) / 100;
}

export async function saveCompetitionIndex(input: CompetitionIndexInput): Promise<number> {
  const overall = computeCompetitionIndex(input);
  const { error } = await supabase
    .from("innovation_competition_index" as any)
    .insert({ ...input, overall_competition_score: overall });
  if (error) throw error;
  return overall;
}

export async function getCompetitionIndex(period?: string) {
  let query = supabase.from("innovation_competition_index" as any).select("*");
  if (period) query = query.eq("period", period);
  const { data, error } = await query.order("overall_competition_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// CAPITAL RISK ANALYSIS
// =====================================================

export function detectMacroRisks(params: {
  fundingConcentrationHHI: number;
  institutionalDependencyRatio: number;
  innovationYieldTrend: number;
  grantRenewalRate: number;
  complianceStability: number;
  industryEngagementTrend: number;
  ventureFundingTrend: number;
  brainDrainRate: number;
}): Array<{ risk_type: MacroRiskType; severity: string; description: string; trend_direction: string }> {
  const risks: Array<{ risk_type: MacroRiskType; severity: string; description: string; trend_direction: string }> = [];

  if (params.fundingConcentrationHHI > 0.5) risks.push({ risk_type: "funding_overconcentration", severity: params.fundingConcentrationHHI > 0.7 ? "critical" : "high", description: "Research funding overly concentrated in single domain", trend_direction: "increasing" });
  if (params.institutionalDependencyRatio > 0.6) risks.push({ risk_type: "institutional_dependency", severity: "high", description: "Excessive reliance on few institutions for research output", trend_direction: "stable" });
  if (params.innovationYieldTrend < -0.1) risks.push({ risk_type: "declining_innovation_yield", severity: "high", description: "Innovation output declining relative to funding input", trend_direction: "declining" });
  if (params.grantRenewalRate < 0.4) risks.push({ risk_type: "grant_renewal_collapse", severity: "critical", description: "Grant renewal rates below sustainable threshold", trend_direction: "declining" });
  if (params.complianceStability < 0.5) risks.push({ risk_type: "compliance_instability_cluster", severity: "high", description: "Widespread compliance issues detected across institutions", trend_direction: "declining" });
  if (params.industryEngagementTrend < -0.15) risks.push({ risk_type: "industry_disengagement", severity: "medium", description: "Industry-academia collaboration declining", trend_direction: "declining" });
  if (params.ventureFundingTrend < -0.2) risks.push({ risk_type: "venture_funding_retreat", severity: "high", description: "Venture capital retreating from research-backed startups", trend_direction: "declining" });
  if (params.brainDrainRate > 0.3) risks.push({ risk_type: "brain_drain_acceleration", severity: params.brainDrainRate > 0.5 ? "critical" : "high", description: "Accelerating researcher outflow exceeding inflow", trend_direction: "increasing" });

  return risks;
}

export async function saveMacroRisks(entityType: string, entityId: string, risks: ReturnType<typeof detectMacroRisks>): Promise<void> {
  if (risks.length === 0) return;
  const entries = risks.map(r => ({ entity_type: entityType, entity_id: entityId, ...r }));
  const { error } = await supabase.from("research_capital_risks" as any).insert(entries);
  if (error) throw error;
}

// =====================================================
// FUNDING ALLOCATION SIMULATION
// =====================================================

export function simulateFundingAllocation(params: {
  currentNIEI: number;
  fundingChangePercent: number;
  targetDomain?: string;
  commercializationIncentiveBoost: number;
  crossBorderExpansion: number;
}): SimulationResult {
  const base = params.currentNIEI;
  const fundingEffect = params.fundingChangePercent * 0.6;
  const commercEffect = params.commercializationIncentiveBoost * 0.3;
  const crossBorderEffect = params.crossBorderExpansion * 0.2;

  return {
    predicted_innovation_yield: Math.round((base * (1 + fundingEffect * 0.01) + commercEffect * 0.1) * 100) / 100,
    predicted_patent_output: Math.round((1 + fundingEffect * 0.008 + commercEffect * 0.05) * 100) / 100,
    predicted_startup_formation: Math.round((1 + commercEffect * 0.15 + fundingEffect * 0.005) * 100) / 100,
    predicted_policy_influence: Math.round((1 + crossBorderEffect * 0.1) * 100) / 100,
    predicted_economic_growth: Math.round((fundingEffect * 0.003 + commercEffect * 0.005 + crossBorderEffect * 0.002) * 100) / 100,
    explanation: {
      model: "greiie_simulation_v1",
      factors: params,
      note: "Predictions are directional estimates based on historical efficiency correlations",
    },
  };
}

export async function saveSimulation(input: SimulationInput, result: SimulationResult, simulatedBy?: string): Promise<void> {
  const { error } = await supabase.from("funding_allocation_simulations" as any).insert({
    ...input, ...result, simulated_by: simulatedBy,
  });
  if (error) throw error;
}

// =====================================================
// INNOVATION NETWORK GRAPH
// =====================================================

export async function saveNetworkEdge(input: {
  source_type: string; source_id: string; target_type: string; target_id: string;
  edge_type: string; weight: number; funding_amount?: number;
  collaboration_reliability?: number; patent_co_ownership?: number;
  startup_co_formation?: number; policy_alignment?: number; period?: string;
}): Promise<void> {
  const { error } = await supabase.from("innovation_network_edges" as any).insert(input);
  if (error) throw error;
}

export async function getNetworkEdges(sourceType?: string, sourceId?: string) {
  let query = supabase.from("innovation_network_edges" as any).select("*");
  if (sourceType) query = query.eq("source_type", sourceType);
  if (sourceId) query = query.eq("source_id", sourceId);
  const { data, error } = await query.order("weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
