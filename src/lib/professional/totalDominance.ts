/**
 * Total Professional Infrastructure Domination Engine
 * Unified Execution Identity, Professional Lifecycle, Execution Marketplace,
 * Intelligent Discovery, AI Growth Advisor, and Category Positioning.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("totalDominance");

// ─── Unified Execution Identity Layer (UEIL) ───

export interface UnifiedExecutionIdentity {
  escrowBackedProjects: number;
  totalEscrowVolume: number;
  institutionalValidations: number;
  sponsorFundingFootprint: number;
  visualDeliverablesCount: number;
  researchOutputsCount: number;
  economicTrustWeight: number;
  talentReadinessScore: number;
  communicationReliability: number;
  collaborationClusters: number;
  careerTrajectoryTrend: string;
  identityCompletenessPct: number;
}

export async function computeUnifiedIdentity(userId: string): Promise<UnifiedExecutionIdentity> {
  const [accountabilityRes, portfolioRes, recordsRes, trustEdgesRes] = await Promise.all([
    supabase.from("accountability_records").select("*").eq("executor_id", userId),
    supabase.from("execution_visual_portfolio").select("id, escrow_linked, institutional_validation").eq("user_id", userId),
    supabase.from("academic_records").select("id").eq("user_id", userId),
    supabase.from("trust_edges").select("id").or(`source_id.eq.${userId},target_id.eq.${userId}`),
  ]);

  const records = accountabilityRes.data ?? [];
  const portfolio = portfolioRes.data ?? [];
  const academicRecords = recordsRes.data ?? [];
  const trustEdges = trustEdgesRes.data ?? [];

  const completed = records.filter((r) => r.outcome_status === "completed");
  const totalEscrow = records.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const sponsors = new Set(records.map((r) => r.funder_id).filter(Boolean));

  const escrowBackedProjects = records.length;
  const totalEscrowVolume = totalEscrow;
  const institutionalValidations = portfolio.filter((p) => p.institutional_validation).length;
  const sponsorFundingFootprint = sponsors.size;
  const visualDeliverablesCount = portfolio.length;
  const researchOutputsCount = academicRecords.length;
  const economicTrustWeight = Math.min(100, trustEdges.length * 5);
  const talentReadinessScore = records.length > 0 ? Math.round((completed.length / records.length) * 100) : 0;
  const communicationReliability = talentReadinessScore;
  const collaborationClusters = Math.min(20, Math.floor(trustEdges.length / 3));

  // Compute completeness
  const fields = [escrowBackedProjects, institutionalValidations, visualDeliverablesCount, researchOutputsCount, trustEdges.length];
  const filledFields = fields.filter((f) => f > 0).length;
  const identityCompletenessPct = Math.round((filledFields / fields.length) * 100);

  const careerTrajectoryTrend = totalEscrow > 100000 ? "accelerating" : totalEscrow > 10000 ? "growing" : escrowBackedProjects > 0 ? "emerging" : "new";

  const identity: UnifiedExecutionIdentity = {
    escrowBackedProjects, totalEscrowVolume, institutionalValidations,
    sponsorFundingFootprint, visualDeliverablesCount, researchOutputsCount,
    economicTrustWeight, talentReadinessScore, communicationReliability,
    collaborationClusters, careerTrajectoryTrend, identityCompletenessPct,
  };

  // Upsert to DB
  await supabase.from("unified_execution_identity").upsert({
    user_id: userId,
    escrow_backed_projects: escrowBackedProjects,
    total_escrow_volume: totalEscrowVolume,
    institutional_validations: institutionalValidations,
    sponsor_funding_footprint: sponsorFundingFootprint,
    visual_deliverables_count: visualDeliverablesCount,
    research_outputs_count: researchOutputsCount,
    economic_trust_weight: economicTrustWeight,
    talent_readiness_score: talentReadinessScore,
    communication_reliability: communicationReliability,
    collaboration_clusters: collaborationClusters,
    career_trajectory_trend: careerTrajectoryTrend,
    identity_completeness_pct: identityCompletenessPct,
    last_computed_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  log.info("Unified identity computed", { userId, identityCompletenessPct });
  return identity;
}

export async function getUnifiedIdentity(userId: string): Promise<UnifiedExecutionIdentity | null> {
  const { data } = await supabase
    .from("unified_execution_identity")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    escrowBackedProjects: data.escrow_backed_projects ?? 0,
    totalEscrowVolume: data.total_escrow_volume ?? 0,
    institutionalValidations: data.institutional_validations ?? 0,
    sponsorFundingFootprint: data.sponsor_funding_footprint ?? 0,
    visualDeliverablesCount: data.visual_deliverables_count ?? 0,
    researchOutputsCount: data.research_outputs_count ?? 0,
    economicTrustWeight: data.economic_trust_weight ?? 0,
    talentReadinessScore: data.talent_readiness_score ?? 0,
    communicationReliability: data.communication_reliability ?? 0,
    collaborationClusters: data.collaboration_clusters ?? 0,
    careerTrajectoryTrend: data.career_trajectory_trend ?? "new",
    identityCompletenessPct: data.identity_completeness_pct ?? 0,
  };
}

// ─── Execution Marketplace ───

export type ListingType = "project_proposal" | "research_collaboration" | "industry_project" | "fyp_opportunity" | "advisory_role";

export interface MarketplaceListingInput {
  title: string;
  description?: string;
  listingType?: ListingType;
  domain?: string;
  requiredSkills?: string[];
  budgetRangeMin?: number;
  budgetRangeMax?: number;
  institutionalOversight?: boolean;
  institutionId?: string;
  facultyCollaboration?: boolean;
  complexityTier?: string;
  milestoneCount?: number;
  expectedDurationDays?: number;
}

export async function createMarketplaceListing(creatorId: string, input: MarketplaceListingInput) {
  const { data, error } = await supabase
    .from("execution_marketplace")
    .insert({
      creator_id: creatorId,
      title: input.title,
      description: input.description,
      listing_type: input.listingType ?? "project_proposal",
      domain: input.domain,
      required_skills: input.requiredSkills ?? [],
      budget_range_min: input.budgetRangeMin,
      budget_range_max: input.budgetRangeMax,
      institutional_oversight: input.institutionalOversight ?? false,
      institution_id: input.institutionId,
      faculty_collaboration: input.facultyCollaboration ?? false,
      complexity_tier: input.complexityTier ?? "standard",
      milestone_count: input.milestoneCount ?? 1,
      expected_duration_days: input.expectedDurationDays,
    })
    .select("id")
    .single();

  if (error) throw error;
  log.info("Marketplace listing created", { creatorId, id: data.id });
  return data;
}

export async function browseMarketplace(filters?: {
  domain?: string;
  complexityTier?: string;
  listingType?: string;
  limit?: number;
}) {
  let query = supabase
    .from("execution_marketplace")
    .select("*")
    .eq("status", "open")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 30);

  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.complexityTier) query = query.eq("complexity_tier", filters.complexityTier);
  if (filters?.listingType) query = query.eq("listing_type", filters.listingType);

  const { data } = await query;
  return data ?? [];
}

export async function applyToListing(applicantId: string, params: {
  listingId: string;
  proposalText?: string;
  proposedBudget?: number;
  proposedTimelineDays?: number;
  relevantPortfolioIds?: string[];
}) {
  const { data, error } = await supabase
    .from("marketplace_applications")
    .insert({
      listing_id: params.listingId,
      applicant_id: applicantId,
      proposal_text: params.proposalText,
      proposed_budget: params.proposedBudget,
      proposed_timeline_days: params.proposedTimelineDays,
      relevant_portfolio_ids: params.relevantPortfolioIds ?? [],
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

// ─── Intelligent Discovery ───

export interface DiscoveryFilters {
  domain?: string;
  entityType?: string;
  minReliability?: number;
  skills?: string[];
  limit?: number;
}

export async function intelligentDiscovery(filters: DiscoveryFilters) {
  let query = supabase
    .from("execution_discovery_index")
    .select("*")
    .order("overall_discovery_score", { ascending: false })
    .limit(filters.limit ?? 30);

  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.minReliability) query = query.gte("escrow_reliability", filters.minReliability);

  const { data } = await query;
  return data ?? [];
}

// ─── AI Growth Advisor ───

export async function getGrowthAdvisorRecords(userId: string) {
  const { data } = await supabase
    .from("ai_growth_advisor_records")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

// ─── Professional Lifecycle ───

export const LIFECYCLE_STAGES = [
  "discovery", "proposal", "escrow_funding", "execution",
  "validation", "publication", "hiring", "institutional_reporting",
  "long_term_reputation",
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

export async function getLifecycleEvents(userId: string, projectId?: string) {
  let query = supabase
    .from("professional_lifecycle_events")
    .select("*")
    .eq("user_id", userId)
    .order("entered_at", { ascending: true });

  if (projectId) query = query.eq("project_id", projectId);
  const { data } = await query;
  return data ?? [];
}

export async function recordLifecycleEvent(userId: string, event: {
  projectId?: string;
  stage: LifecycleStage;
  stageData?: Record<string, unknown>;
  outcome?: string;
}) {
  const { data, error } = await supabase
    .from("professional_lifecycle_events")
    .insert({
      user_id: userId,
      project_id: event.projectId,
      stage: event.stage,
      stage_data: (event.stageData ?? {}) as any,
      outcome: event.outcome,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

// ─── Category Positioning ───

export const CATEGORY_POSITIONING = {
  categoryName: "Professional Execution Infrastructure",
  notA: [
    "Professional social network",
    "Freelance marketplace",
    "Content platform",
    "Social media",
  ],
  butA: [
    "Institutional escrow engine",
    "Economic collaboration backbone",
    "Verified knowledge library",
    "Professional Infrastructure OS",
  ],
  competitiveAdvantages: {
    vsLinkedIn: "Escrow-backed execution replaces self-claimed profiles",
    vsInstagram: "Verified deliverable grid replaces aesthetic content",
    vsUpwork: "Institutional validation + academic integration + long-term reputation",
    vsResearchGate: "Economic trust graph + escrow funding + sponsor coordination",
    vsHandshake: "Full lifecycle integration beyond hiring",
    vsAngelList: "Institutional governance + escrow-backed project execution",
  },
  longTermMoat: [
    "Decade-long escrow history",
    "Institutional reliability datasets",
    "Sponsor funding behavior models",
    "Execution performance analytics",
    "Cross-institution trust graphs",
    "Professional growth trajectories",
  ],
  strategicPhilosophy: {
    neverCompeteFor: ["Attention hours"],
    alwaysCompeteFor: [
      "Career relevance",
      "Institutional trust",
      "Economic impact",
      "Capital coordination",
      "Innovation tracking",
    ],
  },
} as const;
