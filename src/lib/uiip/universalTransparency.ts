/**
 * Universal Transparency Report — anonymized global interoperability metrics.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateInteroperabilityHealth } from "./interoperabilityHealth";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("universalTransparency");

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export interface UniversalTransparencyReport {
  totalExternalIntegrations: number;
  governmentCoveragePercent: number;
  crossBorderFundingShare: number;
  digitalCurrencyIntegrationPercent: number;
  regulatoryComplianceAlignmentPercent: number;
  interoperabilityStabilityBand: string;
  interoperabilityScore: number;
  timestamp: string;
}

export async function generateUniversalTransparencyReport(): Promise<UniversalTransparencyReport> {
  const health = await calculateInteroperabilityHealth();

  const { data: interfaces } = await (supabase as any).from("external_interfaces").select("institution_type").eq("is_active", true);
  const total = (interfaces ?? []).length;
  const govCount = (interfaces ?? []).filter((i: any) => i.institution_type === "government").length;
  const dcCount = (interfaces ?? []).filter((i: any) => i.institution_type === "digital_currency_provider").length;
  const govPct = total > 0 ? Math.round((govCount / total) * 100) : 0;
  const dcPct = total > 0 ? Math.round((dcCount / total) * 100) : 0;

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossPct = totalRouted > 0 ? Math.round((crossBorder / totalRouted) * 100) : 0;

  log.info("Universal transparency report generated");

  return {
    totalExternalIntegrations: total, governmentCoveragePercent: govPct,
    crossBorderFundingShare: crossPct, digitalCurrencyIntegrationPercent: dcPct,
    regulatoryComplianceAlignmentPercent: health.regulatoryAlignmentScore,
    interoperabilityStabilityBand: toBand(health.interoperabilityStabilityScore),
    interoperabilityScore: health.interoperabilityStabilityScore,
    timestamp: new Date().toISOString(),
  };
}
