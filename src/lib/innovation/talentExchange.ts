/**
 * Global Talent Execution Exchange — Service layer.
 * Additive only. Does NOT mutate core financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Talent Profiles ──

export async function getTalentProfiles(filters?: { domain?: string; minTrust?: number; region?: string; availability?: string }) {
  let q = (supabase as any).from("gtex_talent_profiles").select("*").eq("is_public", true).order("trust_score_snapshot", { ascending: false });
  if (filters?.domain) q = q.contains("domain_expertise", [filters.domain]);
  if (filters?.minTrust) q = q.gte("trust_score_snapshot", filters.minTrust);
  if (filters?.region) q = q.eq("geographic_region", filters.region);
  if (filters?.availability) q = q.eq("availability_status", filters.availability);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getMyTalentProfile(userId: string) {
  const { data, error } = await (supabase as any).from("gtex_talent_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertTalentProfile(input: {
  user_id: string;
  display_name: string;
  domain_expertise?: string[];
  skills?: string[];
  geographic_region?: string;
  bio?: string;
  hourly_rate?: number;
  availability_status?: string;
}) {
  const { data, error } = await (supabase as any).from("gtex_talent_profiles")
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).select().single();
  if (error) throw error;
  return data;
}

// ── Opportunities ──

export async function getOpportunities(filters?: { status?: string; domain?: string }) {
  let q = (supabase as any).from("gtex_opportunities").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createOpportunity(input: {
  posted_by: string;
  organization_id?: string;
  title: string;
  description?: string;
  opportunity_type?: string;
  domain?: string;
  required_skills?: string[];
  min_trust_score?: number;
  compensation_range_min?: number;
  compensation_range_max?: number;
  timeline_weeks?: number;
  milestones_planned?: number;
}) {
  const { data, error } = await (supabase as any).from("gtex_opportunities").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateOpportunity(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("gtex_opportunities").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Applications ──

export async function getApplications(opportunityId: string) {
  const { data, error } = await (supabase as any).from("gtex_applications")
    .select("*, gtex_talent_profiles(*)").eq("opportunity_id", opportunityId).order("match_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function applyToOpportunity(input: {
  opportunity_id: string;
  talent_id: string;
  cover_note?: string;
  proposed_rate?: number;
  proposed_timeline_weeks?: number;
}) {
  const { data, error } = await (supabase as any).from("gtex_applications").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Saved Candidates ──

export async function getSavedCandidates(userId: string) {
  const { data, error } = await (supabase as any).from("gtex_saved_candidates")
    .select("*, gtex_talent_profiles(*)").eq("saved_by", userId).order("saved_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveCandidate(userId: string, talentId: string) {
  const { error } = await (supabase as any).from("gtex_saved_candidates").insert({ saved_by: userId, talent_id: talentId });
  if (error) throw error;
}

export async function unsaveCandidate(userId: string, talentId: string) {
  const { error } = await (supabase as any).from("gtex_saved_candidates").delete().eq("saved_by", userId).eq("talent_id", talentId);
  if (error) throw error;
}

// ── Execution Contracts ──

export async function getContracts(filters?: { status?: string; talentId?: string }) {
  let q = (supabase as any).from("gtex_execution_contracts").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.talentId) q = q.eq("talent_id", filters.talentId);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createContract(input: {
  opportunity_id?: string;
  organization_id?: string;
  talent_id: string;
  title: string;
  description?: string;
  milestones?: any[];
  total_compensation?: number;
  timeline_weeks?: number;
}) {
  const { data, error } = await (supabase as any).from("gtex_execution_contracts")
    .insert({ ...input, milestones: JSON.stringify(input.milestones || []) }).select().single();
  if (error) throw error;
  return data;
}

// ── AI Talent Matching ──

export async function runTalentMatching(opportunity: any, candidates: any[]) {
  const { data, error } = await supabase.functions.invoke("gtex-talent-matching", {
    body: { opportunity, candidates },
  });
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getGTEXAnalytics() {
  const [{ data: profiles }, { data: opps }, { data: contracts }] = await Promise.all([
    (supabase as any).from("gtex_talent_profiles").select("*").limit(500),
    (supabase as any).from("gtex_opportunities").select("*").limit(500),
    (supabase as any).from("gtex_execution_contracts").select("*").limit(500),
  ]);

  const allProfiles = profiles ?? [];
  const allOpps = opps ?? [];
  const allContracts = contracts ?? [];

  const domainMap: Record<string, number> = {};
  allProfiles.forEach((p: any) => (p.domain_expertise || []).forEach((d: string) => { domainMap[d] = (domainMap[d] || 0) + 1; }));

  const statusMap: Record<string, number> = {};
  allOpps.forEach((o: any) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });

  return {
    totalTalent: allProfiles.length,
    totalOpportunities: allOpps.length,
    totalContracts: allContracts.length,
    totalCompensation: allContracts.reduce((s: number, c: any) => s + (c.total_compensation || 0), 0),
    avgTrustScore: allProfiles.length > 0 ? Math.round(allProfiles.reduce((s: number, p: any) => s + (p.trust_score_snapshot || 0), 0) / allProfiles.length) : 0,
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
    byOppStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
  };
}

export const AVAILABILITY_STATUSES = ["available", "busy", "open_to_offers", "unavailable"];
export const OPPORTUNITY_TYPES = ["contract", "full_time", "part_time", "research_collaboration", "team_formation"];
