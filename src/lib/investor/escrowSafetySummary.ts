/**
 * Escrow Safety Summary — deal safety metrics for investor confidence.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowSafety");

export interface EscrowSafetySummary {
  totalFundedDeals: number;
  totalCompletedDeals: number;
  totalDisputedDeals: number;
  totalRefundedDeals: number;
  disputeRate: number;
  refundRate: number;
  avgEscrowHoldTimeHours: number;
  milestoneApprovalWithoutDisputePercent: number;
}

export async function generateEscrowSafetySummary(): Promise<EscrowSafetySummary> {
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id, status, escrow_status, created_at, completed_at")
    .limit(2000);

  const all = deals ?? [];
  const funded = all.filter((d) => ["funded", "released"].includes(d.escrow_status ?? ""));
  const completed = all.filter((d) => d.status === "completed");
  const disputed = all.filter((d) => d.status === "disputed");
  const refunded = all.filter((d) => d.escrow_status === "refunded");

  const totalFundedDeals = funded.length;
  const disputeRate = all.length > 0 ? Math.round((disputed.length / all.length) * 100) : 0;
  const refundRate = all.length > 0 ? Math.round((refunded.length / all.length) * 100) : 0;

  // Average hold time for completed deals
  const holdTimes: number[] = [];
  for (const d of completed) {
    if (d.completed_at && d.created_at) {
      holdTimes.push(
        (new Date(d.completed_at).getTime() - new Date(d.created_at).getTime()) / 3600_000
      );
    }
  }
  const avgEscrowHoldTimeHours = holdTimes.length > 0
    ? Math.round(holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length)
    : 0;

  // Milestone approval without dispute
  const nonDisputedCompleted = completed.filter((d) => d.status !== "disputed");
  const milestoneApprovalWithoutDisputePercent = completed.length > 0
    ? Math.round((nonDisputedCompleted.length / completed.length) * 100)
    : 100;

  log.info("Escrow safety summary generated", { totalFundedDeals, disputeRate });
  return {
    totalFundedDeals,
    totalCompletedDeals: completed.length,
    totalDisputedDeals: disputed.length,
    totalRefundedDeals: refunded.length,
    disputeRate,
    refundRate,
    avgEscrowHoldTimeHours,
    milestoneApprovalWithoutDisputePercent,
  };
}
