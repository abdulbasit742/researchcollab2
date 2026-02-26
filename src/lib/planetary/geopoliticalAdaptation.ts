/**
 * Dynamic Geopolitical Adaptation Engine — region splits, sanctions, policy divergence.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("geopoliticalAdaptation");

export interface GeopoliticalAdaptation {
  type: string;
  affectedRegions: string[];
  capitalImpact: number;
  complianceImpact: number;
  requiredActions: string[];
  adaptationDifficulty: number;
}

export type GeopoliticalEvent = "region_split" | "regulatory_fragmentation" | "sanctions" | "cross_border_restriction" | "capital_controls" | "policy_divergence";

export async function modelGeopoliticalEvent(event: GeopoliticalEvent, affectedRegions: string[]): Promise<GeopoliticalAdaptation> {
  const { data: agreements } = await (supabase as any).from("cross_border_agreements")
    .select("id, node_a, node_b, allowed_capital_limit").eq("active", true);
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, region_id, total_network_capital_contributed");

  const affectedNodeIds = (nodes ?? []).filter((n: any) => affectedRegions.includes(n.region_id)).map((n: any) => n.id);
  const affectedCapital = (nodes ?? []).filter((n: any) => affectedRegions.includes(n.region_id))
    .reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const totalCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const capitalImpact = totalCapital > 0 ? Math.round((affectedCapital / totalCapital) * 100) : 0;

  const affectedAgreements = (agreements ?? []).filter((a: any) =>
    affectedNodeIds.includes(a.node_a) || affectedNodeIds.includes(a.node_b)
  ).length;
  const complianceImpact = Math.min(100, affectedAgreements * 15);

  const eventModels: Record<GeopoliticalEvent, { actions: string[]; difficultyBase: number }> = {
    region_split: { actions: ["Create new region entities", "Reassign tenants", "Split capital pools", "Create bilateral agreements"], difficultyBase: 80 },
    regulatory_fragmentation: { actions: ["Version regulatory profiles", "Update compliance rules per region", "Recalibrate risk thresholds"], difficultyBase: 60 },
    sanctions: { actions: ["Freeze affected routes", "Reroute capital", "Update sanction zones", "Notify affected institutions"], difficultyBase: 70 },
    cross_border_restriction: { actions: ["Reduce outflow limits", "Update sovereignty profiles", "Suspend affected agreements"], difficultyBase: 50 },
    capital_controls: { actions: ["Enforce outflow caps", "Freeze cross-border routing", "Activate sovereign override"], difficultyBase: 65 },
    policy_divergence: { actions: ["Track divergence scores", "Create region-specific compliance", "Model impact on routing"], difficultyBase: 40 },
  };

  const model = eventModels[event];
  const difficulty = Math.min(100, Math.round(model.difficultyBase + capitalImpact * 0.3));

  // Audit log
  await (supabase as any).from("governance_audit_logs").insert({
    action: `geopolitical_event_modeled:${event}`, entity_type: "geopolitical_adaptation",
    entity_id: affectedRegions[0] ?? "global", details: { event, affectedRegions, capitalImpact },
  });

  log.info("Geopolitical event modeled", { event, capitalImpact, difficulty });

  return {
    type: event, affectedRegions, capitalImpact, complianceImpact,
    requiredActions: model.actions, adaptationDifficulty: difficulty,
  };
}
