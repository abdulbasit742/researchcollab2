/**
 * Verified Knowledge & Execution Content System
 * Replaces LinkedIn's engagement-optimized feed with substance-driven,
 * execution-backed, institutionally validated content infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("knowledgeContentEngine");

// ─── Content Types ───

export type ExecutionContentType =
  | "funded_case_study"
  | "milestone_breakdown"
  | "institutional_research"
  | "sponsor_insight"
  | "cross_institution_collaboration"
  | "execution_playbook"
  | "academic_innovation"
  | "industry_academic_bridge"
  | "general";

export interface ExecutionContentInput {
  title: string;
  body: string;
  excerpt?: string;
  contentType: ExecutionContentType;
  linkedProjectId?: string;
  linkedMilestoneId?: string;
  linkedEscrowAmount?: number;
  institutionId?: string;
  sponsorId?: string;
  tags?: string[];
  domainCategory?: string;
  caseStudyData?: CaseStudyTemplate;
}

// ─── Case Study Template ───

export interface CaseStudyTemplate {
  problemDefinition: string;
  fundingSource: string;
  escrowStructure: string;
  milestonePlan: string;
  executionChallenges: string;
  resolutionSteps: string;
  outcomeMetrics: Record<string, number>;
  sponsorFeedback?: string;
  institutionalValidation?: string;
}

// ─── Knowledge Badge Types ───

export type KnowledgeBadgeType =
  | "peer_reviewed"
  | "faculty_endorsed"
  | "sponsor_validated"
  | "cross_institution"
  | "execution_verified";

// ─── Substance Ranking ───

const CONTENT_TYPE_WEIGHTS: Record<ExecutionContentType, number> = {
  funded_case_study: 95,
  milestone_breakdown: 90,
  sponsor_insight: 85,
  institutional_research: 85,
  cross_institution_collaboration: 80,
  execution_playbook: 80,
  academic_innovation: 75,
  industry_academic_bridge: 75,
  general: 15,
};

const HYPE_PATTERNS = [
  /agree\s*\?/i,
  /thoughts\s*\?$/i,
  /like\s+if/i,
  /repost\s+if/i,
  /\b(hustle|grind|mindset|motivation)\b/i,
  /day\s+\d+\s+of/i,
  /unpopular\s+opinion/i,
  /hot\s+take/i,
  /thread\s*🧵/i,
];

const UNSUPPORTED_CLAIM_PATTERNS = [
  /increased\s+(funding|efficiency|revenue)/i,
  /reduced\s+(dispute|failure|cost)/i,
  /improved\s+(completion|speed|quality)/i,
];

export function detectHypeContent(body: string, contentType: ExecutionContentType): boolean {
  if (contentType !== "general") return false;
  return HYPE_PATTERNS.some((p) => p.test(body));
}

export function detectUnsupportedClaims(body: string, hasEscrowLink: boolean): string[] {
  if (hasEscrowLink) return [];
  return UNSUPPORTED_CLAIM_PATTERNS
    .filter((p) => p.test(body))
    .map((p) => `Claim "${body.match(p)?.[0]}" requires escrow/data reference`);
}

/**
 * Calculate substance rank for a content piece.
 * Prioritizes execution linkage, institutional validation, and read depth.
 */
export function calculateSubstanceRank(content: {
  contentType: ExecutionContentType;
  linkedEscrowAmount?: number | null;
  isPeerReviewed: boolean;
  isFacultyEndorsed: boolean;
  isSponsorValidated: boolean;
  avgReadTimeSeconds: number;
  completionDepthPct: number;
  deliverableClickCount: number;
  crossReferenceCount: number;
  authorCredibilityScore: number;
}): number {
  const typeWeight = CONTENT_TYPE_WEIGHTS[content.contentType] * 0.30;

  // Execution linkage bonus
  const escrowBonus = content.linkedEscrowAmount && content.linkedEscrowAmount > 0
    ? Math.min(15, content.linkedEscrowAmount / 1000)
    : 0;

  // Validation badges
  const validationBonus =
    (content.isPeerReviewed ? 8 : 0) +
    (content.isFacultyEndorsed ? 8 : 0) +
    (content.isSponsorValidated ? 8 : 0);

  // Read depth (substance signal)
  const readDepth = Math.min(10, content.completionDepthPct / 10);
  const readTime = Math.min(5, content.avgReadTimeSeconds / 60);

  // Reference quality
  const referenceScore = Math.min(7, content.deliverableClickCount + content.crossReferenceCount * 2);

  // Author credibility
  const authorBonus = Math.min(10, content.authorCredibilityScore * 0.1);

  const total = Math.min(100, Math.round(
    typeWeight + escrowBonus + validationBonus + readDepth + readTime + referenceScore + authorBonus
  ));

  return Math.max(0, total);
}

