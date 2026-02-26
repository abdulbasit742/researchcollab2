/**
 * Network-Level Innovation Metrics — aggregated sovereign network analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("networkMetrics");

export interface NetworkMetrics {
  totalNodes: number;
  activeNodes: number;
  totalNetworkCapitalDeployed: number;
  crossNodeFundingVolume: number;
  crossBorderFundingPercent: number;
  networkCompletionRate: number;
  networkDisputeRate: number;
  capitalCirculationVelocity: number;
  activeLiquidityExchanges: number;
  totalLiquidityVolume: number;
  timestamp: string;
}

export async function getNetworkMetrics(): Promise<NetworkMetrics> {
  // Nodes
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("*");
  const allNodes = nodes ?? [];
  const activeNodes = allNodes.filter((n: any) => n.network_participation_status === "active");

  const totalContributed = allNodes.reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const totalReceived = allNodes.reduce((s: number, n: any) => s + (n.total_network_capital_received ?? 0), 0);

  // Capital routes
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id, status").eq("status", "completed");
  const allRoutes = routes ?? [];
  const crossNodeVolume = allRoutes.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderRoutes = allRoutes.filter((r: any) => r.cross_border_agreement_id != null);
  const crossBorderVolume = crossBorderRoutes.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderPercent = crossNodeVolume > 0 ? Math.round((crossBorderVolume / crossNodeVolume) * 100) : 0;

  // Network-wide deal stats (across all node tenants)
  const tenantIds = allNodes.map((n: any) => n.tenant_id);
  let completionRate = 0, disputeRate = 0;
  if (tenantIds.length > 0) {
    const { data: deals } = await supabase.from("deal_rooms").select("status").in("tenant_id", tenantIds.slice(0, 100));
    const allDeals = deals ?? [];
    const completed = allDeals.filter((d) => d.status === "completed").length;
    const disputed = allDeals.filter((d) => d.status === "disputed").length;
    completionRate = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 0;
    disputeRate = allDeals.length > 0 ? Math.round((disputed / allDeals.length) * 100) : 0;
  }

  // Liquidity exchanges
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("amount, status");
  const activeExchanges = (exchanges ?? []).filter((e: any) => e.status === "active");
  const liquidityVolume = activeExchanges.reduce((s: number, e: any) => s + (e.amount ?? 0), 0);

  // Velocity = routes per node
  const velocity = activeNodes.length > 0 ? Math.round(allRoutes.length / activeNodes.length * 10) / 10 : 0;

  log.info("Network metrics calculated", { totalNodes: allNodes.length });

  return {
    totalNodes: allNodes.length, activeNodes: activeNodes.length,
    totalNetworkCapitalDeployed: totalContributed,
    crossNodeFundingVolume: crossNodeVolume,
    crossBorderFundingPercent: crossBorderPercent,
    networkCompletionRate: completionRate, networkDisputeRate: disputeRate,
    capitalCirculationVelocity: velocity,
    activeLiquidityExchanges: activeExchanges.length,
    totalLiquidityVolume: liquidityVolume,
    timestamp: new Date().toISOString(),
  };
}
