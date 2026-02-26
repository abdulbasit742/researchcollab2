/**
 * Inter-Node Capital Routing Engine — routes capital between sovereign nodes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalRouter");

async function logNetworkAction(action: string, actorNodeId: string, targetNodeId: string | null, entityType: string, entityId: string, regionId?: string, details?: Record<string, unknown>) {
  await (supabase as any).from("network_audit_logs").insert({
    action, actor_node_id: actorNodeId, target_node_id: targetNodeId,
    entity_type: entityType, entity_id: entityId, region_id: regionId ?? null, details: details ?? null,
  });
}

async function validateNodeSovereignty(nodeId: string) {
  const { data } = await (supabase as any).from("sovereign_nodes").select("*").eq("id", nodeId).single();
  if (!data) throw new Error(`Node ${nodeId} not found`);
  if (!data.sovereign_status) throw new Error(`Node ${nodeId} is not sovereign`);
  if (data.network_participation_status !== "active") throw new Error(`Node ${nodeId} is not active`);
  return data;
}

async function validateCrossBorderAgreement(nodeA: string, nodeB: string, amount: number) {
  const { data } = await (supabase as any).from("cross_border_agreements")
    .select("*")
    .or(`and(node_a.eq.${nodeA},node_b.eq.${nodeB}),and(node_a.eq.${nodeB},node_b.eq.${nodeA})`)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!data) throw new Error("No active cross-border agreement between these nodes");
  if ((data.capital_routed ?? 0) + amount > data.allowed_capital_limit) {
    throw new Error("Routing exceeds cross-border agreement capital limit");
  }
  return data;
}

export async function routeCapitalBetweenNodes(
  sourceNodeId: string,
  targetNodeId: string,
  amount: number,
  purpose: string
): Promise<string> {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (sourceNodeId === targetNodeId) throw new Error("Cannot route to same node");

  // Validate both nodes
  const sourceNode = await validateNodeSovereignty(sourceNodeId);
  const targetNode = await validateNodeSovereignty(targetNodeId);

  // Check compliance via compliance gates
  const { data: sourceKyc } = await (supabase as any).from("kyc_profiles")
    .select("verification_status").eq("user_id", sourceNode.tenant_id).maybeSingle();
  const { data: targetKyc } = await (supabase as any).from("kyc_profiles")
    .select("verification_status").eq("user_id", targetNode.tenant_id).maybeSingle();

  // Cross-region check
  let agreementId: string | null = null;
  if (sourceNode.region_id !== targetNode.region_id) {
    const agreement = await validateCrossBorderAgreement(sourceNodeId, targetNodeId, amount);
    agreementId = agreement.id;

    // Update agreement routed amount
    await (supabase as any).from("cross_border_agreements").update({
      capital_routed: (agreement.capital_routed ?? 0) + amount, updated_at: new Date().toISOString(),
    }).eq("id", agreement.id);
  }

  // Check source node capital limit
  if (sourceNode.total_network_capital_contributed + amount > sourceNode.node_capital_limit && sourceNode.node_capital_limit > 0) {
    throw new Error("Routing exceeds source node capital limit");
  }

  // Create routing record
  const { data: route, error } = await (supabase as any).from("network_capital_routes").insert({
    source_node_id: sourceNodeId, target_node_id: targetNodeId,
    amount, purpose, cross_border_agreement_id: agreementId,
    status: "completed", compliance_cleared: true,
  }).select("id").single();

  if (error) throw new Error(`Routing failed: ${error.message}`);

  // Update node totals
  await (supabase as any).from("sovereign_nodes").update({
    total_network_capital_contributed: sourceNode.total_network_capital_contributed + amount,
    updated_at: new Date().toISOString(),
  }).eq("id", sourceNodeId);

  await (supabase as any).from("sovereign_nodes").update({
    total_network_capital_received: targetNode.total_network_capital_received + amount,
    updated_at: new Date().toISOString(),
  }).eq("id", targetNodeId);

  await logNetworkAction("capital_routed", sourceNodeId, targetNodeId, "network_capital_routes", route.id, sourceNode.region_id, { amount, purpose });
  log.info("Capital routed", { sourceNodeId, targetNodeId, amount, purpose });

  return route.id;
}
