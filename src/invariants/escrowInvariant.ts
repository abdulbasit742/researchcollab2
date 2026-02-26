/**
 * Escrow Invariant Layer — validates escrow state before any commit.
 * Called by services, never by repositories or controllers.
 */

import { FinancialInvariantError } from "@/lib/core/errors";
import type { EscrowRecord } from "@/repositories/escrowRepo";

const VALID_STATUSES = ["created", "funded", "locked", "partially_released", "completed", "refunded", "disputed"];

export function validateEscrowInvariants(escrow: EscrowRecord): void {
  const errors: string[] = [];

  if (escrow.total_amount <= 0) errors.push("Total amount must be positive");
  if (escrow.locked_amount < 0) errors.push("Locked amount negative");
  if (escrow.released_amount < 0) errors.push("Released amount negative");
  if (escrow.refunded_amount < 0) errors.push("Refunded amount negative");

  const sum = escrow.locked_amount + escrow.released_amount + escrow.refunded_amount;
  if (sum > escrow.total_amount + 0.01) {
    errors.push(`Sum invariant violated: ${sum} > ${escrow.total_amount}`);
  }

  if (!VALID_STATUSES.includes(escrow.status)) {
    errors.push(`Invalid status: ${escrow.status}`);
  }

  if (errors.length > 0) {
    throw new FinancialInvariantError(
      `Escrow invariant violation on ${escrow.id}: ${errors.join("; ")}`,
      { escrowId: escrow.id, errors }
    );
  }
}
