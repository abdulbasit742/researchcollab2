/**
 * Global Execution Exchange — Service layer.
 * Contracts, talent pools, opportunities, applications.
 * Advisory-only. Does NOT mutate core financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Execution Contracts ──

export async function getContracts(filters?: { status?: string; domain?: string }) {
  let q = (supabase as any).from("execution_exchange_contracts").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createContract(input: {
  title: string; description?: string; organization_name?: string;
  contract_type?: string; domain?: string; required_skills?: string[];
  min_trust_score?: number; budget_amount?: number; milestone_count?: number;
  duration_months?: number; created_by?: string;
}) {
  const { data, error } = await (supabase as any).from("execution_exchange_contracts")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateContractStatus(id: string, status: string) {
  const { data, error } = await (supabase as any).from("execution_exchange_contracts")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Talent Pools ──

export async function getTalentPools(filters?: { pool_type?: string; is_public?: boolean }) {
  let q = (supabase as any).from("institutional_talent_pools").select("*").order("member_count", { ascending: false });
  if (filters?.pool_type) q = q.eq("pool_type", filters.pool_type);
  if (filters?.is_public !== undefined) q = q.eq("is_public", filters.is_public);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createTalentPool(input: {
  institution_id?: string; pool_name: string; description?: string;
  pool_type?: string; domain?: string;
}) {
  const { data, error } = await (supabase as any).from("institutional_talent_pools")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getPoolMembers(poolId: string) {
  const { data, error } = await (supabase as any).from("talent_pool_members")
    .select("*").eq("pool_id", poolId).order("trust_score_snapshot", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function joinPool(poolId: string, userId: string, skills?: string[]) {
  const { data, error } = await (supabase as any).from("talent_pool_members")
    .insert({ pool_id: poolId, user_id: userId, top_skills: skills ?? [] }).select().single();
  if (error) throw error;
  return data;
}

// ── Professional Opportunities ──

export async function getOpportunities(filters?: { type?: string; domain?: string }) {
  let q = (supabase as any).from("professional_opportunities").select("*")
    .eq("is_active", true).order("created_at", { ascending: false });
  if (filters?.type) q = q.eq("opportunity_type", filters.type);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function postOpportunity(input: {
  opportunity_type: string; title: string; description?: string;
  organization_name?: string; domain?: string; required_skills?: string[];
  min_trust_score?: number; budget_range_min?: number; budget_range_max?: number;
  deadline?: string; location?: string; posted_by?: string; source_contract_id?: string;
}) {
  const { data, error } = await (supabase as any).from("professional_opportunities")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Applications ──

export async function getApplications(contractId: string) {
  const { data, error } = await (supabase as any).from("contract_applications")
    .select("*").eq("contract_id", contractId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function applyToContract(input: {
  contract_id: string; applicant_id: string; cover_note?: string;
  proposed_budget?: number; proposed_timeline_months?: number;
}) {
  const { data, error } = await (supabase as any).from("contract_applications")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(id: string, status: string) {
  const { data, error } = await (supabase as any).from("contract_applications")
    .update({ status, reviewed_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getExchangeAnalytics() {
  const [contracts, pools, opps] = await Promise.all([
    getContracts(),
    getTalentPools(),
    getOpportunities(),
  ]);

  const totalBudget = contracts.reduce((s: number, c: any) => s + (c.budget_amount || 0), 0);
  const totalMembers = pools.reduce((s: number, p: any) => s + (p.member_count || 0), 0);

  const domainMap: Record<string, number> = {};
  contracts.forEach((c: any) => {
    if (c.domain) domainMap[c.domain] = (domainMap[c.domain] || 0) + 1;
  });
  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, count]) => ({ domain, count }));

  return {
    totalContracts: contracts.length,
    openContracts: contracts.filter((c: any) => c.status === "open").length,
    totalBudget,
    totalPools: pools.length,
    totalMembers,
    totalOpportunities: opps.length,
    topDomains,
  };
}

export const CONTRACT_TYPES = ["execution", "research", "consulting", "mentorship", "review"];
export const POOL_TYPES = ["general", "students", "researchers", "engineers", "postdocs", "faculty"];
export const OPPORTUNITY_TYPES = ["contract", "research", "collaboration", "sponsored", "fellowship", "grant"];
