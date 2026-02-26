/**
 * Analytics Engine — time-series aggregation, snapshots, and trend analysis.
 *
 * Aggregates: deal volume, escrow growth, trust distribution, dispute trends,
 * institutional performance, liquidity flow.
 */

import { supabase } from "@/integrations/supabase/client";

export interface DailySnapshot {
  date: string;
  dealCount: number;
  escrowVolume: number;
  avgTrustScore: number;
  disputeCount: number;
  newUsers: number;
  platformRevenue: number;
}

export interface TrendAnalysis {
  metric: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
}

// ─── Snapshot Generation ───
export async function generateDailySnapshot(): Promise<DailySnapshot> {
  const today = new Date().toISOString().slice(0, 10);

  const [dealsRes, trustRes, feesRes] = await Promise.all([
    supabase.from("deal_rooms").select("id, escrow_amount, status").gte("created_at", `${today}T00:00:00`),
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate"),
    supabase.from("platform_fees").select("platform_fee_amount").gte("created_at", `${today}T00:00:00`),
  ]);

  const deals = dealsRes.data ?? [];
  const trusts = trustRes.data ?? [];
  const fees = feesRes.data ?? [];

  return {
    date: today,
    dealCount: deals.length,
    escrowVolume: deals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0),
    avgTrustScore: trusts.length > 0 ? Math.round(trusts.reduce((s, t) => s + t.trust_score, 0) / trusts.length) : 0,
    disputeCount: Math.round(trusts.reduce((s, t) => s + (t.dispute_rate ?? 0), 0) * trusts.length),
    newUsers: 0, // Would require created_at on profiles
    platformRevenue: fees.reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0),
  };
}

// ─── Trend Analysis ───
export async function computeTrends(): Promise<TrendAnalysis[]> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

  const [currentDeals, prevDeals, currentFees, prevFees] = await Promise.all([
    supabase.from("deal_rooms").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("deal_rooms").select("id", { count: "exact", head: true }).gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
    supabase.from("platform_fees").select("platform_fee_amount").gte("created_at", thirtyDaysAgo),
    supabase.from("platform_fees").select("platform_fee_amount").gte("created_at", sixtyDaysAgo).lt("created_at", thirtyDaysAgo),
  ]);

  const currentRevenue = (currentFees.data ?? []).reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);
  const prevRevenue = (prevFees.data ?? []).reduce((s, f) => s + (f.platform_fee_amount ?? 0), 0);

  function trend(metric: string, current: number, previous: number): TrendAnalysis {
    const changePercent = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
    return { metric, current, previous, changePercent, direction: changePercent > 2 ? "up" : changePercent < -2 ? "down" : "flat" };
  }

  return [
    trend("Deal Volume", currentDeals.count ?? 0, prevDeals.count ?? 0),
    trend("Platform Revenue", currentRevenue, prevRevenue),
  ];
}

// ─── Trust Distribution ───
export async function getTrustDistribution(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("user_trust_profiles")
    .select("trust_tier")
    .not("trust_tier", "is", null);

  const dist: Record<string, number> = {};
  for (const row of data ?? []) {
    const tier = row.trust_tier ?? "unknown";
    dist[tier] = (dist[tier] ?? 0) + 1;
  }
  return dist;
}

// ─── Institutional Performance ───
export async function getInstitutionalAnalytics() {
  const { data, error } = await supabase
    .from("academic_output_metrics")
    .select("institution_id, economic_output, fyp_completion_rate, research_velocity, trust_stability")
    .not("institution_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
