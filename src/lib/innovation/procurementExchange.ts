/**
 * Institutional Procurement Exchange — Additive service layer.
 * RFQ-based procurement marketplace for institutions.
 */
import { supabase } from "@/integrations/supabase/client";

export async function getProcurementRequests(filters?: { status?: string; category?: string }) {
  let q = (supabase as any).from("procurement_requests").select("*").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.category) q = q.eq("category", filters.category);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createProcurementRequest(input: {
  requester_id: string; title: string; description?: string; category?: string;
  budget_min?: number; budget_max?: number; deadline?: string;
  required_certifications?: string[]; institution_id?: string;
}) {
  const { data, error } = await (supabase as any).from("procurement_requests")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function submitBid(input: {
  request_id: string; vendor_id: string; vendor_name?: string;
  bid_amount: number; delivery_timeline_days?: number;
  proposal_details?: string; trust_score_snapshot?: number;
}) {
  const { data, error } = await (supabase as any).from("procurement_bids")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getBids(requestId: string) {
  const { data, error } = await (supabase as any).from("procurement_bids")
    .select("*").eq("request_id", requestId).order("bid_amount");
  if (error) throw error;
  return data ?? [];
}

export async function getProcurementAnalytics() {
  const { data: requests } = await (supabase as any).from("procurement_requests").select("*").limit(500);
  const all = requests ?? [];
  const totalBudget = all.reduce((s: number, r: any) => s + (r.budget_max || 0), 0);

  const catMap: Record<string, number> = {};
  all.forEach((r: any) => {
    if (r.category) catMap[r.category] = (catMap[r.category] || 0) + 1;
  });

  return {
    totalRequests: all.length,
    openRequests: all.filter((r: any) => r.status === "open").length,
    totalBudget,
    totalBids: all.reduce((s: number, r: any) => s + (r.bid_count || 0), 0),
    byCategory: Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([category, count]) => ({ category, count })),
  };
}

export const PROCUREMENT_CATEGORIES = ["equipment", "software", "services", "reagents", "computing", "consulting", "facilities"];
