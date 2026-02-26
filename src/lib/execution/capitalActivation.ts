/**
 * Capital Market Activation Timeline — 5-year projection model.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalActivation");

export interface YearProjection {
  year: number;
  label: string;
  features: string[];
  projectedGMV: number;
  projectedRiskGrowth: number;
  regulatoryVisibility: string;
  institutionalMaturity: string;
}

const TIMELINE: YearProjection[] = [
  {
    year: 1, label: "Foundation",
    features: ["Escrow", "Deals", "Wallet", "Basic Matching"],
    projectedGMV: 500000, projectedRiskGrowth: 5,
    regulatoryVisibility: "minimal", institutionalMaturity: "pilot",
  },
  {
    year: 2, label: "Credit & Pools",
    features: ["Credit Scoring", "Capital Pools", "Institutional Onboarding"],
    projectedGMV: 2500000, projectedRiskGrowth: 15,
    regulatoryVisibility: "low", institutionalMaturity: "early_adoption",
  },
  {
    year: 3, label: "Bonds & Liquidity",
    features: ["Research Bonds", "Liquidity Pools", "Market Index"],
    projectedGMV: 10000000, projectedRiskGrowth: 30,
    regulatoryVisibility: "moderate", institutionalMaturity: "growth",
  },
  {
    year: 4, label: "Innovation Advisory",
    features: ["GIAB Advisory Mode", "Cross-Border Pilot", "Interoperability"],
    projectedGMV: 25000000, projectedRiskGrowth: 45,
    regulatoryVisibility: "significant", institutionalMaturity: "mature",
  },
  {
    year: 5, label: "Reserve Pilot",
    features: ["SERL Pilot", "Cross-Border Settlement", "Global Index"],
    projectedGMV: 50000000, projectedRiskGrowth: 55,
    regulatoryVisibility: "high", institutionalMaturity: "institutional_grade",
  },
];

export function getActivationTimeline(): YearProjection[] {
  return TIMELINE;
}

export function getProjectionForYear(year: number): YearProjection | null {
  return TIMELINE.find(t => t.year === year) ?? null;
}

export function simulateGMVGrowth(currentGMV: number, years: number): number[] {
  const projections: number[] = [];
  let gmv = currentGMV;
  for (let y = 1; y <= years; y++) {
    const yearData = TIMELINE.find(t => t.year === y);
    const growthRate = yearData ? yearData.projectedGMV / (y === 1 ? 500000 : TIMELINE[y - 2].projectedGMV) : 1.5;
    gmv = Math.round(gmv * growthRate);
    projections.push(gmv);
  }
  log.info("GMV growth simulated", { years, finalGMV: projections[projections.length - 1] });
  return projections;
}
