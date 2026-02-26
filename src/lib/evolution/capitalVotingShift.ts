/**
 * Gradual Capital Voting Shift — founder dominance decay curve.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("capitalVotingShift");

export interface VotingPowerDistribution {
  yearsSinceInception: number;
  founderInfluencePercent: number;
  institutionalInfluencePercent: number;
  distributedInfluencePercent: number;
  phase: string;
}

export function simulateCapitalVotingShift(yearsSinceInception: number): VotingPowerDistribution {
  let founderPct: number;
  let institutionalPct: number;
  let distributedPct: number;
  let phase: string;

  if (yearsSinceInception <= 5) {
    // Founder dominance
    founderPct = Math.max(50, 80 - yearsSinceInception * 6);
    institutionalPct = Math.min(40, 15 + yearsSinceInception * 5);
    distributedPct = 100 - founderPct - institutionalPct;
    phase = "Founder Dominance";
  } else if (yearsSinceInception <= 10) {
    // Shared influence
    const progress = (yearsSinceInception - 5) / 5;
    founderPct = Math.round(50 - progress * 20);
    institutionalPct = Math.round(40 + progress * 15);
    distributedPct = 100 - founderPct - institutionalPct;
    phase = "Shared Influence";
  } else if (yearsSinceInception <= 20) {
    // Institutional weighted majority
    const progress = (yearsSinceInception - 10) / 10;
    founderPct = Math.max(5, Math.round(30 - progress * 20));
    institutionalPct = Math.round(55 + progress * 10);
    distributedPct = 100 - founderPct - institutionalPct;
    phase = "Institutional Weighted Majority";
  } else {
    // Distributed sovereign model
    founderPct = 5;
    institutionalPct = 45;
    distributedPct = 50;
    phase = "Distributed Sovereign";
  }

  return { yearsSinceInception, founderInfluencePercent: founderPct, institutionalInfluencePercent: institutionalPct, distributedInfluencePercent: distributedPct, phase };
}

export function simulateVotingTransition(years: number = 30): VotingPowerDistribution[] {
  const results: VotingPowerDistribution[] = [];
  for (let y = 0; y <= years; y++) {
    results.push(simulateCapitalVotingShift(y));
  }
  log.info("Capital voting transition simulated", { years });
  return results;
}
