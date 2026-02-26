/**
 * Financial Guard Middleware — enforces auth, rate limiting, and idempotency
 * on all financial endpoints.
 */

import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit } from "@/lib/core/productionHardening";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialGuard");

export interface FinancialRequestContext {
  userId: string;
  idempotencyKey: string;
}

/**
 * Validate that a financial request has proper auth + idempotency key.
 */
export async function validateFinancialRequest(
  idempotencyKey?: string
): Promise<{ valid: boolean; context?: FinancialRequestContext; error?: string }> {
  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { valid: false, error: "Authentication required" };
  }

  // 2. Idempotency key required for all financial mutations
  if (!idempotencyKey || idempotencyKey.trim().length === 0) {
    return { valid: false, error: "Idempotency key required for financial operations" };
  }

  // 3. Rate limiting
  const rateLimitKey = `financial:${user.id}`;
  if (!checkRateLimit(rateLimitKey, { maxRequests: 20, windowMs: 60_000 })) {
    log.warn("Financial rate limit exceeded", { userId: user.id });
    return { valid: false, error: "Rate limit exceeded. Please try again shortly." };
  }

  return {
    valid: true,
    context: { userId: user.id, idempotencyKey },
  };
}
