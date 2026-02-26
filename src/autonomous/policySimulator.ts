/**
 * Policy Simulation Engine — simulates impact of fee increases,
 * capital restrictions, trust formula changes, and dispute penalty adjustments.
 */

export type PolicyChange = "fee_increase" | "fee_decrease" | "capital_restriction" | "trust_formula_adjust" | "dispute_penalty_increase";

export interface PolicySimulationInput {
  change: PolicyChange;
  magnitude: number; // percentage change
}

export interface PolicySimulationResult {
  input: PolicySimulationInput;
  projectedImpact: {
    stabilityDelta: number;
    growthDelta: number;
    capitalSustainabilityDelta: number;
    coordinationEfficiencyDelta: number;
  };
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  computedAt: string;
}

export function simulatePolicy(input: PolicySimulationInput): PolicySimulationResult {
  const mag = input.magnitude / 100;
  let stabilityDelta = 0;
  let growthDelta = 0;
  let capitalDelta = 0;
  let coordDelta = 0;
  let recommendation = "";

  switch (input.change) {
    case "fee_increase":
      stabilityDelta = mag * 5; // Slight stability gain from revenue
      growthDelta = -mag * 15; // Discourages deal activity
      capitalDelta = mag * 8;
      coordDelta = -mag * 5;
      recommendation = mag > 0.2 ? "High fee increase may suppress growth significantly" : "Moderate increase acceptable with monitoring";
      break;
    case "fee_decrease":
      stabilityDelta = -mag * 3;
      growthDelta = mag * 12;
      capitalDelta = -mag * 5;
      coordDelta = mag * 3;
      recommendation = "Fee decrease stimulates activity but reduces revenue buffer";
      break;
    case "capital_restriction":
      stabilityDelta = mag * 10;
      growthDelta = -mag * 8;
      capitalDelta = mag * 15;
      coordDelta = -mag * 10;
      recommendation = "Tightens risk but slows capital deployment";
      break;
    case "trust_formula_adjust":
      stabilityDelta = mag * 5;
      growthDelta = -mag * 3;
      capitalDelta = mag * 3;
      coordDelta = -mag * 2;
      recommendation = "Trust formula changes require observation period before full assessment";
      break;
    case "dispute_penalty_increase":
      stabilityDelta = mag * 12;
      growthDelta = -mag * 5;
      capitalDelta = mag * 5;
      coordDelta = mag * 3;
      recommendation = "Stronger penalties deter disputes but may discourage risk-taking";
      break;
  }

  const avgAbsImpact = (Math.abs(stabilityDelta) + Math.abs(growthDelta) + Math.abs(capitalDelta) + Math.abs(coordDelta)) / 4;
  const riskLevel = avgAbsImpact > 10 ? "high" : avgAbsImpact > 5 ? "medium" : "low";

  return {
    input,
    projectedImpact: {
      stabilityDelta: Math.round(stabilityDelta * 10) / 10,
      growthDelta: Math.round(growthDelta * 10) / 10,
      capitalSustainabilityDelta: Math.round(capitalDelta * 10) / 10,
      coordinationEfficiencyDelta: Math.round(coordDelta * 10) / 10,
    },
    riskLevel,
    recommendation,
    computedAt: new Date().toISOString(),
  };
}

export function simulateMultiplePolicies(inputs: PolicySimulationInput[]): PolicySimulationResult[] {
  return inputs.map(simulatePolicy);
}
