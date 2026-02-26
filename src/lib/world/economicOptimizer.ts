/**
 * Autonomous Economic Optimization Engine — continuous analysis + recommendations.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("economicOptimizer");

export interface EconomicRecommendation {
  type: string;
  target: string;
  currentState: Record<string, unknown>;
  recommendation: Record<string, unknown>;
  rationale: string;
  confidence: number;
  riskLevel: string;
}

export async function generateEconomicOptimizations(): Promise<EconomicRecommendation[]> {
  const recs: EconomicRecommendation[] = [];

  // Analyze capital stagnation
  const { data: pools } = await (supabase as any).from("capital_pools").select("id, total_committed, total_allocated, tenant_id");
  for (const pool of (pools ?? []).slice(0, 20)) {
    const utilization = pool.total_committed > 0 ? (pool.total_allocated / pool.total_committed) * 100 : 0;
    if (utilization < 30 && pool.total_committed > 0) {
      recs.push({
        type: "capital_reallocation", target: pool.id,
        currentState: { utilization, committed: pool.total_committed },
        recommendation: { action: "redistribute_to_active_pools", amount: pool.total_committed * 0.3 },
        rationale: `Pool utilization at ${utilization.toFixed(0)}%. Recommend redistributing 30% to active pools.`,
        confidence: 70, riskLevel: "low",
      });
    }
  }

  // Analyze low-performing nodes
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, node_trust_score, total_network_capital_contributed, network_participation_status");
  for (const node of (nodes ?? []).filter((n: any) => n.network_participation_status === "active")) {
    if ((node.node_trust_score ?? 50) < 35) {
      recs.push({
        type: "trust_recalibration", target: node.id,
        currentState: { trustScore: node.node_trust_score },
        recommendation: { action: "reduce_capital_routing_weight", factor: 0.5 },
        rationale: `Node trust score ${node.node_trust_score} below 35. Recommend reducing routing weight.`,
        confidence: 75, riskLevel: "medium",
      });
    }
  }

  // Analyze cross-border caps
  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id, node_a, node_b, allowed_capital_limit, capital_routed").eq("active", true);
  for (const agr of agreements ?? []) {
    const usage = agr.allowed_capital_limit > 0 ? ((agr.capital_routed ?? 0) / agr.allowed_capital_limit) * 100 : 0;
    if (usage > 85) {
      recs.push({
        type: "cross_border_cap_increase", target: agr.id,
        currentState: { usage, limit: agr.allowed_capital_limit },
        recommendation: { action: "increase_limit", newLimit: agr.allowed_capital_limit * 1.5 },
        rationale: `Cross-border agreement at ${usage.toFixed(0)}% capacity. Recommend 50% limit increase.`,
        confidence: 65, riskLevel: "medium",
      });
    }
  }

  // Store in optimizer_recommendations
  for (const rec of recs) {
    await (supabase as any).from("optimizer_recommendations").insert({
      recommendation_type: rec.type, recommended_value: rec.recommendation,
      rationale: rec.rationale, confidence_score: rec.confidence,
      impact_summary: { riskLevel: rec.riskLevel, target: rec.target }, status: "pending",
    });
  }

  log.info("Economic optimizations generated", { count: recs.length });
  return recs;
}
