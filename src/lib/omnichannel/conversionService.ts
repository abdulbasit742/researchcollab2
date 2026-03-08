/**
 * Conversion Intelligence Engine — System 34
 */
import { supabase } from "@/integrations/supabase/client";

export async function getConversionPredictions(contactId?: string) {
  let q = (supabase as any).from("omni_conversion_predictions").select("*, omni_contacts(display_name)").order("computed_at", { ascending: false });
  if (contactId) q = q.eq("contact_id", contactId);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createConversionPrediction(input: {
  contact_id: string; lead_id?: string; prediction_type?: string;
  probability?: number; best_next_message?: string; best_channel?: string;
  best_send_time?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_conversion_predictions").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSLATargets() {
  const { data, error } = await (supabase as any).from("omni_sla_targets").select("*").eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}

export async function createSLATarget(input: {
  target_name: string; persona_type?: string; priority?: string;
  first_response_minutes?: number; resolution_hours?: number;
}) {
  const { data, error } = await (supabase as any).from("omni_sla_targets").insert(input).select().single();
  if (error) throw error;
  return data;
}
