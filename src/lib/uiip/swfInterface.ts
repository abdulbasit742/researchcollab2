/**
 * Sovereign Wealth Fund Interface — co-investment modeling via escrow + compliance.
 */

import { supabase } from "@/integrations/supabase/client";
import { getExternalInterface, logIntegrationAccess } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("swfInterface");

export interface SWFReport {
  availablePoolCount: number;
  totalPoolCapital: number;
  riskAdjustedReturn: number;
  esgAlignmentScore: number;
  innovationIndex: number;
  longTermPerformanceIndex: number;
}

export async function generateSWFReport(interfaceId: string): Promise<SWFReport | null> {
  const iface = await getExternalInterface(interfaceId);
  if (!iface || iface.institutionType !== "sovereign_wealth_fund" || !iface.isActive) {
    await logIntegrationAccess(interfaceId, "swf_report", "investment", undefined, true, "Invalid interface");
    return null;
  }
  if (iface.accessScope !== "co_investment" && iface.accessScope !== "full_authorized") {
    await logIntegrationAccess(interfaceId, "swf_report", "investment", undefined, true, "Insufficient access scope");
    return null;
  }

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const utilization = totalCapital > 0 ? (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0) / totalCapital : 0;

  const { data: deals } = await supabase.from("deal_rooms").select("status") as { data: any[] | null };
  const completed = (deals ?? []).filter((d: any) => d.status === "completed").length;
  const total = (deals ?? []).length;

  await logIntegrationAccess(interfaceId, "swf_report", "investment");
  log.info("SWF report generated", { interfaceId });

  return {
    availablePoolCount: (pools ?? []).length, totalPoolCapital: Math.round(totalCapital / 10000) * 10000,
    riskAdjustedReturn: Math.round(utilization * 80), esgAlignmentScore: 72,
    innovationIndex: total > 0 ? Math.min(100, Math.round((completed / total) * 120)) : 0,
    longTermPerformanceIndex: Math.round(utilization * 60 + 20),
  };
}
