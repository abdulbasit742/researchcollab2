/**
 * Execution-First Feed Algorithm
 * Replaces engagement-optimized ranking with execution-relevance scoring.
 * Eliminates vanity viral boosting, engagement farming, and content spam.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("executionFeedAlgorithm");

export type FeedItemType =
  | "funded_project"
  | "milestone_achieved"
  | "institutional_collaboration"
  | "sponsor_case_study"
  | "verified_deliverable"
  | "academic_innovation"
  | "hiring_outcome"
  | "general_content";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  authorId: string;
  authorERS: number;          // Execution Reputation Score
  escrowLinked: boolean;       // Is this tied to a real escrow record?
  institutionallyValidated: boolean;
  timestamp: string;
  engagementCount: number;     // likes/reactions — deprioritized
  content: string;
}

export interface ScoredFeedItem extends FeedItem {
  relevanceScore: number;
  scoreBreakdown: {
    typeWeight: number;
    credibilityBonus: number;
    escrowBonus: number;
    recencyFactor: number;
    engagementPenalty: number;
  };
}

/**
 * Content type weights — execution-relevant content scores higher.
 * General content (thought leadership, motivational) scores lowest.
 */
const TYPE_WEIGHTS: Record<FeedItemType, number> = {
  funded_project: 95,
  milestone_achieved: 90,
  hiring_outcome: 85,
  verified_deliverable: 85,
  sponsor_case_study: 80,
  institutional_collaboration: 80,
  academic_innovation: 75,
  general_content: 20,
};

/**
 * Anti-spam content classifiers.
 * Returns true if content should be deprioritized or filtered.
 */
const SPAM_PATTERNS = [
  /agree\s*\?/i,                    // "Agree?" engagement bait
  /thoughts\s*\?$/i,                // Empty "Thoughts?" posts
  /like\s+if\s+you/i,              // Like farming
  /repost\s+if/i,                  // Repost farming
  /poll:/i,                         // Poll abuse (when not execution-linked)
  /\b(hustle|grind|mindset)\b/i,   // Generic motivational spam
  /day\s+\d+\s+of/i,              // "Day X of..." vanity streaks
];

function isSpamContent(content: string, type: FeedItemType): boolean {
  if (type !== "general_content") return false;
  return SPAM_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Score a feed item for relevance.
 * Prioritizes: execution proof > credibility > recency > engagement
 */
export function scoreFeedItem(item: FeedItem): ScoredFeedItem {
  // Filter spam
  if (isSpamContent(item.content, item.type)) {
    return {
      ...item,
      relevanceScore: 0,
      scoreBreakdown: {
        typeWeight: 0,
        credibilityBonus: 0,
        escrowBonus: 0,
        recencyFactor: 0,
        engagementPenalty: -100,
      },
    };
  }

  const typeWeight = TYPE_WEIGHTS[item.type];

  // Credibility bonus: author's ERS adds trust to content
  const credibilityBonus = Math.min(15, item.authorERS * 0.15);

  // Escrow bonus: content linked to real financial execution
  const escrowBonus = item.escrowLinked ? 15 : 0;

  // Recency factor: mild decay over 7 days
  const ageHours = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
  const recencyFactor = Math.max(0, 10 - ageHours / 16.8); // 0 at 7 days

  // Engagement penalty: high engagement on general content = likely viral farming
  const engagementPenalty = item.type === "general_content" && item.engagementCount > 100
    ? -Math.min(20, item.engagementCount / 50)
    : 0;

  const relevanceScore = Math.max(0, Math.min(100, Math.round(
    typeWeight * 0.5 +
    credibilityBonus +
    escrowBonus +
    recencyFactor +
    engagementPenalty
  )));

  return {
    ...item,
    relevanceScore,
    scoreBreakdown: {
      typeWeight,
      credibilityBonus: Math.round(credibilityBonus * 100) / 100,
      escrowBonus,
      recencyFactor: Math.round(recencyFactor * 100) / 100,
      engagementPenalty,
    },
  };
}

/**
 * Rank a list of feed items by execution relevance.
 * Filters out spam, sorts by relevance score.
 */
export function rankFeed(items: FeedItem[]): ScoredFeedItem[] {
  const scored = items.map(scoreFeedItem);
  const filtered = scored.filter((item) => item.relevanceScore > 0);
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

  log.info("Feed ranked", {
    total: items.length,
    filtered: filtered.length,
    spamRemoved: items.length - filtered.length,
  });

  return filtered;
}
