/**
 * AI Growth Engine — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getGrowthMetrics(filters?: { metric_type?: string; channel?: string }) {
  let q = (supabase as any).from("omni_growth_metrics").select("*").order("period_start", { ascending: false });
  if (filters?.metric_type) q = q.eq("metric_type", filters.metric_type);
  if (filters?.channel) q = q.eq("channel", filters.channel);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createGrowthMetric(input: {
  metric_type: string; channel?: string; period_start: string; period_end: string;
  value: number; previous_value?: number; metadata?: Record<string, unknown>;
}) {
  const changePct = input.previous_value && input.previous_value > 0 ? ((input.value - input.previous_value) / input.previous_value) * 100 : null;
  const { data, error } = await (supabase as any).from("omni_growth_metrics").insert({ ...input, change_pct: changePct }).select().single();
  if (error) throw error;
  return data;
}

export async function getGrowthExperiments(status?: string) {
  let q = (supabase as any).from("omni_growth_experiments").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createGrowthExperiment(input: {
  experiment_name: string; hypothesis?: string; channel?: string;
  variant_a?: string; variant_b?: string; start_date?: string; end_date?: string; created_by?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_growth_experiments").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateGrowthExperiment(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_growth_experiments").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export const METRIC_TYPES = ["user_acquisition", "activation_rate", "retention", "referral", "revenue", "conversion", "engagement"];
