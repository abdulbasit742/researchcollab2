/**
 * Institutional Adoption Ladder — Tier 1 (Standard) to Tier 7 (Sovereign Node).
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("adoptionLadder");

export const TIER_NAMES: Record<number, string> = {
  1: "Standard University",
  2: "Verified Institution",
  3: "Credit-Scored Institution",
  4: "Bond-Issuing Institution",
  5: "Liquidity Pool Participant",
  6: "Reserve-Holding Institution",
  7: "Sovereign Node",
};

export interface InstitutionTier {
  institutionId: string;
  tierLevel: number;
  tierName: string;
  promotedAt: string;
  stabilityScore: number;
  creditMaturity: number;
  governanceApproved: boolean;
}

export async function getInstitutionTier(institutionId: string): Promise<InstitutionTier | null> {
  const { data } = await (supabase as any).from("institution_adoption_tiers")
    .select("*").eq("institution_id", institutionId)
    .order("tier_level", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return {
    institutionId: data.institution_id, tierLevel: data.tier_level,
    tierName: data.tier_name, promotedAt: data.promoted_at,
    stabilityScore: data.stability_score ?? 0, creditMaturity: data.credit_maturity ?? 0,
    governanceApproved: data.governance_approved ?? false,
  };
}

export async function promoteInstitution(institutionId: string, params: {
  stabilityScore: number; creditMaturity: number; governanceApproved?: boolean;
}): Promise<InstitutionTier> {
  const current = await getInstitutionTier(institutionId);
  const currentLevel = current?.tierLevel ?? 0;
  const nextLevel = currentLevel + 1;

  if (nextLevel > 7) throw new Error("Institution already at maximum tier");

  // Promotion requirements
  const requirements: Record<number, { minStability: number; minCredit: number; govRequired: boolean }> = {
    1: { minStability: 0, minCredit: 0, govRequired: false },
    2: { minStability: 50, minCredit: 0, govRequired: false },
    3: { minStability: 60, minCredit: 40, govRequired: false },
    4: { minStability: 70, minCredit: 60, govRequired: true },
    5: { minStability: 75, minCredit: 70, govRequired: true },
    6: { minStability: 80, minCredit: 80, govRequired: true },
    7: { minStability: 90, minCredit: 90, govRequired: true },
  };

  const req = requirements[nextLevel];
  if (!req) throw new Error("Invalid tier");

  if (params.stabilityScore < req.minStability) throw new Error(`Stability ${params.stabilityScore} below minimum ${req.minStability}`);
  if (params.creditMaturity < req.minCredit) throw new Error(`Credit maturity ${params.creditMaturity} below minimum ${req.minCredit}`);
  if (req.govRequired && !params.governanceApproved) throw new Error("Governance approval required for this tier");

  const { data, error } = await (supabase as any).from("institution_adoption_tiers").insert({
    institution_id: institutionId, tier_level: nextLevel, tier_name: TIER_NAMES[nextLevel],
    stability_score: params.stabilityScore, credit_maturity: params.creditMaturity,
    governance_approved: params.governanceApproved ?? false,
  }).select("*").single();

  if (error) throw new Error(`Promotion failed: ${error.message}`);
  log.info("Institution promoted", { institutionId, tier: nextLevel });

  return {
    institutionId, tierLevel: nextLevel, tierName: TIER_NAMES[nextLevel],
    promotedAt: data.promoted_at, stabilityScore: params.stabilityScore,
    creditMaturity: params.creditMaturity, governanceApproved: params.governanceApproved ?? false,
  };
}
