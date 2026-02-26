/**
 * Multilateral Institution Coordination Adapter — cross-border research funding & impact.
 */

import { supabase } from "@/integrations/supabase/client";
import { getExternalInterface, logIntegrationAccess } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("multilateralAdapter");

export interface MultilateralReport {
  crossBorderFundingVolume: number;
  activeRegions: number;
  impactMeasurement: { projectsCompleted: number; institutionsServed: number; capitalDeployed: number };
  complianceHarmonizationScore: number;
  riskSharingAgreements: number;
}

export async function generateMultilateralReport(interfaceId: string): Promise<MultilateralReport | null> {
  const iface = await getExternalInterface(interfaceId);
  if (!iface || !["multilateral", "development_bank"].includes(iface.institutionType) || !iface.isActive) {
    await logIntegrationAccess(interfaceId, "multilateral_report", "coordination", undefined, true, "Invalid interface");
    return null;
  }

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");
  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const { data: deals } = await supabase.from("deal_rooms").select("status") as { data: any[] | null };
  const completed = (deals ?? []).filter((d: any) => d.status === "completed").length;

  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id").eq("active", true);

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated");
  const deployed = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  await logIntegrationAccess(interfaceId, "multilateral_report", "coordination");
  log.info("Multilateral report generated", { interfaceId });

  return {
    crossBorderFundingVolume: Math.round(crossBorder / 1000) * 1000,
    activeRegions: regions?.length ?? 0,
    impactMeasurement: { projectsCompleted: completed, institutionsServed: tenants?.length ?? 0, capitalDeployed: Math.round(deployed / 1000) * 1000 },
    complianceHarmonizationScore: 78,
    riskSharingAgreements: agreements?.length ?? 0,
  };
}
