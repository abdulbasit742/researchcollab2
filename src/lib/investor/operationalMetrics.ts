/**
 * Operational Efficiency Metrics — platform velocity and responsiveness.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("operationalMetrics");

export interface OperationalMetrics {
  avgDealCompletionTimeHours: number;
  avgEscrowVelocityHours: number;
  avgMilestoneApprovalHours: number;
  totalMilestonesProcessed: number;
  dealThroughputPerMonth: number;
}

export async function generateOperationalMetrics(): Promise<OperationalMetrics> {
  // Deal completion time
  const { data: completedDeals } = await supabase
    .from("deal_rooms")
    .select("created_at, completed_at")
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .limit(500);

  const completionTimes = (completedDeals ?? [])
    .filter((d) => d.completed_at && d.created_at)
    .map((d) => (new Date(d.completed_at!).getTime() - new Date(d.created_at).getTime()) / 3600_000);

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const avgDealCompletionTimeHours = avg(completionTimes);
  const avgEscrowVelocityHours = avgDealCompletionTimeHours; // Proxy

  // Milestones via deal_milestones (cast to any for flexibility)
  let totalMilestonesProcessed = 0;
  let avgMilestoneApprovalHours = 0;
  try {
    const { data: milestones, count } = await (supabase as any)
      .from("deal_milestones")
      .select("id, created_at, approved_at", { count: "exact" })
      .limit(500);

    totalMilestonesProcessed = count ?? (milestones?.length ?? 0);
    const approvalTimes = (milestones ?? [])
      .filter((m: any) => m.approved_at && m.created_at)
      .map((m: any) => (new Date(m.approved_at).getTime() - new Date(m.created_at).getTime()) / 3600_000);
    avgMilestoneApprovalHours = avg(approvalTimes);
  } catch {
    // Table may not exist
  }

  // Deal throughput per month (last 90 days)
  const d90 = new Date(Date.now() - 90 * 86400_000).toISOString();
  const { count: recentDeals } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .gte("created_at", d90);

  const dealThroughputPerMonth = Math.round(((recentDeals ?? 0) / 3) * 10) / 10;

  log.info("Operational metrics generated", { avgDealCompletionTimeHours, dealThroughputPerMonth });
  return {
    avgDealCompletionTimeHours,
    avgEscrowVelocityHours,
    avgMilestoneApprovalHours,
    totalMilestonesProcessed,
    dealThroughputPerMonth,
  };
}
