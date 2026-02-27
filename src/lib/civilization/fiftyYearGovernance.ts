/**
 * 50-Year Civilization Governance Model
 * Defines governance phases, succession gates, and long-term stability scoring.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("fiftyYearGovernance");

export type GovernancePhase = "founder_led" | "board_driven" | "institutional_advisory" | "hybrid_governance";

export interface GovernancePhaseDefinition {
  phase: GovernancePhase;
  label: string;
  yearRange: [number, number];
  characteristics: string[];
  maxSingleEntityVotingWeight: number;
}

export interface CivilizationSuccessIndicator {
  metric: string;
  target: string;
  category: "financial" | "institutional" | "governance" | "data" | "security" | "trust";
}

export const GOVERNANCE_PHASES: GovernancePhaseDefinition[] = [
  {
    phase: "founder_led",
    label: "Founder-Led with Advisory Oversight",
    yearRange: [0, 10],
    characteristics: [
      "Founder as protocol guardian",
      "Advisory board for financial oversight",
      "72-hour decision cooling enforced",
      "Ego override safeguards active",
      "All major decisions logged",
    ],
    maxSingleEntityVotingWeight: 51,
  },
  {
    phase: "board_driven",
    label: "Board-Driven with Independent Financial Oversight",
    yearRange: [10, 20],
    characteristics: [
      "Independent board with financial authority",
      "Founder transitions to Chair",
      "CEO appointed for operations",
      "Independent financial auditor",
      "Succession plan tested annually",
    ],
    maxSingleEntityVotingWeight: 35,
  },
  {
    phase: "institutional_advisory",
    label: "Institutional Advisory Council",
    yearRange: [20, 35],
    characteristics: [
      "University advisory council (5+ institutions)",
      "Sponsor advisory representation",
      "Independent compliance committee",
      "Regional governance nodes",
      "Constitutional review every 5 years",
    ],
    maxSingleEntityVotingWeight: 25,
  },
  {
    phase: "hybrid_governance",
    label: "Hybrid Multi-Stakeholder Governance",
    yearRange: [35, 50],
    characteristics: [
      "Academic institutions (40%)",
      "Sponsor representation (20%)",
      "Independent auditors (15%)",
      "Stewardship committee (15%)",
      "Community representation (10%)",
    ],
    maxSingleEntityVotingWeight: 25,
  },
];

export const CONSTITUTIONAL_PRINCIPLES = [
  { id: "escrow_sacred", text: "Escrow integrity is sacred", category: "financial" },
  { id: "ledger_immutable", text: "Ledger immutability is non-negotiable", category: "financial" },
  { id: "trust_over_revenue", text: "Institutional trust over revenue", category: "governance" },
  { id: "transparency", text: "Transparency over silence", category: "governance" },
  { id: "compliance_first", text: "Compliance before expansion", category: "regulatory" },
  { id: "stability_first", text: "Stability before growth", category: "operational" },
  { id: "long_term", text: "Long-term over short-term valuation", category: "financial" },
  { id: "no_speculation", text: "No speculative financial instruments", category: "financial" },
  { id: "human_oversight", text: "Human oversight over automation", category: "governance" },
  { id: "public_accountability", text: "Public accountability", category: "governance" },
] as const;

export const FIFTY_YEAR_SUCCESS_INDICATORS: CivilizationSuccessIndicator[] = [
  { metric: "Escrow-backed projects completed", target: "Millions", category: "financial" },
  { metric: "Global institutional embedment", target: "100+ countries", category: "institutional" },
  { metric: "Ledger integrity", target: "Zero corruption events", category: "data" },
  { metric: "Infrastructure status", target: "Referenced in policy documents", category: "institutional" },
  { metric: "Public trust", target: "Multi-decade transparency report history", category: "trust" },
  { metric: "Regulatory maturity", target: "Proactive compliance posture", category: "security" },
  { metric: "Independent governance", target: "No single controlling entity", category: "governance" },
  { metric: "Data moat", target: "30+ years irreplaceable execution history", category: "data" },
  { metric: "Financial stability", target: "Survived 3+ economic cycles", category: "financial" },
  { metric: "Leadership continuity", target: "3+ successful transitions", category: "governance" },
];

export function determineGovernancePhase(platformAgeYears: number): GovernancePhaseDefinition {
  const phase = GOVERNANCE_PHASES.find(
    (p) => platformAgeYears >= p.yearRange[0] && platformAgeYears < p.yearRange[1]
  );
  return phase ?? GOVERNANCE_PHASES[GOVERNANCE_PHASES.length - 1];
}

export interface CivilizationMaturityScore {
  governanceMaturity: number;
  financialResilience: number;
  institutionalEmbedment: number;
  dataMoatDepth: number;
  securityAdaptation: number;
  regulatoryResilience: number;
  culturalPermanence: number;
  overallCivilizationScore: number;
}

export function calculateCivilizationMaturity(inputs: {
  platformAgeYears: number;
  escrowReliabilityPct: number;
  ledgerCorruptionEvents: number;
  institutionCount: number;
  countryCount: number;
  reserveFundMonths: number;
  revenueConcentrationPct: number;
  securityUpgradeYearsSinceLastt: number;
  successfulLeadershipTransitions: number;
  annualReportsPublished: number;
}): CivilizationMaturityScore {
  const phase = determineGovernancePhase(inputs.platformAgeYears);

  // Governance maturity: transitions + age + phase progression
  const governanceMaturity = Math.min(100, Math.round(
    inputs.successfulLeadershipTransitions * 20 +
    Math.min(50, inputs.platformAgeYears * 2) +
    (GOVERNANCE_PHASES.indexOf(phase) + 1) * 10
  ));

  // Financial resilience: reserves + diversification + escrow reliability
  const financialResilience = Math.min(100, Math.round(
    Math.min(40, inputs.reserveFundMonths * (40 / 18)) +
    Math.max(0, 30 - inputs.revenueConcentrationPct * 0.75) +
    inputs.escrowReliabilityPct * 0.3
  ));

  // Institutional embedment
  const institutionalEmbedment = Math.min(100, Math.round(
    Math.min(50, inputs.institutionCount * 0.5) +
    Math.min(50, inputs.countryCount * 2)
  ));

  // Data moat: age * integrity
  const dataMoatDepth = Math.min(100, Math.round(
    inputs.platformAgeYears * 2 *
    (inputs.ledgerCorruptionEvents === 0 ? 1 : 0.3)
  ));

  // Security adaptation
  const securityAdaptation = Math.min(100, Math.round(
    inputs.securityUpgradeYearsSinceLastt <= 3 ? 90 :
    inputs.securityUpgradeYearsSinceLastt <= 5 ? 70 :
    Math.max(20, 100 - inputs.securityUpgradeYearsSinceLastt * 10)
  ));

  // Regulatory resilience: countries served implies compliance breadth
  const regulatoryResilience = Math.min(100, Math.round(
    Math.min(60, inputs.countryCount * 3) +
    Math.min(40, inputs.platformAgeYears * 2)
  ));

  // Cultural permanence: reports + transitions + age
  const culturalPermanence = Math.min(100, Math.round(
    Math.min(40, inputs.annualReportsPublished * 4) +
    inputs.successfulLeadershipTransitions * 15 +
    Math.min(30, inputs.platformAgeYears)
  ));

  const overallCivilizationScore = Math.min(100, Math.round(
    governanceMaturity * 0.15 +
    financialResilience * 0.20 +
    institutionalEmbedment * 0.15 +
    dataMoatDepth * 0.15 +
    securityAdaptation * 0.10 +
    regulatoryResilience * 0.10 +
    culturalPermanence * 0.15
  ));

  log.info("Civilization maturity calculated", { overallCivilizationScore, phase: phase.phase });

  return {
    governanceMaturity,
    financialResilience,
    institutionalEmbedment,
    dataMoatDepth,
    securityAdaptation,
    regulatoryResilience,
    culturalPermanence,
    overallCivilizationScore,
  };
}

/**
 * Technology Evolution Gate — triggers mandatory review if security/architecture
 * has not been upgraded within the defined cadence.
 */
