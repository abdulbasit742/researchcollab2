/**
 * World Dominance Architecture (WDA) — unified exports.
 */

export { getInfrastructureNodes, simulateRegionShutdown, getGeoDistribution } from "./globalInfrastructure";
export { registerInstitutionIdentity, verifyInstitutionIdentity, getInstitutionIdentity } from "./institutionIdentity";
export { calculateGlobalTrustIndex } from "./trustEconomyEngine";
export { calculateGlobalRisk } from "./globalRiskEngine";
export { generateCapitalIndices } from "./researchCapitalIndex";
export { generateEconomicOptimizations } from "./economicOptimizer";
export { calculateGlobalTreasury } from "./globalTreasuryModel";
export { predictInnovationImpact } from "./innovationPredictor";
export { createInterGovernmentalAgreement, getActiveAgreements, getRegulatoryCompatibility } from "./interGovernmentMesh";
export { calculateWorldHealthIndex } from "./globalHealthIndex";
export { generateWorldTransparencySnapshot } from "./worldTransparency";

export type { InfraNode, FailoverSimulation } from "./globalInfrastructure";
export type { InstitutionIdentity } from "./institutionIdentity";
export type { TrustLayers } from "./trustEconomyEngine";
export type { GlobalRiskProfile } from "./globalRiskEngine";
export type { CapitalIndex } from "./researchCapitalIndex";
export type { EconomicRecommendation } from "./economicOptimizer";
export type { GlobalTreasury } from "./globalTreasuryModel";
export type { InnovationPrediction } from "./innovationPredictor";
export type { InterGovAgreement } from "./interGovernmentMesh";
export type { WorldHealthIndex } from "./globalHealthIndex";
export type { WorldTransparencySnapshot } from "./worldTransparency";
