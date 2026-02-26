/**
 * Governance Voting System — weighted voting on policy proposals.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governanceVoting");

export interface VoteOutcome {
  proposalId: string;
  totalVotes: number;
  approveWeight: number;
  rejectWeight: number;
  abstainWeight: number;
  quorumReached: boolean;
  outcome: "approved" | "rejected" | "pending";
}

const QUORUM_THRESHOLD = 0.5; // 50% of council must vote
const APPROVAL_THRESHOLD = 0.6; // 60% weighted approval needed

export async function castVote(
  proposalId: string,
  voterTenantId: string,
  vote: "approve" | "reject" | "abstain",
  rationale?: string
): Promise<void> {
  // Get voter weight from node trust or council membership
  const { data: node } = await (supabase as any).from("sovereign_nodes")
    .select("id, node_trust_score").eq("tenant_id", voterTenantId).maybeSingle();

  const voteWeight = node ? Math.max(1, Math.round((node.node_trust_score ?? 50) / 10)) : 1;

  const { error } = await (supabase as any).from("governance_votes").upsert({
    proposal_id: proposalId, voter_tenant_id: voterTenantId,
    voter_node_id: node?.id ?? null, vote_weight: voteWeight,
    vote, rationale: rationale ?? null,
  }, { onConflict: "proposal_id,voter_tenant_id" });

  if (error) throw new Error(`Vote failed: ${error.message}`);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "vote_cast", entity_type: "governance_votes", entity_id: proposalId,
    details: { voterTenantId, vote, voteWeight },
  });

  log.info("Vote cast", { proposalId, voterTenantId, vote, voteWeight });
}

export async function calculateVoteOutcome(proposalId: string): Promise<VoteOutcome> {
  const { data: votes } = await (supabase as any).from("governance_votes")
    .select("vote, vote_weight").eq("proposal_id", proposalId);

  const { data: council } = await (supabase as any).from("network_council_members")
    .select("id").eq("active", true);

  const allVotes = votes ?? [];
  const councilSize = council?.length ?? 1;

  const approveWeight = allVotes.filter((v: any) => v.vote === "approve").reduce((s: number, v: any) => s + (v.vote_weight ?? 1), 0);
  const rejectWeight = allVotes.filter((v: any) => v.vote === "reject").reduce((s: number, v: any) => s + (v.vote_weight ?? 1), 0);
  const abstainWeight = allVotes.filter((v: any) => v.vote === "abstain").reduce((s: number, v: any) => s + (v.vote_weight ?? 1), 0);
  const totalWeight = approveWeight + rejectWeight + abstainWeight;

  const quorumReached = allVotes.length >= councilSize * QUORUM_THRESHOLD;
  const approvalRate = totalWeight > 0 ? approveWeight / (approveWeight + rejectWeight) : 0;

  let outcome: "approved" | "rejected" | "pending" = "pending";
  if (quorumReached) {
    outcome = approvalRate >= APPROVAL_THRESHOLD ? "approved" : "rejected";
  }

  log.info("Vote outcome calculated", { proposalId, outcome, approvalRate });

  return {
    proposalId, totalVotes: allVotes.length,
    approveWeight, rejectWeight, abstainWeight,
    quorumReached, outcome,
  };
}
