/**
 * Stripe Payment Service — client-side integration for creating checkout sessions.
 * Actual escrow funding happens ONLY in the stripe-webhook edge function.
 */

import { supabase } from "@/integrations/supabase/client";
import { assertAuthenticated, assertDealExists } from "@/lib/security/invariants";
import { ConflictError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("stripeService");

/**
 * Create a Stripe checkout session for a deal.
 * Returns the checkout URL to redirect the user.
 */
export async function createCheckoutSession(dealId: string): Promise<string> {
  const user = await assertAuthenticated();
  const deal = await assertDealExists(dealId);

  if (deal.buyer_id !== user.id) {
    throw new ConflictError("Only the sponsor can fund a deal");
  }

  if (deal.escrow_status !== "pending" && deal.escrow_status !== null) {
    throw new ConflictError(`Deal escrow is already ${deal.escrow_status}`);
  }

  if (!deal.agreed_amount || deal.agreed_amount <= 0) {
    throw new ConflictError("Deal has no agreed amount");
  }

  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: {
      deal_id: dealId,
      amount: deal.agreed_amount,
      title: deal.title ?? "Deal Payment",
    },
  });

  if (error) {
    log.error("Failed to create checkout session", error);
    throw error;
  }

  return data.url;
}

/**
 * Check if a Stripe event has already been processed (for UI status checks).
 */
export async function isPaymentProcessed(dealId: string): Promise<boolean> {
  const { data } = await supabase
    .from("stripe_events")
    .select("processed")
    .eq("deal_id", dealId)
    .eq("processed", true)
    .maybeSingle();

  return !!data;
}
