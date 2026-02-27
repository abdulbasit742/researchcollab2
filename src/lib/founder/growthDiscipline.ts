/**
 * Growth Discipline Filter & Decline Response System
 * Prevents ego-driven expansion during growth and panic responses during decline.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("growthDiscipline");

export type GrowthPhase = "accelerating" | "stable" | "decelerating" | "declining";

export interface GrowthMetrics {
  escrowVolumeGrowthRate: number;     // % change month-over-month
  institutionRetentionRate: number;    // 0-100%
  sponsorRepeatRate: number;           // 0-100%
  disputeRate: number;                 // 0-100%
  supportTicketLoad: number;           // count
  transactionErrorRate: number;        // 0-100%
  cashRunwayMonths: number;
  teamStressLevel: number;             // 0-100 (self-reported)
  escrowInvariantHealth: number;       // 0-100%
  slaComplianceRate: number;           // 0-100%
}

export interface GrowthDisciplineReport {
  phase: GrowthPhase;
  allowedActions: string[];
  blockedActions: string[];
  warnings: string[];
  riskScore: number;          // 0-100
  evaluatedAt: string;
}

// Actions ALWAYS blocked during rapid growth
const GROWTH_BLOCKED_ACTIONS = [
  "Overhire beyond immediate needs",
  "Launch untested new modules",
  "Expand to new regions without gate clearance",
  "Increase escrow caps aggressively",
  "Change pricing rapidly",
  "Begin aggressive marketing campaigns",
];

// Actions ALWAYS blocked during decline
const DECLINE_BLOCKED_ACTIONS = [
  "Panic-launch features",
  "Drop quality standards",
  "Lower sponsor quality filter",
  "Open public onboarding",
  "Remove escrow safeguards",
  "Cut security monitoring",
];

// Recommended actions during growth
const GROWTH_RECOMMENDED = [
  "Increase reserve fund allocation",
  "Increase monitoring depth",
  "Improve reconciliation systems",
  "Strengthen compliance documentation",
  "Add observability coverage",
];

// Recommended actions during decline
const DECLINE_RECOMMENDED = [
  "Improve UX clarity",
  "Deepen institutional trust relationships",
  "Optimize support response times",
  "Reduce onboarding friction",
  "Strengthen existing relationships",
  "Audit and simplify processes",
];

/**
 * Determine the current growth phase from metrics.
 */
export function detectGrowthPhase(metrics: GrowthMetrics): GrowthPhase {
  if (metrics.escrowVolumeGrowthRate > 20) return "accelerating";
  if (metrics.escrowVolumeGrowthRate > 0) return "stable";
  if (metrics.escrowVolumeGrowthRate > -10) return "decelerating";
  return "declining";
}

/**
 * Evaluate growth discipline and return allowed/blocked actions.
 */
export function evaluateGrowthDiscipline(metrics: GrowthMetrics): GrowthDisciplineReport {
  const phase = detectGrowthPhase(metrics);
  const warnings: string[] = [];
  let riskScore = 0;

  // Phase-specific analysis
  if (phase === "accelerating") {
    riskScore += 20; // Growth itself is stress
    warnings.push("Growth is stress, not celebration — increase reserves and monitoring");

    if (metrics.teamStressLevel > 60) {
      riskScore += 15;
      warnings.push(`Team stress at ${metrics.teamStressLevel}% — slow expansion immediately`);
    }
    if (metrics.disputeRate > 3) {
      riskScore += 15;
      warnings.push(`Dispute rate ${metrics.disputeRate}% rising with volume — fix before scaling`);
    }
    if (metrics.cashRunwayMonths < 12) {
      riskScore += 10;
      warnings.push(`Cash runway ${metrics.cashRunwayMonths} months — preserve, don't spend on expansion`);
    }
  }

  if (phase === "declining" || phase === "decelerating") {
    if (metrics.institutionRetentionRate < 80) {
      riskScore += 20;
      warnings.push("Institutional retention dropping — focus on deepening relationships, NOT new features");
    }
    if (metrics.sponsorRepeatRate < 50) {
      riskScore += 15;
      warnings.push("Sponsor repeat rate low — investigate sponsor experience, NOT add incentives");
    }
  }

  // Universal risk factors
  if (metrics.escrowInvariantHealth < 100) {
    riskScore += 25;
    warnings.push("Escrow invariant health below 100% — ALL expansion frozen until resolved");
  }
  if (metrics.transactionErrorRate > 1) {
    riskScore += 15;
    warnings.push(`Transaction error rate ${metrics.transactionErrorRate}% — investigate before any growth moves`);
  }
  if (metrics.slaComplianceRate < 90) {
    riskScore += 10;
    warnings.push(`SLA compliance at ${metrics.slaComplianceRate}% — operational quality must precede scale`);
  }

  riskScore = Math.min(riskScore, 100);

  const isGrowing = phase === "accelerating" || phase === "stable";
  const blockedActions = isGrowing ? GROWTH_BLOCKED_ACTIONS : DECLINE_BLOCKED_ACTIONS;
  const allowedActions = isGrowing ? GROWTH_RECOMMENDED : DECLINE_RECOMMENDED;

  if (riskScore > 50) {
    log.warn("Growth discipline alert — high risk score", { phase, riskScore });
  } else {
    log.info("Growth discipline evaluated", { phase, riskScore });
  }

  return {
    phase,
    allowedActions,
    blockedActions,
    warnings,
    riskScore,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * 10-year thinking test — simple strategic filter.
 */
export function tenYearTest(proposedAction: string, strengthensIn10Years: boolean): {
  proceed: boolean;
  message: string;
} {
  if (strengthensIn10Years) {
    return { proceed: true, message: `"${proposedAction}" passes the 10-year durability test.` };
  }
  return {
    proceed: false,
    message: `"${proposedAction}" does NOT strengthen RCollab in 10 years — REJECT.`,
  };
}
