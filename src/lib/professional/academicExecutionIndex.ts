/**
 * Global Academic Execution Index (GAEI)
 * Superior to Google Scholar — integrates citations, funding, execution,
 * commercialization, and institutional intelligence.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Multi-Dimensional Impact Index (MDII) ───

export interface MDII {
  citationImpactScore: number;
  fundingImpactScore: number;
  executionCompletionScore: number;
  grantReliabilityScore: number;
  institutionalCollaborationScore: number;
  crossDisciplineInfluenceScore: number;
  researchCommercializationScore: number;
  milestoneEfficiencyScore: number;
  industryAdoptionScore: number;
  longitudinalContributionScore: number;
  overallMdii: number;
}

const MDII_WEIGHTS = {
  citation: 0.15,
  funding: 0.12,
  execution: 0.15,
  grantReliability: 0.10,
  institutionalCollab: 0.08,
  crossDiscipline: 0.08,
  commercialization: 0.10,
  milestoneEfficiency: 0.08,
  industryAdoption: 0.07,
  longitudinal: 0.07,
} as const;

export async function computeMDII(userId: string): Promise<MDII> {
  const [papersRes, grantsRes, commercRes] = await Promise.all([
    supabase.from("research_paper_index").select("*").eq("user_id", userId),
    supabase.from("grant_execution_tracking").select("*").eq("principal_investigator_id", userId),
    supabase.from("research_commercialization" as any).select("*").eq("user_id", userId),
  ]);

  const papers = papersRes.data ?? [];
  const grants = grantsRes.data ?? [];
  const commercializations = commercRes.data ?? [];

  const totalCitations = papers.reduce((s, p) => s + (p.citation_count ?? 0), 0);
  const citationImpactScore = Math.min(100, Math.log2(totalCitations + 1) * 10);

  const totalFunding = grants.reduce((s, g) => s + Number(g.funding_amount ?? 0), 0);
  const fundingImpactScore = Math.min(100, Math.log10(totalFunding + 1) * 15);

  const completedGrants = grants.filter(g => g.grant_status === "completed");
  const executionCompletionScore = grants.length > 0 ? Math.round((completedGrants.length / grants.length) * 100) : 0;

  const reliabilities = grants.map(g => Number(g.completion_reliability ?? 0));
  const grantReliabilityScore = reliabilities.length > 0 ? Math.round(reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length) : 0;

  const institutions = new Set(grants.map(g => g.institution_id).filter(Boolean));
  const institutionalCollaborationScore = Math.min(100, institutions.size * 15);

  const domains = new Set(papers.map(p => p.domain).filter(Boolean));
  const crossDisciplineInfluenceScore = Math.min(100, domains.size * 20);

  const researchCommercializationScore = Math.min(100, commercializations.length * 25);

  const milestoneReleases = grants.reduce((s, g) => s + (g.milestone_releases ?? 0), 0);
  const totalMilestones = grants.reduce((s, g) => s + (g.total_milestones ?? 0), 0);
  const milestoneEfficiencyScore = totalMilestones > 0 ? Math.round((milestoneReleases / totalMilestones) * 100) : 0;

  const industryAdoptionScore = Math.min(100, grants.reduce((s, g) => s + (g.industry_licenses ?? 0), 0) * 20);

  const yearSpan = papers.length > 0 ? Math.max(1, new Set(papers.map(p => p.publication_date?.substring(0, 4)).filter(Boolean)).size) : 0;
  const longitudinalContributionScore = Math.min(100, yearSpan * 10);

  const overallMdii = Math.round(
    citationImpactScore * MDII_WEIGHTS.citation +
    fundingImpactScore * MDII_WEIGHTS.funding +
    executionCompletionScore * MDII_WEIGHTS.execution +
    grantReliabilityScore * MDII_WEIGHTS.grantReliability +
    institutionalCollaborationScore * MDII_WEIGHTS.institutionalCollab +
    crossDisciplineInfluenceScore * MDII_WEIGHTS.crossDiscipline +
    researchCommercializationScore * MDII_WEIGHTS.commercialization +
    milestoneEfficiencyScore * MDII_WEIGHTS.milestoneEfficiency +
    industryAdoptionScore * MDII_WEIGHTS.industryAdoption +
    longitudinalContributionScore * MDII_WEIGHTS.longitudinal
  );

  const mdii: MDII = {
    citationImpactScore, fundingImpactScore, executionCompletionScore,
    grantReliabilityScore, institutionalCollaborationScore, crossDisciplineInfluenceScore,
    researchCommercializationScore, milestoneEfficiencyScore, industryAdoptionScore,
    longitudinalContributionScore, overallMdii,
  };

  await supabase.from("academic_impact_index").upsert({
    user_id: userId,
    citation_impact_score: citationImpactScore,
    funding_impact_score: fundingImpactScore,
    execution_completion_score: executionCompletionScore,
    grant_reliability_score: grantReliabilityScore,
    institutional_collaboration_score: institutionalCollaborationScore,
    cross_discipline_influence_score: crossDisciplineInfluenceScore,
    research_commercialization_score: researchCommercializationScore,
    milestone_efficiency_score: milestoneEfficiencyScore,
    industry_adoption_score: industryAdoptionScore,
    longitudinal_contribution_score: longitudinalContributionScore,
    overall_mdii: overallMdii,
    last_computed_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  return mdii;
}

export async function getMDII(userId: string): Promise<MDII | null> {
  const { data } = await supabase
    .from("academic_impact_index")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return {
    citationImpactScore: Number(data.citation_impact_score ?? 0),
    fundingImpactScore: Number(data.funding_impact_score ?? 0),
    executionCompletionScore: Number(data.execution_completion_score ?? 0),
    grantReliabilityScore: Number(data.grant_reliability_score ?? 0),
    institutionalCollaborationScore: Number(data.institutional_collaboration_score ?? 0),
    crossDisciplineInfluenceScore: Number(data.cross_discipline_influence_score ?? 0),
    researchCommercializationScore: Number(data.research_commercialization_score ?? 0),
    milestoneEfficiencyScore: Number(data.milestone_efficiency_score ?? 0),
    industryAdoptionScore: Number(data.industry_adoption_score ?? 0),
    longitudinalContributionScore: Number(data.longitudinal_contribution_score ?? 0),
    overallMdii: Number(data.overall_mdii ?? 0),
  };
}

// ─── Citation Quality Index (CQI) ───

export function calculateCitationQualityIndex(params: {
  totalCitations: number;
  crossFieldCitations: number;
  policyImpactCitations: number;
  industryWhitepaperCitations: number;
  highImpactJournalWeight: number;
  selfCitations: number;
}): number {
  const baseCitations = params.totalCitations - params.selfCitations * 0.8;
  const crossFieldBonus = params.crossFieldCitations * 1.5;
  const policyBonus = params.policyImpactCitations * 2.0;
  const industryBonus = params.industryWhitepaperCitations * 1.8;
  const journalWeight = params.highImpactJournalWeight;

  return Math.round(
    Math.min(100, Math.log2(
      Math.max(1, baseCitations + crossFieldBonus + policyBonus + industryBonus) * journalWeight
    ) * 8)
  );
}

// ─── Funding-Linked Paper Operations ───

export interface PaperInput {
  title: string;
  abstract?: string;
  authors?: string[];
  doi?: string;
  journal?: string;
  publicationDate?: string;
  associatedGrantIds?: string[];
  escrowManaged?: boolean;
  fundingAmount?: number;
  domain?: string;
  keywords?: string[];
}

export async function indexPaper(userId: string, input: PaperInput) {
  const { data, error } = await supabase
    .from("research_paper_index")
    .insert({
      user_id: userId,
      title: input.title,
      abstract: input.abstract,
      authors: input.authors ?? [],
      doi: input.doi,
      journal: input.journal,
      publication_date: input.publicationDate,
      associated_grant_ids: input.associatedGrantIds ?? [],
      escrow_managed: input.escrowManaged ?? false,
      funding_amount: input.fundingAmount ?? 0,
      domain: input.domain,
      keywords: input.keywords ?? [],
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function searchPapers(filters: {
  domain?: string;
  minFunding?: number;
  escrowManaged?: boolean;
  minCitations?: number;
  keyword?: string;
  limit?: number;
}) {
  let query = supabase
    .from("research_paper_index")
    .select("*")
    .eq("is_public", true)
    .order("citation_quality_index", { ascending: false })
    .limit(filters.limit ?? 30);

  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.minFunding) query = query.gte("funding_amount", filters.minFunding);
  if (filters.escrowManaged !== undefined) query = query.eq("escrow_managed", filters.escrowManaged);
  if (filters.minCitations) query = query.gte("citation_count", filters.minCitations);
  if (filters.keyword) query = query.ilike("title", `%${filters.keyword}%`);

  const { data } = await query;
  return data ?? [];
}

// ─── Grant Execution ───

export interface GrantInput {
  grantTitle: string;
  institutionId?: string;
  approvalDate?: string;
  fundingAmount?: number;
  totalMilestones?: number;
  fundingSource?: string;
  startDate?: string;
  endDate?: string;
}

export async function createGrant(piId: string, input: GrantInput) {
  const { data, error } = await supabase
    .from("grant_execution_tracking")
    .insert({
      principal_investigator_id: piId,
      grant_title: input.grantTitle,
      institution_id: input.institutionId,
      approval_date: input.approvalDate,
      funding_amount: input.fundingAmount ?? 0,
      total_milestones: input.totalMilestones ?? 0,
      funding_source: input.fundingSource,
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getUserGrants(userId: string) {
  const { data } = await supabase
    .from("grant_execution_tracking")
    .select("*")
    .eq("principal_investigator_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Research Lifecycle ───

export const RESEARCH_LIFECYCLE_STAGES = [
  "idea", "grant_approval", "milestone_1", "publication",
  "peer_review", "industry_collaboration", "commercial_outcome", "long_term_impact",
] as const;

export type ResearchLifecycleStage = typeof RESEARCH_LIFECYCLE_STAGES[number];

export async function addLifecycleEvent(userId: string, event: {
  paperId?: string;
  grantId?: string;
  eventType: string;
  eventTitle: string;
  eventDescription?: string;
  eventData?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("research_lifecycle_events")
    .insert({
      user_id: userId,
      paper_id: event.paperId,
      grant_id: event.grantId,
      event_type: event.eventType,
      event_title: event.eventTitle,
      event_description: event.eventDescription,
      event_data: (event.eventData ?? {}) as any,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getResearchTimeline(userId: string, paperId?: string) {
  let query = supabase
    .from("research_lifecycle_events")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: true });

  if (paperId) query = query.eq("paper_id", paperId);
  const { data } = await query;
  return data ?? [];
}

// ─── Institutional Execution Index (IEI) ───

export async function getInstitutionalExecutionIndex(institutionId: string) {
  const { data } = await supabase
    .from("institutional_execution_index")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();
  return data;
}

// ─── Commercialization ───

export async function trackCommercialization(userId: string, input: {
  paperId?: string;
  grantId?: string;
  commercializationType: string;
  title: string;
  description?: string;
  filingDate?: string;
  industryPartners?: string[];
}) {
  const { data, error } = await supabase
    .from("research_commercialization" as any)
    .insert({
      user_id: userId,
      paper_id: input.paperId,
      grant_id: input.grantId,
      commercialization_type: input.commercializationType,
      title: input.title,
      description: input.description,
      filing_date: input.filingDate,
      industry_partners: input.industryPartners ?? [],
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getUserCommercializations(userId: string) {
  const { data } = await supabase
    .from("research_commercialization" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Global Innovation Map ───

export async function getGlobalInnovationMap(filters?: { countryCode?: string; domain?: string; period?: string }) {
  let query = supabase
    .from("global_innovation_map")
    .select("*")
    .order("innovation_cluster_score", { ascending: false });

  if (filters?.countryCode) query = query.eq("country_code", filters.countryCode);
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.period) query = query.eq("period", filters.period);

  const { data } = await query;
  return data ?? [];
}

// ─── Research Integrity ───

export async function getIntegrityFlags(paperId?: string, userId?: string) {
  let query = supabase.from("research_integrity_flags").select("*").eq("status", "open");
  if (paperId) query = query.eq("target_paper_id", paperId);
  if (userId) query = query.eq("target_user_id", userId);
  const { data } = await query;
  return data ?? [];
}

// ─── Execution Reliability Metrics ───

export interface ResearcherReliabilityMetrics {
  grantCompletionPct: number;
  onTimeMilestonePct: number;
  budgetEfficiencyPct: number;
  industryConversionRate: number;
  fundingRetentionPct: number;
  crossInstitutionDensity: number;
  longTermFundingStability: number;
}

export async function computeResearcherReliability(userId: string): Promise<ResearcherReliabilityMetrics> {
  const grants = await getUserGrants(userId);
  const completed = grants.filter(g => g.grant_status === "completed");
  const totalMilestones = grants.reduce((s, g) => s + (g.total_milestones ?? 0), 0);
  const releasedMilestones = grants.reduce((s, g) => s + (g.milestone_releases ?? 0), 0);
  const institutions = new Set(grants.map(g => g.institution_id).filter(Boolean));
  const totalLicenses = grants.reduce((s, g) => s + (g.industry_licenses ?? 0), 0);

  return {
    grantCompletionPct: grants.length > 0 ? Math.round((completed.length / grants.length) * 100) : 0,
    onTimeMilestonePct: totalMilestones > 0 ? Math.round((releasedMilestones / totalMilestones) * 100) : 0,
    budgetEfficiencyPct: Math.round(grants.reduce((s, g) => s + Number(g.completion_reliability ?? 0), 0) / Math.max(1, grants.length)),
    industryConversionRate: grants.length > 0 ? Math.round((totalLicenses / grants.length) * 100) : 0,
    fundingRetentionPct: grants.length > 1 ? Math.round((grants.filter(g => g.grant_status !== "cancelled").length / grants.length) * 100) : 100,
    crossInstitutionDensity: institutions.size,
    longTermFundingStability: Math.min(100, grants.length * 12),
  };
}

// ─── Category Positioning ───

export const GAEI_CATEGORY = {
  googleScholar: "Citation Archive",
  rcollab: "Academic Execution Infrastructure",
  shift: "From 'Who cited you?' to 'What did you build, fund, execute, and commercialize?'",
  dimensions: [
    "Recognition", "Funding", "Execution", "Reliability",
    "Commercialization", "Institutional Intelligence",
  ],
} as const;

export const MDII_EXPLANATION = {
  CIS: "Citation Impact Score — weighted citation count with quality adjustments",
  FIS: "Funding Impact Score — total research funding secured and managed",
  ECS: "Execution Completion Score — percentage of grants successfully completed",
  GRS: "Grant Reliability Score — average reliability across all grants",
  ICS: "Institutional Collaboration Score — breadth of institutional partnerships",
  CDIS: "Cross-Discipline Influence Score — diversity of research domains",
  RCS: "Research Commercialization Score — patents, licenses, spin-offs",
  MES: "Milestone Efficiency Score — milestone delivery punctuality",
  IAS: "Industry Adoption Score — industry licensing and adoption",
  LCS: "Longitudinal Contribution Score — sustained research over years",
} as const;
