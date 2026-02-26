/**
 * Civilizational Optimization Kernel — aggregate, detect drift, propose corrections.
 */

import { calculatePlanetaryHealth } from "@/lib/planetary/planetaryHealthIndex";
import { calculateCivilizationalHealth } from "@/lib/civilization/civilizationalHealthIndex";
import { calculatePlanetaryRiskDistribution } from "@/lib/planetary/riskDistribution";
import { calculateLiquidityStability } from "@/lib/planetary/liquidityStability";
import { calculateGlobalTrustIndex } from "@/lib/world/trustEconomyEngine";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("optimizationKernel");

export interface OptimizationProposal {
  dimension: string;
  currentValue: number;
  targetValue: number;
  proposedAction: string;
  riskDelta: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface KernelSnapshot {
  planetaryHealth: number;
  civilizationalStability: number;
  systemicRisk: number;
  liquidityStability: number;
  trustIndex: number;
  proposals: OptimizationProposal[];
  timestamp: string;
}

export async function runOptimizationCycle(): Promise<KernelSnapshot> {
  const [planetary, civilizational, risk, liquidity, trust] = await Promise.all([
    calculatePlanetaryHealth(),
    calculateCivilizationalHealth(),
    calculatePlanetaryRiskDistribution(),
    calculateLiquidityStability(),
    calculateGlobalTrustIndex(),
  ]);

  const proposals: OptimizationProposal[] = [];

  if (risk.planetarySystemicRiskIndex > 60) {
    proposals.push({ dimension: "risk", currentValue: risk.planetarySystemicRiskIndex, targetValue: 40, proposedAction: "Diversify capital concentration and reduce systemic node dependency", riskDelta: -20, priority: "critical" });
  }
  if (liquidity.idleCapitalPercent > 40) {
    proposals.push({ dimension: "liquidity", currentValue: liquidity.idleCapitalPercent, targetValue: 20, proposedAction: "Redirect idle capital to underfunded regions via cross-border routes", riskDelta: 5, priority: "high" });
  }
  if (trust.globalTrustIndex < 50) {
    proposals.push({ dimension: "trust", currentValue: trust.globalTrustIndex, targetValue: 65, proposedAction: "Incentivize outcome completion and cross-border collaboration", riskDelta: -5, priority: "high" });
  }
  if (planetary.planetaryInstitutionalHealthScore < 60) {
    proposals.push({ dimension: "health", currentValue: planetary.planetaryInstitutionalHealthScore, targetValue: 75, proposedAction: "Strengthen weakest subsystem scores via targeted governance action", riskDelta: -10, priority: "medium" });
  }
  if (liquidity.capitalStagnationRisk > 50) {
    proposals.push({ dimension: "stagnation", currentValue: liquidity.capitalStagnationRisk, targetValue: 25, proposedAction: "Increase cross-border capital velocity incentives", riskDelta: 3, priority: "medium" });
  }

  log.info("Optimization cycle complete", { proposalCount: proposals.length });

  return {
    planetaryHealth: planetary.planetaryInstitutionalHealthScore,
    civilizationalStability: civilizational.civilizationalStabilityScore,
    systemicRisk: risk.planetarySystemicRiskIndex,
    liquidityStability: liquidity.planetaryLiquidityStabilityIndex,
    trustIndex: trust.globalTrustIndex,
    proposals,
    timestamp: new Date().toISOString(),
  };
}
