/**
 * Adaptive Regulatory Engine — region versioning, sanction adaptation, compliance hot-swap.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("adaptiveRegulation");

export interface RegulatoryProfile {
  id: string;
  regionId: string;
  version: number;
  complianceRules: Record<string, unknown>;
  complianceRulesHash: string | null;
  sanctionZones: string[];
  regulatoryDivergenceScore: number;
}

export async function getLatestRegulatoryProfile(regionId: string): Promise<RegulatoryProfile | null> {
  const { data } = await (supabase as any).from("regulatory_profiles")
    .select("*").eq("region_id", regionId).order("version", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, regionId: data.region_id, version: data.version,
    complianceRules: data.compliance_rules, complianceRulesHash: data.compliance_rules_hash,
    sanctionZones: data.sanction_zones ?? [], regulatoryDivergenceScore: data.regulatory_divergence_score,
  };
}

export async function createRegulatoryVersion(
  regionId: string, complianceRules: Record<string, unknown>, sanctionZones?: string[]
): Promise<string> {
  const current = await getLatestRegulatoryProfile(regionId);
  const nextVersion = current ? current.version + 1 : 1;

  // Simple hash
  const rulesStr = JSON.stringify(complianceRules);
  let hash = 0;
  for (let i = 0; i < rulesStr.length; i++) {
    hash = ((hash << 5) - hash) + rulesStr.charCodeAt(i);
    hash |= 0;
  }
  const rulesHash = `CREG-${Math.abs(hash).toString(36).toUpperCase()}`;

  // Divergence from previous
  const divergence = current ? Math.min(100, Object.keys(complianceRules).length * 5) : 0;

  const { data, error } = await (supabase as any).from("regulatory_profiles").insert({
    region_id: regionId, version: nextVersion, compliance_rules: complianceRules,
    compliance_rules_hash: rulesHash, sanction_zones: sanctionZones ?? [],
    regulatory_divergence_score: divergence,
  }).select("id").single();

  if (error) throw new Error(`Regulatory version creation failed: ${error.message}`);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "regulatory_profile_updated", entity_type: "regulatory_profiles",
    entity_id: data.id, details: { regionId, version: nextVersion },
  });

  log.info("Regulatory profile versioned", { regionId, version: nextVersion });
  return data.id;
}

export async function simulateSanctionZoneImpact(sanctionedRegions: string[]): Promise<{
  affectedAgreements: number; affectedRoutes: number; capitalAtRisk: number;
}> {
  const { data: agreements } = await (supabase as any).from("cross_border_agreements")
    .select("id, node_a, node_b").eq("active", true);

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, region_id, total_network_capital_contributed");
  const sanctionedNodeIds = (nodes ?? []).filter((n: any) => sanctionedRegions.includes(n.region_id)).map((n: any) => n.id);

  const affectedAgreements = (agreements ?? []).filter((a: any) =>
    sanctionedNodeIds.includes(a.node_a) || sanctionedNodeIds.includes(a.node_b)
  ).length;

  const { data: routes } = await (supabase as any).from("network_capital_routes")
    .select("amount, source_node_id, target_node_id").eq("status", "active");
  const affectedRoutes = (routes ?? []).filter((r: any) =>
    sanctionedNodeIds.includes(r.source_node_id) || sanctionedNodeIds.includes(r.target_node_id)
  );
  const capitalAtRisk = affectedRoutes.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

  return { affectedAgreements, affectedRoutes: affectedRoutes.length, capitalAtRisk };
}
