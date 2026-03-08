/**
 * Proof of Execution Protocol (PoEP) — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getProofsOfExecution(userId?: string) {
  let q = supabase.from("proof_of_execution").select("*").order("created_at", { ascending: false });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createProofOfExecution(input: {
  user_id: string; proof_type: string; entity_type: string;
  entity_id: string; title: string; description?: string;
  verification_hash?: string; credential_level?: string;
  metadata?: Record<string, unknown>;
}) {
  const hash = input.verification_hash || generateHash(input);
  const { data, error } = await supabase.from("proof_of_execution")
    .insert({ ...input, verification_hash: hash }).select().single();
  if (error) throw error;
  return data;
}

function generateHash(input: Record<string, unknown>): string {
  const str = JSON.stringify({ ...input, ts: Date.now() });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `poep_${Math.abs(hash).toString(16)}`;
}

export async function verifyProof(proofId: string, verifiedBy: string) {
  const { data, error } = await supabase.from("proof_of_execution")
    .update({ verified_at: new Date().toISOString(), verified_by: verifiedBy })
    .eq("id", proofId).select().single();
  if (error) throw error;
  return data;
}

export const PROOF_TYPES = [
  "milestone_completion", "research_contribution", "funded_project",
  "peer_review", "dispute_resolution", "knowledge_publication",
];

export const CREDENTIAL_LEVELS = ["standard", "verified", "institutional", "sovereign"];
