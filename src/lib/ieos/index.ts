/**
 * Internal Execution Operating System (IEOS) — unified export.
 */

export { validateChangeRequest, createChangeRequest, logChangeRequest } from "./changeGovernance";
export type { ChangeRequest, ChangeValidation, ImpactScope } from "./changeGovernance";

export { evaluateReleaseGates } from "./releaseGate";
export type { ReleaseGateResult, ReleaseGate } from "./releaseGate";

export { guardFinancialMutation, validatePostMutation } from "./financialMutationGuard";
export type { MutationRequest, MutationGuardResult, MutationType } from "./financialMutationGuard";

export { evaluateRiskTier, canProceed } from "./riskWorkflow";
export type { RiskEvaluation, RiskFactors, RiskTier } from "./riskWorkflow";

export { evaluateArchitectureDrift, detectEscrowBypass } from "./architectureDrift";
export type { ArchitectureDriftReport, DriftIndicator, ModuleDependency } from "./architectureDrift";

export { calculateDebtIndex, detectStaleFeatureFlags } from "./technicalDebt";
export type { TechnicalDebtReport, DebtItem } from "./technicalDebt";

export { checkStabilityBudget, wouldExceedBudget } from "./stabilityBudget";
export type { StabilityBudget, BudgetUsage, BudgetCheckResult } from "./stabilityBudget";

export { checkVelocity } from "./velocityGovernor";
export type { SprintMetrics, VelocityCheckResult } from "./velocityGovernor";

export { validateStrategicAlignment, auditStrategicDrift } from "./strategyValidator";
export type { StrategicAlignment, StrategicObjective } from "./strategyValidator";
