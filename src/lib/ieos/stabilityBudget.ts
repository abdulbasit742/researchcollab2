/**
 * Stability Budget Framework — enforces quarterly limits on risk-inducing changes.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("stabilityBudget");

export interface StabilityBudget {
  quarter: string;
  maxRiskIncrease: number;
  maxFinancialMutations: number;
  maxCreditAlgorithmChanges: number;
  maxLiquidityModelChanges: number;
}

export interface BudgetUsage {
  quarter: string;
  riskIncrease: number;
  financialMutations: number;
  creditAlgorithmChanges: number;
  liquidityModelChanges: number;
}

export interface BudgetCheckResult {
  withinBudget: boolean;
  breaches: string[];
  remainingCapacity: Record<string, number>;
  evaluatedAt: string;
}

const DEFAULT_BUDGET: StabilityBudget = {
  quarter: "current",
  maxRiskIncrease: 15,
  maxFinancialMutations: 50,
  maxCreditAlgorithmChanges: 3,
  maxLiquidityModelChanges: 2,
};

/**
 * Check if current usage is within the stability budget.
 */
export function checkStabilityBudget(
  usage: BudgetUsage,
  budget: StabilityBudget = DEFAULT_BUDGET
): BudgetCheckResult {
  const breaches: string[] = [];

  if (usage.riskIncrease > budget.maxRiskIncrease) {
    breaches.push(`Risk increase ${usage.riskIncrease} exceeds max ${budget.maxRiskIncrease}`);
  }
  if (usage.financialMutations > budget.maxFinancialMutations) {
    breaches.push(`Financial mutations ${usage.financialMutations} exceeds max ${budget.maxFinancialMutations}`);
  }
  if (usage.creditAlgorithmChanges > budget.maxCreditAlgorithmChanges) {
    breaches.push(`Credit algorithm changes ${usage.creditAlgorithmChanges} exceeds max ${budget.maxCreditAlgorithmChanges}`);
  }
  if (usage.liquidityModelChanges > budget.maxLiquidityModelChanges) {
    breaches.push(`Liquidity model changes ${usage.liquidityModelChanges} exceeds max ${budget.maxLiquidityModelChanges}`);
  }

  const remaining: Record<string, number> = {
    riskIncrease: Math.max(0, budget.maxRiskIncrease - usage.riskIncrease),
    financialMutations: Math.max(0, budget.maxFinancialMutations - usage.financialMutations),
    creditAlgorithmChanges: Math.max(0, budget.maxCreditAlgorithmChanges - usage.creditAlgorithmChanges),
    liquidityModelChanges: Math.max(0, budget.maxLiquidityModelChanges - usage.liquidityModelChanges),
  };

  const withinBudget = breaches.length === 0;

  if (!withinBudget) {
    log.warn("Stability budget exceeded — releases blocked", { breaches });
  } else {
    log.info("Stability budget within limits", { remaining });
  }

  return {
    withinBudget,
    breaches,
    remainingCapacity: remaining,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Check if a proposed change would exceed the stability budget.
 */
export function wouldExceedBudget(
  currentUsage: BudgetUsage,
  proposedDelta: Partial<BudgetUsage>,
  budget: StabilityBudget = DEFAULT_BUDGET
): boolean {
  const projected: BudgetUsage = {
    quarter: currentUsage.quarter,
    riskIncrease: currentUsage.riskIncrease + (proposedDelta.riskIncrease ?? 0),
    financialMutations: currentUsage.financialMutations + (proposedDelta.financialMutations ?? 0),
    creditAlgorithmChanges: currentUsage.creditAlgorithmChanges + (proposedDelta.creditAlgorithmChanges ?? 0),
    liquidityModelChanges: currentUsage.liquidityModelChanges + (proposedDelta.liquidityModelChanges ?? 0),
  };
  return !checkStabilityBudget(projected, budget).withinBudget;
}
