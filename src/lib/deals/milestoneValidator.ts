/**
 * Milestone Release Validator — enforces all preconditions before any milestone payment.
 * No direct wallet transfer allowed. Every release must pass this guard.
 */

import { supabase } from "@/integrations/supabase/client";
import { NotFoundError, ConflictError, FinancialInvariantError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("milestoneValidator");

export interface MilestoneReleaseCheck {
  milestoneId: string;
  dealId: string;
  valid: boolean;
  blockers: string[];
  amount: number;
  checkedAt: string;
}

/**
 * Validate all preconditions for a milestone release.
 * Must pass before any fund movement.
 */
export async function validateMilestoneRelease(
  milestoneId: string,
  dealId: string,
  approverUserId: string
): Promise<MilestoneReleaseCheck> {
  const blockers: string[] = [];

  // 1. Milestone exists and belongs to deal
  const { data: milestone, error: msErr } = await (supabase as any)
    .from("milestones")
    .select("id, deal_id, offer_id, title, amount, status")
    .eq("id", milestoneId)
    .single();

  if (msErr || !milestone) {
    return { milestoneId, dealId, valid: false, blockers: ["Milestone not found"], amount: 0, checkedAt: new Date().toISOString() };
  }

  // 2. Milestone belongs to this deal
  if (milestone.deal_id !== dealId) {
    blockers.push("Milestone does not belong to this deal");
  }

  // 3. Milestone not already released
  if (milestone.status === "released") {
    blockers.push("Milestone already released — double release prevented");
  }

  // 4. Milestone must be in approved or submitted state
  if (!["approved", "submitted"].includes(milestone.status)) {
    blockers.push(`Milestone status "${milestone.status}" does not allow release. Must be "approved" or "submitted"`);
  }

  // 5. Amount must be positive
  if (!milestone.amount || milestone.amount <= 0) {
    blockers.push("Milestone has no valid amount");
  }

  // 6. Deal exists and is in correct state
  const { data: deal, error: dealErr } = await supabase
    .from("deal_rooms")
    .select("id, buyer_id, seller_id, escrow_status, escrow_amount, status")
    .eq("id", dealId)
    .single();

  if (dealErr || !deal) {
    blockers.push("Deal not found");
  } else {
    // 7. Approver must be the buyer/sponsor
    if (deal.buyer_id !== approverUserId) {
      blockers.push("Only the deal sponsor can approve milestone release");
    }

    // 8. Escrow must be funded
    if (!["funded", "active"].includes(deal.escrow_status ?? "")) {
      blockers.push(`Escrow status "${deal.escrow_status}" does not allow release`);
    }

    // 9. Sufficient escrow balance
    if (deal.escrow_amount !== null && milestone.amount > deal.escrow_amount) {
      blockers.push(`Milestone amount (${milestone.amount}) exceeds escrow balance (${deal.escrow_amount})`);
    }
  }

  // 10. Verify escrow wallet has sufficient balance
  if (deal && blockers.length === 0) {
    const { data: wallet } = await supabase
      .from("wallets")
      .select("escrow_balance")
      .eq("user_id", deal.buyer_id)
      .single();

    if (!wallet) {
      blockers.push("Sponsor wallet not found");
    } else if (wallet.escrow_balance < milestone.amount) {
      blockers.push(`Wallet escrow balance (${wallet.escrow_balance}) insufficient for milestone (${milestone.amount})`);
    }
  }

  const valid = blockers.length === 0;

  if (!valid) {
    log.warn("Milestone release validation failed", { milestoneId, dealId, blockers });
  } else {
    log.info("Milestone release validation passed", { milestoneId, dealId, amount: milestone.amount });
  }

  return {
    milestoneId,
    dealId,
    valid,
    blockers,
    amount: milestone.amount ?? 0,
    checkedAt: new Date().toISOString(),
  };
}
