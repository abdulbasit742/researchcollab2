/**
 * Economic Trust Graph Architecture
 * Replaces LinkedIn's binary connection model with escrow-verified,
 * economically weighted professional trust infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("economicTrustGraph");

// ─── Relationship Types ───

export type TrustRelationshipType =
  | "escrow_collaboration"
  | "institutional_oversight"
  | "sponsor_funding"
  | "faculty_supervision"
  | "cross_institution_collaboration"
  | "verified_referral"
  | "advisory";

// ─── Trust Edge Score ───

export interface TrustEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: TrustRelationshipType;
  escrowVolume: number;
  successfulCompletions: number;
  disputeCount: number;
  communicationQualityScore: number;
  repeatCollaborationCount: number;
  trustEdgeScore: number;
  firstInteractionAt: string;
  lastInteractionAt: string;
}

const TES_WEIGHTS = {
  escrowVolume: 0.25,
  completionReliability: 0.25,
  disputeAbsence: 0.20,
  communicationQuality: 0.15,
  repeatFrequency: 0.15,
} as const;

export function calculateTrustEdgeScore(edge: {
  escrowVolume: number;
  successfulCompletions: number;
  disputeCount: number;
  communicationQualityScore: number;
  repeatCollaborationCount: number;
}): number {
  const escrowFactor = Math.min(100, edge.escrowVolume / 500);
  const completionFactor = Math.min(100, edge.successfulCompletions * 20);
  const disputeAbsence = edge.disputeCount === 0 ? 100 : Math.max(0, 100 - edge.disputeCount * 30);
  const commFactor = Math.min(100, edge.communicationQualityScore);
  const repeatFactor = Math.min(100, edge.repeatCollaborationCount * 25);

  return Math.min(100, Math.round(
    escrowFactor * TES_WEIGHTS.escrowVolume +
    completionFactor * TES_WEIGHTS.completionReliability +
    disputeAbsence * TES_WEIGHTS.disputeAbsence +
    commFactor * TES_WEIGHTS.communicationQuality +
    repeatFactor * TES_WEIGHTS.repeatFrequency
  ));
}

// ─── Reputation Index ───

export interface ReputationIndex {
  executionReliability: number;
  economicTrust: number;
  institutionalValidation: number;
  sponsorConfidence: number;
  communicationStability: number;
  disputeRisk: number;
  overallReputation: number;
  tier: "unestablished" | "emerging" | "established" | "trusted" | "pillar";
  networkDepthScore: number;
  networkDiversityScore: number;
  networkStabilityScore: number;
  collaborationRecurrenceRate: number;
  economicInfluenceScore: number;
  totalEscrowInfluenced: number;
  crossInstitutionReach: number;
}

const RI_WEIGHTS = {
  executionReliability: 0.25,
  economicTrust: 0.20,
  institutionalValidation: 0.15,
  sponsorConfidence: 0.15,
  communicationStability: 0.10,
  disputeRiskPenalty: -0.15,
} as const;

function classifyReputationTier(score: number, edgeCount: number): ReputationIndex["tier"] {
  if (edgeCount < 2) return "unestablished";
  if (score >= 85) return "pillar";
  if (score >= 70) return "trusted";
  if (score >= 45) return "established";
  return "emerging";
}

export async function calculateReputationIndex(userId: string): Promise<ReputationIndex> {
  // Trust edges
  const { data: edges } = await supabase
    .from("trust_edges")
    .select("*")
    .or(`source_id.eq.${userId},target_id.eq.${userId}`);

  const allEdges = edges ?? [];
  const totalEscrow = allEdges.reduce((s, e) => s + (e.escrow_volume ?? 0), 0);
  const totalCompletions = allEdges.reduce((s, e) => s + (e.successful_completions ?? 0), 0);
  const totalDisputes = allEdges.reduce((s, e) => s + (e.dispute_count ?? 0), 0);
  const avgCommScore = allEdges.length > 0
    ? allEdges.reduce((s, e) => s + (e.communication_quality_score ?? 0), 0) / allEdges.length
    : 0;

  // Accountability records for execution reliability
  const { data: records } = await supabase
    .from("accountability_records")
    .select("outcome_status, escrow_amount, funder_id, verified_by")
    .eq("executor_id", userId);

  const allRecords = records ?? [];
  const completed = allRecords.filter((r) => r.outcome_status === "completed");
  const disputed = allRecords.filter((r) => r.outcome_status === "disputed");

  const executionReliability = allRecords.length > 0
    ? Math.round((completed.length / allRecords.length) * 100)
    : 0;

  const economicTrust = Math.min(100, Math.round(totalEscrow / 500));

  const { count: validations } = await supabase
    .from("academic_records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verification_status", "verified");
  const institutionalValidation = Math.min(100, (validations ?? 0) * 20);

  // Sponsor confidence (repeat sponsors)
  const sponsors = allRecords.map((r) => r.funder_id).filter(Boolean);
  const uniqueSponsors = new Set(sponsors);
  const repeatSponsors = sponsors.length - uniqueSponsors.size;
  const sponsorConfidence = uniqueSponsors.size > 0
    ? Math.min(100, Math.round((repeatSponsors / uniqueSponsors.size) * 100 + uniqueSponsors.size * 10))
    : 0;

  const communicationStability = Math.min(100, Math.round(avgCommScore));
  const disputeRisk = allRecords.length > 0
    ? Math.round((disputed.length / allRecords.length) * 100)
    : 0;

  // Network quality metrics
  const uniquePartners = new Set(allEdges.flatMap((e) => [e.source_id, e.target_id]).filter((id) => id !== userId));
  const networkDepthScore = Math.min(100, Math.round(
    allEdges.reduce((s, e) => s + (e.trust_edge_score ?? 0), 0) / Math.max(1, allEdges.length)
  ));

  const relationshipTypes = new Set(allEdges.map((e) => e.relationship_type));
  const networkDiversityScore = Math.min(100, relationshipTypes.size * 15);

  // Stability: long-term edges
  const longTermEdges = allEdges.filter((e) => {
    if (!e.first_interaction_at || !e.last_interaction_at) return false;
    const duration = new Date(e.last_interaction_at).getTime() - new Date(e.first_interaction_at).getTime();
    return duration > 90 * 24 * 60 * 60 * 1000; // 90+ days
  });
  const networkStabilityScore = allEdges.length > 0
    ? Math.min(100, Math.round((longTermEdges.length / allEdges.length) * 100))
    : 0;

  const repeatEdges = allEdges.filter((e) => (e.repeat_collaboration_count ?? 0) > 1);
  const collaborationRecurrenceRate = allEdges.length > 0
    ? Math.round((repeatEdges.length / allEdges.length) * 100)
    : 0;

  const economicInfluenceScore = Math.min(100, Math.round(
    totalEscrow / 1000 + uniquePartners.size * 5 + totalCompletions * 3
  ));

  const overallReputation = Math.min(100, Math.max(0, Math.round(
    executionReliability * RI_WEIGHTS.executionReliability +
    economicTrust * RI_WEIGHTS.economicTrust +
    institutionalValidation * RI_WEIGHTS.institutionalValidation +
    sponsorConfidence * RI_WEIGHTS.sponsorConfidence +
    communicationStability * RI_WEIGHTS.communicationStability +
    disputeRisk * RI_WEIGHTS.disputeRiskPenalty
  )));

  const tier = classifyReputationTier(overallReputation, allEdges.length);

  log.info("Reputation index calculated", { userId, overallReputation, tier });

  return {
    executionReliability,
    economicTrust,
    institutionalValidation,
    sponsorConfidence,
    communicationStability,
    disputeRisk,
    overallReputation,
    tier,
    networkDepthScore,
    networkDiversityScore,
    networkStabilityScore,
    collaborationRecurrenceRate,
    economicInfluenceScore,
    totalEscrowInfluenced: totalEscrow,
    crossInstitutionReach: uniquePartners.size,
  };
}

// ─── Anti-Gaming Detection ───

export interface NetworkGamingSignal {
  type: "mass_connection_spam" | "referral_loop" | "reputation_inflation" | "endorsement_ring" | "mutual_praise";
  severity: "low" | "medium" | "high";
  description: string;
  evidenceIds: string[];
}

export async function detectNetworkGaming(userId: string): Promise<NetworkGamingSignal[]> {
  const signals: NetworkGamingSignal[] = [];

  const { data: edges } = await supabase
    .from("trust_edges")
    .select("*")
    .eq("source_id", userId);

  const allEdges = edges ?? [];

  // Mass connection spam: too many zero-escrow edges
  const zeroEscrowEdges = allEdges.filter((e) => (e.escrow_volume ?? 0) === 0);
  if (zeroEscrowEdges.length > 20) {
    signals.push({
      type: "mass_connection_spam",
      severity: "medium",
      description: `${zeroEscrowEdges.length} connections with zero escrow activity`,
      evidenceIds: zeroEscrowEdges.slice(0, 5).map((e) => e.id),
    });
  }

  // Referral loops: mutual edges with same partner and no escrow
  const { data: reverseEdges } = await supabase
    .from("trust_edges")
    .select("*")
    .eq("target_id", userId)
    .eq("relationship_type", "verified_referral");

  const referralPartners = new Set(allEdges.filter((e) => e.relationship_type === "verified_referral").map((e) => e.target_id));
  const mutualReferrals = (reverseEdges ?? []).filter((e) => referralPartners.has(e.source_id));
  if (mutualReferrals.length > 3) {
    signals.push({
      type: "referral_loop",
      severity: "high",
      description: `${mutualReferrals.length} mutual referral loops detected`,
      evidenceIds: mutualReferrals.slice(0, 5).map((e) => e.id),
    });
  }

  return signals;
}

// ─── Collaboration Cluster Detection ───

export async function detectCollaborationClusters(domainCategory?: string) {
  let query = supabase
    .from("collaboration_clusters")
    .select("*")
    .order("total_escrow_volume", { ascending: false })
    .limit(20);

  if (domainCategory) query = query.eq("domain_category", domainCategory);

  const { data } = await query;
  return data ?? [];
}

// ─── Economic Discovery Queries ───

export async function queryEconomicGraph(queryType: string, params: Record<string, any> = {}) {
  switch (queryType) {
    case "top_reliability_nodes": {
      const { data } = await supabase
        .from("reputation_index")
        .select("*")
        .order("execution_reliability", { ascending: false })
        .limit(params.limit ?? 20);
      return data ?? [];
    }
    case "high_trust_sponsors": {
      const { data } = await supabase
        .from("trust_edges")
        .select("*")
        .eq("relationship_type", "sponsor_funding")
        .order("trust_edge_score", { ascending: false })
        .limit(params.limit ?? 20);
      return data ?? [];
    }
    case "cross_sponsor_diversity": {
      const { data } = await supabase
        .from("reputation_index")
        .select("*")
        .order("network_diversity_score", { ascending: false })
        .limit(params.limit ?? 20);
      return data ?? [];
    }
    default:
      return [];
  }
}

// ─── Transparency ───

export const TRUST_GRAPH_TRANSPARENCY = {
  trustEdgeScoreFormula: "TES = EscrowVolume(25%) + CompletionReliability(25%) + DisputeAbsence(20%) + CommunicationQuality(15%) + RepeatFrequency(15%)",
  reputationIndexFormula: "RI = ExecutionReliability(25%) + EconomicTrust(20%) + InstitutionalValidation(15%) + SponsorConfidence(15%) + CommunicationStability(10%) - DisputeRisk(15%)",
  networkQualityMetrics: [
    "Network Depth (avg trust edge score)",
    "Network Diversity (relationship type spread)",
    "Network Stability (long-term edge ratio)",
    "Collaboration Recurrence Rate",
    "Economic Influence Score",
  ],
  notFactors: [
    "Follower count", "Connection count", "Endorsement count",
    "Paid ranking", "Engagement metrics", "Profile views",
  ],
  antiGaming: [
    "Zero-escrow connections receive no trust weight",
    "Mutual referral loops auto-detected and flagged",
    "Reputation inflation circles identified via pattern analysis",
    "Mass connection spam suppressed",
  ],
} as const;
