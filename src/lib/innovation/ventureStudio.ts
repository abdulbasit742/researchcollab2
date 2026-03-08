/**
 * Research Venture Studio — Additive service layer.
 * Converts research projects into structured startup ventures
 * with milestone-backed incubation tracks.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Venture Tracks ──

export async function getVentureTracks(filters?: { stage?: string; domain?: string }) {
  let q = (supabase as any).from("venture_tracks").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (filters?.stage) q = q.eq("stage", filters.stage);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createVentureTrack(input: {
  venture_name: string; description?: string; domain?: string;
  funding_target?: number; milestones_total?: number;
  founder_id: string; institution_id?: string; project_id?: string;
}) {
  const { data, error } = await (supabase as any).from("venture_tracks")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Venture Milestones ──

export async function getVentureMilestones(ventureId: string) {
  const { data, error } = await (supabase as any).from("venture_milestones")
    .select("*").eq("venture_id", ventureId).order("created_at");
  if (error) throw error;
  return data ?? [];
}

// ── Venture Applications ──

export async function applyToVenture(input: {
  venture_id: string; applicant_id: string; role?: string; cover_note?: string; trust_score_snapshot?: number;
}) {
  const { data, error } = await (supabase as any).from("venture_applications")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getVentureAnalytics() {
  const { data: tracks } = await (supabase as any).from("venture_tracks").select("*").eq("is_active", true).limit(500);
  const all = tracks ?? [];
  const totalFunding = all.reduce((s: number, t: any) => s + (t.funding_target || 0), 0);
  const raised = all.reduce((s: number, t: any) => s + (t.funding_raised || 0), 0);

  const stageMap: Record<string, number> = {};
  const domainMap: Record<string, number> = {};
  all.forEach((t: any) => {
    stageMap[t.stage] = (stageMap[t.stage] || 0) + 1;
    if (t.domain) domainMap[t.domain] = (domainMap[t.domain] || 0) + 1;
  });

  return {
    totalVentures: all.length,
    totalFunding,
    totalRaised: raised,
    fundingRate: totalFunding > 0 ? Math.round((raised / totalFunding) * 100) : 0,
    byStage: Object.entries(stageMap).map(([stage, count]) => ({ stage, count })),
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
  };
}

export const VENTURE_STAGES = ["ideation", "validation", "prototype", "mvp", "growth", "graduated"];
