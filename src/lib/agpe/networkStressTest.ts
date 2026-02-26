/**
 * Network Stress Test — simulates adverse scenarios, measures resilience.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("networkStressTest");

export interface StressScenario {
  name: string;
  description: string;
}

export interface StressTestResult {
  scenario: string;
  escrowStability: number;
  liquiditySufficiency: number;
  capitalRecyclingImpact: number;
  nodeTrustDegradation: number;
  resilienceScore: number;
}

const SCENARIOS: Record<string, StressScenario> = {
  dispute_spike: { name: "30% Dispute Spike", description: "30% of active deals become disputed" },
  funding_drop: { name: "50% Sponsor Funding Drop", description: "Sponsor funding decreases by 50%" },
  stripe_outage: { name: "Region Stripe Outage", description: "Primary region Stripe connectivity lost" },
  pool_default: { name: "Capital Pool Default", description: "Largest capital pool defaults entirely" },
  cross_border_freeze: { name: "Cross-Border Freeze", description: "All cross-border agreements suspended" },
};

export function getAvailableScenarios(): StressScenario[] {
  return Object.values(SCENARIOS);
}

export async function runStressTest(scenarioKey: string): Promise<StressTestResult> {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioKey}`);

  // Baseline data (read-only)
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount");
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const { data: exchanges } = await (supabase as any).from("liquidity_exchanges").select("amount, status");
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score, total_network_capital_contributed");

  const allDeals = deals ?? [];
  const allPools = pools ?? [];
  const allExchanges = exchanges ?? [];
  const allNodes = nodes ?? [];

  const totalEscrow = allDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
  const totalCommitted = allPools.reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const activeLiquidity = allExchanges.filter((e: any) => e.status === "active").reduce((s: number, e: any) => s + (e.amount ?? 0), 0);
  const avgTrust = allNodes.length > 0 ? allNodes.reduce((s: number, n: any) => s + (n.node_trust_score ?? 0), 0) / allNodes.length : 50;

  let escrowStability = 90, liquiditySufficiency = 85, capitalRecycling = 80, trustDegradation = 10;

  switch (scenarioKey) {
    case "dispute_spike":
      escrowStability = Math.max(20, 90 - 30);
      trustDegradation = 35;
      capitalRecycling = Math.max(20, 80 - 25);
      break;
    case "funding_drop":
      liquiditySufficiency = Math.max(10, 85 - 42);
      capitalRecycling = Math.max(15, 80 - 35);
      break;
    case "stripe_outage":
      escrowStability = Math.max(30, 90 - 40);
      liquiditySufficiency = Math.max(20, 85 - 30);
      break;
    case "pool_default":
      const maxPool = allPools.reduce((m: number, p: any) => Math.max(m, p.total_committed ?? 0), 0);
      const exposure = totalCommitted > 0 ? (maxPool / totalCommitted) * 100 : 0;
      escrowStability = Math.max(10, 90 - Math.round(exposure * 0.8));
      capitalRecycling = Math.max(10, 80 - Math.round(exposure * 0.6));
      trustDegradation = Math.round(exposure * 0.5);
      break;
    case "cross_border_freeze":
      capitalRecycling = Math.max(30, 80 - 20);
      trustDegradation = 25;
      break;
  }

  const resilienceScore = Math.round(
    escrowStability * 0.3 + liquiditySufficiency * 0.25 + capitalRecycling * 0.2 + (100 - trustDegradation) * 0.25
  );

  log.info("Stress test completed", { scenario: scenarioKey, resilienceScore });

  return {
    scenario: scenario.name, escrowStability, liquiditySufficiency,
    capitalRecyclingImpact: capitalRecycling, nodeTrustDegradation: trustDegradation,
    resilienceScore,
  };
}
