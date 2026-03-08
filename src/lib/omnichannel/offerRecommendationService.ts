/**
 * Offer Recommendation Engine — System 33
 */
import { supabase } from "@/integrations/supabase/client";

export async function getOfferRecommendations(contactId: string) {
  const { data, error } = await (supabase as any).from("omni_offer_recommendations")
    .select("*").eq("contact_id", contactId).order("match_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createOfferRecommendation(input: {
  contact_id: string; lead_id?: string; offer_type: string;
  offer_name: string; match_score?: number; reasoning?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_offer_recommendations").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function markOfferPresented(id: string) {
  return (supabase as any).from("omni_offer_recommendations").update({ status: "presented", presented_at: new Date().toISOString() }).eq("id", id);
}

export async function markOfferAccepted(id: string) {
  return (supabase as any).from("omni_offer_recommendations").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("id", id);
}

export const OFFER_TYPES = ["basic_plan", "career_plan", "business_plan", "institution_pilot", "enterprise_hiring", "analytics_subscription", "research_lab", "sponsor_onboarding", "dataset_commerce"];
