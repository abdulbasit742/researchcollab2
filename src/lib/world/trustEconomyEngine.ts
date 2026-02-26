/**
 * Multi-Layer Trust Economy Engine — 7-layer trust scoring → GLOBAL_TRUST_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("trustEconomyEngine");

export interface TrustLayers {
  dealTrust: number;
  tenantTrust: number;
  nodeTrust: number;
  crossBorderTrust: number;
  governanceTrust: number;
  complianceTrust: number;
  capitalReliabilityTrust: number;
  globalTrustIndex: number;
}

export async function calculateGlobalTrustIndex(): Promise<TrustLayers> {
  // Deal trust: completion vs disputes
  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed").length;
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const dealTrust = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 50;

  // Tenant trust: avg profile completeness proxy
  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const tenantTrust = Math.min(100, 50 + (tenants?.length ?? 0) * 2);

  // Node trust: avg sovereign node scores
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score");
  const avgNodeTrust = (nodes ?? []).length > 0
    ? Math.round((nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 50), 0) / nodes.length) : 50;

  // Cross-border trust: successful cross-border routes
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("status, cross_border_agreement_id");
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id != null);
  const successCross = crossBorder.filter((r: any) => r.status === "completed").length;
  const crossBorderTrust = crossBorder.length > 0 ? Math.round((successCross / crossBorder.length) * 100) : 50;

  // Governance trust: active policies vs rejected
  const { data: policies } = await (supabase as any).from("governance_policies").select("status");
  const activeP = (policies ?? []).filter((p: any) => p.status === "active").length;
  const rejectedP = (policies ?? []).filter((p: any) => p.status === "rejected").length;
  const governanceTrust = Math.min(100, Math.max(30, 70 + activeP * 3 - rejectedP * 5));

  // Compliance trust
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("resolved");
  const unresolved = (alerts ?? []).filter((a: any) => !a.resolved).length;
  const complianceTrust = Math.max(0, 100 - unresolved * 5);

  // Capital reliability
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("status");
  const allEx = exchanges ?? [];
  const returned = allEx.filter((e: any) => e.status === "returned").length;
  const defaulted = allEx.filter((e: any) => e.status === "defaulted").length;
  const capitalReliabilityTrust = allEx.length > 0 ? Math.round(((returned) / Math.max(1, returned + defaulted)) * 100) : 50;

  // Global Trust Index (weighted)
  const globalTrustIndex = Math.min(100, Math.round(
    dealTrust * 0.2 + tenantTrust * 0.1 + avgNodeTrust * 0.15 + crossBorderTrust * 0.15 +
    governanceTrust * 0.1 + complianceTrust * 0.15 + capitalReliabilityTrust * 0.15
  ));

  // Store history
  await (supabase as any).from("trust_index_history").insert({
    entity_id: "global", entity_type: "network", trust_type: "global_trust_index", score: globalTrustIndex,
  });

  log.info("Global trust index calculated", { globalTrustIndex });

  return {
    dealTrust, tenantTrust, nodeTrust: avgNodeTrust, crossBorderTrust,
    governanceTrust, complianceTrust, capitalReliabilityTrust, globalTrustIndex,
  };
}
