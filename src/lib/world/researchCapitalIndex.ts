/**
 * Research Capital Index System — S&P-like indices for research capital.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("researchCapitalIndex");

export interface CapitalIndex {
  regionId: string | null;
  regionCode: string;
  innovationIndex: number;
  capitalVelocityIndex: number;
  completionIndex: number;
  riskAdjustedReturnIndex: number;
  compositeIndex: number;
}

export async function generateCapitalIndices(): Promise<CapitalIndex[]> {
  const { data: regions } = await (supabase as any).from("regions").select("id, code").eq("status", "active");
  const indices: CapitalIndex[] = [];

  for (const region of regions ?? []) {
    const { data: tenants } = await (supabase as any).from("tenants").select("id").eq("region_id", region.id);
    const tenantIds = (tenants ?? []).map((t: any) => t.id);

    if (tenantIds.length === 0) {
      indices.push({ regionId: region.id, regionCode: region.code, innovationIndex: 0, capitalVelocityIndex: 0, completionIndex: 0, riskAdjustedReturnIndex: 0, compositeIndex: 0 });
      continue;
    }

    // Deals in region
    const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount").in("tenant_id", tenantIds.slice(0, 100));
    const allDeals = deals ?? [];
    const completed = allDeals.filter((d) => d.status === "completed");
    const completionIndex = allDeals.length > 0 ? Math.round((completed.length / allDeals.length) * 100) : 0;

    // Capital velocity
    const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount").eq("status", "completed");
    const routeVolume = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
    const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed").in("tenant_id", tenantIds.slice(0, 100));
    const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
    const capitalVelocityIndex = totalCapital > 0 ? Math.min(100, Math.round((routeVolume / totalCapital) * 100)) : 0;

    // Innovation index
    const gmv = completed.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
    const innovationIndex = Math.min(100, Math.round(completionIndex * 0.4 + capitalVelocityIndex * 0.3 + Math.min(30, tenantIds.length * 3) + 0.3));

    // Risk-adjusted return
    const disputed = allDeals.filter((d) => d.status === "disputed").length;
    const disputeRate = allDeals.length > 0 ? (disputed / allDeals.length) * 100 : 0;
    const riskAdjustedReturnIndex = Math.max(0, Math.round(completionIndex - disputeRate * 1.5));

    const compositeIndex = Math.round(innovationIndex * 0.3 + capitalVelocityIndex * 0.25 + completionIndex * 0.25 + riskAdjustedReturnIndex * 0.2);

    // Store snapshot
    await (supabase as any).from("capital_index_snapshots").insert({
      region_id: region.id, innovation_index: innovationIndex,
      capital_velocity_index: capitalVelocityIndex, completion_index: completionIndex,
      risk_adjusted_return_index: riskAdjustedReturnIndex,
    });

    indices.push({ regionId: region.id, regionCode: region.code, innovationIndex, capitalVelocityIndex, completionIndex, riskAdjustedReturnIndex, compositeIndex });
  }

  log.info("Capital indices generated", { regionCount: indices.length });
  return indices;
}
