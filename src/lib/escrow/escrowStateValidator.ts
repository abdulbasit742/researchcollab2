/**
 * Escrow State Validator — unified pre-commit validation for all escrow mutations.
 * Every escrow change MUST call validateEscrowState() before committing.
 */

import { supabase } from "@/integrations/supabase/client";
import { FinancialInvariantError, ConflictError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowStateValidator");

export type EscrowAction = "fund" | "release" | "refund" | "dispute" | "complete";

export interface EscrowStateCheck {
  dealId: string;
  action: EscrowAction;
  valid: boolean;
  blockers: string[];
  preState: string;
  checkedAt: string;
}

/**
 * Validate that an escrow action is safe to execute.
 */
export async function validateEscrowState(
  dealId: string,
  action: EscrowAction,
  actorId: string,
  amount?: number
): Promise<EscrowStateCheck> {
  const blockers: string[] = [];

  // Fetch deal
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .select("id, buyer_id, seller_id, escrow_status, escrow_amount, agreed_amount, status")
    .eq("id", dealId)
    .single();

  if (error || !deal) {
    return { dealId, action, valid: false, blockers: ["Deal not found"], preState: "unknown", checkedAt: new Date().toISOString() };
  }

  const escrowStatus = deal.escrow_status ?? "pending";

  // Action-specific validation
  switch (action) {
    case "fund": {
      if (escrowStatus !== "pending") {
        blockers.push(`Cannot fund: escrow is "${escrowStatus}", must be "pending"`);
      }
      if (deal.buyer_id !== actorId) {
        blockers.push("Only the sponsor can fund escrow");
      }
      if (!deal.agreed_amount || deal.agreed_amount <= 0) {
        blockers.push("No agreed amount on deal");
      }
      // Check wallet balance
      if (blockers.length === 0) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("available_balance")
          .eq("user_id", actorId)
          .single();
        if (!wallet) {
          blockers.push("Sponsor wallet not found");
        } else if (wallet.available_balance < (deal.agreed_amount ?? 0)) {
          blockers.push(`Insufficient balance: have ${wallet.available_balance}, need ${deal.agreed_amount}`);
        }
      }
      break;
    }

    case "release": {
      if (!["funded", "active"].includes(escrowStatus)) {
        blockers.push(`Cannot release: escrow is "${escrowStatus}"`);
      }
      if (deal.buyer_id !== actorId) {
        blockers.push("Only the sponsor can release escrow");
      }
      if (amount !== undefined && amount > (deal.escrow_amount ?? 0)) {
        blockers.push(`Release amount (${amount}) exceeds escrow balance (${deal.escrow_amount})`);
      }
      break;
    }

    case "refund": {
      if (!["funded", "disputed"].includes(escrowStatus)) {
        blockers.push(`Cannot refund: escrow is "${escrowStatus}"`);
      }
      break;
    }

    case "dispute": {
      if (!["funded", "active"].includes(escrowStatus)) {
        blockers.push(`Cannot dispute: escrow is "${escrowStatus}"`);
      }
      if (deal.buyer_id !== actorId && deal.seller_id !== actorId) {
        blockers.push("Only deal participants can dispute");
      }
      break;
    }

    case "complete": {
      if (!["funded", "active"].includes(escrowStatus)) {
        blockers.push(`Cannot complete: escrow is "${escrowStatus}"`);
      }
      if ((deal.escrow_amount ?? 0) > 0) {
        blockers.push("Cannot complete deal with unreleased escrow funds");
      }
      break;
    }
  }

  // Universal invariant — no negative escrow
  if (deal.escrow_amount !== null && deal.escrow_amount < 0) {
    blockers.push("CRITICAL: Negative escrow balance detected");
  }

  const valid = blockers.length === 0;

  if (!valid) {
    log.warn("Escrow state validation failed", { dealId, action, blockers });
  } else {
    log.info("Escrow state validation passed", { dealId, action });
  }

  return {
    dealId,
    action,
    valid,
    blockers,
    preState: escrowStatus,
    checkedAt: new Date().toISOString(),
  };
}
