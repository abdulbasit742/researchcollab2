/**
 * Offers Repository — pure DB operations.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];
type OfferInsert = Database["public"]["Tables"]["offers"]["Insert"];
type OfferUpdate = Database["public"]["Tables"]["offers"]["Update"];

export async function findById(id: string): Promise<Offer | null> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findMany(limit = 50): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function findByUser(userId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insert(data: OfferInsert): Promise<Offer> {
  const { data: offer, error } = await supabase
    .from("offers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return offer;
}

export async function update(id: string, data: OfferUpdate): Promise<Offer> {
  const { data: offer, error } = await supabase
    .from("offers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return offer;
}
