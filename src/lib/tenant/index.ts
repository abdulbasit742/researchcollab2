/**
 * Multi-Tenant Module — unified exports.
 */

export { getCurrentTenantId, setCurrentTenantId, clearTenantContext, assertTenantAccess, getUserTenants, GLOBAL_TENANT } from "./tenantContext";
export { assertSameTenant, guardDealTenant, guardWalletTenant, guardOfferTenant, guardThreadTenant, TenantViolationError } from "./tenantGuards";
export { runLeakDetection } from "./leakDetector";
export { validateEscrowTenancy, getTenantWallet, getTenantDeals } from "./tenantScoped";
export { runTenantHealthCheck } from "./tenantHealth";
export type { LeakResult } from "./leakDetector";
export type { TenantHealthReport } from "./tenantHealth";
