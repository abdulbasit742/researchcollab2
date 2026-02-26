/**
 * Financial Double Verification — pre-operation integrity checks.
 * Must be called before any escrow or wallet mutation.
 */

import { supabase } from "@/integrations/supabase/client";
import { FinancialInvariantError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialVerification");

export interface VerificationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Verify wallet financial consistency before performing operations.
 */
export async function verifyFinancialConsistency(
  userId: string
): Promise<VerificationResult> {
  const issues: string[] = [];

  // Get wallet
  const { data: wallet, error: wErr } = await supabase
    .from("wallets")
    .select("id, available_balance, escrow_balance, pending_balance, total_earned, total_spent")
    .eq("user_id", userId)
    .maybeSingle();

  if (wErr || !wallet) {
    return { valid: false, issues: ["Wallet not found"] };
  }

  // Check non-negative balances
  if (wallet.available_balance < 0) {
    issues.push(`Negative available_balance: ${wallet.available_balance}`);
  }
  if (wallet.escrow_balance < 0) {
    issues.push(`Negative escrow_balance: ${wallet.escrow_balance}`);
  }
  if (wallet.pending_balance < 0) {
    issues.push(`Negative pending_balance: ${wallet.pending_balance}`);
  }

  // Check transaction sum matches wallet snapshot (basic integrity)
  const { data: txns, error: txErr } = await supabase
    .from("wallet_transactions")
    .select("amount, status")
    .eq("wallet_id", wallet.id)
    .eq("status", "completed");

  if (!txErr && txns) {
    const txnSum = txns.reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const walletTotal = wallet.available_balance + wallet.escrow_balance + wallet.pending_balance;

    // Allow small float tolerance
    const diff = Math.abs(txnSum - walletTotal);
    if (diff > 1) {
      issues.push(
        `Transaction sum (${txnSum}) diverges from wallet total (${walletTotal}) by ${diff}`
      );
    }
  }

  if (issues.length > 0) {
    log.warn("Financial consistency issues detected", { userId, issues });
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Assert financial consistency — throws if inconsistent.
 */
export async function assertFinancialConsistency(userId: string): Promise<void> {
  const result = await verifyFinancialConsistency(userId);
  if (!result.valid) {
    throw new FinancialInvariantError(
      `Financial integrity check failed: ${result.issues.join("; ")}`,
      { userId, issues: result.issues }
    );
  }
}
