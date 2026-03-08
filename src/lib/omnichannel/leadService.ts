/**
 * Lead Management Service — Systems 9, 28, 32
 */
import { supabase } from "@/integrations/supabase/client";

export async function getLeads(filters?: { pipeline_stage?: string; channel_source?: string }) {
  let q = (supabase as any).from("omni_lead_records").select("*, omni_contacts(display_name, email, phone, lead_score, country)").order("updated_at", { ascending: false });
  if (filters?.pipeline_stage) q = q.eq("pipeline_stage", filters.pipeline_stage);
  if (filters?.channel_source) q = q.eq("channel_source", filters.channel_source);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createLead(input: {
  contact_id: string; lead_source?: string; channel_source?: string;
  persona_fit?: string; interest_domain?: string; pipeline_stage?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_lead_records").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_lead_records").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getLeadStats() {
  const { data, error } = await (supabase as any).from("omni_lead_records").select("pipeline_stage, channel_source, conversion_probability, estimated_contract_value");
  if (error) throw error;
  const stats = {
    total: data?.length || 0,
    byStage: {} as Record<string, number>,
    byChannel: {} as Record<string, number>,
    totalPipelineValue: 0,
    avgConversionProbability: 0,
  };
  let probSum = 0;
  data?.forEach((l: any) => {
    stats.byStage[l.pipeline_stage] = (stats.byStage[l.pipeline_stage] || 0) + 1;
    stats.byChannel[l.channel_source] = (stats.byChannel[l.channel_source] || 0) + 1;
    stats.totalPipelineValue += Number(l.estimated_contract_value) || 0;
    probSum += Number(l.conversion_probability) || 0;
  });
  stats.avgConversionProbability = stats.total > 0 ? probSum / stats.total : 0;
  return stats;
}

export const PIPELINE_STAGES = ["new_lead", "qualified", "demo_requested", "demo_scheduled", "proposal_pending", "in_negotiation", "pilot_started", "converted", "lost", "reengage_later"];
