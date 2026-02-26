/**
 * Global Academic Capital Market System (GACMS) — unified exports.
 */

export { createResearchCapitalAsset, getResearchCapitalAssets } from "./researchCapitalAsset";
export { calculateInstitutionCreditScore, getInstitutionCreditProfile, scoreToRatingBand } from "./creditRatingEngine";
export { structureInstrument } from "./innovationInstruments";
export { issueResearchBond, getResearchBonds } from "./researchBondEngine";
export { simulateInnovationDerivative } from "./innovationDerivatives";
export { getTreasuryPosition } from "./institutionTreasury";
export { getMarketLiquidityPools } from "./liquidityPools";
export { calculateRiskAdjustedReturn } from "./riskReturnModel";
export { containDefault } from "./defaultContainment";
export { calculateMarketStability } from "./marketStability";
export { calculateGlobalCapitalIndex } from "./globalCapitalIndex";
export { generateMarketTransparencyReport } from "./marketTransparency";

export type { ResearchCapitalAsset, BackingType, ComplianceStatus } from "./researchCapitalAsset";
export type { InstitutionCreditProfile, RatingBand } from "./creditRatingEngine";
export type { CapitalInstrument, InstrumentType } from "./innovationInstruments";
export type { ResearchBond } from "./researchBondEngine";
export type { DerivativeSimulation, DerivativeType } from "./innovationDerivatives";
export type { TreasuryPosition } from "./institutionTreasury";
export type { MarketLiquidityPool, PoolTier } from "./liquidityPools";
export type { RiskReturnAssessment } from "./riskReturnModel";
export type { DefaultContainmentResult, DefaultEvent } from "./defaultContainment";
export type { MarketStabilityAssessment } from "./marketStability";
export type { GlobalAcademicCapitalIndex } from "./globalCapitalIndex";
export type { MarketTransparencyReport } from "./marketTransparency";
