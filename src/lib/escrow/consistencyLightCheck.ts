/**
 * Lightweight escrow consistency check — fast runtime validation.
 * Full reconciliation runs nightly via pg_cron. This is for spot checks.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowLightCheck");

export interface LightCheckResult {
  consistent: boolean;
  issues: string[];
  checkedAt: string;
}

/**
 * Fast check: verify a single user's wallet escrow matches their active deal locks.
 * Much cheaper than a full ledger scan.
 */
export async function checkUserEscrowConsistency(userId: string): Promise<LightCheckResult> {
  const issues: string[] = [];

  // 1. Get wallet escrow balance
  const { data: wallet, error: wErr } = await supabase
    .from("wallets")
    .select("escrow_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (wErr || !wallet) {
    return { consistent: true, issues: [], checkedAt: new Date().toISOString() };
  }

  // 2. Sum active deal escrows where user is buyer
  const { data: deals, error: dErr } = await supabase
    .from("deal_rooms")
    .select("escrow_amount")
    .eq("buyer_id", userId)
    .in("escrow_status", ["funded", "active"]);

  if (dErr) {
    issues.push(`Failed to fetch deals: ${dErr.message}`);
    return { consistent: false, issues, checkedAt: new Date().toISOString() };
  }

  const dealEscrowSum = (deals ?? []).reduce((sum, d) => sum + (d.escrow_amount ?? 0), 0);

  // 3. Compare — allow small float tolerance
  const delta = Math.abs(wallet.escrow_balance - dealEscrowSum);
  if (delta > 1) {
    issues.push(
      `Wallet escrow (${wallet.escrow_balance}) ≠ deal escrow sum (${dealEscrowSum}), delta: ${delta}`
    );
    log.warn("Escrow mismatch detected", { userId, walletEscrow: wallet.escrow_balance, dealSum: dealEscrowSum });
  }

  return {
    consistent: issues.length === 0,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Quick non-negative balance check — no joins, single query.
 */
export async function checkWalletNonNegative(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("wallets")
    .select("available_balance, escrow_balance, pending_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return true; // No wallet = OK

  return data.available_balance >= 0 && data.escrow_balance >= 0 && data.pending_balance >= 0;
}
