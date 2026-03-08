/**
 * Campaign & Broadcast Engine Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getCampaigns(status?: string) {
  let q = (supabase as any).from("omni_campaigns").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createCampaign(input: {
  campaign_name: string; campaign_type: string; channel: string;
  target_segment?: Record<string, unknown>; template_content?: string;
  schedule?: Record<string, unknown>; created_by?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_campaigns").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_campaigns").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getCampaignSends(campaignId: string) {
  const { data, error } = await (supabase as any).from("omni_campaign_sends").select("*, omni_contacts(display_name, email)").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const CAMPAIGN_TYPES = ["lead_nurture", "demo_reminder", "onboarding_followup", "event_invitation", "sponsor_outreach", "reactivation"];