export function checkTechEvolutionGate(yearsSinceArchReview: number, yearsSinceSecurityUpgrade: number, yearsSinceComplianceReview: number): {
  archReviewOverdue: boolean;
  securityUpgradeOverdue: boolean;
  complianceReviewOverdue: boolean;
  mandatoryActionRequired: boolean;
} {
  const archReviewOverdue = yearsSinceArchReview > 5;
  const securityUpgradeOverdue = yearsSinceSecurityUpgrade > 5;
  const complianceReviewOverdue = yearsSinceComplianceReview > 5;
  const mandatoryActionRequired = archReviewOverdue || securityUpgradeOverdue || complianceReviewOverdue;

  if (mandatoryActionRequired) {
    log.warn("Technology evolution gate triggered", {
      archReviewOverdue, securityUpgradeOverdue, complianceReviewOverdue,
    });
  }

  return { archReviewOverdue, securityUpgradeOverdue, complianceReviewOverdue, mandatoryActionRequired };
}

/**
 * Financial Stability Gate — validates reserve fund and revenue diversification.
 */
export function checkFinancialStabilityGate(reserveFundMonths: number, maxRegionRevenuePct: number, maxSponsorClassPct: number): {
  reserveAdequate: boolean;
  regionDiversified: boolean;
  sponsorDiversified: boolean;
  financiallyStable: boolean;
} {
  const reserveAdequate = reserveFundMonths >= 18;
  const regionDiversified = maxRegionRevenuePct <= 40;
  const sponsorDiversified = maxSponsorClassPct <= 30;
  const financiallyStable = reserveAdequate && regionDiversified && sponsorDiversified;

  if (!financiallyStable) {
    log.warn("Financial stability gate failed", {
      reserveFundMonths, maxRegionRevenuePct, maxSponsorClassPct,
    });
  }

  return { reserveAdequate, regionDiversified, sponsorDiversified, financiallyStable };
}
