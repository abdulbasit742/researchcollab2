/**
 * Civilizational Infrastructure Evolution (CIE) — unified exports.
 */

export { seedConstitutionalPrinciples, getConstitutionalPrinciples, validateAgainstConstitution } from "./constitutionalLayer";
export { modelEconomicResilience } from "./economicResilience";
export { calculateFailoverReadiness } from "./sovereignFailover";
export { getCurrentEpoch, calculateGovernanceContinuity } from "./intergenerationalGovernance";
export { simulateCrisis } from "./crisisSimulator";
export { calculateShockAbsorption } from "./shockAbsorptionModel";
export { assessInstitutionalContinuity } from "./institutionalContinuity";
export { simulateAdversarialAttack } from "./adversarialSimulator";
export { getLatestRegulatoryProfile, createRegulatoryVersion, simulateSanctionZoneImpact } from "./adaptiveRegulation";
export { calculateCivilizationalHealth } from "./civilizationalHealthIndex";
export { generateStabilityTransparencyReport } from "./stabilityTransparency";

export type { ConstitutionalPrinciple, InvariantCategory } from "./constitutionalLayer";
export type { ResilienceScenario, ResilienceResult } from "./economicResilience";
export type { FailoverReadiness } from "./sovereignFailover";
export type { GovernanceEpoch, GovernanceContinuityReport } from "./intergenerationalGovernance";
export type { CrisisScenario, CrisisResult } from "./crisisSimulator";
export type { ShockAbsorptionProfile } from "./shockAbsorptionModel";
export type { ContinuityAssessment } from "./institutionalContinuity";
export type { AttackScenario, AdversarialResult } from "./adversarialSimulator";
export type { RegulatoryProfile } from "./adaptiveRegulation";
export type { CivilizationalHealthScore } from "./civilizationalHealthIndex";
export type { StabilityTransparencyReport } from "./stabilityTransparency";
