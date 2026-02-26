/**
 * International Multi-Region Architecture — unified exports.
 */

export { getCurrentRegion, assertRegionMatch, getTenantRegionId } from "./tenantRegionContext";
export { convertCurrency, assertCurrencyMatch, getSupportedCurrencies, getExchangeRate } from "./currencyService";
export { resolveStripeConfig, assertNoCorssRegionPayment } from "./stripeRegionResolver";
export { assertSameRegion, assertDealRegionMatch, assertPoolRegionMatch, assertWalletCurrencyRegion } from "./regionGuards";
export { getGlobalAnalytics } from "./globalAnalytics";
export { checkRegionHealth, checkAllRegionsHealth } from "./regionHealth";
export { isFeatureEnabled, getRegionFeatures, setFeatureFlag, FEATURE_KEYS } from "./featureFlags";

export type { RegionInfo } from "./tenantRegionContext";
export type { RegionalStripeConfig } from "./stripeRegionResolver";
export type { RegionGMV, GlobalAnalyticsReport } from "./globalAnalytics";
export type { RegionHealthStatus } from "./regionHealth";
