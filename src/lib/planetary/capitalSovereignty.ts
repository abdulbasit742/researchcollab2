/**
 * Sovereign Capital Sovereignty Model — region-based capital protection & routing limits.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalSovereignty");

export interface CapitalSovereigntyProfile {
  regionId: string;
  capitalOutflowLimit: number;
  complianceRestrictionLevel: string;
  crossBorderExposure: number;
  sovereignOverrideActive: boolean;
  version: number;
}

export async function getCapitalSovereigntyProfile(regionId: string): Promise<CapitalSovereigntyProfile | null> {
  const { data } = await (supabase as any).from("capital_sovereignty_profiles")
    .select("*").eq("region_id", regionId).order("version", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return {
    regionId: data.region_id, capitalOutflowLimit: data.capital_outflow_limit,
    complianceRestrictionLevel: data.compliance_restriction_level,
    crossBorderExposure: data.cross_border_exposure, sovereignOverrideActive: data.sovereign_override_active,
    version: data.version,
  };
}

export async function createSovereigntyProfile(
  regionId: string, outflowLimit: number, restrictionLevel: string = "standard"
): Promise<string> {
  const current = await getCapitalSovereigntyProfile(regionId);
  const nextVersion = current ? current.version + 1 : 1;

  // Calculate cross-border exposure
  const { data: routes } = await (supabase as any).from("network_capital_routes")
    .select("amount").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const exposure = totalRouted > 0 ? Math.min(100, Math.round((totalRouted * 0.3 / Math.max(1, outflowLimit)) * 100)) : 0;

  const { data, error } = await (supabase as any).from("capital_sovereignty_profiles").insert({
    region_id: regionId, capital_outflow_limit: outflowLimit,
    compliance_restriction_level: restrictionLevel, cross_border_exposure: exposure, version: nextVersion,
  }).select("id").single();

  if (error) throw new Error(`Sovereignty profile creation failed: ${error.message}`);
  log.info("Capital sovereignty profile created", { regionId, version: nextVersion });
  return data.id;
}

export async function simulateCapitalFreeze(regionId: string): Promise<{
  affectedRoutes: number; capitalAtRisk: number; alternativeRoutes: number;
}> {
  const { data: routes } = await (supabase as any).from("network_capital_routes")
    .select("amount, source_node_id, target_node_id").eq("status", "active");

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, region_id");
  const regionNodeIds = (nodes ?? []).filter((n: any) => n.region_id === regionId).map((n: any) => n.id);

  const affected = (routes ?? []).filter((r: any) =>
    regionNodeIds.includes(r.source_node_id) || regionNodeIds.includes(r.target_node_id)
  );
  const capitalAtRisk = affected.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const unaffected = (routes ?? []).length - affected.length;

  return { affectedRoutes: affected.length, capitalAtRisk, alternativeRoutes: unaffected };
}
