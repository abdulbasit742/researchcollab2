/**
 * Escrow-Collateralized Issuance Engine — no synthetic expansion.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("issuanceEngine");

const MIN_BACKING_RATIO = 1.0; // 100% collateralized

export interface IssuanceResult {
  unitId: string;
  backingAmount: number;
  unitValue: number;
  trustWeight: number;
  riskWeight: number;
}

export async function issueReserveUnits(params: {
  capitalPoolId: string; amount: number; issuingInstitution: string; regionScope?: string[];
}): Promise<IssuanceResult> {
  if (params.amount <= 0) throw new Error("Amount must be positive");

  // Verify pool has locked capital
  const { data: pool } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated").eq("id", params.capitalPoolId).maybeSingle();
  if (!pool) throw new Error("Capital pool not found");

  const available = (pool.total_committed ?? 0) - (pool.total_allocated ?? 0);
  if (params.amount > available) throw new Error(`Insufficient escrow-locked capital. Available: ${available}, Requested: ${params.amount}`);

  // Backing ratio enforcement
  const backingRatio = available / params.amount;
  if (backingRatio < MIN_BACKING_RATIO) throw new Error("Backing ratio below minimum — no synthetic expansion allowed");

  // Risk simulation
  const riskWeight = Math.max(0.5, Math.min(2.0, 1.0 + (1 - backingRatio) * 2));
  const trustWeight = Math.max(0.5, Math.min(1.5, backingRatio * 0.8 + 0.2));
  const unitValue = Math.round(params.amount * trustWeight / riskWeight * 100) / 100;

  const { data, error } = await (supabase as any).from("reserve_units").insert({
    backing_capital_amount: params.amount,
    backing_pool_id: params.capitalPoolId,
    region_scope: params.regionScope ?? [],
    trust_weight: trustWeight,
    risk_weight: riskWeight,
    compliance_status: "pending",
    issuing_institution: params.issuingInstitution,
    unit_value: unitValue,
  }).select("id").single();

  if (error) throw new Error(`Issuance failed: ${error.message}`);
  log.info("Reserve units issued", { unitId: data.id, amount: params.amount, unitValue });
  return { unitId: data.id, backingAmount: params.amount, unitValue, trustWeight, riskWeight };
}
