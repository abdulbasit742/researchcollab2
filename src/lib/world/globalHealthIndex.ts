/**
 * Global Health Index — WORLD_NETWORK_HEALTH_INDEX (0-100).
 */

import { calculateGlobalTrustIndex } from "./trustEconomyEngine";
import { calculateGlobalRisk } from "./globalRiskEngine";
import { calculateGlobalTreasury } from "./globalTreasuryModel";
import { calculateSystemHealth } from "@/lib/agpe/systemHealthModel";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("globalHealthIndex");

export interface WorldHealthIndex {
  trustIndex: number;
  riskScore: number;
  capitalEfficiency: number;
  complianceHealth: number;
  governanceStability: number;
  innovationGrowth: number;
  treasuryScore: number;
  worldNetworkHealthIndex: number;
  timestamp: string;
}

export async function calculateWorldHealthIndex(): Promise<WorldHealthIndex> {
  const [trust, risk, treasury, system] = await Promise.all([
    calculateGlobalTrustIndex(),
    calculateGlobalRisk(),
    calculateGlobalTreasury(),
    calculateSystemHealth(),
  ]);

  const worldIndex = Math.min(100, Math.round(
    trust.globalTrustIndex * 0.2 +
    (100 - risk.globalSystemicRiskScore) * 0.15 +
    treasury.globalTreasuryScore * 0.15 +
    system.financialHealth * 0.15 +
    system.complianceHealth * 0.1 +
    system.governanceStability * 0.1 +
    system.innovationGrowth * 0.15
  ));

  log.info("World health index calculated", { worldIndex });

  return {
    trustIndex: trust.globalTrustIndex,
    riskScore: risk.globalSystemicRiskScore,
    capitalEfficiency: treasury.globalTreasuryScore,
    complianceHealth: system.complianceHealth,
    governanceStability: system.governanceStability,
    innovationGrowth: system.innovationGrowth,
    treasuryScore: treasury.globalTreasuryScore,
    worldNetworkHealthIndex: worldIndex,
    timestamp: new Date().toISOString(),
  };
}