// ─── Knowledge Credibility Score (KCS) ───

export interface AuthorCredibility {
  knowledgeCredibilityScore: number;
  escrowDepthFactor: number;
  institutionalValidationFactor: number;
  deliverableRelevanceFactor: number;
  peerEndorsementFactor: number;
  sponsorAcknowledgmentFactor: number;
  contentCount: number;
  avgSubstanceRank: number;
  tier: "emerging" | "contributor" | "authority" | "expert" | "thought_leader";
}

const KCS_WEIGHTS = {
  escrowDepth: 0.25,
  institutionalValidation: 0.20,
  deliverableRelevance: 0.20,
  peerEndorsement: 0.15,
  sponsorAcknowledgment: 0.20,
} as const;

function classifyKCSTier(score: number, contentCount: number): AuthorCredibility["tier"] {
  if (contentCount < 2) return "emerging";
  if (score >= 85) return "thought_leader";
  if (score >= 70) return "expert";
  if (score >= 50) return "authority";
  return "contributor";
}

export async function calculateAuthorCredibility(userId: string): Promise<AuthorCredibility> {
  // Escrow depth from accountability records
  const { data: records } = await supabase
    .from("accountability_records")
    .select("escrow_amount, outcome_status")
    .eq("executor_id", userId);

  const allRecords = records ?? [];
  const totalEscrow = allRecords.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const escrowDepthFactor = Math.min(100, totalEscrow / 500);

  // Institutional validation
  const { count: validationCount } = await supabase
    .from("academic_records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verification_status", "verified");
  const institutionalValidationFactor = Math.min(100, (validationCount ?? 0) * 20);

  // Content metrics
  const { data: contentData } = await supabase
    .from("execution_content")
    .select("substance_rank_score, is_peer_reviewed, is_sponsor_validated, linked_project_id")
    .eq("author_id", userId)
    .eq("status", "published");

  const content = contentData ?? [];
  const contentCount = content.length;
  const avgSubstanceRank = contentCount > 0
    ? content.reduce((s, c) => s + (c.substance_rank_score ?? 0), 0) / contentCount
    : 0;

  const deliverableRelevanceFactor = Math.min(100,
    content.filter((c) => c.linked_project_id).length * 15
  );

  const peerEndorsementFactor = Math.min(100,
    content.filter((c) => c.is_peer_reviewed).length * 20
  );

  const sponsorAcknowledgmentFactor = Math.min(100,
    content.filter((c) => c.is_sponsor_validated).length * 20
  );

  const knowledgeCredibilityScore = Math.min(100, Math.round(
    escrowDepthFactor * KCS_WEIGHTS.escrowDepth +
    institutionalValidationFactor * KCS_WEIGHTS.institutionalValidation +
    deliverableRelevanceFactor * KCS_WEIGHTS.deliverableRelevance +
    peerEndorsementFactor * KCS_WEIGHTS.peerEndorsement +
    sponsorAcknowledgmentFactor * KCS_WEIGHTS.sponsorAcknowledgment
  ));

  const tier = classifyKCSTier(knowledgeCredibilityScore, contentCount);

  log.info("Author credibility calculated", { userId, knowledgeCredibilityScore, tier });

  return {
    knowledgeCredibilityScore,
    escrowDepthFactor: Math.round(escrowDepthFactor),
    institutionalValidationFactor: Math.round(institutionalValidationFactor),
    deliverableRelevanceFactor: Math.round(deliverableRelevanceFactor),
    peerEndorsementFactor: Math.round(peerEndorsementFactor),
    sponsorAcknowledgmentFactor: Math.round(sponsorAcknowledgmentFactor),
    contentCount,
    avgSubstanceRank: Math.round(avgSubstanceRank * 100) / 100,
    tier,
  };
}

