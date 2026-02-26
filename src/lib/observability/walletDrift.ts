/**
 * Wallet Drift Detection — detects when wallet snapshot diverges from transaction sum.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { captureMessage } from "./errorTracker";

const log = createLogger("walletDrift");

export interface DriftResult {
  userId: string;
  hasDrift: boolean;
  walletTotal: number;
  transactionSum: number;
  delta: number;
}

/**
 * Detect wallet drift for a specific user.
 * Compares wallet balance snapshot vs completed transaction sum.
 */
export async function detectWalletDrift(userId: string): Promise<DriftResult> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id, available_balance, escrow_balance, pending_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    return { userId, hasDrift: false, walletTotal: 0, transactionSum: 0, delta: 0 };
  }

  const walletTotal = (wallet.available_balance ?? 0) + (wallet.escrow_balance ?? 0) + (wallet.pending_balance ?? 0);

  const { data: txns } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", wallet.id)
    .eq("status", "completed");

  const transactionSum = (txns ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const delta = Math.abs(walletTotal - transactionSum);
  const hasDrift = delta > 1; // Allow PKR 1 tolerance

  if (hasDrift) {
    log.warn("Wallet drift detected", { userId, walletTotal, transactionSum, delta });

    captureMessage("Wallet drift detected", "error", {
      userId,
      operation: "wallet_drift_check",
    });

    try {
      await supabase.from("platform_alerts").insert({
        alert_type: "wallet_drift",
        severity: delta > 1000 ? "critical" : "warning",
        message: `Wallet drift for user: delta PKR ${delta}`,
        metadata: { userId, walletTotal, transactionSum, delta },
        is_resolved: false,
      });
    } catch {
      // Silent
    }
  }

  return { userId, hasDrift, walletTotal, transactionSum, delta };
}

/**
 * Batch drift check — check multiple users (for nightly job).
 */
export async function batchDriftCheck(userIds: string[]): Promise<DriftResult[]> {
  const results: DriftResult[] = [];
  for (const uid of userIds) {
    results.push(await detectWalletDrift(uid));
  }
  return results;
}
