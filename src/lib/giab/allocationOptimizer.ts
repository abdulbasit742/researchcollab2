/**
 * Capital Allocation Optimization Engine — multi-objective scoring, no black-box ML.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("allocationOptimizer");

export interface AllocationRecommendation {
  sourceNode: string;
  targetNode: string;
  recommendedAmount: number;
  innovationGrowthImpact: number;
  riskAdjustedReturnImpact: number;
  diversificationImpact: number;
  trustStabilityImpact: number;
  compositeScore: number;
  rationale: string[];
  requiresGovernanceApproval: boolean;
}

const GOVERNANCE_THRESHOLD = 50000;

export async function generateAllocationRecommendations(): Promise<AllocationRecommendation[]> {
  const { data: pools } = await (supabase as any).from("capital_pools").select("id, tenant_id, total_committed, total_allocated");
  const recommendations: AllocationRecommendation[] = [];

  const poolList = pools ?? [];
  if (poolList.length < 2) return recommendations;

  // Find over-funded and under-funded nodes
  const overFunded: any[] = [];
  const underFunded: any[] = [];

  for (const p of poolList) {
    const utilization = p.total_committed > 0 ? p.total_allocated / p.total_committed : 0;
    const idle = (p.total_committed ?? 0) - (p.total_allocated ?? 0);
    if (utilization < 0.3 && idle > 10000) overFunded.push({ ...p, idle });
    if (utilization > 0.85) underFunded.push(p);
  }

  for (const source of overFunded) {
    for (const target of underFunded) {
      if (source.tenant_id === target.tenant_id) continue;

      const amount = Math.min(source.idle * 0.3, 100000);
      if (amount < 5000) continue;

      const rationale: string[] = [];
      rationale.push(`Source pool ${source.id} has ${Math.round(source.idle)} idle capital`);
      rationale.push(`Target pool ${target.id} is ${Math.round((target.total_allocated / target.total_committed) * 100)}% utilized`);

      const innovationImpact = Math.min(30, Math.round(amount / 5000));
      const riskReturn = Math.max(0, 20 - Math.round(amount / 20000));
      const diversification = source.tenant_id !== target.tenant_id ? 20 : 5;
      const trustStability = 15;

      const composite = Math.round(innovationImpact * 0.3 + riskReturn * 0.25 + diversification * 0.25 + trustStability * 0.2);

      recommendations.push({
        sourceNode: source.id, targetNode: target.id, recommendedAmount: Math.round(amount),
        innovationGrowthImpact: innovationImpact, riskAdjustedReturnImpact: riskReturn,
        diversificationImpact: diversification, trustStabilityImpact: trustStability,
        compositeScore: Math.min(100, composite), rationale,
        requiresGovernanceApproval: amount > GOVERNANCE_THRESHOLD,
      });
    }
  }

  recommendations.sort((a, b) => b.compositeScore - a.compositeScore);
  log.info("Allocation recommendations generated", { count: recommendations.length });
  return recommendations.slice(0, 20);
}