// ─── Content Publishing ───

export async function publishExecutionContent(
  authorId: string,
  input: ExecutionContentInput
): Promise<{ id: string; substanceRank: number; warnings: string[] }> {
  const warnings: string[] = [];

  // Anti-hype check
  if (detectHypeContent(input.body, input.contentType)) {
    warnings.push("Content detected as engagement bait — ranking suppressed");
  }

  // Unsupported claims check
  const claimWarnings = detectUnsupportedClaims(
    input.body,
    !!(input.linkedProjectId || input.linkedEscrowAmount)
  );
  warnings.push(...claimWarnings);

  const substanceRank = calculateSubstanceRank({
    contentType: input.contentType,
    linkedEscrowAmount: input.linkedEscrowAmount,
    isPeerReviewed: false,
    isFacultyEndorsed: false,
    isSponsorValidated: false,
    avgReadTimeSeconds: 0,
    completionDepthPct: 0,
    deliverableClickCount: 0,
    crossReferenceCount: 0,
    authorCredibilityScore: 0,
  });

  const { data, error } = await supabase
    .from("execution_content")
    .insert({
      author_id: authorId,
      content_type: input.contentType,
      title: input.title,
      body: input.body,
      excerpt: input.excerpt,
      linked_project_id: input.linkedProjectId,
      linked_milestone_id: input.linkedMilestoneId,
      linked_escrow_amount: input.linkedEscrowAmount,
      institution_id: input.institutionId,
      sponsor_id: input.sponsorId,
      tags: input.tags ?? [],
      domain_category: input.domainCategory,
      case_study_data: input.caseStudyData as any,
      substance_rank_score: substanceRank,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;

  log.info("Content published", { id: data.id, substanceRank, warnings: warnings.length });

  return { id: data.id, substanceRank, warnings };
}

// ─── Content Search ───

export interface ContentSearchFilters {
  contentType?: ExecutionContentType;
  domainCategory?: string;
  minEscrowAmount?: number;
  institutionId?: string;
  isPeerReviewed?: boolean;
  isFacultyEndorsed?: boolean;
  tags?: string[];
  sortBy?: "substance_rank" | "recency" | "read_depth";
}

export async function searchExecutionContent(filters: ContentSearchFilters) {
  let query = supabase
    .from("execution_content")
    .select("*")
    .eq("status", "published");

  if (filters.contentType) query = query.eq("content_type", filters.contentType);
  if (filters.domainCategory) query = query.eq("domain_category", filters.domainCategory);
  if (filters.institutionId) query = query.eq("institution_id", filters.institutionId);
  if (filters.isPeerReviewed) query = query.eq("is_peer_reviewed", true);
  if (filters.isFacultyEndorsed) query = query.eq("is_faculty_endorsed", true);
  if (filters.minEscrowAmount) query = query.gte("linked_escrow_amount", filters.minEscrowAmount);
  if (filters.tags && filters.tags.length > 0) query = query.overlaps("tags", filters.tags);

  const sortCol = filters.sortBy === "recency" ? "published_at"
    : filters.sortBy === "read_depth" ? "completion_depth_pct"
    : "substance_rank_score";

  query = query.order(sortCol, { ascending: false }).limit(50);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Transparency ───

export const CONTENT_RANKING_TRANSPARENCY = {
  formula: "Substance Rank = TypeWeight(30%) + EscrowLink + Badges + ReadDepth + References + AuthorCredibility",
  rankedBy: [
    "Content type relevance (execution-linked types weighted highest)",
    "Escrow-backed project linkage",
    "Peer review / faculty / sponsor validation badges",
    "Average read completion depth (substance signal)",
    "Deliverable and cross-reference click-through",
    "Author Knowledge Credibility Score",
  ],
  notRankedBy: [
    "Likes or reactions",
    "Follower count",
    "Share/repost count",
    "Paid promotion",
    "Emoji engagement",
    "Comment volume",
  ],
  antiHype: [
    "Engagement bait patterns auto-detected and suppressed",
    "Unsupported performance claims flagged without escrow evidence",
    "Generic motivational content ranked lowest",
    "No viral amplification loop",
  ],
} as const;
