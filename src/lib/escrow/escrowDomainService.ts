/**
 * Escrow Domain Service — isolated escrow lifecycle management.
 * All escrow operations go through here. No page may directly mutate escrow state.
 *
 * State machine:
 *   pending → funded → active → completed
 *   pending → cancelled
 *   funded → refunded
 *   active → disputed → active | refunded
 */

import { supabase } from "@/integrations/supabase/client";
import { runAtomic } from "@/lib/core/transaction";
import {
  assertAuthenticated,
  assertDealExists,
  assertDealParticipant,
  assertDealStatus,
  assertSufficientBalance,
} from "@/lib/security/invariants";
import { ConflictError, NotFoundError } from "@/lib/core/errors";
import * as walletDomain from "@/lib/wallet/walletDomainService";
import { createNotification, createBulkNotifications } from "@/lib/notificationService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrow");

const VALID_ESCROW_TRANSITIONS: Record<string, string[]> = {
  pending: ["funded", "cancelled"],
  funded: ["active", "refunded"],
  active: ["completed", "disputed"],
  disputed: ["active", "refunded"],
  completed: [],
  refunded: [],
  cancelled: [],
};

function validateTransition(current: string, next: string) {
  const allowed = VALID_ESCROW_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new ConflictError(
      `Invalid escrow transition: ${current} → ${next}. Allowed: ${allowed.join(", ")}`
    );
  }
}

async function getMilestone(milestoneId: string) {
  const { data, error } = await supabase
    .from("milestones")
    .select("id, offer_id, title, amount, status")
    .eq("id", milestoneId)
    .single();

  if (error || !data) throw new NotFoundError("Milestone", milestoneId);
  return data;
}

/**
 * Fund escrow for a deal — locks funds from client wallet.
 */
export async function fundEscrow(dealId: string) {
  const user = await assertAuthenticated();

  return runAtomic({
    validate: async () => {
      const deal = await assertDealExists(dealId);
      if (deal.buyer_id !== user.id) {
        throw new ConflictError("Only the sponsor can fund escrow");
      }
      validateTransition(deal.escrow_status ?? "pending", "funded");
      if (!deal.agreed_amount || deal.agreed_amount <= 0) {
        throw new ConflictError("Deal has no agreed amount");
      }
      const wallet = await walletDomain.getWallet(user.id);
      if (!wallet) throw new NotFoundError("Wallet");
      assertSufficientBalance(wallet.available_balance, deal.agreed_amount);
    },
    execute: async () => {
      const deal = await assertDealExists(dealId);
      const amount = deal.agreed_amount!;

      await walletDomain.lockForEscrow(user.id, amount, dealId, deal.title ?? "Deal");

      const { error } = await supabase
        .from("deal_rooms")
        .update({
          escrow_status: "funded",
          escrow_amount: amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dealId);

      if (error) throw error;

      await createBulkNotifications([
        {
          user_id: deal.buyer_id!,
          type: "deal_update",
          title: "Escrow Funded",
          message: `PKR ${amount.toLocaleString()} locked in escrow for "${deal.title}"`,
          data: { deal_id: dealId, link: `/deals/${dealId}` },
        },
        {
          user_id: deal.seller_id!,
          type: "deal_update",
          title: "Escrow Funded",
          message: `Client has funded escrow (PKR ${amount.toLocaleString()}) for "${deal.title}". You can begin work.`,
          data: { deal_id: dealId, link: `/deals/${dealId}` },
        },
      ]);

      log.info("Escrow funded", { dealId, amount });
      return { success: true as const, lockedAmount: amount };
    },
  });
}

/**
 * Release a milestone payment — moves funds from client escrow to executor.
 */
export async function releaseMilestone(milestoneId: string, dealId: string) {
  const user = await assertAuthenticated();

  return runAtomic({
    validate: async () => {
      const deal = await assertDealExists(dealId);
      if (deal.buyer_id !== user.id) {
        throw new ConflictError("Only the sponsor can release milestones");
      }
      assertDealStatus(deal.escrow_status, ["funded", "active"], "release milestone");

      const ms = await getMilestone(milestoneId);
      if (ms.status === "released") {
        throw new ConflictError("Milestone already released");
      }
      if (!["approved", "submitted"].includes(ms.status)) {
        throw new ConflictError(
          `Cannot release payment: milestone is "${ms.status}". Must be approved or submitted.`
        );
      }
    },
    execute: async () => {
      const deal = await assertDealExists(dealId);
      const milestone = await getMilestone(milestoneId);

      await walletDomain.releaseEscrowToExecutor(
        deal.buyer_id!,
        deal.seller_id!,
        milestone.amount,
        milestoneId,
        milestone.title
      );

      await supabase
        .from("milestones")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", milestoneId);

      await createNotification(
        deal.seller_id!,
        "Payment Received",
        `PKR ${milestone.amount.toLocaleString()} released for milestone "${milestone.title}"`,
        "payment_received",
        { deal_id: dealId, milestone_id: milestoneId, link: `/deals/${dealId}` }
      );

      log.info("Milestone released", { milestoneId, dealId, amount: milestone.amount });
      return { success: true as const, releasedAmount: milestone.amount };
    },
  });
}

/**
 * Dispute a deal — freezes escrow and notifies parties.
 */
export async function disputeDeal(dealId: string, reason: string) {
  const user = await assertAuthenticated();

  const deal = await assertDealParticipant(dealId, user.id);
  validateTransition(deal.escrow_status ?? "active", "disputed");

  await supabase
    .from("deal_rooms")
    .update({
      status: "disputed",
      escrow_status: "disputed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  const otherParty = user.id === deal.buyer_id ? deal.seller_id : deal.buyer_id;

  await createBulkNotifications([
    {
      user_id: otherParty!,
      type: "deal_update",
      title: "Deal Disputed",
      message: `A dispute has been raised on "${deal.title}": ${reason}`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    },
    {
      user_id: user.id,
      type: "deal_update",
      title: "Dispute Filed",
      message: `Your dispute on "${deal.title}" has been filed.`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    },
  ]);

  log.info("Deal disputed", { dealId, initiator: user.id });
  return { success: true as const };
}

/**
 * Refund a deal — returns escrowed funds to client.
 */
export async function refundDeal(dealId: string) {
  await assertAuthenticated();

  return runAtomic({
    validate: async () => {
      const deal = await assertDealExists(dealId);
      validateTransition(deal.escrow_status ?? "pending", "refunded");
    },
    execute: async () => {
      const deal = await assertDealExists(dealId);
      const amount = deal.escrow_amount ?? 0;

      if (amount > 0) {
        await walletDomain.refundEscrow(
          deal.buyer_id!,
          amount,
          dealId,
          deal.title ?? "Deal"
        );
      }

      await supabase
        .from("deal_rooms")
        .update({
          status: "cancelled",
          escrow_status: "refunded",
          escrow_amount: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dealId);

      if (amount > 0) {
        await createNotification(
          deal.buyer_id!,
          "Escrow Refunded",
          `PKR ${amount.toLocaleString()} has been refunded from "${deal.title}"`,
          "payment_received",
          { deal_id: dealId, link: `/wallet` }
        );
      }

      log.info("Deal refunded", { dealId, amount });
      return { success: true as const, refundedAmount: amount };
    },
  });
}
