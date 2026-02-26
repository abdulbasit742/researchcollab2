/**
 * Capital Shock Absorption Model — models sudden withdrawals, defaults, trust collapses.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("shockAbsorption");

export interface ShockAbsorptionProfile {
  absorptionCapacity: number;
  capitalRedistributionEfficiency: number;
  systemicFailureProbability: number;
  reserveRatio: number;
  shockAbsorptionScore: number;
}

export async function calculateShockAbsorption(): Promise<ShockAbsorptionProfile> {
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const reserves = totalCommitted - totalAllocated;
  const reserveRatio = totalCommitted > 0 ? Math.round((reserves / totalCommitted) * 100) : 0;

  const { data: wallets } = await (supabase as any).from("wallets").select("balance, escrow_locked");
  const totalBalance = (wallets ?? []).reduce((s: number, w: any) => s + (w.balance ?? 0), 0);
  const totalLocked = (wallets ?? []).reduce((s: number, w: any) => s + (w.escrow_locked ?? 0), 0);
  const liquidRatio = (totalBalance + reserves) > 0 ? ((totalBalance - totalLocked + reserves) / (totalBalance + reserves)) * 100 : 50;

  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score");
  const avgTrust = (nodes ?? []).length > 0
    ? (nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 50), 0) / nodes.length : 50;

  const absorptionCapacity = Math.min(100, Math.round(reserveRatio * 0.4 + liquidRatio * 0.3 + avgTrust * 0.3));
  const redistributionEfficiency = Math.min(100, Math.round(reserveRatio * 0.5 + (pools ?? []).length * 5));
  const failureProbability = Math.max(0, Math.round(100 - absorptionCapacity * 0.6 - avgTrust * 0.4));
  const shockScore = Math.round(absorptionCapacity * 0.4 + redistributionEfficiency * 0.3 + (100 - failureProbability) * 0.3);

  log.info("Shock absorption calculated", { shockScore });

  return {
    absorptionCapacity, capitalRedistributionEfficiency: redistributionEfficiency,
    systemicFailureProbability: failureProbability, reserveRatio, shockAbsorptionScore: shockScore,
  };
}
