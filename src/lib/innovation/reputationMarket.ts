/**
 * Execution Reputation Market — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getServiceListings(serviceType?: string) {
  let q = supabase.from("reputation_service_listings").select("*").order("rating_avg", { ascending: false });
  if (serviceType) q = q.eq("service_type", serviceType);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function createListing(input: {
  provider_id: string; service_type: string; title: string;
  description?: string; fee_amount?: number; min_ecs_required?: number;
}) {
  const { data, error } = await supabase.from("reputation_service_listings").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function requestService(listing_id: string, requester_id: string, provider_id: string) {
  const { data, error } = await supabase.from("reputation_service_engagements")
    .insert({ listing_id, requester_id, provider_id }).select().single();
  if (error) throw error;
  return data;
}

export async function getMyEngagements(userId: string) {
  const { data, error } = await supabase.from("reputation_service_engagements")
    .select("*").or(`requester_id.eq.${userId},provider_id.eq.${userId}`);
  if (error) throw error;
  return data;
}

export const SERVICE_TYPES = [
  "milestone_validator", "dispute_arbitrator", "peer_reviewer",
  "research_advisor", "code_auditor", "data_validator",
];
