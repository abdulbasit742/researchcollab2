/**
 * Industry Partnership Exchange — Additive service layer.
 * Companies post R&D challenges; researchers propose solutions with execution credentials.
 */
import { supabase } from "@/integrations/supabase/client";

export async function getIndustryChallenges(filters?: { status?: string; domain?: string }) {
  let q = (supabase as any).from("industry_challenges").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createIndustryChallenge(input: {
  company_name: string; title: string; description?: string; domain?: string;
  challenge_type?: string; budget_amount?: number; deadline?: string;
  required_expertise?: string[]; min_trust_score?: number; posted_by: string;
}) {
  const { data, error } = await (supabase as any).from("industry_challenges")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function submitProposal(input: {
  challenge_id: string; proposer_id: string; team_name?: string;
  proposal_summary?: string; approach?: string;
  proposed_budget?: number; proposed_timeline_months?: number;
  trust_score_snapshot?: number;
}) {
  const { data, error } = await (supabase as any).from("challenge_proposals")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getProposals(challengeId: string) {
  const { data, error } = await (supabase as any).from("challenge_proposals")
    .select("*").eq("challenge_id", challengeId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPartnershipAnalytics() {
  const { data: challenges } = await (supabase as any).from("industry_challenges").select("*").limit(500);
  const all = challenges ?? [];
  const totalBudget = all.reduce((s: number, c: any) => s + (c.budget_amount || 0), 0);

  const typeMap: Record<string, number> = {};
  const domainMap: Record<string, number> = {};
  all.forEach((c: any) => {
    if (c.challenge_type) typeMap[c.challenge_type] = (typeMap[c.challenge_type] || 0) + 1;
    if (c.domain) domainMap[c.domain] = (domainMap[c.domain] || 0) + 1;
  });

  return {
    totalChallenges: all.length,
    openChallenges: all.filter((c: any) => c.status === "open").length,
    featuredChallenges: all.filter((c: any) => c.is_featured).length,
    totalBudget,
    totalApplications: all.reduce((s: number, c: any) => s + (c.application_count || 0), 0),
    byType: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
  };
}

export const CHALLENGE_TYPES = ["r_and_d", "product_dev", "data_analysis", "feasibility_study", "prototype", "consulting"];
