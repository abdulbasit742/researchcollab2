/**
 * Institutional Reserve Allocation System — credit-rated, risk-capped.
 */

import { supabase } from "@/integrations/supabase/client";
import { getInstitutionCreditProfile } from "@/lib/markets/creditRatingEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveAllocation");

export interface ReserveHolding {
  tenantId: string;
  totalUnitsHeld: number;
  totalBackingValue: number;
  totalUnitValue: number;
  regionExposure: Record<string, number>;
  withinCreditLimit: boolean;
}

export async function getInstitutionReserveHolding(tenantId: string): Promise<ReserveHolding> {
  const { data: units } = await (supabase as any).from("reserve_units")
    .select("backing_capital_amount, unit_value, region_scope")
    .eq("issuing_institution", tenantId).eq("is_redeemed", false);

  const allUnits = units ?? [];
  const regionExposure: Record<string, number> = {};
  for (const u of allUnits) {
    for (const r of u.region_scope ?? []) {
      regionExposure[r] = (regionExposure[r] ?? 0) + (u.unit_value ?? 0);
    }
  }

  const credit = await getInstitutionCreditProfile(tenantId);
  const totalValue = allUnits.reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0);
  const withinLimit = !credit || totalValue <= credit.capitalAccessLimit;

  log.info("Reserve holding calculated", { tenantId, units: allUnits.length });

  return {
    tenantId, totalUnitsHeld: allUnits.length,
    totalBackingValue: allUnits.reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0),
    totalUnitValue: totalValue, regionExposure, withinCreditLimit: withinLimit,
  };
}
