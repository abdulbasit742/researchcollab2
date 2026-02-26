/**
 * Government Integration Gateway — aggregated metrics, no raw wallet access.
 */

import { supabase } from "@/integrations/supabase/client";
import { getExternalInterface, logIntegrationAccess } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governmentGateway");

export interface GovernmentReport {
  region: string;
  totalInnovationProjects: number;
  completedProjects: number;
  completionRate: number;
  activeInstitutions: number;
  complianceStatus: string;
  nationalInnovationIndex: number;
  grantDistributionSummary: { allocated: number; utilized: number };
}

export async function generateGovernmentReport(interfaceId: string, region: string): Promise<GovernmentReport | null> {
  const iface = await getExternalInterface(interfaceId);
  if (!iface || iface.institutionType !== "government" || !iface.isActive) {
    await logIntegrationAccess(interfaceId, "government_report", "metrics", region, true, "Invalid or inactive interface");
    return null;
  }
  if (!iface.regionScope.includes(region) && iface.regionScope.length > 0) {
    await logIntegrationAccess(interfaceId, "government_report", "metrics", region, true, "Region out of scope");
    return null;
  }

  const { data: deals } = await supabase.from("deal_rooms").select("status, tenant_id") as { data: any[] | null };
  const total = (deals ?? []).length;
  const completed = (deals ?? []).filter((d: any) => d.status === "completed").length;

  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const allocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const utilized = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  await logIntegrationAccess(interfaceId, "government_report", "metrics", region);
  log.info("Government report generated", { interfaceId, region });

  return {
    region, totalInnovationProjects: total, completedProjects: completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    activeInstitutions: tenants?.length ?? 0, complianceStatus: "aligned",
    nationalInnovationIndex: total > 0 ? Math.min(100, Math.round((completed / total) * 100 * 1.2)) : 0,
    grantDistributionSummary: { allocated: Math.round(allocated / 1000) * 1000, utilized: Math.round(utilized / 1000) * 1000 },
  };
}
