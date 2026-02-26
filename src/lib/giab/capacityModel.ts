/**
 * Institutional Capacity Modeling — prevents over-allocation beyond capacity.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("capacityModel");

export interface InstitutionalCapacity {
  tenantId: string;
  absorptionCapacity: number;
  capitalScalingLimit: number;
  governanceMaturity: number;
  disputeToleranceLimit: number;
  trustSaturationThreshold: number;
  capacityScore: number;
  canAbsorbMore: boolean;
}

export async function modelInstitutionalCapacity(tenantId: string): Promise<InstitutionalCapacity> {
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount").eq("tenant_id", tenantId) as { data: any[] | null };
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d: any) => d.status === "completed").length;
  const disputed = allDeals.filter((d: any) => d.status === "disputed").length;
  const total = allDeals.length;
  const totalCapital = allDeals.reduce((s: number, d: any) => s + (d.escrow_amount ?? 0), 0);

  const completionRate = total > 0 ? completed / total : 0;
  const disputeRate = total > 0 ? disputed / total : 0;

  // Absorption: how much more can this institution handle
  const baseAbsorption = Math.min(100, completed * 8);
  const absorptionCapacity = Math.round(baseAbsorption * (1 - disputeRate));

  // Scaling limit based on track record
  const capitalScalingLimit = Math.round(totalCapital * (1 + completionRate));

  // Governance maturity proxy
  const governanceMaturity = Math.min(100, Math.round(completionRate * 60 + (total > 10 ? 20 : total * 2) + (disputeRate < 0.1 ? 20 : 0)));

  // Dispute tolerance
  const disputeTolerance = Math.max(0, Math.round(100 - disputeRate * 300));

  // Trust saturation
  const trustSaturation = Math.min(100, Math.round(completionRate * 80 + 20));

  const capacityScore = Math.round(
    absorptionCapacity * 0.25 + governanceMaturity * 0.25 + disputeTolerance * 0.2 + trustSaturation * 0.15 + Math.min(100, capitalScalingLimit / 1000) * 0.15
  );

  const canAbsorbMore = capacityScore > 40 && disputeRate < 0.25;

  log.info("Capacity modeled", { tenantId, capacityScore, canAbsorbMore });

  return {
    tenantId, absorptionCapacity, capitalScalingLimit, governanceMaturity,
    disputeToleranceLimit: disputeTolerance, trustSaturationThreshold: trustSaturation,
    capacityScore: Math.min(100, capacityScore), canAbsorbMore,
  };
}
