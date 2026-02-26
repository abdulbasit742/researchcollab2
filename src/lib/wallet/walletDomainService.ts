/**
 * Wallet Domain Service — single source of truth for all wallet mutations.
 * No page or hook should directly update wallet tables.
 */

import * as repo from "./repository";
import { runAtomic } from "@/lib/core/transaction";
import { validateWalletAmount } from "@/lib/core/validation";
import {
  assertNonNegativeBalance,
  assertSufficientBalance,
} from "@/lib/security/invariants";
import { FinancialInvariantError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { logAudit } from "@/lib/security/guards";

const log = createLogger("wallet");

/**
 * Get or create wallet for a user. Safe to call repeatedly.
 */
export async function getOrCreateWallet(userId: string) {
  const existing = await repo.findByUserId(userId);
  if (existing) return existing;

  log.info("Creating wallet for user", { userId });
  return repo.createWallet(userId);
}

/**
 * Get wallet (returns null if not found).
 */
export async function getWallet(userId: string) {
  return repo.findByUserId(userId);
}

/**
 * List transaction history.
 */
export async function getTransactions(userId: string, limit = 50) {
  const wallet = await repo.findByUserId(userId);
  if (!wallet) return [];
  return repo.listTransactions(wallet.id, limit);
}

/**
 * Deposit funds — atomic: validate → update balance → record transaction.
 */
export async function deposit(
  userId: string,
  amount: number,
  description = "Deposit"
) {
  const validAmount = validateWalletAmount(amount);

  return runAtomic({
    validate: async () => {
      // Amount already validated above
    },
    execute: async () => {
      const wallet = await getOrCreateWallet(userId);
      const newBalance = wallet.available_balance + validAmount;

      assertNonNegativeBalance(newBalance, "available_balance after deposit");

      await repo.updateBalances(wallet.id, {
        available_balance: newBalance,
        total_earned: wallet.total_earned + validAmount,
      });

      await repo.insertTransaction({
        wallet_id: wallet.id,
        user_id: userId,
        type: "deposit",
        amount: validAmount,
        balance_after: newBalance,
        description,
        status: "completed",
      });

      log.info("Deposit completed", { userId, amount: validAmount, newBalance });
      return { success: true as const, newBalance };
    },
  });
}

/**
 * Request withdrawal — moves from available to pending.
 */
export async function requestWithdrawal(userId: string, amount: number) {
  const validAmount = validateWalletAmount(amount);

  return runAtomic({
    validate: async () => {
      const wallet = await repo.findByUserId(userId);
      if (!wallet) throw new FinancialInvariantError("Wallet not found");
      assertSufficientBalance(wallet.available_balance, validAmount);
    },
    execute: async () => {
      const wallet = await repo.findByUserId(userId);
      if (!wallet) throw new FinancialInvariantError("Wallet not found");

      const newAvailable = wallet.available_balance - validAmount;
      const newPending = wallet.pending_balance + validAmount;

      assertNonNegativeBalance(newAvailable, "available_balance after withdrawal");
      assertNonNegativeBalance(newPending, "pending_balance");

      await repo.updateBalances(wallet.id, {
        available_balance: newAvailable,
        pending_balance: newPending,
      });

      await repo.insertTransaction({
        wallet_id: wallet.id,
        user_id: userId,
        type: "withdrawal",
        amount: -validAmount,
        balance_after: newAvailable,
        description: "Withdrawal request",
        status: "pending",
      });

      log.info("Withdrawal requested", { userId, amount: validAmount });
      return { success: true as const, newBalance: newAvailable };
    },
  });
}

/**
 * Lock funds into escrow — only called by escrow engine.
 */
export async function lockForEscrow(
  userId: string,
  amount: number,
  dealId: string,
  dealTitle: string
) {
  const validAmount = validateWalletAmount(amount);

  const wallet = await getOrCreateWallet(userId);
  assertSufficientBalance(wallet.available_balance, validAmount);

  const newAvailable = wallet.available_balance - validAmount;
  const newEscrow = wallet.escrow_balance + validAmount;

  assertNonNegativeBalance(newAvailable, "available_balance after escrow lock");

  await repo.updateBalances(wallet.id, {
    available_balance: newAvailable,
    escrow_balance: newEscrow,
    total_spent: wallet.total_spent + validAmount,
  });

  await repo.insertTransaction({
    wallet_id: wallet.id,
    user_id: userId,
    type: "escrow_deposit",
    amount: -validAmount,
    balance_after: newAvailable,
    description: `Escrow funded for deal: ${dealTitle}`,
    reference_id: dealId,
    reference_type: "deal",
    status: "completed",
  });
}

/**
 * Release escrow funds to executor — only called by escrow engine.
 */
export async function releaseEscrowToExecutor(
  clientId: string,
  executorId: string,
  amount: number,
  milestoneId: string,
  milestoneTitle: string
) {
  const validAmount = validateWalletAmount(amount);

  // Client side: reduce escrow
  const clientWallet = await repo.findByUserId(clientId);
  if (!clientWallet) throw new FinancialInvariantError("Client wallet not found");
  assertSufficientBalance(clientWallet.escrow_balance, validAmount, "escrow balance");

  await repo.updateBalances(clientWallet.id, {
    escrow_balance: clientWallet.escrow_balance - validAmount,
  });

  await repo.insertTransaction({
    wallet_id: clientWallet.id,
    user_id: clientId,
    type: "milestone_release",
    amount: -validAmount,
    balance_after: clientWallet.available_balance,
    description: `Milestone released: ${milestoneTitle}`,
    reference_id: milestoneId,
    reference_type: "milestone",
    status: "completed",
  });

  // Executor side: add to available
  const executorWallet = await getOrCreateWallet(executorId);
  const executorNewBalance = executorWallet.available_balance + validAmount;

  await repo.updateBalances(executorWallet.id, {
    available_balance: executorNewBalance,
    total_earned: executorWallet.total_earned + validAmount,
  });

  await repo.insertTransaction({
    wallet_id: executorWallet.id,
    user_id: executorId,
    type: "milestone_release",
    amount: validAmount,
    balance_after: executorNewBalance,
    description: `Payment received: ${milestoneTitle}`,
    reference_id: milestoneId,
    reference_type: "milestone",
    status: "completed",
  });
}

/**
 * Refund escrowed funds back to client — only called by escrow engine.
 */
export async function refundEscrow(
  clientId: string,
  amount: number,
  dealId: string,
  dealTitle: string
) {
  if (amount <= 0) return;

  const wallet = await repo.findByUserId(clientId);
  if (!wallet) throw new FinancialInvariantError("Client wallet not found for refund");

  const newAvailable = wallet.available_balance + amount;
  const newEscrow = Math.max(0, wallet.escrow_balance - amount);

  await repo.updateBalances(wallet.id, {
    available_balance: newAvailable,
    escrow_balance: newEscrow,
  });

  await repo.insertTransaction({
    wallet_id: wallet.id,
    user_id: clientId,
    type: "refund",
    amount,
    balance_after: newAvailable,
    description: `Escrow refund for deal: ${dealTitle}`,
    reference_id: dealId,
    reference_type: "deal",
    status: "completed",
  });
}

/**
 * Admin-only manual adjustment.
 */
export async function adminAdjust(
  adminId: string,
  targetUserId: string,
  amount: number,
  reason: string
) {
  const wallet = await repo.findByUserId(targetUserId);
  if (!wallet) throw new FinancialInvariantError("Target wallet not found");

  const newBalance = wallet.available_balance + amount;
  assertNonNegativeBalance(newBalance, "balance after admin adjustment");

  await repo.updateBalances(wallet.id, {
    available_balance: newBalance,
  });

  await repo.insertTransaction({
    wallet_id: wallet.id,
    user_id: targetUserId,
    type: amount > 0 ? "deposit" : "withdrawal",
    amount,
    balance_after: newBalance,
    description: `Admin adjustment: ${reason}`,
    status: "completed",
  });

  await logAudit({
    userId: adminId,
    action: "manual_wallet_adjustment",
    entityType: "wallet",
    entityId: wallet.id,
    details: { targetUserId, amount, reason, newBalance },
  });

  return { success: true as const, newBalance };
}
