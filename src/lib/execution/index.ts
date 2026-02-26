/**
 * Global Execution Dominance Strategy (GEDS) — unified exports.
 */

export { getAllPhases, getActivePhase, activatePhase, deactivatePhase, isPhaseActive, isFeatureAccessible } from "./phaseManager";
export { isFeatureEnabled, setEmergencyShutdown, getFeatureRegistry } from "./featureFlags";
export { assessRegulatoryExposure, enforceRegulatoryLimits } from "./regulatoryExposure";
export { getInstitutionTier, promoteInstitution, TIER_NAMES } from "./adoptionLadder";
export { getActivationTimeline, getProjectionForYear, simulateGMVGrowth } from "./capitalActivation";
export { getAllStages, getStageRequirements, validateStageReadiness } from "./reserveRollout";
export { getGIABMode, setGIABMode, isGIABVisible, getGIABModeDescription } from "./giabMode";
export { getNarrativeProfile, setActiveNarrative, getActiveNarrative, getAllNarratives, recommendNarrative } from "./investorNarrative";
export { getPublicExposureConfig, isDataPubliclyVisible, getPublicDataSummary } from "./publicExposure";

export type { PlatformPhase } from "./phaseManager";
export type { FeatureGate } from "./featureFlags";
export type { RegulatoryExposure } from "./regulatoryExposure";
export type { InstitutionTier } from "./adoptionLadder";
export type { YearProjection } from "./capitalActivation";
export type { ReserveStage, StageRequirements } from "./reserveRollout";
export type { GIABMode } from "./giabMode";
export type { NarrativeLayer, NarrativeProfile } from "./investorNarrative";
export type { ExposureConfig } from "./publicExposure";
