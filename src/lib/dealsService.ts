import { supabase } from "@/integrations/supabase/client";

/**
 * Deals service — standalone CRUD for deal_rooms.
 * Hooks (useDealRoom, useDealRooms, useCreateDealRoom) handle UI-level queries.
 * This service is for programmatic / edge-function use.
 */

export async function getUserDeals(userId: string) {
  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDealById(id: string) {
  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createDealFromOffer(
  offerId: string,
  buyerId: string,
  sellerId: string,
  title: string,
  amount: number
) {
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .insert({
      offer_id: offerId,
      buyer_id: buyerId,
      seller_id: sellerId,
      title,
      status: "negotiating",
      agreed_amount: amount,
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for both parties
  await Promise.all([
    supabase.from("notifications").insert({
      user_id: buyerId,
      type: "deal_created",
      title: "New Deal Created",
      message: `Deal "${title}" has been initiated.`,
      data: { deal_id: deal.id, link: `/deals/${deal.id}` },
    }),
    supabase.from("notifications").insert({
      user_id: sellerId,
      type: "deal_created",
      title: "New Deal Invitation",
      message: `You've been invited to deal "${title}".`,
      data: { deal_id: deal.id, link: `/deals/${deal.id}` },
    }),
  ]);

  return deal;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  negotiating: ["agreed", "cancelled"],
  agreed: ["in_progress", "cancelled"],
  in_progress: ["completed", "disputed", "cancelled"],
  disputed: ["in_progress", "cancelled"],
  // Terminal states
  completed: [],
  cancelled: [],
};

export async function updateDealStatus(id: string, newStatus: string) {
  // Fetch current status for validation
  const { data: deal, error: fetchError } = await supabase
    .from("deal_rooms")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const currentStatus = deal.status || "negotiating";
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(", ")}`
    );
  }

  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("deal_rooms")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function updateDealProgress(id: string, percentage: number) {
  const { error } = await supabase
    .from("deal_rooms")
    .update({
      metadata: { progress_percentage: Math.min(100, Math.max(0, percentage)) },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
