/**
 * Cohort Retention Analysis — signup cohort tracking for investors.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("cohortAnalysis");

export interface CohortData {
  cohortMonth: string;
  totalUsers: number;
  activeAfter1Month: number;
  activeAfter3Months: number;
  activeAfter6Months: number;
  retentionRate1m: number;
  retentionRate3m: number;
  retentionRate6m: number;
}

export interface CohortReport {
  sponsorCohorts: CohortData[];
  overallRetention1m: number;
  overallRetention3m: number;
  overallRetention6m: number;
}

export async function generateCohortAnalysis(): Promise<CohortReport> {
  // Get all sponsors (users who have created deals as buyer)
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("buyer_id, created_at")
    .not("buyer_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(2000);

  if (!deals || deals.length === 0) {
    return { sponsorCohorts: [], overallRetention1m: 0, overallRetention3m: 0, overallRetention6m: 0 };
  }

  // Map sponsor → first deal date + all deal dates
  const sponsorActivity = new Map<string, string[]>();
  for (const d of deals) {
    const dates = sponsorActivity.get(d.buyer_id) ?? [];
    dates.push(d.created_at);
    sponsorActivity.set(d.buyer_id, dates);
  }

  // Group by signup cohort month (first deal month)
  const cohortMap = new Map<string, { total: number; active1m: number; active3m: number; active6m: number }>();

  for (const [, dates] of sponsorActivity) {
    dates.sort();
    const firstDate = new Date(dates[0]);
    const cohortMonth = dates[0].substring(0, 7);

    const entry = cohortMap.get(cohortMonth) ?? { total: 0, active1m: 0, active3m: 0, active6m: 0 };
    entry.total++;

    const hasActivityAfter = (months: number) =>
      dates.some((d) => new Date(d).getTime() > firstDate.getTime() + months * 30 * 86400_000);

    if (hasActivityAfter(1)) entry.active1m++;
    if (hasActivityAfter(3)) entry.active3m++;
    if (hasActivityAfter(6)) entry.active6m++;

    cohortMap.set(cohortMonth, entry);
  }

  const sponsorCohorts: CohortData[] = [...cohortMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cohortMonth, data]) => ({
      cohortMonth,
      totalUsers: data.total,
      activeAfter1Month: data.active1m,
      activeAfter3Months: data.active3m,
      activeAfter6Months: data.active6m,
      retentionRate1m: data.total > 0 ? Math.round((data.active1m / data.total) * 100) : 0,
      retentionRate3m: data.total > 0 ? Math.round((data.active3m / data.total) * 100) : 0,
      retentionRate6m: data.total > 0 ? Math.round((data.active6m / data.total) * 100) : 0,
    }));

  const totals = sponsorCohorts.reduce(
    (acc, c) => ({
      total: acc.total + c.totalUsers,
      a1: acc.a1 + c.activeAfter1Month,
      a3: acc.a3 + c.activeAfter3Months,
      a6: acc.a6 + c.activeAfter6Months,
    }),
    { total: 0, a1: 0, a3: 0, a6: 0 }
  );

  log.info("Cohort analysis generated", { cohortCount: sponsorCohorts.length });
  return {
    sponsorCohorts,
    overallRetention1m: totals.total > 0 ? Math.round((totals.a1 / totals.total) * 100) : 0,
    overallRetention3m: totals.total > 0 ? Math.round((totals.a3 / totals.total) * 100) : 0,
    overallRetention6m: totals.total > 0 ? Math.round((totals.a6 / totals.total) * 100) : 0,
  };
}
