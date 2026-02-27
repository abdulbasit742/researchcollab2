/**
 * Global Research Commercialization & Innovation Engine (GRCIE)
 * Patent pipeline, commercialization conversion, startup intelligence, innovation clusters.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const TRL_LEVELS = [1,2,3,4,5,6,7,8,9] as const;

export const GRCIE_TRANSPARENCY = {
  philosophy: "Academic success = citation + innovation conversion + commercialization + economic impact",
  patent_quality: "Patent Quality Index weights forward citations, industry adoption, licensing, and longevity — not count",
  rcci: "Research-to-Commercialization Conversion Index tracks full pipeline from publication to revenue",
  iyr: "Innovation Yield Ratio = total commercial outputs / total grant funding",
};

export const PQI_WEIGHTS = {
  forward_citation_quality: 0.15,
  industry_citation: 0.15,
  cross_border_filings: 0.10,
  litigation_defense: 0.10,
  licensing_conversion: 0.15,
  commercial_adoption: 0.15,
  market_penetration: 0.10,
  technology_longevity: 0.10,
};

export const IIS_WEIGHTS = {
  advisory_participation: 0.15,
  licensing_revenue: 0.20,
  corporate_rd: 0.15,
  joint_patent: 0.15,
  industry_funding_diversity: 0.15,
  technology_adoption: 0.20,
};

// =====================================================
// TYPES
// =====================================================

export interface PatentInput {
  research_project_id?: string;
  grant_id?: string;
  institution_id?: string;
  title: string;
  filing_date?: string;
  classification_codes?: string[];
  co_inventors?: string[];
  ownership_type?: string;
  technology_readiness_level?: number;
}

export interface CommercializationInput {
  research_project_id?: string;
  patent_id?: string;
  institution_id?: string;
  researcher_id?: string;
  time_publication_to_patent_days?: number;
  time_patent_to_licensing_days?: number;
  licensing_revenue?: number;
  venture_capital_attracted?: number;
  industry_pilot_success_rate?: number;
  revenue_per_research_dollar?: number;
}

export interface StartupInput {
  name: string;
  founding_date?: string;
  founding_team_ids?: string[];
  original_grant_id?: string;
  original_patent_id?: string;
  institution_id?: string;
  sector?: string;
  region?: string;
}

export interface InnovationFailureInput {
  patent_id?: string;
  startup_id?: string;
  failure_type: string;
  root_cause?: string;
  lessons_learned?: string;
  funding_exhausted?: boolean;
  regulatory_rejection?: boolean;
  market_adoption_failure?: boolean;
}

// =====================================================
// PATENT PIPELINE
// =====================================================

export async function createPatent(input: PatentInput): Promise<string> {
  const { data, error } = await supabase
    .from("patent_pipeline" as any)
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function getPatentsByGrant(grantId: string) {
  const { data, error } = await supabase
    .from("patent_pipeline" as any)
    .select("*")
    .eq("grant_id", grantId)
    .order("filing_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPatentsByInstitution(institutionId: string) {
  const { data, error } = await supabase
    .from("patent_pipeline" as any)
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function computePQI(params: {
  forwardCitationQuality: number;
  industryCitation: number;
  crossBorderFilings: number;
  litigationDefense: number;
  licensingConversion: number;
  commercialAdoption: number;
  marketPenetration: number;
  technologyLongevity: number;
}): number {
  const pqi =
    params.forwardCitationQuality * PQI_WEIGHTS.forward_citation_quality +
    params.industryCitation * PQI_WEIGHTS.industry_citation +
    params.crossBorderFilings * PQI_WEIGHTS.cross_border_filings +
    params.litigationDefense * PQI_WEIGHTS.litigation_defense +
    params.licensingConversion * PQI_WEIGHTS.licensing_conversion +
    params.commercialAdoption * PQI_WEIGHTS.commercial_adoption +
    params.marketPenetration * PQI_WEIGHTS.market_penetration +
    params.technologyLongevity * PQI_WEIGHTS.technology_longevity;
  return Math.round(pqi * 100) / 100;
}

// =====================================================
// COMMERCIALIZATION METRICS
// =====================================================

export function computeRCCI(params: {
  licensingRevenue: number;
  ventureCapital: number;
  pilotSuccessRate: number;
  revenuePerDollar: number;
  commercialSurvival: number;
  startupFormation: number;
}): number {
  const rcci =
    Math.min(1, params.licensingRevenue / 1_000_000) * 0.2 +
    Math.min(1, params.ventureCapital / 5_000_000) * 0.15 +
    params.pilotSuccessRate * 0.2 +
    Math.min(1, params.revenuePerDollar) * 0.2 +
    params.commercialSurvival * 0.15 +
    params.startupFormation * 0.1;
  return Math.round(rcci * 100) / 100;
}

export async function saveCommercializationMetrics(input: CommercializationInput): Promise<void> {
  const rcci = computeRCCI({
    licensingRevenue: input.licensing_revenue ?? 0,
    ventureCapital: input.venture_capital_attracted ?? 0,
    pilotSuccessRate: input.industry_pilot_success_rate ?? 0,
    revenuePerDollar: input.revenue_per_research_dollar ?? 0,
    commercialSurvival: 0,
    startupFormation: 0,
  });
  const { error } = await supabase
    .from("commercialization_metrics" as any)
    .insert({ ...input, rcci });
  if (error) throw error;
}

// =====================================================
// STARTUP INTELLIGENCE
// =====================================================

export async function createStartup(input: StartupInput): Promise<string> {
  const { data, error } = await supabase
    .from("research_startups" as any)
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function getStartupsByInstitution(institutionId: string) {
  const { data, error } = await supabase
    .from("research_startups" as any)
    .select("*")
    .eq("institution_id", institutionId)
    .order("founding_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INNOVATION YIELD RATIO
// =====================================================

export function computeIYR(totalCommercialOutputs: number, totalGrantFunding: number): number {
  if (totalGrantFunding <= 0) return 0;
  return Math.round((totalCommercialOutputs / (totalGrantFunding / 100_000)) * 100) / 100;
}

// =====================================================
// INDUSTRY INFLUENCE SCORE
// =====================================================

export function computeIIS(params: {
  advisoryParticipation: number;
  licensingRevenue: number;
  corporateRD: number;
  jointPatent: number;
  industryFundingDiversity: number;
  technologyAdoption: number;
}): number {
  const iis =
    params.advisoryParticipation * IIS_WEIGHTS.advisory_participation +
    params.licensingRevenue * IIS_WEIGHTS.licensing_revenue +
    params.corporateRD * IIS_WEIGHTS.corporate_rd +
    params.jointPatent * IIS_WEIGHTS.joint_patent +
    params.industryFundingDiversity * IIS_WEIGHTS.industry_funding_diversity +
    params.technologyAdoption * IIS_WEIGHTS.technology_adoption;
  return Math.round(iis * 100) / 100;
}

export async function saveIIS(userId: string, iis: number): Promise<void> {
  const { error } = await supabase
    .from("industry_influence_scores" as any)
    .insert({ user_id: userId, overall_iis: iis });
  if (error) throw error;
}

// =====================================================
// INNOVATION FAILURE TRACKING
// =====================================================

export async function recordInnovationFailure(input: InnovationFailureInput): Promise<void> {
  const { error } = await supabase
    .from("innovation_failure_records" as any)
    .insert(input);
  if (error) throw error;
}

// =====================================================
// INNOVATION CLUSTER MAP
// =====================================================

export async function getInnovationClusters(emerging?: boolean) {
  let query = supabase.from("innovation_cluster_map" as any).select("*");
  if (emerging !== undefined) query = query.eq("is_emerging", emerging);
  const { data, error } = await query.order("commercialization_density", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// AI COMMERCIALIZATION FORECASTING
// =====================================================

export function forecastCommercialization(params: {
  trl: number;
  patentQuality: number;
  licensingHistory: number;
  industryInterest: number;
  fundingStability: number;
  marketSize: number;
}): {
  licensing_likelihood: number;
  startup_probability: number;
  vc_attraction: number;
  adoption_probability: number;
  time_to_market_months: number;
  sustainability_risk: number;
  explanation: Record<string, unknown>;
} {
  const trlNorm = params.trl / 9;
  const licensing = trlNorm * 0.3 + params.patentQuality * 0.3 + params.licensingHistory * 0.2 + params.industryInterest * 0.2;
  const startup = trlNorm * 0.25 + params.fundingStability * 0.25 + params.marketSize * 0.25 + params.patentQuality * 0.25;
  const vc = params.marketSize * 0.3 + trlNorm * 0.25 + params.patentQuality * 0.2 + params.industryInterest * 0.25;
  const adoption = trlNorm * 0.3 + params.industryInterest * 0.3 + params.marketSize * 0.2 + params.patentQuality * 0.2;
  const ttm = Math.max(6, Math.round((1 - trlNorm) * 60 + (1 - params.fundingStability) * 24));
  const risk = Math.max(0, 1 - (trlNorm * 0.3 + params.fundingStability * 0.3 + params.industryInterest * 0.2 + params.patentQuality * 0.2));

  return {
    licensing_likelihood: Math.round(Math.min(1, licensing) * 100) / 100,
    startup_probability: Math.round(Math.min(1, startup) * 100) / 100,
    vc_attraction: Math.round(Math.min(1, vc) * 100) / 100,
    adoption_probability: Math.round(Math.min(1, adoption) * 100) / 100,
    time_to_market_months: ttm,
    sustainability_risk: Math.round(risk * 100) / 100,
    explanation: { model: "weighted_trl_v1", factors: params },
  };
}
