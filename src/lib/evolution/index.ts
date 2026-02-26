/**
 * Controlled Sovereign Distribution Architecture (CSDA) — unified exports.
 */

export { calculateSovereigntyMaturity, getSovereigntyProfile, getNetworkMaturityLevel, MaturityLevel, MATURITY_LABELS } from "./sovereigntyMaturity";
export { getGovernanceCapabilities } from "./governanceUnlockEngine";
export { executeFounderAction, isFounderAuthorityActive, getFounderDependencyRatio } from "./founderSafeguards";
export { calculateVotingWeight } from "./trustWeightedGovernance";
export { simulateCapitalVotingShift, simulateVotingTransition } from "./capitalVotingShift";
export { evaluateAutonomy } from "./autonomyUnlock";
export { assessCaptureRisk } from "./captureProtection";
export { executeEmergencyOverride } from "./emergencyOverride";
export { calculateEvolutionHealth } from "./evolutionHealthIndex";
export { generateEvolutionSnapshot } from "./evolutionTransparency";

export type { SovereigntyProfile } from "./sovereigntyMaturity";
export type { GovernanceCapabilities } from "./governanceUnlockEngine";
export type { FounderVetoRecord, FounderAction } from "./founderSafeguards";
export type { VotingWeight } from "./trustWeightedGovernance";
export type { VotingPowerDistribution } from "./capitalVotingShift";
export type { AutonomyCapabilities } from "./autonomyUnlock";
export type { CaptureRiskAssessment } from "./captureProtection";
export type { EmergencyOverrideResult, EmergencyAction } from "./emergencyOverride";
export type { EvolutionHealthScore } from "./evolutionHealthIndex";
export type { EvolutionTransparencySnapshot } from "./evolutionTransparency";
