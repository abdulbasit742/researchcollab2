/**
 * Distributed Institutional Consensus Layer — multi-region weighted voting.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("consensusLayer");

export interface ConsensusSession {
  id: string;
  participatingRegions: string[];
  proposalSummary: string | null;
  outcome: string;
  trustWeightedScore: number;
  quorumMet: boolean;
  complianceCleared: boolean;
  riskProjectionScore: number | null;
  createdAt: string;
}

export interface ConsensusVote {
  regionId: string;
  vote: "approve" | "reject" | "abstain";
  trustWeight: number;
  compliancePassed: boolean;
}

export async function createConsensusSession(regions: string[], proposalSummary: string): Promise<string> {
  const { data, error } = await (supabase as any).from("consensus_sessions").insert({
    participating_regions: regions, proposal_summary: proposalSummary,
    outcome: "pending", trust_weighted_score: 0, quorum_met: false, compliance_cleared: false,
  }).select("id").single();
  if (error) throw new Error(`Consensus session creation failed: ${error.message}`);
  log.info("Consensus session created", { id: data.id, regions: regions.length });
  return data.id;
}

export async function resolveConsensus(sessionId: string, votes: ConsensusVote[]): Promise<ConsensusSession> {
  const complianceFailed = votes.some((v) => !v.compliancePassed);
  if (complianceFailed) {
    await (supabase as any).from("consensus_sessions").update({
      outcome: "rejected", compliance_cleared: false, resolved_at: new Date().toISOString(),
    }).eq("id", sessionId);
    log.warn("Consensus rejected due to compliance failure", { sessionId });
    const { data } = await (supabase as any).from("consensus_sessions").select("*").eq("id", sessionId).single();
    return mapSession(data);
  }

  const totalWeight = votes.reduce((s, v) => s + v.trustWeight, 0);
  const approveWeight = votes.filter((v) => v.vote === "approve").reduce((s, v) => s + v.trustWeight, 0);
  const trustScore = totalWeight > 0 ? Math.round((approveWeight / totalWeight) * 100) : 0;
  const quorum = votes.length >= Math.ceil(votes.length * 0.5);
  const approved = quorum && trustScore >= 60;

  await (supabase as any).from("consensus_sessions").update({
    outcome: approved ? "approved" : trustScore === 50 ? "deadlocked" : "rejected",
    trust_weighted_score: trustScore, quorum_met: quorum, compliance_cleared: true,
    resolved_at: new Date().toISOString(),
  }).eq("id", sessionId);

  log.info("Consensus resolved", { sessionId, outcome: approved ? "approved" : "rejected", trustScore });
  const { data } = await (supabase as any).from("consensus_sessions").select("*").eq("id", sessionId).single();
  return mapSession(data);
}

function mapSession(d: any): ConsensusSession {
  return {
    id: d.id, participatingRegions: d.participating_regions, proposalSummary: d.proposal_summary,
    outcome: d.outcome, trustWeightedScore: d.trust_weighted_score, quorumMet: d.quorum_met,
    complianceCleared: d.compliance_cleared, riskProjectionScore: d.risk_projection_score, createdAt: d.created_at,
  };
}
