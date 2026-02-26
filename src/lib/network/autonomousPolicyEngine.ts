/**
 * Autonomous Capital Allocation Policy Engine — auto-fund deals meeting node criteria.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("autonomousPolicyEngine");

export interface PolicyEvaluation {
  nodeId: string;
  dealId: string;
  eligible: boolean;
  reasons: string[];
  recommendedAmount: number;
}

export async function evaluateDealForAutonomousFunding(
  nodeId: string, dealId: string
): Promise<PolicyEvaluation> {
  const result: PolicyEvaluation = { nodeId, dealId, eligible: true, reasons: [], recommendedAmount: 0 };

  // Get node policy
  const { data: node } = await (supabase as any).from("sovereign_nodes").select("*").eq("id", nodeId).single();
  if (!node) { result.eligible = false; result.reasons.push("Node not found"); return result; }
  if (!node.autonomous_policy_enabled) { result.eligible = false; result.reasons.push("Autonomous policy disabled"); return result; }
  if (!node.sovereign_status) { result.eligible = false; result.reasons.push("Node not sovereign"); return result; }

  // Get deal
  const { data: deal } = await supabase.from("deal_rooms").select("*").eq("id", dealId).single();
  if (!deal) { result.eligible = false; result.reasons.push("Deal not found"); return result; }

  const dealAmount = deal.escrow_amount ?? 0;

  // Check max capital per deal
  if (node.autonomous_max_capital_per_deal > 0 && dealAmount > node.autonomous_max_capital_per_deal) {
    result.eligible = false;
    result.reasons.push(`Deal amount ${dealAmount} exceeds max per deal ${node.autonomous_max_capital_per_deal}`);
  }

  // Check dispute tolerance — get deal tenant dispute rate
  const { data: tenantDeals } = await supabase.from("deal_rooms").select("status").eq("tenant_id", deal.tenant_id);
  const allDeals = tenantDeals ?? [];
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const disputeRate = allDeals.length > 0 ? (disputed / allDeals.length) * 100 : 0;

  if (disputeRate > (node.autonomous_dispute_tolerance ?? 10)) {
    result.eligible = false;
    result.reasons.push(`Tenant dispute rate ${disputeRate.toFixed(1)}% exceeds tolerance ${node.autonomous_dispute_tolerance}%`);
  }

  // Check remaining capacity
  const remaining = (node.node_capital_limit ?? 0) - (node.total_network_capital_contributed ?? 0);
  if (dealAmount > remaining && remaining > 0) {
    result.recommendedAmount = remaining;
    result.reasons.push(`Partial funding recommended: ${remaining}`);
  } else if (result.eligible) {
    result.recommendedAmount = dealAmount;
  }

  if (result.eligible) {
    log.info("Deal eligible for autonomous funding", { nodeId, dealId, amount: result.recommendedAmount });

    // Log the evaluation
    await (supabase as any).from("network_audit_logs").insert({
      action: "autonomous_evaluation_passed", actor_node_id: nodeId,
      entity_type: "deal_rooms", entity_id: dealId,
      details: { recommendedAmount: result.recommendedAmount, disputeRate },
    });
  }

  return result;
}
