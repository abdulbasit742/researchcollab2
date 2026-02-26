/**
 * Regional Growth Signal Mapper — heatmap data for capital allocation zones.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("regionalMapper");

export interface RegionalGrowthSignal {
  regionId: string;
  regionCode: string;
  capitalAllocation: number;
  innovationOutput: number;
  riskLevel: "low" | "medium" | "high";
  growthSignal: "under_allocated" | "balanced" | "over_allocated" | "innovation_desert";
  synergyCorridors: string[];
  signalStrength: number;
}

export async function mapRegionalGrowth(): Promise<RegionalGrowthSignal[]> {
  const { data: regions } = await (supabase as any).from("regions").select("id, code").eq("status", "active");
  const signals: RegionalGrowthSignal[] = [];

  for (const region of regions ?? []) {
    const { data: tenants } = await (supabase as any).from("tenants").select("id").eq("region_id", region.id);
    const tenantIds = (tenants ?? []).map((t: any) => t.id);

    let capitalAllocation = 0;
    let innovationOutput = 0;

    if (tenantIds.length > 0) {
      const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated").in("tenant_id", tenantIds.slice(0, 100));
      capitalAllocation = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

      const { data: deals } = await supabase.from("deal_rooms").select("status").in("tenant_id", tenantIds.slice(0, 100)) as { data: any[] | null };
      innovationOutput = (deals ?? []).filter((d: any) => d.status === "completed").length;
    }

    const efficiency = capitalAllocation > 0 ? innovationOutput / (capitalAllocation / 10000) : 0;
    const riskLevel = efficiency < 0.3 ? "high" : efficiency < 0.7 ? "medium" : "low";

    let growthSignal: RegionalGrowthSignal["growthSignal"];
    if (capitalAllocation === 0 && tenantIds.length > 0) growthSignal = "innovation_desert";
    else if (efficiency > 1.2) growthSignal = "under_allocated";
    else if (efficiency < 0.3) growthSignal = "over_allocated";
    else growthSignal = "balanced";

    const signalStrength = Math.min(100, Math.round(
      (tenantIds.length * 10) + (innovationOutput * 5) + (growthSignal === "under_allocated" ? 20 : 0)
    ));

    signals.push({
      regionId: region.id, regionCode: region.code, capitalAllocation, innovationOutput,
      riskLevel, growthSignal, synergyCorridors: [], signalStrength,
    });
  }

  log.info("Regional growth mapped", { regionCount: signals.length });
  return signals;
}
