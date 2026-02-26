/**
 * National Innovation Metrics Engine — aggregated per-region metrics.
 */

import { supabase } from "@/integrations/supabase/client";
import { convertCurrency } from "@/lib/region/currencyService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("nationalMetrics");

export interface NationalMetrics {
  regionId: string;
  regionCode: string;
  totalGMV: number;
  totalFundedProjects: number;
  totalCompletedProjects: number;
  totalCapitalDeployed: number;
  completionRate: number;
  disputeRate: number;
  growthRate: number;
  institutionCount: number;
  timestamp: string;
}

export async function getNationalMetrics(regionId: string): Promise<NationalMetrics> {
  const { data: region } = await (supabase as any).from("regions").select("id, code, currency_default").eq("id", regionId).single();
  if (!region) throw new Error("Region not found");

  // Get tenants in region
  const { data: tenants } = await (supabase as any).from("tenants").select("id").eq("region_id", regionId);
  const tenantIds = (tenants ?? []).map((t: any) => t.id);

  if (tenantIds.length === 0) {
    return {
      regionId, regionCode: region.code, totalGMV: 0, totalFundedProjects: 0,
      totalCompletedProjects: 0, totalCapitalDeployed: 0, completionRate: 0,
      disputeRate: 0, growthRate: 0, institutionCount: 0, timestamp: new Date().toISOString(),
    };
  }

  // Deals
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount").in("tenant_id", tenantIds.slice(0, 100));
  const allDeals = deals ?? [];
  const funded = allDeals.filter((d) => ["funded", "active", "completed"].includes(d.status ?? ""));
  const completed = allDeals.filter((d) => d.status === "completed");
  const disputed = allDeals.filter((d) => d.status === "disputed");

  const totalGMV = funded.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const completionRate = allDeals.length > 0 ? Math.round((completed.length / allDeals.length) * 100) : 0;
  const disputeRate = allDeals.length > 0 ? Math.round((disputed.length / allDeals.length) * 100) : 0;

  // Capital deployed
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated").in("tenant_id", tenantIds.slice(0, 100));
  const totalCapitalDeployed = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  log.info("National metrics calculated", { regionId, institutionCount: tenantIds.length });

  return {
    regionId, regionCode: region.code, totalGMV, totalFundedProjects: funded.length,
    totalCompletedProjects: completed.length, totalCapitalDeployed, completionRate,
    disputeRate, growthRate: 0, institutionCount: tenantIds.length, timestamp: new Date().toISOString(),
  };
}
