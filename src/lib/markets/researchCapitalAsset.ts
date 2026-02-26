/**
 * Research Capital Asset Model — structured, escrow-backed research capital classes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("researchCapitalAsset");

export type BackingType = "project_backed" | "milestone_backed" | "institution_backed" | "sovereign_grant" | "cross_border_research";
export type ComplianceStatus = "pending" | "approved" | "rejected" | "expired";

export interface ResearchCapitalAsset {
  id: string;
  underlyingProjectId: string | null;
  backingType: BackingType;
  riskScore: number;
  expectedReturn: number;
  maturityPeriod: number;
  complianceStatus: ComplianceStatus;
  regionScope: string[];
  tenantId: string | null;
  totalValue: number;
  escrowBackingAmount: number;
  isActive: boolean;
  createdAt: string;
}

export async function createResearchCapitalAsset(params: {
  underlyingProjectId?: string; backingType: BackingType; totalValue: number;
  escrowBackingAmount: number; maturityPeriod?: number; regionScope?: string[]; tenantId?: string;
}): Promise<string> {
  if (params.escrowBackingAmount <= 0) throw new Error("Escrow backing required — no synthetic assets allowed");
  if (params.escrowBackingAmount < params.totalValue * 0.5) throw new Error("Minimum 50% escrow collateralization required");

  const riskScore = calculateAssetRisk(params.backingType, params.escrowBackingAmount, params.totalValue);

  const { data, error } = await (supabase as any).from("research_capital_assets").insert({
    underlying_project_id: params.underlyingProjectId ?? null,
    backing_type: params.backingType,
    total_value: params.totalValue,
    escrow_backing_amount: params.escrowBackingAmount,
    risk_score: riskScore,
    expected_return: calculateExpectedReturn(riskScore, params.maturityPeriod ?? 365),
    maturity_period: params.maturityPeriod ?? 365,
    region_scope: params.regionScope ?? [],
    tenant_id: params.tenantId ?? null,
  }).select("id").single();

  if (error) throw new Error(`Asset creation failed: ${error.message}`);
  log.info("Research capital asset created", { id: data.id, type: params.backingType });
  return data.id;
}

export async function getResearchCapitalAssets(tenantId?: string): Promise<ResearchCapitalAsset[]> {
  let query = (supabase as any).from("research_capital_assets").select("*").eq("is_active", true).order("created_at", { ascending: false });
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data } = await query;
  return (data ?? []).map(mapAsset);
}

function mapAsset(d: any): ResearchCapitalAsset {
  return {
    id: d.id, underlyingProjectId: d.underlying_project_id, backingType: d.backing_type,
    riskScore: d.risk_score, expectedReturn: d.expected_return, maturityPeriod: d.maturity_period,
    complianceStatus: d.compliance_status, regionScope: d.region_scope, tenantId: d.tenant_id,
    totalValue: d.total_value, escrowBackingAmount: d.escrow_backing_amount,
    isActive: d.is_active, createdAt: d.created_at,
  };
}

function calculateAssetRisk(backingType: BackingType, escrowBacking: number, totalValue: number): number {
  const collateralRatio = totalValue > 0 ? escrowBacking / totalValue : 0;
  const typeRisk: Record<BackingType, number> = {
    sovereign_grant: 10, institution_backed: 25, project_backed: 40, milestone_backed: 50, cross_border_research: 55,
  };
  const baseRisk = typeRisk[backingType];
  const collateralAdj = (1 - collateralRatio) * 30;
  return Math.min(100, Math.max(0, Math.round(baseRisk + collateralAdj)));
}

function calculateExpectedReturn(riskScore: number, maturityDays: number): number {
  const baseReturn = 2 + riskScore * 0.08;
  const maturityMultiplier = Math.min(2, maturityDays / 365);
  return Math.round(baseReturn * maturityMultiplier * 100) / 100;
}
