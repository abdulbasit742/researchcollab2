/**
 * Universal Institutional Interoperability Protocol (UIIP) — unified exports.
 */

export { registerExternalInterface, getExternalInterface, generateExternalSafeMetrics, logIntegrationAccess } from "./sovereignInterface";
export { generateGovernmentReport } from "./governmentGateway";
export { generateCentralBankReport } from "./centralBankAdapter";
export { generateSWFReport } from "./swfInterface";
export { generateMultilateralReport } from "./multilateralAdapter";
export { generateRegulatoryReport } from "./regulatoryExchange";
export { simulateDigitalCurrencyIntegration } from "./digitalCurrencyEngine";
export { validateApiAccess } from "./apiTrustGateway";
export { assessExternalRisk } from "./riskFirewall";
export { sovereigntyValidationCheck } from "./sovereigntyGuardrails";
export { calculateInteroperabilityHealth } from "./interoperabilityHealth";
export { generateUniversalTransparencyReport } from "./universalTransparency";

export type { ExternalInterface, ExternalSafeMetrics, InstitutionType, AccessScope, TrustTier } from "./sovereignInterface";
export type { GovernmentReport } from "./governmentGateway";
export type { CentralBankReport } from "./centralBankAdapter";
export type { SWFReport } from "./swfInterface";
export type { MultilateralReport } from "./multilateralAdapter";
export type { RegulatoryReport } from "./regulatoryExchange";
export type { DigitalCurrencySimulation, DigitalCurrencyType } from "./digitalCurrencyEngine";
export type { GatewayValidation } from "./apiTrustGateway";
export type { ExternalRiskAssessment } from "./riskFirewall";
export type { SovereigntyValidation } from "./sovereigntyGuardrails";
export type { InteroperabilityHealthScore } from "./interoperabilityHealth";
export type { UniversalTransparencyReport } from "./universalTransparency";
