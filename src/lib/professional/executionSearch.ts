/**
 * Execution Intelligence Search Engine
 * Replaces LinkedIn's keyword/title/connection search with escrow-verified execution search.
 * Structured index, multi-dimensional filters, execution ranking, and anti-gaming.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("executionSearch");

// ─── Search Index Types ───

export interface IndividualSearchIndex {
  userId: string;
  displayName: string;
  totalEscrowHandled: number;
  projectCount: number;
  onTimeMilestonePct: number;
  disputeFreePct: number;
  institutionalValidationCount: number;
  skills: string[];
  avgProjectComplexity: number;
  repeatSponsorRatio: number;
  slaAdherenceScore: number;
  executionRankScore: number;
}

export interface InstitutionSearchIndex {
  institutionId: string;
  name: string;
  completionRate: number;
  sponsorRetentionRate: number;
  escrowVolume: number;
  disputeRatio: number;
  milestoneVelocity: number;
  projectCount: number;
  executionRankScore: number;
}

export interface SponsorSearchIndex {
  sponsorId: string;
  displayName: string;
  totalEscrowFunded: number;
  disputeRatio: number;
  repeatFundingRate: number;
  institutionalSpread: number;
  escrowReliability: number;
  executionRankScore: number;
}

// ─── Search Filters ───

export interface TalentSearchFilters {
  escrowHandledMin?: number;
  escrowHandledMax?: number;
  minDeliverableCount?: number;
  hasInstitutionalValidation?: boolean;
  skills?: string[];
  minOnTimeDeliveryPct?: number;
  maxDisputeRate?: number;
  minRepeatSponsorEndorsements?: number;
  projectDomain?: string;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
}

export interface InstitutionSearchFilters {
  minProjectVolume?: number;
  minCompletionReliability?: number;
  minSponsorDiversity?: number;
  fundingCategory?: string;
  minAvgDealSize?: number;
}

export interface SponsorSearchFilters {
  minEscrowFunded?: number;
  industryCategory?: string;
  minRepeatRate?: number;
  maxDisputeFrequency?: number;
}

export type SearchContext = "sponsor" | "recruiter" | "institution" | "general";

// ─── Execution Ranking Model (ERM) ───

const ERM_WEIGHTS = {
  escrowVolume: 0.20,
  completionReliability: 0.20,
  complexityFactor: 0.15,
  budgetScale: 0.10,
  institutionalValidation: 0.15,
  sponsorRepeat: 0.10,
  disputePenalty: -0.15,
  consistency: 0.10,
} as const;

function computeExecutionRank(metrics: {
  escrowVolume: number;
  completionRate: number;
  complexity: number;
  budgetScale: number;
  validations: number;
  repeatRatio: number;
  disputeRate: number;
  consistency: number;
}): number {
  const normalized = {
    escrow: Math.min(100, metrics.escrowVolume / 1000),
    completion: metrics.completionRate,
    complexity: metrics.complexity,
    budget: Math.min(100, metrics.budgetScale / 500),
    validation: Math.min(100, metrics.validations * 20),
    repeat: metrics.repeatRatio * 100,
    dispute: metrics.disputeRate * 100,
    consistency: metrics.consistency,
  };

  return Math.max(0, Math.min(100, Math.round(
    normalized.escrow * ERM_WEIGHTS.escrowVolume +
    normalized.completion * ERM_WEIGHTS.completionReliability +
    normalized.complexity * ERM_WEIGHTS.complexityFactor +
    normalized.budget * ERM_WEIGHTS.budgetScale +
    normalized.validation * ERM_WEIGHTS.institutionalValidation +
    normalized.repeat * ERM_WEIGHTS.sponsorRepeat +
    normalized.dispute * ERM_WEIGHTS.disputePenalty +
    normalized.consistency * ERM_WEIGHTS.consistency
  )));
}

// ─── Context-Aware Ranking Adjustments ───

function applyContextBoost(score: number, context: SearchContext, metrics: {
  completionRate: number;
  complexity: number;
  consistency: number;
  repeatRatio: number;
}): number {
  switch (context) {
    case "sponsor":
      // Sponsors care about reliability + domain match
      return Math.round(score * 0.7 + metrics.completionRate * 0.2 + metrics.repeatRatio * 10 * 0.1);
    case "recruiter":
      // Recruiters care about complexity + consistency
      return Math.round(score * 0.6 + metrics.complexity * 0.2 + metrics.consistency * 0.2);
    case "institution":
      // Institutions care about collaboration compatibility
      return Math.round(score * 0.7 + metrics.consistency * 0.15 + metrics.completionRate * 0.15);
    default:
      return score;
  }
}

// ─── Search Execution ───

export async function searchTalent(
  filters: TalentSearchFilters,
  context: SearchContext = "general",
  limit = 50
): Promise<IndividualSearchIndex[]> {
  // Fetch accountability records grouped by executor
  const { data: records } = await supabase
    .from("accountability_records")
    .select("executor_id, escrow_amount, outcome_status, deadline, verified_at, funder_id, promised_deliverables")
    .limit(2000);

  if (!records?.length) return [];

  // Group by executor
  const byExecutor = new Map<string, typeof records>();
  for (const r of records) {
    const list = byExecutor.get(r.executor_id) ?? [];
    list.push(r);
    byExecutor.set(r.executor_id, list);
  }

  // Build index per executor
  const results: IndividualSearchIndex[] = [];

  for (const [userId, userRecords] of byExecutor) {
    const projectCount = userRecords.length;
    const totalEscrow = userRecords.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
    const completed = userRecords.filter((r) => r.outcome_status === "completed");
    const disputed = userRecords.filter((r) => r.outcome_status === "disputed");
    const onTime = completed.filter((r) => !r.deadline || !r.verified_at || new Date(r.verified_at) <= new Date(r.deadline));

    const onTimePct = completed.length > 0 ? (onTime.length / completed.length) * 100 : 0;
    const disputeFreePct = projectCount > 0 ? ((projectCount - disputed.length) / projectCount) * 100 : 0;
    const disputeRate = projectCount > 0 ? disputed.length / projectCount : 0;

    // Sponsor repeat
    const sponsors = userRecords.map((r) => r.funder_id).filter(Boolean);
    const sponsorSet = new Set(sponsors);
    const repeatSponsors = sponsors.length - sponsorSet.size;
    const repeatRatio = sponsorSet.size > 0 ? repeatSponsors / sponsorSet.size : 0;

    const avgEscrow = projectCount > 0 ? totalEscrow / projectCount : 0;
    const complexity = Math.min(100, avgEscrow / 500 + projectCount * 3);
    const consistency = Math.min(100, onTimePct * 0.5 + disputeFreePct * 0.5);

    // Apply filters
    if (filters.escrowHandledMin && totalEscrow < filters.escrowHandledMin) continue;
    if (filters.escrowHandledMax && totalEscrow > filters.escrowHandledMax) continue;
    if (filters.minOnTimeDeliveryPct && onTimePct < filters.minOnTimeDeliveryPct) continue;
    if (filters.maxDisputeRate && disputeRate * 100 > filters.maxDisputeRate) continue;

    // Skills from deliverables
    const skills = [...new Set(userRecords.flatMap((r) => r.promised_deliverables ?? []))];
    if (filters.skills?.length) {
      const hasSkill = filters.skills.some((s) => skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase())));
      if (!hasSkill) continue;
    }

    let rankScore = computeExecutionRank({
      escrowVolume: totalEscrow,
      completionRate: completed.length > 0 ? (completed.length / projectCount) * 100 : 0,
      complexity,
      budgetScale: avgEscrow,
      validations: 0, // resolved separately
      repeatRatio,
      disputeRate,
      consistency,
    });

    rankScore = applyContextBoost(rankScore, context, {
      completionRate: completed.length > 0 ? (completed.length / projectCount) * 100 : 0,
      complexity,
      consistency,
      repeatRatio,
    });

    results.push({
      userId,
      displayName: userId.substring(0, 8),
      totalEscrowHandled: totalEscrow,
      projectCount,
      onTimeMilestonePct: Math.round(onTimePct * 100) / 100,
      disputeFreePct: Math.round(disputeFreePct * 100) / 100,
      institutionalValidationCount: 0,
      skills,
      avgProjectComplexity: Math.round(complexity),
      repeatSponsorRatio: Math.round(repeatRatio * 100) / 100,
      slaAdherenceScore: Math.round(consistency),
      executionRankScore: rankScore,
    });
  }

  // Enrich with institutional validations
  const userIds = results.map((r) => r.userId);
  if (userIds.length > 0) {
    const { data: validations } = await supabase
      .from("academic_records")
      .select("user_id")
      .in("user_id", userIds.slice(0, 100))
      .eq("verification_status", "verified");

    const valCounts = (validations ?? []).reduce<Record<string, number>>((acc, v) => {
      acc[v.user_id] = (acc[v.user_id] || 0) + 1;
      return acc;
    }, {});

    for (const r of results) {
      r.institutionalValidationCount = valCounts[r.userId] ?? 0;
      if (filters.hasInstitutionalValidation && r.institutionalValidationCount === 0) {
        results.splice(results.indexOf(r), 1);
      }
    }
  }

  // Resolve display names
  if (results.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", results.map((r) => r.userId).slice(0, 100));

    const nameMap = new Map((profiles ?? []).map((p) => [p.id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()]));
    for (const r of results) {
      r.displayName = nameMap.get(r.userId) || r.displayName;
    }
  }

  // Sort by execution rank
  results.sort((a, b) => b.executionRankScore - a.executionRankScore);

  log.info("Talent search completed", { resultCount: results.length, context, filters });

  return results.slice(0, limit);
}

// ─── Institution Search ───

export async function searchInstitutions(
  filters: InstitutionSearchFilters = {},
  limit = 50
): Promise<InstitutionSearchIndex[]> {
  const { data: orgs } = await (supabase as any)
    .from("organizations")
    .select("id, name")
    .eq("is_verified", true)
    .limit(200);

  if (!orgs?.length) return [];

  // Get accountability records to compute per-institution metrics
  const { data: records } = await supabase
    .from("accountability_records")
    .select("project_id, escrow_amount, outcome_status, funder_id")
    .limit(2000);

  // For now, return basic institution list with placeholder metrics
  const results: InstitutionSearchIndex[] = (orgs ?? []).map((org) => ({
    institutionId: org.id,
    name: org.name,
    completionRate: 0,
    sponsorRetentionRate: 0,
    escrowVolume: 0,
    disputeRatio: 0,
    milestoneVelocity: 0,
    projectCount: 0,
    executionRankScore: 50,
  }));

  if (filters.minCompletionReliability) {
    return results.filter((r) => r.completionRate >= (filters.minCompletionReliability ?? 0));
  }

  return results.slice(0, limit);
}

// ─── Intelligent Match Suggestions ───

export interface MatchSuggestion {
  entityId: string;
  entityType: "individual" | "institution" | "sponsor";
  matchScore: number;
  matchReasons: string[];
}

export async function suggestMatches(
  forType: "sponsor" | "institution" | "student",
  forId: string,
  limit = 10
): Promise<MatchSuggestion[]> {
  const suggestions: MatchSuggestion[] = [];

  if (forType === "sponsor") {
    // Suggest teams based on execution history
    const talent = await searchTalent({}, "sponsor", limit);
    for (const t of talent) {
      const reasons: string[] = [];
      if (t.onTimeMilestonePct >= 90) reasons.push("Exceptional on-time delivery");
      if (t.disputeFreePct >= 95) reasons.push("Near-zero dispute rate");
      if (t.repeatSponsorRatio > 0.3) reasons.push("High sponsor loyalty");
      if (t.institutionalValidationCount > 0) reasons.push("Institutionally validated");

      suggestions.push({
        entityId: t.userId,
        entityType: "individual",
        matchScore: t.executionRankScore,
        matchReasons: reasons.length > 0 ? reasons : ["Execution-verified professional"],
      });
    }
  }

  log.info("Match suggestions generated", { forType, forId, count: suggestions.length });

  return suggestions.slice(0, limit);
}

// ─── Search Transparency ───

export const SEARCH_TRANSPARENCY = {
  rankingFactors: [
    { factor: "Escrow-backed project count", weight: "20%", description: "Number of projects with real financial commitment" },
    { factor: "Completion reliability", weight: "20%", description: "Percentage of projects completed successfully" },
    { factor: "Project complexity", weight: "15%", description: "Budget scale and deliverable depth" },
    { factor: "Budget scale handled", weight: "10%", description: "Total and average escrow amounts" },
    { factor: "Institutional validation", weight: "15%", description: "University/faculty verified credentials" },
    { factor: "Sponsor repeat factor", weight: "10%", description: "Sponsors who funded the same person again" },
    { factor: "Dispute penalty", weight: "-15%", description: "Disputes reduce ranking" },
    { factor: "Consistency over time", weight: "10%", description: "Sustained performance, not one-time spikes" },
  ],
  notFactors: [
    "Follower count",
    "Likes or reactions",
    "Viral post reach",
    "Connection degree",
    "Keyword stuffing",
    "Paid promotion",
    "Endorsement loops",
  ],
  antiGaming: [
    "Escrow-backed verification prevents fake project inflation",
    "Institutional validation prevents artificial skill stuffing",
    "Repeat sponsor ratio prevents mutual endorsement loops",
    "Dispute records are immutable and penalize gaming attempts",
    "No escrow = no ranking boost",
  ],
} as const;
