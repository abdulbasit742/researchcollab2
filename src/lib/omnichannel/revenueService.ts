/**
 * AI Revenue Engine Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getRevenueStreams(filters?: { stream_type?: string; status?: string }) {
  let q = (supabase as any).from("omni_revenue_streams").select("*, omni_contacts(display_name, email)").order("created_at", { ascending: false });
  if (filters?.stream_type) q = q.eq("stream_type", filters.stream_type);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createRevenueStream(input: {
  stream_name: string; stream_type?: string; channel?: string;
  contact_id?: string; amount?: number; currency?: string;
  conversion_source?: string; ai_recommendation?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_revenue_streams").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateRevenueStream(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_revenue_streams").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getRevenueForecasts(streamType?: string) {
  let q = (supabase as any).from("omni_revenue_forecasts").select("*").order("created_at", { ascending: false });
  if (streamType) q = q.eq("stream_type", streamType);
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createForecast(input: {
  forecast_period: string; stream_type: string;
  predicted_amount?: number; confidence?: number; factors?: Record<string, unknown>;
}) {
  const { data, error } = await (supabase as any).from("omni_revenue_forecasts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getRevenueStats() {
  const { data, error } = await (supabase as any).from("omni_revenue_streams").select("stream_type, status, amount");
  if (error) throw error;
  const stats = {
    totalPipeline: 0,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    wonRevenue: 0,
  };
  data?.forEach((r: any) => {
    const amt = r.amount || 0;
    stats.totalPipeline += amt;
    stats.byType[r.stream_type] = (stats.byType[r.stream_type] || 0) + amt;
    stats.byStatus[r.status] = (stats.byStatus[r.status] || 0) + 1;
    if (r.status === "won") stats.wonRevenue += amt;
  });
  return stats;
}

export const STREAM_TYPES = ["subscription", "marketplace", "hiring", "research_lab", "analytics", "dataset", "licensing"];
export const REVENUE_STATUSES = ["prospect", "qualified", "proposal", "negotiation", "won", "lost", "churned"];
