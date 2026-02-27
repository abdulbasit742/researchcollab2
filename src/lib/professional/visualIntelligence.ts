/**
 * Professional Visual Intelligence Platform Engine
 * Execution visual portfolio, project story mode, visual impact scoring,
 * institutional showcase, trust badges, and anti-addiction design.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("visualIntelligence");

// ─── Visual Types ───

export type VisualType =
  | "deliverable" | "prototype" | "research_output" | "case_study"
  | "design_artifact" | "engineering_simulation" | "data_visualization"
  | "field_deployment" | "milestone_submission";

export type ReelType =
  | "project_demo" | "prototype_walkthrough" | "code_explanation"
  | "research_insight" | "milestone_explanation" | "engineering_breakdown";

export type BadgeType =
  | "escrow_backed_deliverable" | "sponsor_validated_output"
  | "faculty_endorsed_prototype" | "institutional_certified_research"
  | "dispute_free_execution";

export type StoryEventType =
  | "funding_confirmation" | "milestone_submission" | "feedback_iteration"
  | "revision_progress" | "final_approval" | "completion_highlight";

// ─── Portfolio Management ───

export interface PortfolioItemInput {
  title: string;
  description?: string;
  visualType: VisualType;
  mediaUrls: string[];
  thumbnailUrl?: string;
  projectId?: string;
  escrowLinked?: boolean;
  escrowAmount?: number;
  escrowAmountVisible?: boolean;
  skillsDemonstrated?: string[];
  rolePlayed?: string;
  performanceOutcome?: string;
}

export async function createPortfolioItem(userId: string, input: PortfolioItemInput) {
  const { data, error } = await supabase
    .from("execution_visual_portfolio")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      visual_type: input.visualType,
      media_urls: input.mediaUrls,
      thumbnail_url: input.thumbnailUrl,
      project_id: input.projectId,
      escrow_linked: input.escrowLinked ?? false,
      escrow_amount: input.escrowAmount,
      escrow_amount_visible: input.escrowAmountVisible ?? false,
      skills_demonstrated: input.skillsDemonstrated ?? [],
      role_played: input.rolePlayed,
      performance_outcome: input.performanceOutcome,
    })
    .select("id")
    .single();

  if (error) throw error;
  log.info("Portfolio item created", { userId, id: data.id });
  return data;
}

export async function getUserPortfolio(userId: string) {
  const { data } = await supabase
    .from("execution_visual_portfolio")
    .select("*")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function discoverPortfolio(filters: {
  visualType?: string;
  skillFilter?: string;
  institutionId?: string;
  limit?: number;
}) {
  let query = supabase
    .from("execution_visual_portfolio")
    .select("*")
    .eq("is_public", true)
    .order("visual_impact_score", { ascending: false })
    .limit(filters.limit ?? 30);

  if (filters.visualType) query = query.eq("visual_type", filters.visualType);
  if (filters.institutionId) query = query.eq("institution_id", filters.institutionId);

  const { data } = await query;
  return data ?? [];
}

// ─── Project Lifecycle Stories ───

export async function getProjectStories(projectId: string) {
  const { data } = await supabase
    .from("project_lifecycle_stories")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_public", true)
    .order("event_at", { ascending: true });
  return data ?? [];
}

export async function createProjectStoryEvent(userId: string, event: {
  projectId: string;
  eventType: StoryEventType;
  eventTitle: string;
  eventDescription?: string;
  mediaUrl?: string;
  milestoneNumber?: number;
  escrowStage?: string;
}) {
  const { data, error } = await supabase
    .from("project_lifecycle_stories")
    .insert({
      user_id: userId,
      project_id: event.projectId,
      event_type: event.eventType,
      event_title: event.eventTitle,
      event_description: event.eventDescription,
      media_url: event.mediaUrl,
      milestone_number: event.milestoneNumber,
      escrow_stage: event.escrowStage,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

// ─── Institutional Showcase ───

export async function getInstitutionalChannels(institutionId?: string) {
  let query = supabase
    .from("institutional_showcase_channels")
    .select("*")
    .eq("is_active", true);

  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data } = await query;
  return data ?? [];
}

export async function getShowcasePosts(channelId?: string, institutionId?: string) {
  let query = supabase
    .from("institutional_showcase_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (channelId) query = query.eq("channel_id", channelId);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data } = await query;
  return data ?? [];
}

// ─── Visual Discussions ───

export async function getVisualDiscussions(portfolioItemId: string) {
  const { data } = await supabase
    .from("visual_discussions")
    .select("*")
    .eq("portfolio_item_id", portfolioItemId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function addVisualDiscussion(authorId: string, params: {
  portfolioItemId: string;
  content: string;
  discussionType?: string;
  isFacultyReview?: boolean;
  isSponsorComment?: boolean;
  parentId?: string;
}) {
  const { data, error } = await supabase
    .from("visual_discussions")
    .insert({
      author_id: authorId,
      portfolio_item_id: params.portfolioItemId,
      content: params.content,
      discussion_type: params.discussionType ?? "feedback",
      is_faculty_review: params.isFacultyReview ?? false,
      is_sponsor_comment: params.isSponsorComment ?? false,
      parent_id: params.parentId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

// ─── Execution Reels ───

export async function getExecutionReels(filters?: { userId?: string; reelType?: string; limit?: number }) {
  let query = supabase
    .from("execution_reels")
    .select("*")
    .eq("is_public", true)
    .order("visual_impact_score", { ascending: false })
    .limit(filters?.limit ?? 20);

  if (filters?.userId) query = query.eq("user_id", filters.userId);
  if (filters?.reelType) query = query.eq("reel_type", filters.reelType);
  const { data } = await query;
  return data ?? [];
}

// ─── Visual Trust Badges ───

export async function getUserBadges(userId: string) {
  const { data } = await supabase
    .from("visual_trust_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);
  return data ?? [];
}

// ─── Visual Impact Score ───

export interface VisualImpactScore {
  economicImpact: number;
  sponsorRepeatScore: number;
  institutionalCredibility: number;
  complexityScore: number;
  adoptionRate: number;
  industryRecognition: number;
  overallVIS: number;
  tier: "emerging" | "established" | "impactful" | "distinguished" | "legendary";
}

const VIS_WEIGHTS = {
  economicImpact: 0.25,
  sponsorRepeatScore: 0.20,
  institutionalCredibility: 0.20,
  complexityScore: 0.15,
  adoptionRate: 0.10,
  industryRecognition: 0.10,
} as const;

function classifyVISTier(score: number): VisualImpactScore["tier"] {
  if (score >= 85) return "legendary";
  if (score >= 70) return "distinguished";
  if (score >= 50) return "impactful";
  if (score >= 25) return "established";
  return "emerging";
}

export async function calculateVisualImpactScore(userId: string): Promise<VisualImpactScore> {
  const { data: portfolio } = await supabase
    .from("execution_visual_portfolio")
    .select("*")
    .eq("user_id", userId);

  const items = portfolio ?? [];
  const escrowLinked = items.filter((i) => i.escrow_linked);
  const sponsorValidated = items.filter((i) => i.sponsor_validated);
  const institutionalValidated = items.filter((i) => i.institutional_validation);
  const totalComplexity = items.reduce((s, i) => s + (i.complexity_score ?? 0), 0);

  const economicImpact = Math.min(100, escrowLinked.length * 15);
  const sponsorRepeatScore = Math.min(100, sponsorValidated.length * 20);
  const institutionalCredibility = Math.min(100, institutionalValidated.length * 20);
  const complexityScore = items.length > 0 ? Math.min(100, Math.round(totalComplexity / items.length)) : 0;
  const adoptionRate = Math.min(100, items.length * 10);
  const industryRecognition = Math.min(100, Math.round((sponsorRepeatScore + institutionalCredibility) / 2));

  const overallVIS = Math.round(
    economicImpact * VIS_WEIGHTS.economicImpact +
    sponsorRepeatScore * VIS_WEIGHTS.sponsorRepeatScore +
    institutionalCredibility * VIS_WEIGHTS.institutionalCredibility +
    complexityScore * VIS_WEIGHTS.complexityScore +
    adoptionRate * VIS_WEIGHTS.adoptionRate +
    industryRecognition * VIS_WEIGHTS.industryRecognition
  );

  const tier = classifyVISTier(overallVIS);
  log.info("VIS calculated", { userId, overallVIS, tier });

  return {
    economicImpact, sponsorRepeatScore, institutionalCredibility,
    complexityScore, adoptionRate, industryRecognition, overallVIS, tier,
  };
}

// ─── Transparency Constants ───

export const VISUAL_INTELLIGENCE_TRANSPARENCY = {
  philosophy: "Depth over dopamine. Trust over trends. Execution over aesthetics. Economic proof over popularity.",
  portfolioRequirements: [
    "Every visual must be escrow-linked or institutionally validated",
    "Time-stamped execution evidence",
    "Skills demonstrated must be tagged",
    "No aesthetic-only posting",
  ],
  rankingFactors: [
    "Escrow impact",
    "Completion reliability",
    "Sponsor validation",
    "Institutional badge weight",
    "Deliverable complexity",
    "Long-term project performance",
  ],
  notRankedBy: [
    "Likes", "Emojis", "Follower count",
    "Time spent viewing", "Reaction velocity",
  ],
  antiAddictionDesign: [
    "No infinite scroll",
    "No algorithmic dopamine injection",
    "No prominent engagement counters",
    "No manipulative notifications",
    "No comparison culture encouragement",
    "Structured discovery mode",
    "Professional focus enforced",
  ],
  reelRequirements: [
    "Must be project demo, prototype walkthrough, code explanation, research insight, milestone explanation, or engineering breakdown",
    "Must link to full project page with escrow-backed details",
    "No entertainment or trend content",
  ],
  visualBadges: [
    "Escrow-backed deliverable",
    "Sponsor validated output",
    "Faculty endorsed prototype",
    "Institutional certified research",
    "Dispute-free execution",
  ],
  visFormula: "VIS = EconomicImpact(25%) + SponsorRepeat(20%) + InstitutionalCredibility(20%) + Complexity(15%) + AdoptionRate(10%) + IndustryRecognition(10%)",
} as const;
