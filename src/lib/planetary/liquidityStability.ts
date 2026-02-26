/**
 * Planetary Liquidity Stability Engine — PLANETARY_LIQUIDITY_STABILITY_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("liquidityStability");

export interface LiquidityStabilityProfile {
  globalLockedCapital: number;
  crossBorderVelocity: number;
  idleCapitalPercent: number;
  highRiskConcentration: number;
  interNodeImbalance: number;
  capitalStagnationRisk: number;
  planetaryLiquidityStabilityIndex: number;
}

export async function calculateLiquidityStability(): Promise<LiquidityStabilityProfile> {
  const { data: wallets } = await (supabase as any).from("wallets").select("balance, escrow_locked");
  const totalBalance = (wallets ?? []).reduce((s: number, w: any) => s + (w.balance ?? 0), 0);
  const totalLocked = (wallets ?? []).reduce((s: number, w: any) => s + (w.escrow_locked ?? 0), 0);

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const idleCapital = totalCommitted > 0 ? Math.round(((totalCommitted - totalAllocated) / totalCommitted) * 100) : 0;

  // Cross-border velocity
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderVelocity = totalCommitted > 0 ? Math.min(100, Math.round((crossBorder / totalCommitted) * 100)) : 0;

  // Concentration risk
  const maxPool = (pools ?? []).reduce((m: number, p: any) => Math.max(m, p.total_committed ?? 0), 0);
  const concentration = totalCommitted > 0 ? Math.round((maxPool / totalCommitted) * 100) : 0;

  // Inter-node imbalance
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("total_network_capital_contributed, total_network_capital_received");
  const contributions = (nodes ?? []).map((n: any) => (n.total_network_capital_contributed ?? 0) - (n.total_network_capital_received ?? 0));
  const maxImbalance = contributions.length > 0 ? Math.max(...contributions.map(Math.abs)) : 0;
  const totalNodeCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const imbalance = totalNodeCapital > 0 ? Math.min(100, Math.round((maxImbalance / totalNodeCapital) * 100)) : 0;

  // Stagnation: high idle + low velocity
  const stagnation = Math.round(idleCapital * 0.6 + (100 - crossBorderVelocity) * 0.4);

  const stabilityIndex = Math.max(0, Math.min(100, Math.round(
    (100 - idleCapital) * 0.2 + crossBorderVelocity * 0.2 + (100 - concentration) * 0.2 +
    (100 - imbalance) * 0.2 + (100 - stagnation) * 0.2
  )));

  log.info("Liquidity stability calculated", { stabilityIndex });

  return {
    globalLockedCapital: totalLocked, crossBorderVelocity, idleCapitalPercent: idleCapital,
    highRiskConcentration: concentration, interNodeImbalance: imbalance,
    capitalStagnationRisk: stagnation, planetaryLiquidityStabilityIndex: stabilityIndex,
  };
}
