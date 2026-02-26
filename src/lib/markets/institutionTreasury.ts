/**
 * Institutional Treasury Layer — reserve allocation, bond investment, pool participation.
 */

import { supabase } from "@/integrations/supabase/client";
import { getInstitutionCreditProfile } from "./creditRatingEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("institutionTreasury");

export interface TreasuryPosition {
  tenantId: string;
  reserveCapital: number;
  bondInvestments: number;
  poolParticipations: number;
  crossBorderExposure: number;
  totalTreasuryValue: number;
  diversificationScore: number;
}

export async function getTreasuryPosition(tenantId: string): Promise<TreasuryPosition> {
  const credit = await getInstitutionCreditProfile(tenantId);
  const capitalCap = credit?.capitalAccessLimit ?? 100000;

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated").eq("tenant_id", tenantId);
  const reserveCapital = (pools ?? []).reduce((s: number, p: any) => s + ((p.total_committed ?? 0) - (p.total_allocated ?? 0)), 0);
  const poolParticipations = (pools ?? []).length;

  const { data: bonds } = await (supabase as any).from("research_bonds").select("total_principal, status").eq("issuing_institution", tenantId);
  const activeBonds = (bonds ?? []).filter((b: any) => b.status === "active");
  const bondInvestments = activeBonds.reduce((s: number, b: any) => s + (b.total_principal ?? 0), 0);

  const { data: assets } = await (supabase as any).from("research_capital_assets").select("total_value, backing_type").eq("tenant_id", tenantId).eq("is_active", true);
  const crossBorder = (assets ?? []).filter((a: any) => a.backing_type === "cross_border_research").reduce((s: number, a: any) => s + (a.total_value ?? 0), 0);

  const total = reserveCapital + bondInvestments + crossBorder;
  const components = [reserveCapital, bondInvestments, crossBorder].filter(v => v > 0).length;
  const diversification = Math.min(100, components * 25 + (total > 0 ? 15 : 0));

  log.info("Treasury position calculated", { tenantId, total });

  return {
    tenantId, reserveCapital: Math.max(0, reserveCapital), bondInvestments,
    poolParticipations, crossBorderExposure: crossBorder,
    totalTreasuryValue: Math.min(total, capitalCap), diversificationScore: diversification,
  };
}
