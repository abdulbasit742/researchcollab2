/**
 * Innovation Generator Service — continuous innovation and expansion for RCollab.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Proposals ───
export async function getProposals(filters?: { status?: string; category?: string }) {
  let q = supabase.from("inn_proposals").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.category) q = q.eq("category", filters.category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateProposalStatus(id: string, status: string, reviewNotes?: string, reviewerId?: string) {
  const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (reviewNotes) updates.review_notes = reviewNotes;
  if (reviewerId) { updates.reviewed_by = reviewerId; updates.reviewed_at = new Date().toISOString(); }
  const { error } = await supabase.from("inn_proposals").update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Impact Projections ───
export async function getImpactProjections(proposalId: string) {
  const { data, error } = await supabase.from("inn_impact_projections").select("*").eq("proposal_id", proposalId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Roadmap ───
export async function getRoadmap(phase?: string) {
  let q = supabase.from("inn_roadmap").select("*").order("created_at", { ascending: true }).limit(100);
  if (phase) q = q.eq("phase", phase);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateRoadmapItem(id: string, updates: { status?: string; progress?: number }) {
  const { error } = await supabase.from("inn_roadmap").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ─── Metrics ───
export async function getInnovationMetrics(category?: string) {
  let q = supabase.from("inn_metrics").select("*").order("created_at", { ascending: false }).limit(50);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── AI Invocation ───
export async function invokeInnovationGenerator(action: string, payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("inn-generator", { body: { action, payload } });
  if (error) throw error;
  return data?.result ?? data;
}

// ─── Dashboard Aggregation ───
export async function getInnovationDashboard() {
  const [proposals, roadmap, metrics] = await Promise.all([
    getProposals(),
    getRoadmap(),
    getInnovationMetrics(),
  ]);

  const byStatus: Record<string, number> = {};
  proposals.forEach((p: any) => { byStatus[p.status] = (byStatus[p.status] ?? 0) + 1; });

  const byCategory: Record<string, number> = {};
  proposals.forEach((p: any) => { byCategory[p.category] = (byCategory[p.category] ?? 0) + 1; });

  const totalPotential = proposals.reduce((s: number, p: any) => s + (p.revenue_potential ?? 0), 0);
  const avgScore = proposals.length > 0 ? Math.round(proposals.reduce((s: number, p: any) => s + (p.innovation_score ?? 0), 0) / proposals.length) : 0;

  return {
    proposals, roadmap, metrics,
    summary: { byStatus, byCategory, totalPotential, avgScore, totalProposals: proposals.length, roadmapItems: roadmap.length },
  };
}
