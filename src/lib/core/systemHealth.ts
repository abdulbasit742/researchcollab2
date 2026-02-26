/**
 * System Health — admin-only diagnostic checks.
 * Validates financial consistency and data integrity.
 */

import { supabase } from "@/integrations/supabase/client";
import { assertAuthenticated, assertAdmin } from "@/lib/security/invariants";
import { createLogger } from "./logger";

const log = createLogger("systemHealth");

export interface HealthCheckResult {
  check: string;
  status: "pass" | "fail" | "warn";
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Check that no wallet has negative available_balance or escrow_balance.
 */
export async function checkWalletConsistency(): Promise<HealthCheckResult> {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  const { data: negativeWallets, error } = await supabase
    .from("wallets")
    .select("id, user_id, available_balance, escrow_balance")
    .or("available_balance.lt.0,escrow_balance.lt.0")
    .limit(10);

  if (error) {
    return { check: "wallet_consistency", status: "fail", message: error.message };
  }

  if (negativeWallets && negativeWallets.length > 0) {
    return {
      check: "wallet_consistency",
      status: "fail",
      message: `Found ${negativeWallets.length} wallet(s) with negative balances`,
      details: { walletIds: negativeWallets.map((w) => w.id) },
    };
  }

  return { check: "wallet_consistency", status: "pass", message: "All wallets consistent" };
}

/**
 * Check that deals with escrow_status "funded" or "active" have matching escrow amounts.
 */
export async function checkDealEscrowConsistency(): Promise<HealthCheckResult> {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  const { data: deals, error } = await supabase
    .from("deal_rooms")
    .select("id, escrow_status, escrow_amount, agreed_amount")
    .in("escrow_status", ["funded", "active"])
    .limit(100);

  if (error) {
    return { check: "deal_escrow_consistency", status: "fail", message: error.message };
  }

  const inconsistent = (deals ?? []).filter(
    (d) => d.escrow_amount !== d.agreed_amount && (d.escrow_amount ?? 0) > 0
  );

  if (inconsistent.length > 0) {
    return {
      check: "deal_escrow_consistency",
      status: "warn",
      message: `${inconsistent.length} deal(s) have mismatched escrow/agreed amounts`,
      details: { dealIds: inconsistent.map((d) => d.id) },
    };
  }

  return { check: "deal_escrow_consistency", status: "pass", message: "All funded deals consistent" };
}

/**
 * Run all health checks.
 */
export async function runAllHealthChecks(): Promise<HealthCheckResult[]> {
  const results = await Promise.allSettled([
    checkWalletConsistency(),
    checkDealEscrowConsistency(),
  ]);

  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      check: `health_check_${i}`,
      status: "fail" as const,
      message: String(r.reason),
    };
  });
}
