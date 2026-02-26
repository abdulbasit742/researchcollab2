/**
 * Cross-Region Analytics Aggregator — read-only aggregate metrics across regions.
 */

import { supabase } from "@/integrations/supabase/client";
import { convertCurrency } from "./currencyService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalAnalytics");

export interface RegionGMV {
  regionId: string;
  regionCode: string;
  regionName: string;
  localGMV: number;
  localCurrency: string;
  gmvUSD: number;
  dealCount: number;
  growthRate: number;
}

export interface GlobalAnalyticsReport {
  totalGMV_USD: number;
  regionBreakdown: RegionGMV[];
  totalDeals: number;
  totalRegions: number;
  timestamp: string;
}

export async function getGlobalAnalytics(): Promise<GlobalAnalyticsReport> {
  const { data: regions } = await (supabase as any)
    .from("regions")
    .select("id, code, name, currency_default")
    .eq("status", "active");

  if (!regions || regions.length === 0) {
    return { totalGMV_USD: 0, regionBreakdown: [], totalDeals: 0, totalRegions: 0, timestamp: new Date().toISOString() };
  }

  const breakdown: RegionGMV[] = [];
  let totalGMV = 0;
  let totalDeals = 0;

  for (const region of regions) {
    // Get tenants in this region
    const { data: tenants } = await (supabase as any)
      .from("tenants")
      .select("id")
      .eq("region_id", region.id);

    const tenantIds = (tenants ?? []).map((t: any) => t.id);

    if (tenantIds.length === 0) {
      breakdown.push({
        regionId: region.id, regionCode: region.code, regionName: region.name,
        localGMV: 0, localCurrency: region.currency_default, gmvUSD: 0, dealCount: 0, growthRate: 0,
      });
      continue;
    }

    // Get deals for these tenants
    const { data: deals } = await supabase
      .from("deal_rooms")
      .select("escrow_amount, status")
      .in("tenant_id", tenantIds.slice(0, 100))
      .in("status", ["completed", "funded", "active"]);

    const localGMV = (deals ?? []).reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
    const dealCount = (deals ?? []).length;

    let gmvUSD = localGMV;
    try {
      gmvUSD = region.currency_default !== "USD" ? convertCurrency(localGMV, region.currency_default, "USD") : localGMV;
    } catch { /* fallback to local */ }

    totalGMV += gmvUSD;
    totalDeals += dealCount;

    breakdown.push({
      regionId: region.id, regionCode: region.code, regionName: region.name,
      localGMV, localCurrency: region.currency_default, gmvUSD, dealCount, growthRate: 0,
    });
  }

  log.info("Global analytics aggregated", { regionCount: regions.length, totalGMV });

  return {
    totalGMV_USD: Math.round(totalGMV * 100) / 100,
    regionBreakdown: breakdown,
    totalDeals,
    totalRegions: regions.length,
    timestamp: new Date().toISOString(),
  };
}
