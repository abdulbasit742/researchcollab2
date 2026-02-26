/**
 * GMV Breakdown Engine — structured GMV analytics for investor reporting.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("gmvBreakdown");

export interface GMVSegment {
  label: string;
  gmv: number;
  dealCount: number;
}

export interface MonthlyGMV {
  month: string;
  gmv: number;
  growthRate: number | null;
}

export interface GMVBreakdown {
  lifetimeGMV: number;
  gmvByTenant: GMVSegment[];
  gmvByMonth: MonthlyGMV[];
  gmvByDealSize: GMVSegment[];
  avgDealSize: number;
  totalDeals: number;
}

export async function generateGMVBreakdown(): Promise<GMVBreakdown> {
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id, escrow_amount, tenant_id, created_at, escrow_status")
    .in("escrow_status", ["funded", "released"]);

  const validDeals = (deals ?? []).filter((d) => (d.escrow_amount ?? 0) > 0);

  const lifetimeGMV = validDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const totalDeals = validDeals.length;
  const avgDealSize = totalDeals > 0 ? Math.round(lifetimeGMV / totalDeals) : 0;

  // By tenant
  const tenantMap = new Map<string, { gmv: number; count: number }>();
  for (const d of validDeals) {
    const tid = d.tenant_id ?? "global";
    const entry = tenantMap.get(tid) ?? { gmv: 0, count: 0 };
    entry.gmv += d.escrow_amount ?? 0;
    entry.count++;
    tenantMap.set(tid, entry);
  }
  const gmvByTenant: GMVSegment[] = [...tenantMap.entries()].map(([label, v]) => ({
    label,
    gmv: v.gmv,
    dealCount: v.count,
  }));

  // By month
  const monthMap = new Map<string, number>();
  for (const d of validDeals) {
    const month = d.created_at.substring(0, 7);
    monthMap.set(month, (monthMap.get(month) ?? 0) + (d.escrow_amount ?? 0));
  }
  const sortedMonths = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const gmvByMonth: MonthlyGMV[] = sortedMonths.map(([month, gmv], i) => ({
    month,
    gmv,
    growthRate: i > 0 && sortedMonths[i - 1][1] > 0
      ? Math.round(((gmv - sortedMonths[i - 1][1]) / sortedMonths[i - 1][1]) * 100)
      : null,
  }));

  // By deal size segment
  const segments = [
    { label: "Micro (<1K)", min: 0, max: 1000 },
    { label: "Small (1K–5K)", min: 1000, max: 5000 },
    { label: "Medium (5K–25K)", min: 5000, max: 25000 },
    { label: "Large (25K–100K)", min: 25000, max: 100000 },
    { label: "Enterprise (100K+)", min: 100000, max: Infinity },
  ];
  const gmvByDealSize: GMVSegment[] = segments.map((seg) => {
    const matching = validDeals.filter(
      (d) => (d.escrow_amount ?? 0) >= seg.min && (d.escrow_amount ?? 0) < seg.max
    );
    return {
      label: seg.label,
      gmv: matching.reduce((s, d) => s + (d.escrow_amount ?? 0), 0),
      dealCount: matching.length,
    };
  });

  log.info("GMV breakdown generated", { lifetimeGMV, totalDeals });
  return { lifetimeGMV, gmvByTenant, gmvByMonth, gmvByDealSize, avgDealSize, totalDeals };
}
