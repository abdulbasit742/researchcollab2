/**
 * Self-Optimizing Civilizational Engine (SOCE) — unified exports.
 */

export { runOptimizationCycle } from "./optimizationKernel";
export { calculateObjectiveScore } from "./objectiveFunction";
export { modelLongTermSurvival } from "./longTermSurvivalModel";
export { simulateCapitalRebalancing } from "./capitalRebalancer";
export { detectTrustDrift } from "./trustDriftEngine";
export { analyzeInnovationOutput } from "./innovationMaximizer";
export { analyzeGovernanceStability } from "./governanceStability";
export { assessInequality } from "./inequalityRegulator";
export { evaluateEvolutionRisk } from "./riskWeightedEvolution";
export { calculateMultiGenerationalStability } from "./multiGenerationalStability";
export { generateSOCETransparencyReport } from "./soceTransparency";

export type { KernelSnapshot, OptimizationProposal } from "./optimizationKernel";
export type { ObjectiveFunctionResult, ObjectiveDimension } from "./objectiveFunction";
export type { LongTermSurvivalResult, SurvivalProjection } from "./longTermSurvivalModel";
export type { RebalanceSimulation, RebalanceRecommendation } from "./capitalRebalancer";
export type { TrustDriftReport, TrustDriftAlert } from "./trustDriftEngine";
export type { InnovationMaximizerResult, InnovationOptimization } from "./innovationMaximizer";
export type { GovernanceStabilityResult } from "./governanceStability";
export type { InequalityReport } from "./inequalityRegulator";
export type { RiskGateResult } from "./riskWeightedEvolution";
export type { MultiGenerationalStabilityResult } from "./multiGenerationalStability";
export type { SOCETransparencyReport } from "./soceTransparency";
