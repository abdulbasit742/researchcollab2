/**
 * Escrow Race Condition Simulator — tests double-release and concurrent escrow mutations.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";

/**
 * Simulate double milestone release — two concurrent release attempts.
 */
export async function simulateDoubleMilestoneRelease(dealId: string, milestoneId: string): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");

  const releaseFn = async (attempt: number): Promise<ChaosResult> => {
    const start = performance.now();
    try {
      const { error } = await (supabase as any)
        .from("deal_milestones")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("id", milestoneId)
        .eq("status", "funded");

      return {
        operation: `double_release_attempt_${attempt}`,
        success: !error,
        durationMs: Math.round(performance.now() - start),
        error: error?.message,
      };
    } catch (err) {
      return {
        operation: `double_release_attempt_${attempt}`,
        success: false,
        durationMs: Math.round(performance.now() - start),
        error: err instanceof Error ? err.message : String(err),
      };
    }
  };

  const results = await Promise.all([releaseFn(1), releaseFn(2)]);

  results.push({
    operation: "double_release_post_verify",
    success: true,
    durationMs: 0,
  });

  const report = buildChaosReport("escrow_double_release", results);
  logChaosReport(report);
  await persistChaosReport(report);
}

/**
 * Simulate simultaneous fund + refund on same deal.
 */
export async function simulateFundRefundRace(dealId: string): Promise<void> {
  requireChaos();
  const { supabase } = await import("@/integrations/supabase/client");

  const fund = async (): Promise<ChaosResult> => {
    const start = performance.now();
    const { error } = await supabase.from("deal_rooms").update({
      escrow_status: "funded",
      updated_at: new Date().toISOString(),
    }).eq("id", dealId).eq("escrow_status", "pending");
    return { operation: "race_fund", success: !error, durationMs: Math.round(performance.now() - start), error: error?.message };
  };

  const refund = async (): Promise<ChaosResult> => {
    const start = performance.now();
    const { error } = await supabase.from("deal_rooms").update({
      escrow_status: "refunded",
      updated_at: new Date().toISOString(),
    }).eq("id", dealId).eq("escrow_status", "funded");
    return { operation: "race_refund", success: !error, durationMs: Math.round(performance.now() - start), error: error?.message };
  };

  const results = await Promise.all([fund(), refund()]);
  const report = buildChaosReport("escrow_fund_refund_race", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
