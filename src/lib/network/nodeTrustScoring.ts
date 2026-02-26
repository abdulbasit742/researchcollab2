/**
 * Node Trust Scoring — scores sovereign nodes on operational performance.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("nodeTrustScoring");

export interface NodeTrustBreakdown {
  nodeId: string;
  completionScore: number;
  disputeScore: number;
  complianceScore: number;
  capitalUtilizationScore: number;
  returnConsistencyScore: number;
  crossBorderReliabilityScore: number;
  compositeScore: number;
}

export async function calculateNodeTrustScore(nodeId: string): Promise<NodeTrustBreakdown> {
  const { data: node } = await (supabase as any).from("sovereign_nodes").select("*").eq("id", nodeId).single();
  if (!node) throw new Error("Node not found");

  // Deal stats
  const { data: deals } = await supabase.from("deal_rooms").select("status").eq("tenant_id", node.tenant_id);
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed").length;
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const completionScore = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 50;
  const disputeScore = allDeals.length > 0 ? Math.max(0, 100 - Math.round((disputed / allDeals.length) * 200)) : 50;

  // Compliance
  const { data: risk } = await (supabase as any).from("compliance_risk_profiles")
    .select("compliance_risk_score").eq("user_id", node.tenant_id).maybeSingle();
  const complianceScore = Math.max(0, 100 - (risk?.compliance_risk_score ?? 0));

  // Capital utilization
  const contributed = node.total_network_capital_contributed ?? 0;
  const received = node.total_network_capital_received ?? 0;
  const limit = node.node_capital_limit ?? 1;
  const capitalUtilizationScore = limit > 0 ? Math.min(100, Math.round((contributed / limit) * 100)) : 50;

  // Return consistency (liquidity returns)
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges")
    .select("status").eq("lender_node_id", nodeId);
  const lent = exchanges ?? [];
  const returned = lent.filter((e: any) => e.status === "returned").length;
  const defaulted = lent.filter((e: any) => e.status === "defaulted").length;
  const returnConsistencyScore = lent.length > 0 ? Math.round(((returned) / lent.length) * 100) : 50;

  // Cross-border reliability
  const { data: routes } = await (supabase as any).from("network_capital_routes")
    .select("status, cross_border_agreement_id").eq("source_node_id", nodeId);
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id != null);
  const successCross = crossBorder.filter((r: any) => r.status === "completed").length;
  const crossBorderReliabilityScore = crossBorder.length > 0 ? Math.round((successCross / crossBorder.length) * 100) : 50;

  // Composite: weighted average
  const compositeScore = Math.min(100, Math.round(
    completionScore * 0.2 + disputeScore * 0.2 + complianceScore * 0.15 +
    capitalUtilizationScore * 0.15 + returnConsistencyScore * 0.15 + crossBorderReliabilityScore * 0.15
  ));

  // Update node trust score
  await (supabase as any).from("sovereign_nodes").update({
    node_trust_score: compositeScore, updated_at: new Date().toISOString(),
  }).eq("id", nodeId);

  log.info("Node trust score calculated", { nodeId, compositeScore });

  return {
    nodeId, completionScore, disputeScore, complianceScore,
    capitalUtilizationScore, returnConsistencyScore, crossBorderReliabilityScore, compositeScore,
  };
}
