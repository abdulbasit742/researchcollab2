/**
 * Global Treasury Visibility Model — GLOBAL_TREASURY_SCORE (0-100).
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalTreasuryModel");

export interface GlobalTreasury {
  totalGlobalCapital: number;
  totalLockedLiquidity: number;
  totalCirculatingCapital: number;
  crossBorderLiquidityPercent: number;
  idleCapitalPercent: number;
  riskWeightedExposure: number;
  globalTreasuryScore: number;
  timestamp: string;
}

export async function calculateGlobalTreasury(): Promise<GlobalTreasury> {
  // Wallets
  const { data: wallets } = await (supabase as any).from("wallets").select("balance, escrow_locked");
  const totalBalance = (wallets ?? []).reduce((s: number, w: any) => s + (w.balance ?? 0), 0);
  const totalEscrow = (wallets ?? []).reduce((s: number, w: any) => s + (w.escrow_locked ?? 0), 0);

  // Capital pools
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalPoolCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  // Grant pools
  const { data: grants } = await (supabase as any).from("public_grant_pools").select("total_committed, total_allocated");
  const grantCapital = (grants ?? []).reduce((s: number, g: any) => s + (g.total_committed ?? 0), 0);

  // Liquidity exchanges
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("amount, status");
  const activeLiquidity = (exchanges ?? []).filter((e: any) => e.status === "active").reduce((s: number, e: any) => s + (e.amount ?? 0), 0);

  // Cross-border
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderRouted = (routes ?? []).filter((r: any) => r.cross_border_agreement_id != null).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

  const totalGlobalCapital = totalBalance + totalPoolCapital + grantCapital;
  const totalLocked = totalEscrow + activeLiquidity;
  const circulating = totalGlobalCapital - totalLocked;
  const crossBorderPercent = totalRouted > 0 ? Math.round((crossBorderRouted / totalRouted) * 100) : 0;
  const idleCapital = totalPoolCapital > 0 ? Math.round(((totalPoolCapital - totalAllocated) / totalPoolCapital) * 100) : 0;

  // Risk-weighted exposure
  const riskWeighted = Math.round(totalLocked * 0.1 + (totalPoolCapital - totalAllocated) * 0.05);

  // Treasury score
  const utilizationScore = totalPoolCapital > 0 ? (totalAllocated / totalPoolCapital) * 40 : 20;
  const liquidityScore = totalGlobalCapital > 0 ? Math.min(30, (circulating / totalGlobalCapital) * 30) : 15;
  const diversificationScore = crossBorderPercent > 0 ? Math.min(30, crossBorderPercent * 0.6) : 5;
  const globalTreasuryScore = Math.min(100, Math.round(utilizationScore + liquidityScore + diversificationScore));

  log.info("Global treasury calculated", { globalTreasuryScore, totalGlobalCapital });

  return {
    totalGlobalCapital, totalLockedLiquidity: totalLocked,
    totalCirculatingCapital: circulating, crossBorderLiquidityPercent: crossBorderPercent,
    idleCapitalPercent: idleCapital, riskWeightedExposure: riskWeighted,
    globalTreasuryScore, timestamp: new Date().toISOString(),
  };
}
