/**
 * Research-Backed Reserve Unit Model (RERU).
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveUnit");

export interface ReserveUnit {
  id: string;
  backingCapitalAmount: number;
  backingPoolId: string | null;
  regionScope: string[];
  trustWeight: number;
  riskWeight: number;
  complianceStatus: string;
  issuingInstitution: string | null;
  unitValue: number;
  isRedeemed: boolean;
  issuedAt: string;
}

export async function getReserveUnits(opts?: { institution?: string; activeOnly?: boolean }): Promise<ReserveUnit[]> {
  let query = (supabase as any).from("reserve_units").select("*").order("issued_at", { ascending: false });
  if (opts?.institution) query = query.eq("issuing_institution", opts.institution);
  if (opts?.activeOnly) query = query.eq("is_redeemed", false).in("compliance_status", ["approved", "active"]);
  const { data } = await query;
  return (data ?? []).map(mapUnit);
}

export async function getTotalReserveSupply(): Promise<{ totalUnits: number; totalBacking: number; totalValue: number }> {
  const { data } = await (supabase as any).from("reserve_units").select("backing_capital_amount, unit_value").eq("is_redeemed", false);
  const units = data ?? [];
  return {
    totalUnits: units.length,
    totalBacking: units.reduce((s: number, u: any) => s + (u.backing_capital_amount ?? 0), 0),
    totalValue: units.reduce((s: number, u: any) => s + (u.unit_value ?? 0), 0),
  };
}

function mapUnit(d: any): ReserveUnit {
  return {
    id: d.id, backingCapitalAmount: d.backing_capital_amount, backingPoolId: d.backing_pool_id,
    regionScope: d.region_scope, trustWeight: d.trust_weight, riskWeight: d.risk_weight,
    complianceStatus: d.compliance_status, issuingInstitution: d.issuing_institution,
    unitValue: d.unit_value, isRedeemed: d.is_redeemed, issuedAt: d.issued_at,
  };
}
