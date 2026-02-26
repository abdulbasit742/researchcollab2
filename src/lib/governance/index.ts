/**
 * Public–Private Institutional Coordination Layer — unified exports.
 */

export { assertGovernanceRole, assertGovernmentAdmin, hasGovernanceRole } from "./governanceRoles";
export { calculateInstitutionScore, allocateGrantToTenant } from "./performanceAllocator";
export { getNationalMetrics } from "./nationalMetrics";
export { getOversightDashboardData } from "./oversightDashboardService";
export { generateQuarterlyReport } from "./accountabilityReports";
export { generatePublicSnapshot } from "./publicSnapshot";

export type { GovernanceRole } from "./governanceRoles";
export type { InstitutionScore } from "./performanceAllocator";
export type { NationalMetrics } from "./nationalMetrics";
export type { OversightDashboardData } from "./oversightDashboardService";
export type { AccountabilityReport } from "./accountabilityReports";
export type { PublicTransparencySnapshot } from "./publicSnapshot";
