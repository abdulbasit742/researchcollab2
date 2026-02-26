/**
 * Autonomous Governance Voting Engine — trust-weighted institutional voting
 * on platform policy changes. Proposal lifecycle: draft → active → passed/rejected.
 */

import { supabase } from "@/integrations/supabase/client";

export type ProposalStatus = "draft" | "active" | "passed" | "rejected" | "expired";
export type PolicyDomain = "fee_limits" | "capital_caps" | "risk_tolerance" | "dispute_penalties" | "trust_formula" | "general";

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  policyDomain: PolicyDomain;
  proposedChange: Record<string, any>;
  proposedBy: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  weightedScoreFor: number;
  weightedScoreAgainst: number;
  quorumRequired: number;
  expiresAt: string;
  createdAt: string;
}

export interface GovernanceVote {
  proposalId: string;
  voterId: string;
  decision: "for" | "against" | "abstain";
  weight: number;
  reason?: string;
  votedAt: string;
}

// In-memory store (production would use DB tables)
const proposals = new Map<string, GovernanceProposal>();
const votes = new Map<string, GovernanceVote[]>();

function generateId(): string {
  return `gov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createProposal(params: {
  title: string;
  description: string;
  policyDomain: PolicyDomain;
  proposedChange: Record<string, any>;
  proposedBy: string;
  durationDays?: number;
}): Promise<GovernanceProposal> {
  // Verify proposer trust
  const { data: trust } = await supabase
    .from("user_trust_profiles")
    .select("trust_score")
    .eq("user_id", params.proposedBy)
    .maybeSingle();

  if ((trust?.trust_score ?? 0) < 50) {
    throw new Error("Minimum trust score of 50 required to create proposals");
  }

  const id = generateId();
  const proposal: GovernanceProposal = {
    id,
    title: params.title,
    description: params.description,
    policyDomain: params.policyDomain,
    proposedChange: params.proposedChange,
    proposedBy: params.proposedBy,
    status: "draft",
    votesFor: 0,
    votesAgainst: 0,
    weightedScoreFor: 0,
    weightedScoreAgainst: 0,
    quorumRequired: 10,
    expiresAt: new Date(Date.now() + (params.durationDays ?? 7) * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  proposals.set(id, proposal);
  votes.set(id, []);
  return proposal;
}

export function activateProposal(proposalId: string): GovernanceProposal {
  const proposal = proposals.get(proposalId);
  if (!proposal) throw new Error("Proposal not found");
  if (proposal.status !== "draft") throw new Error("Only draft proposals can be activated");
  proposal.status = "active";
  return proposal;
}

export async function castVote(params: {
  proposalId: string;
  voterId: string;
  decision: "for" | "against" | "abstain";
  reason?: string;
}): Promise<GovernanceVote> {
  const proposal = proposals.get(params.proposalId);
  if (!proposal) throw new Error("Proposal not found");
  if (proposal.status !== "active") throw new Error("Voting only allowed on active proposals");
  if (new Date() > new Date(proposal.expiresAt)) throw new Error("Voting period expired");

  const existing = (votes.get(params.proposalId) ?? []).find(v => v.voterId === params.voterId);
  if (existing) throw new Error("Already voted on this proposal");

  // Trust-weighted vote
  const { data: trust } = await supabase
    .from("user_trust_profiles")
    .select("trust_score")
    .eq("user_id", params.voterId)
    .maybeSingle();

  const weight = Math.max(1, Math.round((trust?.trust_score ?? 50) / 10));

  const vote: GovernanceVote = {
    proposalId: params.proposalId,
    voterId: params.voterId,
    decision: params.decision,
    weight,
    reason: params.reason,
    votedAt: new Date().toISOString(),
  };

  const voteList = votes.get(params.proposalId) ?? [];
  voteList.push(vote);
  votes.set(params.proposalId, voteList);

  if (params.decision === "for") {
    proposal.votesFor++;
    proposal.weightedScoreFor += weight;
  } else if (params.decision === "against") {
    proposal.votesAgainst++;
    proposal.weightedScoreAgainst += weight;
  }

  // Check quorum
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  if (totalVotes >= proposal.quorumRequired) {
    proposal.status = proposal.weightedScoreFor > proposal.weightedScoreAgainst ? "passed" : "rejected";
  }

  return vote;
}

export function getProposal(id: string): GovernanceProposal | undefined {
  return proposals.get(id);
}

export function getActiveProposals(): GovernanceProposal[] {
  return Array.from(proposals.values()).filter(p => p.status === "active");
}

export function getAllProposals(): GovernanceProposal[] {
  return Array.from(proposals.values());
}

export function getVotes(proposalId: string): GovernanceVote[] {
  return votes.get(proposalId) ?? [];
}
