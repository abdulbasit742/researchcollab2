/**
 * Problem Marketplace — proposals and funding pools for global problems.
 * Additive layer. Does NOT mutate core financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Proposals ──

export async function getProposals(problemId?: string, status?: string) {
  let q = (supabase as any)
    .from("problem_proposals")
    .select("*")
    .order("created_at", { ascending: false });

  if (problemId) q = q.eq("problem_id", problemId);
  if (status) q = q.eq("status", status);

  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createProposal(input: {
  problem_id: string;
  proposer_id: string;
  institution_id?: string;
  title: string;
  approach_summary?: string;
  estimated_budget?: number;
  estimated_timeline_months?: number;
  team_size?: number;
  required_skills?: string[];
}) {
  const { data, error } = await (supabase as any)
    .from("problem_proposals")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProposalStatus(id: string, status: string, reviewedBy?: string) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (reviewedBy) {
    updates.reviewed_by = reviewedBy;
    updates.reviewed_at = new Date().toISOString();
  }
  const { data, error } = await (supabase as any)
    .from("problem_proposals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Funding Pools ──

export async function getFundingPools(problemId?: string) {
  let q = (supabase as any)
    .from("problem_funding_pools")
    .select("*")
    .order("created_at", { ascending: false });

  if (problemId) q = q.eq("problem_id", problemId);

  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createFundingPool(input: {
  problem_id: string;
  sponsor_id: string;
  pool_name: string;
  total_amount: number;
  currency?: string;
  expires_at?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("problem_funding_pools")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function allocateFromPool(poolId: string, amount: number) {
  const pool = await (supabase as any)
    .from("problem_funding_pools")
    .select("allocated_amount, total_amount")
    .eq("id", poolId)
    .single();

  if (pool.error) throw pool.error;
  const newAllocated = (pool.data.allocated_amount || 0) + amount;
  if (newAllocated > pool.data.total_amount) throw new Error("Insufficient pool funds");

  const { data, error } = await (supabase as any)
    .from("problem_funding_pools")
    .update({ allocated_amount: newAllocated })
    .eq("id", poolId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
