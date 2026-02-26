import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];
type OfferInsert = Database["public"]["Tables"]["offers"]["Insert"];
type OfferUpdate = Database["public"]["Tables"]["offers"]["Update"];

/**
 * Offers service — standalone CRUD for the offers table.
 * Hooks (useOpportunityEngine) already handle UI-level queries.
 * This service is for programmatic / edge-function use.
 */

export async function getAllOffers(limit = 50) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Offer[];
}

export async function getOfferById(id: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Offer | null;
}

export async function createOffer(data: OfferInsert) {
  const { data: offer, error } = await supabase
    .from("offers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return offer as Offer;
}

export async function updateOffer(id: string, data: OfferUpdate) {
  const { data: offer, error } = await supabase
    .from("offers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return offer as Offer;
}

export async function closeOffer(id: string, reason?: string) {
  return updateOffer(id, {
    status: "cancelled",
    cancellation_reason: reason || null,
    cancelled_at: new Date().toISOString(),
  });
}

export async function getOffersByUser(userId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Offer[];
}
