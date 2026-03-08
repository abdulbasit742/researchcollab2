/**
 * Research Syndication Engine — Additive service layer.
 * Multi-institution joint funding coordination with syndicated research pools.
 */
import { supabase } from "@/integrations/supabase/client";

export async function getSyndicates(filters?: { status?: string; domain?: string }) {
  let q = (supabase as any).from("research_syndicates").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createSyndicate(input: {
  syndicate_name: string; description?: string; domain?: string;
  funding_target?: number; governance_model?: string;
  ip_sharing_policy?: string; lead_coordinator_id: string;
}) {
  const { data, error } = await (supabase as any).from("research_syndicates")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function joinSyndicate(input: {
  syndicate_id: string; user_id: string; funding_commitment?: number; role?: string;
}) {
  const { data, error } = await (supabase as any).from("syndicate_members")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSyndicateMembers(syndicateId: string) {
  const { data, error } = await (supabase as any).from("syndicate_members")
    .select("*").eq("syndicate_id", syndicateId).order("joined_at");
  if (error) throw error;
  return data ?? [];
}

export async function getSyndicateAnalytics() {
  const { data: syndicates } = await (supabase as any).from("research_syndicates").select("*").limit(500);
  const all = syndicates ?? [];
  const totalTarget = all.reduce((s: number, r: any) => s + (r.funding_target || 0), 0);
  const totalCommitted = all.reduce((s: number, r: any) => s + (r.funding_committed || 0), 0);

  const domainMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  all.forEach((s: any) => {
    if (s.domain) domainMap[s.domain] = (domainMap[s.domain] || 0) + 1;
    statusMap[s.status] = (statusMap[s.status] || 0) + 1;
  });

  return {
    totalSyndicates: all.length,
    totalTarget,
    totalCommitted,
    commitmentRate: totalTarget > 0 ? Math.round((totalCommitted / totalTarget) * 100) : 0,
    totalMembers: all.reduce((s: number, r: any) => s + (r.member_count || 0), 0),
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
    byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
  };
}

export const SYNDICATE_STATUSES = ["forming", "active", "funded", "executing", "completed"];
export const GOVERNANCE_MODELS = ["consensus", "weighted_vote", "lead_institution", "rotating_chair"];
export const IP_POLICIES = ["proportional", "lead_owns", "shared_equally", "open_access"];
