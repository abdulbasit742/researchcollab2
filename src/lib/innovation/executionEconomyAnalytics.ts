/**
 * Execution Economy Analytics — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getEconomyReports(filters?: { report_type?: string; region?: string }) {
  let q = (supabase as any).from("execution_economy_reports").select("*").order("created_at", { ascending: false });
  if (filters?.report_type) q = q.eq("report_type", filters.report_type);
  if (filters?.region) q = q.eq("region", filters.region);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createEconomyReport(input: {
  report_type: string; period_start: string; period_end: string;
  metrics: Record<string, unknown>; summary?: string;
  institution_id?: string; region?: string;
}) {
  const { data, error } = await (supabase as any).from("execution_economy_reports")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export const REPORT_TYPES = ["productivity", "capital_efficiency", "talent_mobility", "collaboration"];
