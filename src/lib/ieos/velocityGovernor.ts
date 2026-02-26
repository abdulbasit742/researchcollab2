/**
 * Execution Velocity Governor — prevents reckless release cadence.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("velocityGovernor");

export interface SprintMetrics {
  sprintNumber: number;
  financialChanges: number;
  governanceChanges: number;
  bondChanges: number;
  reserveChanges: number;
  highRiskReleases: number;
  lastHighRiskAt?: string;
}

export interface VelocityCheckResult {
  allowed: boolean;
  blockers: string[];
  cooldownRequired: boolean;
  cooldownUntil?: string;
  stabilizationSprintDue: boolean;
  evaluatedAt: string;
}

const MAX_FINANCIAL_CHANGES_PER_SPRINT = 5;
const MAX_SIMULTANEOUS_CRITICAL_MODULES = 1;
const STABILIZATION_INTERVAL = 3; // Every 3 sprints
const COOLDOWN_HOURS_AFTER_HIGH_RISK = 48;

/**
 * Evaluate whether the current velocity allows a new release.
 */
export function checkVelocity(metrics: SprintMetrics): VelocityCheckResult {
  const blockers: string[] = [];
  let cooldownRequired = false;
  let cooldownUntil: string | undefined;

  // 1. Max financial changes per sprint
  if (metrics.financialChanges >= MAX_FINANCIAL_CHANGES_PER_SPRINT) {
    blockers.push(`Financial changes (${metrics.financialChanges}) at sprint limit (${MAX_FINANCIAL_CHANGES_PER_SPRINT})`);
  }

  // 2. No simultaneous critical module upgrades
  const criticalModuleChanges = [metrics.bondChanges, metrics.reserveChanges, metrics.governanceChanges].filter(c => c > 0).length;
  if (criticalModuleChanges > MAX_SIMULTANEOUS_CRITICAL_MODULES) {
    blockers.push(`${criticalModuleChanges} critical modules changed simultaneously (max: ${MAX_SIMULTANEOUS_CRITICAL_MODULES})`);
  }

  // 3. Cooldown after high-risk release
  if (metrics.lastHighRiskAt) {
    const elapsed = Date.now() - new Date(metrics.lastHighRiskAt).getTime();
    const cooldownMs = COOLDOWN_HOURS_AFTER_HIGH_RISK * 3600000;
    if (elapsed < cooldownMs) {
      cooldownRequired = true;
      cooldownUntil = new Date(new Date(metrics.lastHighRiskAt).getTime() + cooldownMs).toISOString();
      blockers.push(`Cooldown active until ${cooldownUntil} (${COOLDOWN_HOURS_AFTER_HIGH_RISK}h after high-risk release)`);
    }
  }

  // 4. Stabilization sprint check
  const stabilizationSprintDue = metrics.sprintNumber % STABILIZATION_INTERVAL === 0;
  if (stabilizationSprintDue && metrics.financialChanges > 0) {
    blockers.push("Stabilization sprint — no financial changes allowed");
  }

  const allowed = blockers.length === 0;

  if (!allowed) {
    log.warn("Velocity check failed", { sprint: metrics.sprintNumber, blockers });
  } else {
    log.info("Velocity check passed", { sprint: metrics.sprintNumber });
  }

  return {
    allowed,
    blockers,
    cooldownRequired,
    cooldownUntil,
    stabilizationSprintDue,
    evaluatedAt: new Date().toISOString(),
  };
}
