/**
 * Risk Projection Engine — forecasts system-wide risk from policy changes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskProjectionEngine");

export interface RiskProjection {
  capitalConcentrationRisk: number;
  nodeOverexposureRisk: number;
  crossBorderComplianceRisk: number;
  liquidityImbalanceRisk: number;
  disputeClusteringRisk: number;
  riskProjectionScore: number;
  confidenceLevel: number;
}

export async function projectRisk(): Promise<RiskProjection> {
  // Capital concentration
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const allPools = pools ?? [];
  const totalCommitted = allPools.reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const maxPool = allPools.reduce((m: number, p: any) => Math.max(m, p.total_committed ?? 0), 0);
  const concentrationRisk = totalCommitted > 0 ? Math.round((maxPool / totalCommitted) * 100) : 0;

  // Node overexposure
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("total_network_capital_contributed, node_capital_limit");
  const allNodes = nodes ?? [];
  const overexposed = allNodes.filter((n: any) => n.node_capital_limit > 0 && (n.total_network_capital_contributed ?? 0) > n.node_capital_limit * 0.8).length;
  const nodeOverexposure = allNodes.length > 0 ? Math.round((overexposed / allNodes.length) * 100) : 0;

  // Cross-border compliance
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("cross_border_agreement_id, status");
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id != null);
  const failedCross = crossBorder.filter((r: any) => r.status === "failed").length;
  const crossBorderRisk = crossBorder.length > 0 ? Math.round((failedCross / crossBorder.length) * 100) : 0;

  // Liquidity imbalance
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("status");
  const allExchanges = exchanges ?? [];
  const defaulted = allExchanges.filter((e: any) => e.status === "defaulted").length;
  const liquidityRisk = allExchanges.length > 0 ? Math.round((defaulted / allExchanges.length) * 100) : 0;

  // Dispute clustering
  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const allDeals = deals ?? [];
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const disputeRisk = allDeals.length > 0 ? Math.min(100, Math.round((disputed / allDeals.length) * 200)) : 0;

  // Composite
  const score = Math.min(100, Math.round(
    concentrationRisk * 0.25 + nodeOverexposure * 0.2 + crossBorderRisk * 0.2 + liquidityRisk * 0.15 + disputeRisk * 0.2
  ));

  const confidence = Math.max(40, 95 - (allDeals.length < 10 ? 30 : 0) - (allNodes.length < 3 ? 20 : 0));

  log.info("Risk projection calculated", { score, confidence });

  return {
    capitalConcentrationRisk: concentrationRisk,
    nodeOverexposureRisk: nodeOverexposure,
    crossBorderComplianceRisk: crossBorderRisk,
    liquidityImbalanceRisk: liquidityRisk,
    disputeClusteringRisk: disputeRisk,
    riskProjectionScore: score,
    confidenceLevel: confidence,
  };
}
