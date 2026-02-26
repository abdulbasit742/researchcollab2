/**
 * Region Guards — enforces data residency and prevents cross-region access.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("regionGuards");

export function assertSameRegion(entityRegionId: string | null, sessionRegionId: string | null): void {
  if (!entityRegionId || !sessionRegionId) return; // Graceful during migration period
  if (entityRegionId !== sessionRegionId) {
    log.error("Region boundary violation", { entityRegionId, sessionRegionId });
    throw new Error("Access denied: entity belongs to a different data residency region");
  }
}

export function assertDealRegionMatch(dealRegionId: string | null, participantRegionId: string | null): void {
  if (!dealRegionId || !participantRegionId) return;
  if (dealRegionId !== participantRegionId) {
    throw new Error("Cross-region deal participation is not permitted");
  }
}

export function assertPoolRegionMatch(poolRegionId: string | null, dealRegionId: string | null): void {
  if (!poolRegionId || !dealRegionId) return;
  if (poolRegionId !== dealRegionId) {
    throw new Error("Capital pool and deal must belong to the same region");
  }
}

export function assertWalletCurrencyRegion(walletCurrency: string, regionCurrency: string): void {
  if (walletCurrency !== regionCurrency) {
    log.warn("Wallet currency does not match region default", { walletCurrency, regionCurrency });
  }
}
