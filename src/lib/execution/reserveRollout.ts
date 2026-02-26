/**
 * Reserve Layer Staged Rollout — 5-stage gated activation.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("reserveRollout");

export type ReserveStage = 1 | 2 | 3 | 4 | 5;

export interface StageRequirements {
  stage: ReserveStage;
  name: string;
  minStabilityScore: number;
  minCreditMaturity: number;
  minLiquidityStability: number;
  governanceApprovalRequired: boolean;
  description: string;
}

const STAGES: StageRequirements[] = [
  { stage: 1, name: "Simulation Only", minStabilityScore: 0, minCreditMaturity: 0, minLiquidityStability: 0, governanceApprovalRequired: false, description: "Reserve unit modeling and simulation — no real issuance" },
  { stage: 2, name: "Internal Institutional Pilot", minStabilityScore: 70, minCreditMaturity: 60, minLiquidityStability: 65, governanceApprovalRequired: true, description: "Limited issuance within select institutions" },
  { stage: 3, name: "Cross-Border Pilot", minStabilityScore: 80, minCreditMaturity: 70, minLiquidityStability: 75, governanceApprovalRequired: true, description: "Multi-region settlement testing" },
  { stage: 4, name: "Regulatory-Coordinated Activation", minStabilityScore: 85, minCreditMaturity: 80, minLiquidityStability: 80, governanceApprovalRequired: true, description: "Full compliance-cleared activation" },
  { stage: 5, name: "Global Scaled Reserve Issuance", minStabilityScore: 90, minCreditMaturity: 85, minLiquidityStability: 85, governanceApprovalRequired: true, description: "Planetary-scale reserve operations" },
];

export function getStageRequirements(stage: ReserveStage): StageRequirements {
  return STAGES[stage - 1];
}

export function getAllStages(): StageRequirements[] {
  return [...STAGES];
}

export function validateStageReadiness(stage: ReserveStage, metrics: {
  stabilityScore: number; creditMaturity: number; liquidityStability: number; governanceApproved: boolean;
}): { ready: boolean; blockers: string[] } {
  const req = getStageRequirements(stage);
  const blockers: string[] = [];

  if (metrics.stabilityScore < req.minStabilityScore) blockers.push(`Stability ${metrics.stabilityScore} < ${req.minStabilityScore}`);
  if (metrics.creditMaturity < req.minCreditMaturity) blockers.push(`Credit maturity ${metrics.creditMaturity} < ${req.minCreditMaturity}`);
  if (metrics.liquidityStability < req.minLiquidityStability) blockers.push(`Liquidity stability ${metrics.liquidityStability} < ${req.minLiquidityStability}`);
  if (req.governanceApprovalRequired && !metrics.governanceApproved) blockers.push("Governance approval required");

  if (blockers.length > 0) log.info("Stage not ready", { stage, blockers });
  return { ready: blockers.length === 0, blockers };
}
