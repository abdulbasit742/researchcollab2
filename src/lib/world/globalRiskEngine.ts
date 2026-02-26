/**
 * Global Risk & Exposure Engine — systemic risk modeling (read-only).
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalRiskEngine");

export interface GlobalRiskProfile {
  crossRegionCapitalExposure: number;
  capitalConcentrationRisk: number;
  systemicDisputeClustering: number;
  liquidityImbalanceRisk: number;
  complianceFragilityIndex: number;
  nodeSystemicImportance: Record<string, number>;
  globalSystemicRiskScore: number;
  regionalRiskMap: Record<string, number>;
}

export async function calculateGlobalRisk(): Promise<GlobalRiskProfile> {
  // Cross-region capital exposure
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id, source_node_id, status").eq("status", "completed");
  const allRoutes = routes ?? [];
  const totalRouted = allRoutes.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossRegion = allRoutes.filter((r: any) => r.cross_border_agreement_id != null);
  const crossRegionVolume = crossRegion.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossRegionExposure = totalRouted > 0 ? Math.round((crossRegionVolume / totalRouted) * 100) : 0;

  // Capital concentration
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed");
  const allPools = pools ?? [];
  const totalCommitted = allPools.reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const maxPool = allPools.reduce((m: number, p: any) => Math.max(m, p.total_committed ?? 0), 0);
  const concentrationRisk = totalCommitted > 0 ? Math.round((maxPool / totalCommitted) * 100) : 0;

  // Dispute clustering
  const { data: deals } = await supabase.from("deal_rooms").select("status, tenant_id");
  const allDeals = deals ?? [];
  const disputed = allDeals.filter((d) => d.status === "disputed");
  const disputeRate = allDeals.length > 0 ? (disputed.length / allDeals.length) * 100 : 0;
  const disputeClustering = Math.min(100, Math.round(disputeRate * 2.5));

  // Liquidity imbalance
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("amount, status");
  const activeEx = (exchanges ?? []).filter((e: any) => e.status === "active");
  const defaultedEx = (exchanges ?? []).filter((e: any) => e.status === "defaulted");
  const liquidityRisk = activeEx.length > 0 ? Math.round((defaultedEx.length / (activeEx.length + defaultedEx.length)) * 100) : 0;

  // Compliance fragility
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("resolved");
  const unresolved = (alerts ?? []).filter((a: any) => !a.resolved).length;
  const complianceFragility = Math.min(100, unresolved * 8);

  // Node systemic importance
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, total_network_capital_contributed");
  const totalNodeCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const nodeImportance: Record<string, number> = {};
  for (const n of nodes ?? []) {
    nodeImportance[n.id] = totalNodeCapital > 0 ? Math.round(((n.total_network_capital_contributed ?? 0) / totalNodeCapital) * 100) : 0;
  }

  // Regional risk map
  const { data: regions } = await (supabase as any).from("regions").select("id, code");
  const regionalRiskMap: Record<string, number> = {};
  for (const r of regions ?? []) {
    const regionDeals = allDeals.filter((d) => d.tenant_id); // simplified
    regionalRiskMap[r.code ?? r.id] = Math.round(disputeRate + liquidityRisk * 0.3);
  }

  const globalRisk = Math.min(100, Math.round(
    crossRegionExposure * 0.2 + concentrationRisk * 0.2 + disputeClustering * 0.2 +
    liquidityRisk * 0.15 + complianceFragility * 0.25
  ));

  log.info("Global risk calculated", { globalRisk });

  return {
    crossRegionCapitalExposure: crossRegionExposure,
    capitalConcentrationRisk: concentrationRisk,
    systemicDisputeClustering: disputeClustering,
    liquidityImbalanceRisk: liquidityRisk,
    complianceFragilityIndex: complianceFragility,
    nodeSystemicImportance: nodeImportance,
    globalSystemicRiskScore: globalRisk,
    regionalRiskMap,
  };
}
