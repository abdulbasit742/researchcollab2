/**
 * Capital Flow Auto-Rebalancing Simulator — propose-only capital redistribution.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalRebalancer");

export interface RebalanceRecommendation {
  sourceNodeId: string;
  targetNodeId: string;
  amount: number;
  reason: string;
  riskDelta: number;
  projectedGrowthImpact: number;
}

export interface RebalanceSimulation {
  recommendations: RebalanceRecommendation[];
  totalCapitalMoved: number;
  projectedRiskReduction: number;
  projectedIdleReduction: number;
  timestamp: string;
}

export async function simulateCapitalRebalancing(): Promise<RebalanceSimulation> {
  const { data: nodes } = await (supabase as any).from("sovereign_nodes")
    .select("id, node_trust_score, total_network_capital_contributed, total_network_capital_received");

  if (!nodes || nodes.length < 2) {
    return { recommendations: [], totalCapitalMoved: 0, projectedRiskReduction: 0, projectedIdleReduction: 0, timestamp: new Date().toISOString() };
  }

  const totalCapital = nodes.reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const avgCapital = totalCapital / nodes.length;
  const recommendations: RebalanceRecommendation[] = [];

  // Over-concentrated → under-funded
  const overConcentrated = nodes.filter((n: any) => (n.total_network_capital_contributed ?? 0) > avgCapital * 1.5);
  const underFunded = nodes.filter((n: any) => (n.total_network_capital_contributed ?? 0) < avgCapital * 0.5 && (n.node_trust_score ?? 0) >= 40);

  for (const source of overConcentrated) {
    for (const target of underFunded) {
      const excess = (source.total_network_capital_contributed ?? 0) - avgCapital;
      const amount = Math.round(Math.min(excess * 0.2, avgCapital * 0.3));
      if (amount > 0) {
        recommendations.push({
          sourceNodeId: source.id, targetNodeId: target.id, amount,
          reason: `Reduce concentration at source (${Math.round(excess)} excess) and fund underserved node`,
          riskDelta: -5, projectedGrowthImpact: 3,
        });
      }
    }
  }

  const totalMoved = recommendations.reduce((s, r) => s + r.amount, 0);

  log.info("Capital rebalancing simulated", { recommendations: recommendations.length, totalMoved });

  return {
    recommendations, totalCapitalMoved: totalMoved,
    projectedRiskReduction: Math.min(20, recommendations.length * 3),
    projectedIdleReduction: Math.min(15, recommendations.length * 2),
    timestamp: new Date().toISOString(),
  };
}
