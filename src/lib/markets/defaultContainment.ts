/**
 * Default Containment Framework — isolate exposure, prevent cascade.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("defaultContainment");

export interface DefaultEvent {
  entityType: "institution" | "bond" | "project" | "pool";
  entityId: string;
  exposureAmount: number;
  cascadeRisk: number;
}

export interface DefaultContainmentResult {
  isolatedExposure: number;
  cascadePrevented: boolean;
  affectedEntities: number;
  liquidityInjectionNeeded: number;
  trustScoreImpact: number;
  creditRatingImpact: number;
  defaultContainmentScore: number;
  actions: string[];
}

export async function containDefault(event: DefaultEvent): Promise<DefaultContainmentResult> {
  const actions: string[] = [];

  // 1. Isolate exposure
  actions.push(`Isolated ${event.entityType} ${event.entityId} exposure: ${event.exposureAmount}`);

  // 2. Calculate cascade risk
  let affectedEntities = 0;
  let cascadeRisk = event.cascadeRisk;

  if (event.entityType === "institution") {
    const { data: bonds } = await (supabase as any).from("research_bonds").select("id").eq("issuing_institution", event.entityId).eq("status", "active");
    affectedEntities += (bonds ?? []).length;
    cascadeRisk += (bonds ?? []).length * 5;
  }

  if (event.entityType === "bond") {
    const { data: bond } = await (supabase as any).from("research_bonds").select("issuing_institution, total_principal").eq("id", event.entityId).maybeSingle();
    if (bond) {
      affectedEntities += 1;
      cascadeRisk += (bond.total_principal > 100000) ? 20 : 10;
    }
  }

  // 3. Prevent cascade
  const cascadePrevented = cascadeRisk < 70;
  if (!cascadePrevented) actions.push("WARNING: Cascade risk exceeds threshold — manual intervention required");

  // 4. Liquidity injection simulation
  const injectionNeeded = Math.round(event.exposureAmount * 0.3);
  actions.push(`Liquidity injection simulated: ${injectionNeeded}`);

  // 5. Impact calculations
  const trustImpact = Math.min(20, Math.round(event.exposureAmount / 50000));
  const creditImpact = Math.min(15, Math.round(cascadeRisk * 0.2));

  actions.push(`Trust score impact: -${trustImpact}`);
  actions.push(`Credit rating impact: -${creditImpact} points`);

  // Containment score
  const containmentScore = Math.max(0, Math.min(100, 100 - Math.round(cascadeRisk * 0.7 + trustImpact + creditImpact)));

  log.warn("Default containment executed", { entityType: event.entityType, containmentScore });

  return {
    isolatedExposure: event.exposureAmount, cascadePrevented, affectedEntities,
    liquidityInjectionNeeded: injectionNeeded, trustScoreImpact: -trustImpact,
    creditRatingImpact: -creditImpact, defaultContainmentScore: containmentScore, actions,
  };
}
