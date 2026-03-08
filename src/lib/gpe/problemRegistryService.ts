/**
 * GPE Problem Registry — Service layer for the Global Problem → Funding → Execution layer.
 * Additive only. Does NOT touch core escrow, trust, or ledger systems.
 */
import { supabase } from "@/integrations/supabase/client";

export const GPE_CATEGORIES = [
  "AI Safety", "Climate Adaptation", "Crop Yield Optimization", "Water Purification",
  "Energy Storage", "Health Diagnostics", "Urban Resilience", "Manufacturing Optimization",
  "Education Access", "Public Health Analytics", "Cybersecurity Research", "Supply Chain Intelligence",
  "Agri-Tech Automation", "Biomedical Data", "National Skill Development", "Research Tooling",
  "Space Exploration", "Financial Inclusion", "Biodiversity", "Digital Infrastructure",
];

export const PROBLEM_STATUSES = [
  "draft", "submitted", "under_review", "published", "matched",
  "funding_open", "proposal_review", "execution_active", "paused", "completed", "archived",
];

// ── Problem Registry ──

export async function getProblems(filters?: {
  category?: string; status?: string; urgency?: string; search?: string; limit?: number;
}) {
  let q = (supabase as any).from("gpe_problem_registry").select("*").order("created_at", { ascending: false });
  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.urgency) q = q.eq("urgency_level", filters.urgency);
  if (filters?.search) q = q.ilike("problem_title", `%${filters.search}%`);
  const { data, error } = await q.limit(filters?.limit || 100);
  if (error) throw error;
  return data ?? [];
}

export async function getProblem(id: string) {
  const { data, error } = await (supabase as any).from("gpe_problem_registry").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createProblem(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_problem_registry").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProblem(id: string, updates: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_problem_registry").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Proposals ──

export async function getProposals(problemId?: string, status?: string) {
  let q = (supabase as any).from("gpe_proposals").select("*").order("created_at", { ascending: false });
  if (problemId) q = q.eq("problem_id", problemId);
  if (status) q = q.eq("status", status);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createProposal(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_proposals").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProposal(id: string, updates: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_proposals").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Proposal Reviews ──

export async function getProposalReviews(proposalId: string) {
  const { data, error } = await (supabase as any).from("gpe_proposal_reviews").select("*").eq("proposal_id", proposalId);
  if (error) throw error;
  return data ?? [];
}

export async function createProposalReview(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_proposal_reviews").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Funding Pools ──

export async function getFundingPools(sponsorId?: string) {
  let q = (supabase as any).from("gpe_funding_pools").select("*").order("created_at", { ascending: false });
  if (sponsorId) q = q.eq("sponsor_user_id", sponsorId);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createFundingPool(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_funding_pools").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Sponsor Accounts ──

export async function getSponsorAccount(userId: string) {
  const { data, error } = await (supabase as any).from("gpe_sponsor_accounts").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSponsorAccount(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_sponsor_accounts").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Saved Items ──

export async function saveProblem(userId: string, problemId: string) {
  const { error } = await (supabase as any).from("gpe_saved_items").insert({ user_id: userId, problem_id: problemId });
  if (error) throw error;
}

export async function unsaveProblem(userId: string, problemId: string) {
  const { error } = await (supabase as any).from("gpe_saved_items").delete().eq("user_id", userId).eq("problem_id", problemId);
  if (error) throw error;
}

export async function getSavedProblems(userId: string) {
  const { data, error } = await (supabase as any).from("gpe_saved_items").select("*, gpe_problem_registry(*)").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

// ── Opportunity Feed ──

export async function getOpportunityFeed(limit = 50) {
  const { data, error } = await (supabase as any).from("gpe_opportunity_feed").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── AI Triage ──

export async function runAITriage(problemId: string) {
  const { data, error } = await supabase.functions.invoke("gpe-ai-triage", { body: { problem_id: problemId } });
  if (error) throw error;
  return data;
}

export async function getTriageRuns(problemId: string) {
  const { data, error } = await (supabase as any).from("gpe_ai_triage_runs").select("*").eq("problem_id", problemId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── AI Matching ──

export async function runAIMatching(problemId: string) {
  const { data, error } = await supabase.functions.invoke("gpe-ai-matching", { body: { problem_id: problemId } });
  if (error) throw error;
  return data;
}

export async function getMatchingRuns(problemId: string) {
  const { data, error } = await (supabase as any).from("gpe_ai_matching_runs").select("*").eq("problem_id", problemId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Operator Tasks ──

export async function getOperatorTasks(status?: string) {
  let q = (supabase as any).from("gpe_operator_tasks").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function updateOperatorTask(id: string, updates: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_operator_tasks").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Institution Portals ──

export async function getInstitutionPortals(institutionId?: string) {
  let q = (supabase as any).from("gpe_institution_portals").select("*").order("created_at", { ascending: false });
  if (institutionId) q = q.eq("institution_id", institutionId);
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createInstitutionPortal(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_institution_portals").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Commercialization Signals ──

export async function getCommercializationSignals(problemId?: string) {
  let q = (supabase as any).from("gpe_commercialization_signals").select("*").order("created_at", { ascending: false });
  if (problemId) q = q.eq("problem_id", problemId);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

// ── Lead Capture ──

export async function getLeads(status?: string) {
  let q = (supabase as any).from("gpe_lead_capture").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createLead(input: Record<string, any>) {
  const { data, error } = await (supabase as any).from("gpe_lead_capture").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Revenue Events ──

export async function getRevenueEvents(limit = 100) {
  const { data, error } = await (supabase as any).from("gpe_revenue_events").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Analytics Helpers ──

export async function getProblemAnalytics() {
  const [problems, proposals, pools, revenue] = await Promise.all([
    getProblems({ limit: 500 }),
    getProposals(),
    getFundingPools(),
    getRevenueEvents(500),
  ]);

  const totalCapital = pools.reduce((s: number, p: any) => s + (p.total_committed_capital || 0), 0);
  const totalRevenue = revenue.reduce((s: number, r: any) => s + (r.amount || 0), 0);
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  problems.forEach((p: any) => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  });

  return {
    totalProblems: problems.length,
    totalProposals: proposals.length,
    totalFundingPools: pools.length,
    totalCapitalCommitted: totalCapital,
    totalRevenue,
    byCategory,
    byStatus,
    avgProposalsPerProblem: problems.length > 0 ? proposals.length / problems.length : 0,
  };
}
