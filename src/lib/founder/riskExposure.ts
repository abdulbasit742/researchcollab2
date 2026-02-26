/**
 * Founder Risk Exposure Monitor — tracks frequency and severity of founder overrides.
 */

import { countOverridesInWindow, getRecentDecisions } from "./decisionLog";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("founderRiskExposure");

export interface RiskExposureReport {
  score: number; // 0-100
  overridesLast7Days: number;
  highRiskOverrides: number;
  releaseGateBypasses: number;
  escrowOverrideAttempts: number;
  reservePressureEvents: number;
  advisoryReviewTriggered: boolean;
  evaluatedAt: string;
}

const ADVISORY_THRESHOLD = 60;

/**
 * Calculate the Founder Risk Exposure Score.
 */
export async function calculateRiskExposure(): Promise<RiskExposureReport> {
  const overridesLast7Days = await countOverridesInWindow(168);
  const decisions = await getRecentDecisions(100);

  const last30Days = decisions.filter(d => {
    const age = Date.now() - new Date(d.timestamp).getTime();
    return age < 30 * 24 * 3600000;
  });

  const highRiskOverrides = last30Days.filter(d => d.overrideFlag && (d.riskLevel === "high" || d.riskLevel === "critical")).length;
  const releaseGateBypasses = last30Days.filter(d => d.decisionType === "release_gate_bypass").length;
  const escrowOverrideAttempts = last30Days.filter(d => d.decisionType === "escrow_override").length;
  const reservePressureEvents = last30Days.filter(d => d.decisionType === "reserve_issuance" && d.riskLevel !== "low").length;

  let score = 0;
  score += Math.min(overridesLast7Days * 8, 30);
  score += Math.min(highRiskOverrides * 12, 25);
  score += Math.min(releaseGateBypasses * 15, 20);
  score += Math.min(escrowOverrideAttempts * 15, 15);
  score += Math.min(reservePressureEvents * 10, 10);
  score = Math.min(score, 100);

  const advisoryReviewTriggered = score >= ADVISORY_THRESHOLD;

  if (advisoryReviewTriggered) {
    log.warn("Founder risk exposure threshold exceeded — advisory review triggered", { score });
  } else {
    log.info("Founder risk exposure within limits", { score });
  }

  return {
    score,
    overridesLast7Days,
    highRiskOverrides,
    releaseGateBypasses,
    escrowOverrideAttempts,
    reservePressureEvents,
    advisoryReviewTriggered,
    evaluatedAt: new Date().toISOString(),
  };
}
