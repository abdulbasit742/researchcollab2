/**
 * System-Wide Health Model — GLOBAL_NETWORK_HEALTH_INDEX (0-100).
 */

import { supabase } from "@/integrations/supabase/client";
import { projectRisk } from "./riskProjectionEngine";
import { calculateEconomicImpact } from "./economicImpactModel";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("systemHealthModel");

export interface SystemHealth {
  financialHealth: number;
  liquidityHealth: number;
  complianceHealth: number;
  governanceStability: number;
  innovationGrowth: number;
  globalNetworkHealthIndex: number;
  timestamp: string;
}

export async function calculateSystemHealth(): Promise<SystemHealth> {
  // Financial health: escrow integrity + wallet health
  const { data: wallets } = await (supabase as any).from("wallets").select("balance, escrow_locked");
  const allWallets = wallets ?? [];
  const totalBalance = allWallets.reduce((s: number, w: any) => s + (w.balance ?? 0), 0);
  const totalEscrow = allWallets.reduce((s: number, w: any) => s + (w.escrow_locked ?? 0), 0);
  const financialHealth = totalBalance > 0 ? Math.min(100, Math.round(((totalBalance - totalEscrow) / totalBalance) * 100 + 30)) : 50;

  // Liquidity health
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("status");
  const allExchanges = exchanges ?? [];
  const defaulted = allExchanges.filter((e: any) => e.status === "defaulted").length;
  const liquidityHealth = allExchanges.length > 0 ? Math.max(0, 100 - Math.round((defaulted / allExchanges.length) * 200)) : 80;

  // Compliance health
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("id, resolved");
  const unresolved = (alerts ?? []).filter((a: any) => !a.resolved).length;
  const complianceHealth = Math.max(0, 100 - unresolved * 5);

  // Governance stability
  const { data: policies } = await (supabase as any).from("governance_policies").select("status");
  const activePolicies = (policies ?? []).filter((p: any) => p.status === "active").length;
  const rejectedPolicies = (policies ?? []).filter((p: any) => p.status === "rejected").length;
  const governanceStability = Math.max(30, 80 + activePolicies * 2 - rejectedPolicies * 5);

  // Innovation growth
  const impact = await calculateEconomicImpact();
  const innovationGrowth = impact.innovationIndex;

  // Global index
  const globalNetworkHealthIndex = Math.min(100, Math.round(
    financialHealth * 0.25 + liquidityHealth * 0.2 + complianceHealth * 0.2 + governanceStability * 0.15 + innovationGrowth * 0.2
  ));

  log.info("System health calculated", { globalNetworkHealthIndex });

  return {
    financialHealth, liquidityHealth, complianceHealth,
    governanceStability: Math.min(100, governanceStability),
    innovationGrowth, globalNetworkHealthIndex,
    timestamp: new Date().toISOString(),
  };
}
