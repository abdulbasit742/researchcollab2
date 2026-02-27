/**
 * Founder Risk Mitigation & Succession Engine (FRMSE) — unified export.
 */

export { logFounderDecision, getRecentDecisions, countOverridesInWindow } from "./decisionLog";
export type { FounderDecision, DecisionType, RiskLevel } from "./decisionLog";

export { calculateRiskExposure } from "./riskExposure";
export type { RiskExposureReport } from "./riskExposure";

export { calculateStrategicDrift } from "./strategicDrift";
export type { StrategicDriftReport, DriftFactors } from "./strategicDrift";

export { evaluateOverrideAttempt } from "./egoSafeguard";
export type { OverrideAttempt, SafeguardResult } from "./egoSafeguard";

export { calculateSuccessionReadiness } from "./successionModel";
export type { SuccessionReadinessReport, SuccessionFactors } from "./successionModel";

export { activateContinuityMode, deactivateContinuityMode, isModuleOperational, isExpansionAllowed, getContinuityState } from "./emergencyContinuity";
export type { ContinuityState, ContinuityTrigger } from "./emergencyContinuity";

export { activateStabilityBuffer, deactivateStabilityBuffer, isOperationAllowed, getBufferState } from "./stabilityBuffer";
export type { StabilityBufferState } from "./stabilityBuffer";

export { calculatePowerConcentration } from "./powerIndex";
export type { PowerConcentrationReport } from "./powerIndex";

export { calculateDependencyScore } from "./dependencyScore";
export type { DependencyReport } from "./dependencyScore";

export { createCoolingRequest, isCoolingComplete, runValidationMatrix, approveDecision, getRemainingCoolingHours } from "./decisionCooling";
export type { CoolingRequest, CoolingDecisionType, ValidationResult } from "./decisionCooling";

export { detectGrowthPhase, evaluateGrowthDiscipline, tenYearTest } from "./growthDiscipline";
export type { GrowthMetrics, GrowthDisciplineReport, GrowthPhase } from "./growthDiscipline";

export { FOUNDER_RISK_PATTERNS, evaluateFounderPerformance } from "./psychologicalRisks";
export type { PsychologicalRisk, FounderPerformanceMetrics } from "./psychologicalRisks";
