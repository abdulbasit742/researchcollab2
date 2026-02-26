/**
 * Planetary Risk Distribution Network — PLANETARY_SYSTEMIC_RISK_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskDistribution");

export interface PlanetaryRiskDistribution {
  systemicRiskNodes: number;
  capitalConcentrationClusters: number;
  trustFragilityScore: number;
  liquidityStressZones: number;
  disputeClusters: number;
  complianceFragilityBands: number;
  planetarySystemicRiskIndex: number;
}

export async function calculatePlanetaryRiskDistribution(): Promise<PlanetaryRiskDistribution> {
  // Systemic risk nodes: nodes with >20% capital share
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, total_network_capital_contributed, node_trust_score");
  const totalNodeCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const systemicNodes = (nodes ?? []).filter((n: any) =>
    totalNodeCapital > 0 && ((n.total_network_capital_contributed ?? 0) / totalNodeCapital) > 0.2
  ).length;

  // Capital concentration clusters
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, tenant_id");
  const tenantCapital: Record<string, number> = {};
  for (const p of pools ?? []) {
    tenantCapital[p.tenant_id ?? "unknown"] = (tenantCapital[p.tenant_id ?? "unknown"] ?? 0) + (p.total_committed ?? 0);
  }
  const totalPoolCapital = Object.values(tenantCapital).reduce((s, v) => s + v, 0);
  const concentrationClusters = Object.values(tenantCapital).filter((v) => totalPoolCapital > 0 && v / totalPoolCapital > 0.15).length;

  // Trust fragility
  const lowTrustNodes = (nodes ?? []).filter((n: any) => (n.node_trust_score ?? 50) < 35).length;
  const trustFragility = (nodes ?? []).length > 0 ? Math.round((lowTrustNodes / nodes.length) * 100) : 0;

  // Liquidity stress zones
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("status");
  const defaulted = (exchanges ?? []).filter((e: any) => e.status === "defaulted").length;
  const stressZones = Math.min(10, defaulted);

  // Dispute clusters
  const { data: deals } = await supabase.from("deal_rooms").select("status, tenant_id");
  const disputed = (deals ?? []).filter((d) => d.status === "disputed");
  const disputeByTenant: Record<string, number> = {};
  for (const d of disputed) {
    disputeByTenant[d.tenant_id ?? "unknown"] = (disputeByTenant[d.tenant_id ?? "unknown"] ?? 0) + 1;
  }
  const disputeClusters = Object.values(disputeByTenant).filter((v) => v >= 3).length;

  // Compliance fragility
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("resolved");
  const unresolved = (alerts ?? []).filter((a: any) => !a.resolved).length;
  const complianceFragility = Math.min(10, Math.round(unresolved / 5));

  // Planetary systemic risk
  const riskIndex = Math.min(100, Math.round(
    systemicNodes * 15 + concentrationClusters * 12 + trustFragility * 0.3 +
    stressZones * 8 + disputeClusters * 10 + complianceFragility * 5
  ));

  log.info("Planetary risk distribution calculated", { riskIndex });

  return {
    systemicRiskNodes: systemicNodes, capitalConcentrationClusters: concentrationClusters,
    trustFragilityScore: trustFragility, liquidityStressZones: stressZones,
    disputeClusters, complianceFragilityBands: complianceFragility,
    planetarySystemicRiskIndex: riskIndex,
  };
}
