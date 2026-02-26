/**
 * Research Bond Framework — institution-issued, escrow-locked bonds.
 */

import { supabase } from "@/integrations/supabase/client";
import { getInstitutionCreditProfile } from "./creditRatingEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("researchBondEngine");

export interface ResearchBond {
  id: string;
  issuingInstitution: string;
  bondName: string;
  totalPrincipal: number;
  maturityDate: string;
  riskScore: number;
  escrowLockedAmount: number;
  defaultProbability: number;
  couponRate: number;
  status: string;
  backingAssetIds: string[];
}

export async function issueResearchBond(params: {
  issuingInstitution: string; bondName: string; totalPrincipal: number;
  maturityDate: string; escrowLockedAmount: number; backingAssetIds?: string[]; regionScope?: string[];
}): Promise<string> {
  // Verify credit profile
  const credit = await getInstitutionCreditProfile(params.issuingInstitution);
  if (!credit) throw new Error("Institution credit profile not found — calculate credit score first");
  if (params.totalPrincipal > credit.bondIssuanceLimit) throw new Error(`Bond exceeds issuance limit (${credit.bondIssuanceLimit})`);
  if (params.escrowLockedAmount < params.totalPrincipal * 0.6) throw new Error("Minimum 60% escrow collateralization for bonds");

  const collateralRatio = params.totalPrincipal > 0 ? params.escrowLockedAmount / params.totalPrincipal : 0;
  const riskScore = Math.min(100, Math.round((100 - credit.creditScore) * 0.5 + (1 - collateralRatio) * 30));
  const defaultProbability = Math.round(riskScore * 0.4 * 100) / 100;
  const couponRate = Math.round((1 + riskScore * 0.08) * 100) / 100;

  const { data, error } = await (supabase as any).from("research_bonds").insert({
    issuing_institution: params.issuingInstitution, bond_name: params.bondName,
    total_principal: params.totalPrincipal, maturity_date: params.maturityDate,
    risk_score: riskScore, escrow_locked_amount: params.escrowLockedAmount,
    default_probability: defaultProbability, coupon_rate: couponRate,
    backing_asset_ids: params.backingAssetIds ?? [], region_scope: params.regionScope ?? [],
    status: "pending_approval",
  }).select("id").single();

  if (error) throw new Error(`Bond issuance failed: ${error.message}`);
  log.info("Research bond issued", { id: data.id, principal: params.totalPrincipal, riskScore });
  return data.id;
}

export async function getResearchBonds(institutionId?: string): Promise<ResearchBond[]> {
  let query = (supabase as any).from("research_bonds").select("*").order("created_at", { ascending: false });
  if (institutionId) query = query.eq("issuing_institution", institutionId);
  const { data } = await query;
  return (data ?? []).map((d: any): ResearchBond => ({
    id: d.id, issuingInstitution: d.issuing_institution, bondName: d.bond_name,
    totalPrincipal: d.total_principal, maturityDate: d.maturity_date, riskScore: d.risk_score,
    escrowLockedAmount: d.escrow_locked_amount, defaultProbability: d.default_probability,
    couponRate: d.coupon_rate, status: d.status, backingAssetIds: d.backing_asset_ids,
  }));
}
