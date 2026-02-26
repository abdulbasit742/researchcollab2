/**
 * External Risk Boundary Firewall — detect and restrict external influence concentration.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskFirewall");

export interface ExternalRiskAssessment {
  externalInfluenceConcentration: number;
  capitalDependencyOnSovereign: number;
  regulatoryCaptureRisk: number;
  politicalExposureImbalance: number;
  capitalPressureRisk: number;
  overallExternalRisk: number;
  thresholdExceeded: boolean;
  recommendedActions: string[];
}

export async function assessExternalRisk(): Promise<ExternalRiskAssessment> {
  const { data: interfaces } = await (supabase as any).from("external_interfaces").select("institution_type, trust_tier, is_active").eq("is_active", true);
  const total = (interfaces ?? []).length;

  // Influence concentration: any single type > 40%
  const typeCounts: Record<string, number> = {};
  for (const i of interfaces ?? []) {
    typeCounts[i.institution_type] = (typeCounts[i.institution_type] ?? 0) + 1;
  }
  const maxTypeShare = total > 0 ? Math.round((Math.max(...Object.values(typeCounts)) / total) * 100) : 0;

  // Capital dependency: government + sovereign wealth > 50%
  const sovereignCount = (interfaces ?? []).filter((i: any) => ["government", "sovereign_wealth_fund", "central_bank"].includes(i.institution_type)).length;
  const sovereignDep = total > 0 ? Math.round((sovereignCount / total) * 100) : 0;

  // Regulatory capture: regulatory bodies with high trust tier
  const regHighTrust = (interfaces ?? []).filter((i: any) => i.institution_type === "regulatory_body" && ["trusted", "sovereign"].includes(i.trust_tier)).length;
  const regCapture = Math.min(100, regHighTrust * 25);

  // Political exposure: government interfaces
  const govCount = (interfaces ?? []).filter((i: any) => i.institution_type === "government").length;
  const politicalExposure = total > 0 ? Math.round((govCount / total) * 100) : 0;

  const capitalPressure = Math.round((sovereignDep + politicalExposure) / 2);

  const overall = Math.min(100, Math.round(
    maxTypeShare * 0.25 + sovereignDep * 0.25 + regCapture * 0.2 + politicalExposure * 0.15 + capitalPressure * 0.15
  ));

  const exceeded = overall > 60;
  const actions: string[] = [];
  if (exceeded) {
    if (maxTypeShare > 40) actions.push("Diversify external interface types");
    if (sovereignDep > 50) actions.push("Reduce sovereign actor dependency");
    if (regCapture > 50) actions.push("Restrict regulatory body trust tier elevation");
    if (politicalExposure > 40) actions.push("Balance government vs non-government integrations");
    log.warn("External risk threshold exceeded", { overall });
  }

  return {
    externalInfluenceConcentration: maxTypeShare, capitalDependencyOnSovereign: sovereignDep,
    regulatoryCaptureRisk: regCapture, politicalExposureImbalance: politicalExposure,
    capitalPressureRisk: capitalPressure, overallExternalRisk: overall,
    thresholdExceeded: exceeded, recommendedActions: actions,
  };
}
