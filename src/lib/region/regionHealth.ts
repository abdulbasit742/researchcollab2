/**
 * Regional Health Monitor — per-region system health checks.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("regionHealth");

export interface RegionHealthStatus {
  regionId: string;
  regionCode: string;
  dbHealthy: boolean;
  stripeHealthy: boolean;
  escrowIntegrity: boolean;
  walletIntegrity: boolean;
  poolHealthScore: number;
  anomalyCount: number;
  checkedAt: string;
}

export async function checkRegionHealth(regionId: string): Promise<RegionHealthStatus> {
  const { data: region } = await (supabase as any)
    .from("regions")
    .select("id, code, stripe_account_id")
    .eq("id", regionId)
    .single();

  if (!region) throw new Error("Region not found");

  // DB health: can we query tenants?
  const { error: dbErr } = await (supabase as any)
    .from("tenants")
    .select("id")
    .eq("region_id", regionId)
    .limit(1);

  const dbHealthy = !dbErr;

  // Stripe health: account configured?
  const stripeHealthy = !!region.stripe_account_id;

  // Wallet integrity: no negative balances in region
  const { data: tenants } = await (supabase as any)
    .from("tenants").select("id").eq("region_id", regionId).limit(100);
  const tenantIds = (tenants ?? []).map((t: any) => t.id);

  let walletIntegrity = true;
  if (tenantIds.length > 0) {
    const { data: negWallets } = await (supabase as any)
      .from("wallets").select("id").in("tenant_id", tenantIds.slice(0, 50)).lt("available_balance", 0).limit(1);
    walletIntegrity = !(negWallets && negWallets.length > 0);
  }

  const status: RegionHealthStatus = {
    regionId: region.id,
    regionCode: region.code,
    dbHealthy,
    stripeHealthy,
    escrowIntegrity: true, // Assume OK; full check via escrow integrity service
    walletIntegrity,
    poolHealthScore: 100,
    anomalyCount: 0,
    checkedAt: new Date().toISOString(),
  };

  // Snapshot
  await (supabase as any).from("region_health_snapshots").insert({
    region_id: regionId,
    db_healthy: dbHealthy,
    stripe_healthy: stripeHealthy,
    escrow_integrity: status.escrowIntegrity,
    wallet_integrity: walletIntegrity,
    pool_health_score: status.poolHealthScore,
    anomaly_count: status.anomalyCount,
  });

  log.info("Region health checked", { regionId, dbHealthy, stripeHealthy, walletIntegrity });
  return status;
}

export async function checkAllRegionsHealth(): Promise<RegionHealthStatus[]> {
  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");
  const results: RegionHealthStatus[] = [];
  for (const r of regions ?? []) {
    try {
      results.push(await checkRegionHealth(r.id));
    } catch (err) {
      log.error("Region health check failed", { regionId: r.id, error: (err as Error).message });
    }
  }
  return results;
}
