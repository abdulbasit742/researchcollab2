/**
 * Escrow Velocity Metrics — measures speed of capital flow through the system.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowVelocity");

export interface EscrowVelocityMetrics {
  avgFundTimeHours: number;
  avgReleaseTimeHours: number;
  avgCompletionTimeHours: number;
  sampleSize: number;
}

function hoursBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 3600_000;
}

export async function calculateEscrowVelocity(tenantId?: string): Promise<EscrowVelocityMetrics> {
  let query = supabase
    .from("deal_rooms")
    .select("created_at, completed_at, escrow_status, status")
    .in("escrow_status", ["funded", "released"])
    .limit(500);

  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data: deals } = await query;

  if (!deals || deals.length === 0) {
    return { avgFundTimeHours: 0, avgReleaseTimeHours: 0, avgCompletionTimeHours: 0, sampleSize: 0 };
  }

  const completionTimes: number[] = [];

  for (const d of deals) {
    if (d.completed_at && d.created_at) {
      completionTimes.push(hoursBetween(d.created_at, d.completed_at));
    }
  }

  const avg = (arr: number[]) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  const metrics: EscrowVelocityMetrics = {
    avgFundTimeHours: 0, // Would require funded_at column
    avgReleaseTimeHours: 0, // Would require milestone-level tracking
    avgCompletionTimeHours: avg(completionTimes),
    sampleSize: deals.length,
  };

  log.info("Escrow velocity calculated", { ...metrics });
  return metrics;
}
