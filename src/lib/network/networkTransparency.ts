/**
 * Network Transparency Snapshot — anonymized public metrics, zero PII.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("networkTransparency");

export interface NetworkTransparencySnapshot {
  totalSovereignNodes: number;
  totalNetworkCapital: number;
  crossBorderFundingPercent: number;
  networkGrowthRate: number;
  globalCompletionRate: number;
  trustDistribution: { high: number; medium: number; low: number };
  activeLiquidityExchanges: number;
  activeAgreements: number;
  timestamp: string;
}

export async function generateNetworkTransparencySnapshot(): Promise<NetworkTransparencySnapshot> {
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("sovereign_status, node_trust_score, total_network_capital_contributed, network_participation_status");
  const sovereign = (nodes ?? []).filter((n: any) => n.sovereign_status);

  const totalCapital = sovereign.reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);

  // Trust distribution
  const high = sovereign.filter((n: any) => (n.node_trust_score ?? 0) >= 70).length;
  const medium = sovereign.filter((n: any) => (n.node_trust_score ?? 0) >= 40 && (n.node_trust_score ?? 0) < 70).length;
  const low = sovereign.filter((n: any) => (n.node_trust_score ?? 0) < 40).length;

  // Cross-border %
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const allRoutes = routes ?? [];
  const totalVolume = allRoutes.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderVolume = allRoutes.filter((r: any) => r.cross_border_agreement_id != null).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderPercent = totalVolume > 0 ? Math.round((crossBorderVolume / totalVolume) * 100) : 0;

  // Active liquidity exchanges
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("id").eq("status", "active");

  // Active agreements
  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id").eq("active", true);

  // Completion rate across network
  const tenantIds = sovereign.map((n: any) => n.tenant_id).filter(Boolean);
  let completionRate = 0;
  if (tenantIds.length > 0) {
    const { data: deals } = await supabase.from("deal_rooms").select("status");
    const allDeals = deals ?? [];
    const completed = allDeals.filter((d) => d.status === "completed").length;
    completionRate = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 0;
  }

  log.info("Network transparency snapshot generated");

  return {
    totalSovereignNodes: sovereign.length,
    totalNetworkCapital: totalCapital,
    crossBorderFundingPercent: crossBorderPercent,
    networkGrowthRate: 0,
    globalCompletionRate: completionRate,
    trustDistribution: { high, medium, low },
    activeLiquidityExchanges: exchanges?.length ?? 0,
    activeAgreements: agreements?.length ?? 0,
    timestamp: new Date().toISOString(),
  };
}
