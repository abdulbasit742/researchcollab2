/**
 * Security Guards — centralized access control assertions.
 *
 * Usage: call at the top of any service function that requires access control.
 * Throws on failure — callers should catch and display appropriate error.
 */

import { supabase } from "@/integrations/supabase/client";

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Assert the current session is authenticated. Returns the user.
 */
export async function assertAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new AuthError();
  return user;
}

/**
 * Assert the user has admin role (via user_roles table).
 */
export async function assertAdmin(userId: string) {
  const { data, error } = await supabase
    .rpc("has_role", { _user_id: userId, _role: "admin" });

  if (error || !data) {
    throw new ForbiddenError("Admin access required");
  }
}

/**
 * Assert the user is a participant (buyer or seller) of a deal.
 */
export async function assertDealParticipant(dealId: string, userId: string) {
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .select("buyer_id, seller_id")
    .eq("id", dealId)
    .single();

  if (error || !deal) throw new ForbiddenError("Deal not found");
  if (deal.buyer_id !== userId && deal.seller_id !== userId) {
    throw new ForbiddenError("You are not a participant in this deal");
  }
  return deal;
}

/**
 * Assert the user is the buyer (client/sponsor) of a deal.
 */
export async function assertDealBuyer(dealId: string, userId: string) {
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .select("buyer_id")
    .eq("id", dealId)
    .single();

  if (error || !deal) throw new ForbiddenError("Deal not found");
  if (deal.buyer_id !== userId) {
    throw new ForbiddenError("Only the deal sponsor can perform this action");
  }
}

/**
 * Assert the user is the seller (executor/student) of a deal.
 */
export async function assertDealSeller(dealId: string, userId: string) {
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .select("seller_id")
    .eq("id", dealId)
    .single();

  if (error || !deal) throw new ForbiddenError("Deal not found");
  if (deal.seller_id !== userId) {
    throw new ForbiddenError("Only the deal executor can perform this action");
  }
}

/**
 * Assert the user owns a specific offer.
 */
export async function assertOfferOwner(offerId: string, userId: string) {
  const { data: offer, error } = await supabase
    .from("offers")
    .select("sender_id")
    .eq("id", offerId)
    .single();

  if (error || !offer) throw new ForbiddenError("Offer not found");
  if (offer.sender_id !== userId) {
    throw new ForbiddenError("You do not own this offer");
  }
}

/**
 * Assert the user is a participant in a message thread.
 */
export async function assertThreadParticipant(threadId: string, userId: string) {
  const { data: thread, error } = await supabase
    .from("message_threads")
    .select("user_a, user_b")
    .eq("id", threadId)
    .single();

  if (error || !thread) throw new ForbiddenError("Thread not found");
  if (thread.user_a !== userId && thread.user_b !== userId) {
    throw new ForbiddenError("You are not a participant in this thread");
  }
}

/**
 * Log an audit entry for sensitive operations.
 */
export async function logAudit(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  await supabase.from("admin_audit_logs").insert({
    admin_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details as any ?? null,
  });
}
