/**
 * Invariant guards — reusable precondition assertions.
 * Throw structured DomainErrors. Use at the top of domain service functions.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  FinancialInvariantError,
  ConflictError,
} from "@/lib/core/errors";

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function assertAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new AuthenticationError();
  return user;
}

// ─── Roles ─────────────────────────────────────────────────────────────────

export async function assertAdmin(userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || !data) throw new AuthorizationError("Admin access required");
}

// ─── Wallet ────────────────────────────────────────────────────────────────

export async function assertWalletOwner(walletUserId: string, currentUserId: string) {
  if (walletUserId !== currentUserId) {
    throw new AuthorizationError("You can only access your own wallet");
  }
}

export function assertNonNegativeBalance(balance: number, label = "balance") {
  if (balance < 0) {
    throw new FinancialInvariantError(
      `${label} would become negative: ${balance}`,
      { balance, label }
    );
  }
}

export function assertSufficientBalance(
  available: number,
  required: number,
  label = "available balance"
) {
  if (available < required) {
    throw new FinancialInvariantError(
      `Insufficient ${label}: have ${available}, need ${required}`,
      { available, required }
    );
  }
}

// ─── Deals ─────────────────────────────────────────────────────────────────

export async function assertDealExists(dealId: string) {
  const { data, error } = await supabase
    .from("deal_rooms")
    .select("id, buyer_id, seller_id, status, escrow_status, agreed_amount, escrow_amount, title")
    .eq("id", dealId)
    .single();

  if (error || !data) throw new NotFoundError("Deal", dealId);
  return data;
}

export async function assertDealParticipant(dealId: string, userId: string) {
  const deal = await assertDealExists(dealId);
  if (deal.buyer_id !== userId && deal.seller_id !== userId) {
    throw new AuthorizationError("You are not a participant in this deal");
  }
  return deal;
}

export function assertDealStatus(
  currentStatus: string | null,
  allowedStatuses: string[],
  action: string
) {
  const status = currentStatus ?? "unknown";
  if (!allowedStatuses.includes(status)) {
    throw new ConflictError(
      `Cannot ${action}: deal is "${status}". Allowed: ${allowedStatuses.join(", ")}`
    );
  }
}

// ─── Milestones ────────────────────────────────────────────────────────────

export async function assertMilestoneExists(milestoneId: string) {
  const { data, error } = await supabase
    .from("milestones")
    .select("id, deal_id, offer_id, title, amount, status")
    .eq("id", milestoneId)
    .single();

  if (error || !data) throw new NotFoundError("Milestone", milestoneId);
  return data;
}

export function assertMilestoneState(
  currentStatus: string,
  allowedStatuses: string[],
  action: string
) {
  if (!allowedStatuses.includes(currentStatus)) {
    throw new ConflictError(
      `Cannot ${action}: milestone is "${currentStatus}". Allowed: ${allowedStatuses.join(", ")}`
    );
  }
}

// ─── Offers ────────────────────────────────────────────────────────────────

export async function assertOfferOwner(offerId: string, userId: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("sender_id")
    .eq("id", offerId)
    .single();

  if (error || !data) throw new NotFoundError("Offer", offerId);
  if (data.sender_id !== userId) {
    throw new AuthorizationError("You do not own this offer");
  }
}

// ─── Threads ───────────────────────────────────────────────────────────────

export async function assertThreadParticipant(threadId: string, userId: string) {
  const { data, error } = await supabase
    .from("message_threads")
    .select("user_a, user_b")
    .eq("id", threadId)
    .single();

  if (error || !data) throw new NotFoundError("Thread", threadId);
  if (data.user_a !== userId && data.user_b !== userId) {
    throw new AuthorizationError("You are not a participant in this thread");
  }
}
