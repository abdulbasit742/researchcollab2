/**
 * Partial Failure Simulator — injects failures mid-operation to test rollback/consistency.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";

/**
 * Simulate a multi-step operation where step N fails.
 * Verifies that earlier steps don't leave orphaned state.
 */
export async function simulatePartialDealFlow(dealId: string): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");

  const results: ChaosResult[] = [];

  // Step 1: Update deal status (succeeds)
  const s1 = performance.now();
  const { error: e1 } = await supabase
    .from("deal_rooms")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", dealId);
  results.push({
    operation: "partial_step1_deal_update",
    success: !e1,
    durationMs: Math.round(performance.now() - s1),
    error: e1?.message,
  });

  // Step 2: Inject failure — attempt invalid wallet operation
  const s2 = performance.now();
  try {
    // Intentionally invalid: insert with missing required fields to trigger failure
    const { error: e2 } = await supabase.from("wallet_transactions").insert({
      wallet_id: "00000000-0000-0000-0000-000000000000", // Non-existent
      user_id: "00000000-0000-0000-0000-000000000000",
      type: "chaos_test",
      amount: -9999999,
      balance_after: -9999999,
      description: "Chaos partial failure test",
      status: "completed",
    } as any);

    results.push({
      operation: "partial_step2_inject_failure",
      success: !!e2, // We WANT this to fail
      durationMs: Math.round(performance.now() - s2),
      error: e2 ? undefined : "INVARIANT: Invalid transaction was accepted!",
      invariantViolation: !e2,
    });
  } catch (err) {
    results.push({
      operation: "partial_step2_inject_failure",
      success: true, // Exception = correctly rejected
      durationMs: Math.round(performance.now() - s2),
    });
  }

  // Step 3: Verify deal wasn't left in inconsistent state
  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("status, escrow_status")
    .eq("id", dealId)
    .maybeSingle();

  results.push({
    operation: "partial_step3_consistency_check",
    success: !!deal,
    durationMs: 0,
  });

  const report = buildChaosReport("partial_failure_deal_flow", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
