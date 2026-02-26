/**
 * Network Liquidity Exchange — time-bound capital lending between sovereign nodes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("liquidityExchange");

export interface LiquidityProposal {
  lenderNodeId: string;
  borrowerNodeId: string;
  amount: number;
  returnModel: "interest_free" | "fixed_return";
  fixedReturnRate?: number;
  durationDays: number;
}

export async function proposeLiquidityExchange(proposal: LiquidityProposal): Promise<string> {
  if (proposal.amount <= 0) throw new Error("Amount must be positive");
  if (proposal.lenderNodeId === proposal.borrowerNodeId) throw new Error("Cannot lend to self");

  // Validate both nodes sovereign
  const { data: lender } = await (supabase as any).from("sovereign_nodes").select("*").eq("id", proposal.lenderNodeId).single();
  const { data: borrower } = await (supabase as any).from("sovereign_nodes").select("*").eq("id", proposal.borrowerNodeId).single();

  if (!lender?.sovereign_status) throw new Error("Lender node not sovereign");
  if (!borrower?.sovereign_status) throw new Error("Borrower node not sovereign");

  // Cross-region check
  if (lender.region_id !== borrower.region_id) {
    const { data: agreement } = await (supabase as any).from("cross_border_agreements")
      .select("id")
      .or(`and(node_a.eq.${proposal.lenderNodeId},node_b.eq.${proposal.borrowerNodeId}),and(node_a.eq.${proposal.borrowerNodeId},node_b.eq.${proposal.lenderNodeId})`)
      .eq("active", true).limit(1).maybeSingle();
    if (!agreement) throw new Error("Cross-border agreement required for cross-region liquidity");
  }

  const returnAmount = proposal.returnModel === "fixed_return"
    ? proposal.amount * (1 + (proposal.fixedReturnRate ?? 0) / 100)
    : proposal.amount;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + proposal.durationDays);

  const { data, error } = await (supabase as any).from("liquidity_exchanges").insert({
    lender_node_id: proposal.lenderNodeId,
    borrower_node_id: proposal.borrowerNodeId,
    amount: proposal.amount,
    return_amount: returnAmount,
    return_model: proposal.returnModel,
    fixed_return_rate: proposal.fixedReturnRate ?? 0,
    expires_at: expiresAt.toISOString(),
    status: "proposed",
  }).select("id").single();

  if (error) throw new Error(`Liquidity proposal failed: ${error.message}`);

  await (supabase as any).from("network_audit_logs").insert({
    action: "liquidity_proposed", actor_node_id: proposal.lenderNodeId,
    target_node_id: proposal.borrowerNodeId,
    entity_type: "liquidity_exchanges", entity_id: data.id,
    details: { amount: proposal.amount, returnModel: proposal.returnModel, durationDays: proposal.durationDays },
  });

  log.info("Liquidity exchange proposed", { id: data.id });
  return data.id;
}

export async function activateLiquidityExchange(exchangeId: string): Promise<void> {
  const { data } = await (supabase as any).from("liquidity_exchanges").select("*").eq("id", exchangeId).single();
  if (!data) throw new Error("Exchange not found");
  if (data.status !== "proposed") throw new Error("Exchange not in proposed state");

  await (supabase as any).from("liquidity_exchanges").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", exchangeId);

  // Update node totals
  await (supabase as any).from("sovereign_nodes").update({
    total_network_capital_contributed: (await getNodeField(data.lender_node_id, "total_network_capital_contributed")) + data.amount,
  }).eq("id", data.lender_node_id);

  await (supabase as any).from("sovereign_nodes").update({
    total_network_capital_received: (await getNodeField(data.borrower_node_id, "total_network_capital_received")) + data.amount,
  }).eq("id", data.borrower_node_id);

  await (supabase as any).from("network_audit_logs").insert({
    action: "liquidity_activated", actor_node_id: data.lender_node_id,
    target_node_id: data.borrower_node_id,
    entity_type: "liquidity_exchanges", entity_id: exchangeId,
  });

  log.info("Liquidity exchange activated", { exchangeId });
}

async function getNodeField(nodeId: string, field: string): Promise<number> {
  const { data } = await (supabase as any).from("sovereign_nodes").select(field).eq("id", nodeId).single();
  return data?.[field] ?? 0;
}
