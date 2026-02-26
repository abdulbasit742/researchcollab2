/**
 * Wallet Collision Simulator — tests concurrent wallet mutations for invariant safety.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";

/**
 * Simulate concurrent withdrawals from the same wallet.
 */
export async function simulateConcurrentWithdrawals(userId: string, count = 10): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");

  const { data: walletBefore } = await supabase
    .from("wallets")
    .select("id, available_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (!walletBefore) throw new Error("Wallet not found");

  const withdrawAmount = 10;

  const results: ChaosResult[] = [];

  const promises = Array.from({ length: count }, async (_, i) => {
    const start = performance.now();
    try {
      const { error } = await supabase
        .from("wallets")
        .update({
          available_balance: Math.max(0, walletBefore.available_balance - withdrawAmount),
          updated_at: new Date().toISOString(),
        })
        .eq("id", walletBefore.id);

      return {
        operation: `concurrent_withdraw_${i}`,
        success: !error,
        durationMs: Math.round(performance.now() - start),
        error: error?.message,
      } as ChaosResult;
    } catch (err) {
      return {
        operation: `concurrent_withdraw_${i}`,
        success: false,
        durationMs: Math.round(performance.now() - start),
        error: String(err),
      } as ChaosResult;
    }
  });

  results.push(...await Promise.all(promises));

  // Post-check: balance should not be negative
  const { data: walletAfter } = await supabase
    .from("wallets")
    .select("available_balance, escrow_balance")
    .eq("id", walletBefore.id)
    .maybeSingle();

  results.push({
    operation: "wallet_negative_balance_check",
    success: (walletAfter?.available_balance ?? 0) >= 0,
    durationMs: 0,
    invariantViolation: (walletAfter?.available_balance ?? 0) < 0,
    error: (walletAfter?.available_balance ?? 0) < 0 ? `NEGATIVE BALANCE: ${walletAfter?.available_balance}` : undefined,
  });

  const report = buildChaosReport("wallet_concurrent_withdrawals", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
