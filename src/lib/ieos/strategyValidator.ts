/**
 * Strategic Alignment Validator — ensures every change maps to a strategic objective.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("strategyValidator");

export type StrategicObjective =
  | "escrow_stability"
  | "institutional_trust"
  | "compliance_robustness"
  | "liquidity_resilience"
  | "innovation_efficiency";

export interface StrategicAlignment {
  changeId: string;
  objectives: StrategicObjective[];
  aligned: boolean;
  driftFlag: boolean;
  justification: string;
  evaluatedAt: string;
}

/**
 * Validate that a change aligns with at least one strategic objective.
 */
export function validateStrategicAlignment(
  changeId: string,
  objectives: StrategicObjective[],
  justification: string
): StrategicAlignment {
  const aligned = objectives.length > 0;
  const driftFlag = !aligned;

  const result: StrategicAlignment = {
    changeId,
    objectives,
    aligned,
    driftFlag,
    justification: justification || (driftFlag ? "No strategic justification provided" : justification),
    evaluatedAt: new Date().toISOString(),
  };

  if (driftFlag) {
    log.warn("Expansion drift detected — change not aligned to any strategic objective", { changeId });
  } else {
    log.info("Strategic alignment confirmed", { changeId, objectives });
  }

  return result;
}

/**
 * Batch validate multiple changes and return drift summary.
 */
export function auditStrategicDrift(
  changes: Array<{ id: string; objectives: StrategicObjective[]; justification: string }>
): { totalChanges: number; alignedCount: number; driftCount: number; driftRate: number; driftItems: string[] } {
  let alignedCount = 0;
  let driftCount = 0;
  const driftItems: string[] = [];

  for (const c of changes) {
    const result = validateStrategicAlignment(c.id, c.objectives, c.justification);
    if (result.aligned) {
      alignedCount++;
    } else {
      driftCount++;
      driftItems.push(c.id);
    }
  }

  const driftRate = changes.length > 0 ? Math.round((driftCount / changes.length) * 100) : 0;

  return { totalChanges: changes.length, alignedCount, driftCount, driftRate, driftItems };
}
