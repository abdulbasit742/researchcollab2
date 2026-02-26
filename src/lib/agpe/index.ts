/**
 * Autonomous Governance & Policy Engine (AGPE) — unified exports.
 */

export { proposePolicyChange, approvePolicy, rejectPolicy, getProposalStatus } from "./policyProposalEngine";
export { runSimulation } from "./simulationSandbox";
export { simulateCapitalImpact } from "./capitalImpactSimulator";
export { projectRisk } from "./riskProjectionEngine";
export { calculateEconomicImpact } from "./economicImpactModel";
export { runStressTest, getAvailableScenarios } from "./networkStressTest";
export { castVote, calculateVoteOutcome } from "./governanceVoting";
export { generateOptimizationRecommendations } from "./autonomousOptimizer";
export { validatePolicyActivation } from "./policyActivationGuardrails";
export { calculateSystemHealth } from "./systemHealthModel";
export { generatePolicyTransparencyReport } from "./policyTransparencyReport";

export type { PolicyProposal } from "./policyProposalEngine";
export type { SimulationResult } from "./simulationSandbox";
export type { CapitalImpactReport } from "./capitalImpactSimulator";
export type { RiskProjection } from "./riskProjectionEngine";
export type { EconomicImpact } from "./economicImpactModel";
export type { StressTestResult, StressScenario } from "./networkStressTest";
export type { VoteOutcome } from "./governanceVoting";
export type { OptimizerRecommendation } from "./autonomousOptimizer";
export type { GuardrailResult } from "./policyActivationGuardrails";
export type { SystemHealth } from "./systemHealthModel";
export type { PolicyTransparencyReport } from "./policyTransparencyReport";
