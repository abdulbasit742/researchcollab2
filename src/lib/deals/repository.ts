/**
 * Deals Repository — pure DB operations.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DealRoom = Database["public"]["Tables"]["deal_rooms"]["Row"];
type DealRoomInsert = Database["public"]["Tables"]["deal_rooms"]["Insert"];

export async function findById(dealId: string): Promise<DealRoom | null> {
  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findByUser(userId: string): Promise<DealRoom[]> {
  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateStatus(
  dealId: string,
  updates: Partial<Omit<DealRoom, "id" | "created_at">>
) {
  const { error } = await supabase
    .from("deal_rooms")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (error) throw error;
}

export async function insertDeal(data: DealRoomInsert): Promise<DealRoom> {
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return deal;
}

export async function findMilestonesByOffer(offerId: string) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("offer_id", offerId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
