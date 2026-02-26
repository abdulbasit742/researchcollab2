/**
 * Inter-Governmental Coordination Mesh — multi-government policy alignment.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("interGovernmentMesh");

export interface InterGovAgreement {
  id: string;
  regionA: string;
  regionB: string;
  capitalLimit: number;
  complianceAlignmentScore: number;
  active: boolean;
}

export async function createInterGovernmentalAgreement(
  regionA: string, regionB: string, capitalLimit: number, complianceScore: number, riskSharingTerms?: Record<string, unknown>
): Promise<string> {
  if (regionA === regionB) throw new Error("Cannot create self-agreement");

  const { data, error } = await (supabase as any).from("intergovernmental_agreements").insert({
    region_a: regionA, region_b: regionB,
    capital_limit: capitalLimit, compliance_alignment_score: complianceScore,
    risk_sharing_terms: riskSharingTerms ?? {}, active: true,
  }).select("id").single();

  if (error) throw new Error(`Agreement creation failed: ${error.message}`);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "intergov_agreement_created", entity_type: "intergovernmental_agreements",
    entity_id: data.id, details: { regionA, regionB, capitalLimit },
  });

  log.info("Intergovernmental agreement created", { id: data.id });
  return data.id;
}

export async function getActiveAgreements(): Promise<InterGovAgreement[]> {
  const { data } = await (supabase as any).from("intergovernmental_agreements").select("*").eq("active", true);
  return (data ?? []).map((a: any) => ({
    id: a.id, regionA: a.region_a, regionB: a.region_b,
    capitalLimit: a.capital_limit, complianceAlignmentScore: a.compliance_alignment_score,
    active: a.active,
  }));
}

export async function getRegulatoryCompatibility(regionA: string, regionB: string): Promise<number> {
  const { data } = await (supabase as any).from("intergovernmental_agreements")
    .select("compliance_alignment_score")
    .or(`and(region_a.eq.${regionA},region_b.eq.${regionB}),and(region_a.eq.${regionB},region_b.eq.${regionA})`)
    .eq("active", true).maybeSingle();
  return data?.compliance_alignment_score ?? 0;
}
