/**
 * Founder Psychological Risk Identification & Personal Performance Metrics.
 * Maps cognitive biases to operational safeguards.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("psychologicalRisks");

export interface PsychologicalRisk {
  id: string;
  name: string;
  description: string;
  trigger: string;
  safeguard: string;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Documented psychological risk patterns that threaten infrastructure companies.
 */
export const FOUNDER_RISK_PATTERNS: PsychologicalRisk[] = [
  {
    id: "feature_addiction",
    name: "Feature Addiction",
    description: "Compulsive urge to build new features instead of stabilizing existing ones.",
    trigger: "Seeing competitor announcements or receiving investor feature requests.",
    safeguard: "72-hour cooling period + validation matrix before any new feature approval.",
    severity: "high",
  },
  {
    id: "expansion_temptation",
    name: "Expansion Temptation",
    description: "Urge to expand regions/markets before proving stability in current ones.",
    trigger: "Receiving inbound interest from new institutions or regions.",
    safeguard: "Scale gate system — expansion only after 60+ days zero critical incidents.",
    severity: "high",
  },
  {
    id: "comparison_pressure",
    name: "Comparison Pressure",
    description: "Anxiety from comparing RCollab's pace to unrelated tech companies.",
    trigger: "Tech news, competitor funding rounds, industry conferences.",
    safeguard: "Remember: infrastructure companies grow slow. Compare to Stripe's first 5 years, not TikTok.",
    severity: "medium",
  },
  {
    id: "ego_announcements",
    name: "Ego-Driven Announcements",
    description: "Premature public claims of scale, dominance, or disruption.",
    trigger: "Small wins, media interest, advisory board validation.",
    safeguard: "Understate externally. Overperform internally. No announcement without 90+ days of data.",
    severity: "critical",
  },
  {
    id: "impatience",
    name: "Impatience with Slow Growth",
    description: "Frustration when growth doesn't match ambition timeline.",
    trigger: "Quarter-over-quarter stagnation, slow institutional sales cycles.",
    safeguard: "Reframe: institutional trust takes years. Each stable quarter compounds.",
    severity: "medium",
  },
  {
    id: "overconfidence",
    name: "Overconfidence After Small Success",
    description: "Inflated confidence leading to premature scaling after early wins.",
    trigger: "First pilot success, positive press, strong early metrics.",
    safeguard: "Growth temptation filter — accelerating growth triggers reserve building, not expansion.",
    severity: "high",
  },
  {
    id: "panic_decline",
    name: "Panic After Small Decline",
    description: "Reactive, fear-driven decisions when metrics dip temporarily.",
    trigger: "Monthly dip in usage, sponsor churn, support spike.",
    safeguard: "Decline response discipline — deepen existing relationships, do NOT panic-launch.",
    severity: "high",
  },
  {
    id: "shiny_object",
    name: "Shiny Object Distraction",
    description: "Chasing new tech trends (AI hype, blockchain, etc.) instead of core infrastructure.",
    trigger: "Industry hype cycles, conference keynotes, advisor suggestions.",
    safeguard: "Mission anchor: 'RCollab exists to provide escrow-backed academic execution infrastructure.' Period.",
    severity: "critical",
  },
  {
    id: "revenue_obsession",
    name: "Revenue Obsession Over Trust",
    description: "Prioritizing short-term revenue at the expense of institutional trust.",
    trigger: "Runway pressure, investor demands, competitive anxiety.",
    safeguard: "Track trust health index alongside revenue. Trust precedes sustainable revenue.",
    severity: "critical",
  },
  {
    id: "operational_fragility",
    name: "Underestimating Operational Fragility",
    description: "Assuming the system is more resilient than it actually is.",
    trigger: "Long periods without incidents creating false confidence.",
    safeguard: "Monthly stress simulations. Monthly backup restore tests. Never assume stability is permanent.",
    severity: "high",
  },
];

export interface FounderPerformanceMetrics {
  stabilityBeforeScale: boolean;
  escrowInvariantHealth: number;       // 0-100%
  institutionalRetention: number;       // 0-100%
  disputeRate: number;                  // 0-100%
  supportLoad: number;                  // tickets/week
  operationalClarity: number;           // 0-100 self-assessment
  cashRunwayMonths: number;
  stressLevel: number;                  // 0-100
  overallHealth: "green" | "yellow" | "red";
}

/**
 * Evaluate founder personal performance metrics.
 */
export function evaluateFounderPerformance(metrics: Omit<FounderPerformanceMetrics, "overallHealth">): FounderPerformanceMetrics {
  let redFlags = 0;

  if (!metrics.stabilityBeforeScale) redFlags += 2;
  if (metrics.escrowInvariantHealth < 100) redFlags += 3;
  if (metrics.institutionalRetention < 80) redFlags += 1;
  if (metrics.disputeRate > 5) redFlags += 1;
  if (metrics.supportLoad > 50) redFlags += 1;
  if (metrics.cashRunwayMonths < 6) redFlags += 2;
  if (metrics.stressLevel > 70) redFlags += 1;
  if (metrics.operationalClarity < 60) redFlags += 1;

  let overallHealth: FounderPerformanceMetrics["overallHealth"];
  if (redFlags >= 5) overallHealth = "red";
  else if (redFlags >= 2) overallHealth = "yellow";
  else overallHealth = "green";

  if (overallHealth === "red") {
    log.warn("Founder performance RED — slow expansion immediately", { redFlags });
  }

  return { ...metrics, overallHealth };
}
