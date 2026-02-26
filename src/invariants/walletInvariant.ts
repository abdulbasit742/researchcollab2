/**
 * Wallet Invariant Layer — validates wallet state.
 */

import type { WalletRecord } from "@/repositories/walletRepo";

export function validateWalletInvariants(wallet: WalletRecord): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (wallet.available_balance < 0) errors.push("Negative available balance");
  if (wallet.escrow_balance < 0) errors.push("Negative escrow balance");
  if (wallet.pending_balance < 0) errors.push("Negative pending balance");

  return { valid: errors.length === 0, errors };
}
