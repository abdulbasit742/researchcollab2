/**
 * Risk-Weighted Reserve Cap Model — prevents reserve inflation.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveCapModel");

export interface ReserveCaps {
  maxIssuancePerRegion: number;
  maxIssuancePerInstitution: number;
  crossBorderIssuanceLimit: number;
  riskAdjustedBackingRatio: number;
  capitalConcentrationCap: number;
}

const DEFAULT_CAPS: ReserveCaps = {
  maxIssuancePerRegion: 5000000,
  maxIssuancePerInstitution: 1000000,
  crossBorderIssuanceLimit: 2000000,
  riskAdjustedBackingRatio: 1.0,
  capitalConcentrationCap: 0.3,
};

export interface CapValidation {
  allowed: boolean;
  violations: string[];
  currentCaps: ReserveCaps;
}

export async function validateIssuanceCaps(institutionId: string, amount: number, regionScope: string[]): Promise<CapValidation> {
  const violations: string[] = [];

  // Institution cap
  const { data: instUnits } = await (supabase as any).from("reserve_units")
    .select("backing_capital_amount").eq("issuing_institution", institutionId).eq("is_redeemed", false);
  const instTotal = (instUnits ?? []).reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0);
  if (instTotal + amount > DEFAULT_CAPS.maxIssuancePerInstitution) {
    violations.push(`Institution cap exceeded: ${instTotal + amount} > ${DEFAULT_CAPS.maxIssuancePerInstitution}`);
  }

  // Region cap
  for (const region of regionScope) {
    const { data: regionUnits } = await (supabase as any).from("reserve_units")
      .select("backing_capital_amount").eq("is_redeemed", false).contains("region_scope", [region]);
    const regionTotal = (regionUnits ?? []).reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0);
    if (regionTotal + amount > DEFAULT_CAPS.maxIssuancePerRegion) {
      violations.push(`Region ${region} cap exceeded: ${regionTotal + amount} > ${DEFAULT_CAPS.maxIssuancePerRegion}`);
    }
  }

  // Cross-border cap
  if (regionScope.length > 1) {
    const { data: crossUnits } = await (supabase as any).from("reserve_units")
      .select("backing_capital_amount, region_scope").eq("is_redeemed", false);
    const crossTotal = (crossUnits ?? []).filter((u: any) => (u.region_scope ?? []).length > 1)
      .reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0);
    if (crossTotal + amount > DEFAULT_CAPS.crossBorderIssuanceLimit) {
      violations.push(`Cross-border issuance limit exceeded`);
    }
  }

  log.info("Issuance cap validation", { institutionId, violations: violations.length });
  return { allowed: violations.length === 0, violations, currentCaps: DEFAULT_CAPS };
}
