/**
 * GMV Tracking Engine — calculates Gross Merchandise Value from funded/completed deals.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("gmvTracker");

export interface GMVSnapshot {
  tenantId: string | null;
  period: string;
  gmv: number;
}

async function sumDealAmounts(
  filter: { tenantId?: string; from?: string; to?: string; statuses?: string[] }
): Promise<number> {
  let query = supabase
    .from("deal_rooms")
    .select("escrow_amount")
    .in("escrow_status", filter.statuses ?? ["funded", "released"]);

  if (filter.tenantId) query = query.eq("tenant_id", filter.tenantId);
  if (filter.from) query = query.gte("created_at", filter.from);
  if (filter.to) query = query.lte("created_at", filter.to);

  const { data } = await query;
  return (data ?? []).reduce((sum, d) => sum + (d.escrow_amount ?? 0), 0);
}

export async function calculateTotalGMV(tenantId?: string): Promise<number> {
  return sumDealAmounts({ tenantId, statuses: ["funded", "released"] });
}

export async function calculateMonthlyGMV(month: string, tenantId?: string): Promise<number> {
  const from = `${month}-01T00:00:00Z`;
  const y = parseInt(month.split("-")[0]);
  const m = parseInt(month.split("-")[1]);
  const to = new Date(y, m, 0, 23, 59, 59).toISOString();
  return sumDealAmounts({ tenantId, from, to });
}

export async function calculateDailyGMV(tenantId?: string): Promise<number> {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  return sumDealAmounts({ tenantId, from: from.toISOString() });
}

export async function calculateRollingGMV(days: number, tenantId?: string): Promise<number> {
  const from = new Date(Date.now() - days * 86400_000).toISOString();
  return sumDealAmounts({ tenantId, from });
}

export async function snapshotGMV(tenantId: string | null, periodType: "daily" | "monthly"): Promise<void> {
  const gmv = tenantId ? await calculateTotalGMV(tenantId) : await calculateTotalGMV();
  try {
    await (supabase as any).from("revenue_snapshots").insert({
      tenant_id: tenantId,
      period_type: periodType,
      gmv,
    });
    log.info("GMV snapshot saved", { tenantId, periodType, gmv });
  } catch {
    log.warn("Failed to persist GMV snapshot");
  }
}
