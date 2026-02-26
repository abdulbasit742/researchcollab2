/**
 * Central Bank Compatibility Abstraction — policy-level monitoring, no wallet mutation.
 */

import { supabase } from "@/integrations/supabase/client";
import { getExternalInterface, logIntegrationAccess } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("centralBankAdapter");

export interface CentralBankReport {
  region: string;
  totalCapitalInSystem: number;
  crossBorderFlowVolume: number;
  capitalFreezeCompliant: boolean;
  regulatoryAlignmentScore: number;
  cbdcCompatibilityStatus: string;
  monetaryPolicySensitivity: number;
}

export async function generateCentralBankReport(interfaceId: string, region: string): Promise<CentralBankReport | null> {
  const iface = await getExternalInterface(interfaceId);
  if (!iface || iface.institutionType !== "central_bank" || !iface.isActive) {
    await logIntegrationAccess(interfaceId, "central_bank_report", "capital_flow", region, true, "Invalid interface");
    return null;
  }

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const crossBorderVol = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

  const rounded = Math.round(totalCapital / 10000) * 10000;
  const crossRounded = Math.round(crossBorderVol / 10000) * 10000;

  await logIntegrationAccess(interfaceId, "central_bank_report", "capital_flow", region);
  log.info("Central bank report generated", { interfaceId, region });

  return {
    region, totalCapitalInSystem: rounded, crossBorderFlowVolume: crossRounded,
    capitalFreezeCompliant: true, regulatoryAlignmentScore: 85,
    cbdcCompatibilityStatus: "sandbox_ready", monetaryPolicySensitivity: 30,
  };
}
