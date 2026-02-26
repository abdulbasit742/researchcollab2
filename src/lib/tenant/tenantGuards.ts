/**
 * Tenant Guards — prevents cross-tenant data access at the service layer.
 */

import { createLogger } from "@/lib/core/logger";
import { captureMessage } from "@/lib/observability/errorTracker";

const log = createLogger("tenantGuard");

export class TenantViolationError extends Error {
  constructor(message: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = "TenantViolationError";
  }
}

/**
 * Assert that two tenant IDs match. Throws if they don't.
 */
export function assertSameTenant(
  entityTenantId: string | null,
  sessionTenantId: string,
  context?: string
): void {
  if (!entityTenantId || entityTenantId !== sessionTenantId) {
    const msg = `Cross-tenant access blocked${context ? `: ${context}` : ""}`;
    log.error(msg, { entityTenantId, sessionTenantId });
    captureMessage(msg, "error", {
      operation: "tenant_guard",
      entityTenantId: entityTenantId ?? "null",
      sessionTenantId,
    } as any);
    throw new TenantViolationError(msg, { entityTenantId, sessionTenantId });
  }
}

/**
 * Validate that a deal belongs to the current tenant before escrow operations.
 */
export function guardDealTenant(dealTenantId: string | null, sessionTenantId: string): void {
  assertSameTenant(dealTenantId, sessionTenantId, "deal access");
}

/**
 * Validate wallet belongs to current tenant.
 */
export function guardWalletTenant(walletTenantId: string | null, sessionTenantId: string): void {
  assertSameTenant(walletTenantId, sessionTenantId, "wallet access");
}

/**
 * Validate offer belongs to current tenant.
 */
export function guardOfferTenant(offerTenantId: string | null, sessionTenantId: string): void {
  assertSameTenant(offerTenantId, sessionTenantId, "offer access");
}

/**
 * Validate message thread belongs to current tenant.
 */
export function guardThreadTenant(threadTenantId: string | null, sessionTenantId: string): void {
  assertSameTenant(threadTenantId, sessionTenantId, "messaging access");
}
