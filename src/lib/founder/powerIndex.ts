/**
 * Power Concentration Index — measures how much authority is concentrated in founder.
 */

import { getRecentDecisions } from "./decisionLog";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("powerIndex");

export interface PowerConcentrationReport {
  score: number; // 0-100, higher = more concentrated
  overrideFrequency: number;
  vetoUsage: number;
  releaseBypassFrequency: number;
  capitalRoutingInfluence: number; // estimated 0-100
  healthy: boolean;
  evaluatedAt: string;
}

const HEALTHY_THRESHOLD = 50;

/**
 * Calculate the Power Concentration Score.
 */
export async function calculatePowerConcentration(
  capitalRoutingInfluence = 50
): Promise<PowerConcentrationReport> {
  const decisions = await getRecentDecisions(200);

  const last90Days = decisions.filter(d => {
    const age = Date.now() - new Date(d.timestamp).getTime();
    return age < 90 * 24 * 3600000;
  });

  const overrideFrequency = last90Days.filter(d => d.overrideFlag).length;
  const vetoUsage = last90Days.filter(d => d.decisionType === "governance_veto").length;
  const releaseBypassFrequency = last90Days.filter(d => d.decisionType === "release_gate_bypass").length;

  let score = 0;
  score += Math.min(overrideFrequency * 5, 25);
  score += Math.min(vetoUsage * 10, 20);
  score += Math.min(releaseBypassFrequency * 8, 20);
  score += Math.round(capitalRoutingInfluence * 0.35);
  score = Math.min(score, 100);

  const healthy = score < HEALTHY_THRESHOLD;

  if (!healthy) {
    log.warn("Power concentration elevated", { score });
  } else {
    log.info("Power concentration within healthy range", { score });
  }

  return {
    score,
    overrideFrequency,
    vetoUsage,
    releaseBypassFrequency,
    capitalRoutingInfluence,
    healthy,
    evaluatedAt: new Date().toISOString(),
  };
}
