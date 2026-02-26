/**
 * Global Interoperability Health Index — INTEROPERABILITY_STABILITY_SCORE (0-100).
 */

import { supabase } from "@/integrations/supabase/client";
import { assessExternalRisk } from "./riskFirewall";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("interoperabilityHealth");

export interface InteroperabilityHealthScore {
  externalDependencyRatio: number;
  capitalExposureToSovereign: number;
  regulatoryAlignmentScore: number;
  integrationDiversityScore: number;
  externalRiskExposure: number;
  interoperabilityStabilityScore: number;
  timestamp: string;
}

export async function calculateInteroperabilityHealth(): Promise<InteroperabilityHealthScore> {
  const risk = await assessExternalRisk();

  const { data: interfaces } = await (supabase as any).from("external_interfaces").select("institution_type").eq("is_active", true);
  const uniqueTypes = new Set((interfaces ?? []).map((i: any) => i.institution_type)).size;
  const diversityScore = Math.min(100, uniqueTypes * 12);

  // Regulatory alignment from compliance data
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("resolved");
  const totalAlerts = (alerts ?? []).length;
  const resolved = (alerts ?? []).filter((a: any) => a.resolved).length;
  const regAlignment = totalAlerts > 0 ? Math.round((resolved / totalAlerts) * 100) : 85;

  const depRatio = (interfaces ?? []).length > 0 ? Math.min(100, (interfaces ?? []).length * 5) : 0;

  const score = Math.max(0, Math.min(100, Math.round(
    (100 - depRatio) * 0.15 + (100 - risk.capitalDependencyOnSovereign) * 0.2 +
    regAlignment * 0.2 + diversityScore * 0.2 + (100 - risk.overallExternalRisk) * 0.25
  )));

  log.info("Interoperability health calculated", { score });

  return {
    externalDependencyRatio: depRatio, capitalExposureToSovereign: risk.capitalDependencyOnSovereign,
    regulatoryAlignmentScore: regAlignment, integrationDiversityScore: diversityScore,
    externalRiskExposure: risk.overallExternalRisk, interoperabilityStabilityScore: score,
    timestamp: new Date().toISOString(),
  };
}
