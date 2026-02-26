/**
 * External Sovereign Interface Layer — standardized interoperability schema with masking.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sovereignInterface");

export type InstitutionType = "government" | "central_bank" | "sovereign_wealth_fund" | "multilateral" | "development_bank" | "research_council" | "ngo" | "private_capital" | "regulatory_body" | "digital_currency_provider";
export type AccessScope = "read_only" | "aggregate_only" | "compliance_reporting" | "co_investment" | "coordination" | "full_authorized";
export type TrustTier = "basic" | "verified" | "trusted" | "sovereign";

export interface ExternalInterface {
  id: string;
  interfaceName: string;
  institutionType: InstitutionType;
  regionScope: string[];
  accessScope: AccessScope;
  complianceProfile: string;
  trustTier: TrustTier;
  rateLimitPerHour: number;
  isActive: boolean;
  createdAt: string;
}

export interface ExternalSafeMetrics {
  totalInstitutions: number;
  totalCapitalDeployed: number; // aggregated, rounded
  activeRegions: number;
  innovationIndex: number;
  complianceAlignmentPercent: number;
  crossBorderPercent: number;
}

export async function registerExternalInterface(params: {
  interfaceName: string; institutionType: InstitutionType; regionScope: string[];
  accessScope: AccessScope; complianceProfile?: string; trustTier?: TrustTier; rateLimitPerHour?: number;
}): Promise<string> {
  const { data, error } = await (supabase as any).from("external_interfaces").insert({
    interface_name: params.interfaceName, institution_type: params.institutionType,
    region_scope: params.regionScope, access_scope: params.accessScope,
    compliance_profile: params.complianceProfile ?? "standard",
    trust_tier: params.trustTier ?? "basic", rate_limit_per_hour: params.rateLimitPerHour ?? 100,
  }).select("id").single();
  if (error) throw new Error(`Interface registration failed: ${error.message}`);
  log.info("External interface registered", { id: data.id, type: params.institutionType });
  return data.id;
}

export async function getExternalInterface(id: string): Promise<ExternalInterface | null> {
  const { data } = await (supabase as any).from("external_interfaces").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, interfaceName: data.interface_name, institutionType: data.institution_type,
    regionScope: data.region_scope, accessScope: data.access_scope, complianceProfile: data.compliance_profile,
    trustTier: data.trust_tier, rateLimitPerHour: data.rate_limit_per_hour, isActive: data.is_active, createdAt: data.created_at,
  };
}

export async function generateExternalSafeMetrics(): Promise<ExternalSafeMetrics> {
  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const rounded = Math.round(totalCapital / 1000) * 1000; // mask precision

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("cross_border_agreement_id").eq("status", "completed");
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).length;
  const crossPct = (routes ?? []).length > 0 ? Math.round((crossBorder / routes.length) * 100) : 0;

  return {
    totalInstitutions: tenants?.length ?? 0, totalCapitalDeployed: rounded,
    activeRegions: regions?.length ?? 0, innovationIndex: 0, complianceAlignmentPercent: 0, crossBorderPercent: crossPct,
  };
}

export async function logIntegrationAccess(interfaceId: string, action: string, resourceType: string, regionScope?: string, blocked?: boolean, blockReason?: string): Promise<void> {
  await (supabase as any).from("external_integration_logs").insert({
    interface_id: interfaceId, action, resource_type: resourceType, region_scope: regionScope,
    was_blocked: blocked ?? false, block_reason: blockReason,
  });
}
