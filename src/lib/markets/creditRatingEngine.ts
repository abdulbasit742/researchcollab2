/**
 * Institutional Credit Rating Engine — AAA→D scale mapped to 0–100.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("creditRatingEngine");

export type RatingBand = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC" | "CC" | "C" | "D";

export interface InstitutionCreditProfile {
  tenantId: string;
  creditScore: number;
  ratingBand: RatingBand;
  volatilityIndex: number;
  capitalAccessLimit: number;
  bondIssuanceLimit: number;
}

export function scoreToRatingBand(score: number): RatingBand {
  if (score >= 95) return "AAA";
  if (score >= 85) return "AA";
  if (score >= 75) return "A";
  if (score >= 65) return "BBB";
  if (score >= 55) return "BB";
  if (score >= 45) return "B";
  if (score >= 35) return "CCC";
  if (score >= 25) return "CC";
  if (score >= 15) return "C";
  return "D";
}

export async function calculateInstitutionCreditScore(tenantId: string): Promise<InstitutionCreditProfile> {
  const { data: deals } = await supabase.from("deal_rooms").select("status").eq("tenant_id", tenantId) as { data: any[] | null };
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d: any) => d.status === "completed").length;
  const disputed = allDeals.filter((d: any) => d.status === "disputed").length;
  const completionRate = allDeals.length > 0 ? completed / allDeals.length : 0;
  const disputeRate = allDeals.length > 0 ? disputed / allDeals.length : 0;

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated").eq("tenant_id", tenantId);
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const capitalReturn = totalCommitted > 0 ? Math.min(1, totalAllocated / totalCommitted) : 0;

  const weights = { completion: 0.25, dispute: 0.20, capitalReturn: 0.20, compliance: 0.15, trust: 0.10, liquidity: 0.10 };

  const complianceHealth = 0.7; // baseline
  const trustStability = 0.6;
  const liquidityDiscipline = capitalReturn;

  const composite =
    completionRate * weights.completion +
    (1 - disputeRate) * weights.dispute +
    capitalReturn * weights.capitalReturn +
    complianceHealth * weights.compliance +
    trustStability * weights.trust +
    liquidityDiscipline * weights.liquidity;

  const creditScore = Math.max(0, Math.min(100, Math.round(composite * 100)));
  const ratingBand = scoreToRatingBand(creditScore);

  const volatility = Math.round(Math.abs(disputeRate - completionRate) * 50);
  const capitalAccessLimit = Math.round(50000 + creditScore * 5000);
  const bondIssuanceLimit = Math.round(25000 + creditScore * 2500);

  // Upsert
  await (supabase as any).from("institution_credit_profiles").upsert({
    tenant_id: tenantId, credit_score: creditScore, rating_band: ratingBand,
    volatility_index: volatility, completion_rate: completionRate, dispute_rate: disputeRate,
    capital_return_consistency: capitalReturn, compliance_health: complianceHealth * 100,
    trust_stability: trustStability * 100, liquidity_discipline: liquidityDiscipline * 100,
    capital_access_limit: capitalAccessLimit, bond_issuance_limit: bondIssuanceLimit,
    governance_participation: 50, updated_at: new Date().toISOString(),
  }, { onConflict: "tenant_id" });

  log.info("Credit score calculated", { tenantId, creditScore, ratingBand });
  return { tenantId, creditScore, ratingBand, volatilityIndex: volatility, capitalAccessLimit, bondIssuanceLimit };
}

export async function getInstitutionCreditProfile(tenantId: string): Promise<InstitutionCreditProfile | null> {
  const { data } = await (supabase as any).from("institution_credit_profiles").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (!data) return null;
  return {
    tenantId: data.tenant_id, creditScore: data.credit_score, ratingBand: data.rating_band,
    volatilityIndex: data.volatility_index, capitalAccessLimit: data.capital_access_limit, bondIssuanceLimit: data.bond_issuance_limit,
  };
}
