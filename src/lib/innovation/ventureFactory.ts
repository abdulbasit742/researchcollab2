/**
 * Research → Startup Venture Factory — Additive service layer.
 * Does NOT mutate core financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Startup Candidates ──

export async function getStartupCandidates(filters?: { status?: string; domain?: string }) {
  let q = (supabase as any).from("vf_startup_candidates").select("*").order("commercialization_score", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.domain) q = q.eq("research_domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createStartupCandidate(input: {
  project_id?: string;
  title: string;
  description?: string;
  research_domain?: string;
  team_lead_id: string;
  institution_id?: string;
  market_opportunity?: string;
  technology_readiness_level?: number;
}) {
  const { data, error } = await (supabase as any).from("vf_startup_candidates")
    .insert({ ...input, status: "identified" }).select().single();
  if (error) throw error;
  return data;
}

export async function updateStartupCandidate(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("vf_startup_candidates")
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Team Members ──

export async function getTeamMembers(candidateId: string) {
  const { data, error } = await (supabase as any).from("vf_team_members")
    .select("*").eq("candidate_id", candidateId).order("joined_at");
  if (error) throw error;
  return data ?? [];
}

export async function addTeamMember(input: { candidate_id: string; user_id: string; role?: string; trust_score_snapshot?: number }) {
  const { data, error } = await (supabase as any).from("vf_team_members").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Investors ──

export async function getInvestors(filters?: { investorType?: string; isActive?: boolean }) {
  let q = (supabase as any).from("vf_investors").select("*").order("created_at", { ascending: false });
  if (filters?.investorType) q = q.eq("investor_type", filters.investorType);
  if (filters?.isActive !== undefined) q = q.eq("is_active", filters.isActive);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function registerInvestor(input: {
  user_id: string;
  investor_type: string;
  organization_name?: string;
  investment_focus?: string[];
  min_investment?: number;
  max_investment?: number;
}) {
  const { data, error } = await (supabase as any).from("vf_investors").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Investor Interests ──

export async function getInvestorInterests(candidateId: string) {
  const { data, error } = await (supabase as any).from("vf_investor_interests")
    .select("*, vf_investors(*)").eq("candidate_id", candidateId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function expressInterest(input: { investor_id: string; candidate_id: string; interest_level?: string; notes?: string }) {
  const { data, error } = await (supabase as any).from("vf_investor_interests").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Incubation Tasks ──

export async function getIncubationTasks(candidateId: string) {
  const { data, error } = await (supabase as any).from("vf_incubation_tasks")
    .select("*").eq("candidate_id", candidateId).order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createIncubationTask(input: {
  candidate_id: string;
  title: string;
  description?: string;
  category?: string;
  assigned_to?: string;
  due_date?: string;
}) {
  const { data, error } = await (supabase as any).from("vf_incubation_tasks").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateIncubationTask(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("vf_incubation_tasks")
    .update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── AI Signal Engine ──

export async function runCommercializationSignalEngine(input: {
  projectTitle: string;
  projectDescription?: string;
  domain?: string;
  milestoneOutcomes?: string[];
  sponsorDemand?: string[];
  impactMetrics?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.functions.invoke("venture-signal-engine", { body: input });
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getVentureFactoryAnalytics() {
  const { data: candidates } = await (supabase as any).from("vf_startup_candidates").select("*").limit(500);
  const all = candidates ?? [];

  const statusMap: Record<string, number> = {};
  const domainMap: Record<string, number> = {};
  let totalFunding = 0;

  all.forEach((c: any) => {
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    if (c.research_domain) domainMap[c.research_domain] = (domainMap[c.research_domain] || 0) + 1;
    totalFunding += c.funding_secured || 0;
  });

  const launched = all.filter((c: any) => c.status === "launched").length;

  return {
    totalCandidates: all.length,
    launched,
    totalFunding,
    conversionRate: all.length > 0 ? Math.round((launched / all.length) * 100) : 0,
    byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
  };
}

export const CANDIDATE_STATUSES = ["identified", "evaluation", "incubation", "venture_building", "launched"];
export const INVESTOR_TYPES = ["venture_capital", "angel", "corporate_venture", "innovation_fund"];
export const TASK_CATEGORIES = ["product", "legal", "finance", "engineering", "marketing", "general"];
