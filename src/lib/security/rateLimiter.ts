/**
 * Rate Limiter — DB-backed per-user action throttling.
 * Records actions in rate_limit_entries and checks counts within time windows.
 */

import { supabase } from "@/integrations/supabase/client";
import { DomainError } from "@/lib/core/errors";

export class RateLimitError extends DomainError {
  constructor(action: string, limit: number, windowMinutes: number) {
    super(
      `Rate limit exceeded: max ${limit} ${action} actions per ${windowMinutes} minutes`,
      "RATE_LIMIT_EXCEEDED",
      429
    );
    this.name = "RateLimitError";
  }
}

interface RateLimitConfig {
  action: string;
  maxRequests: number;
  windowMinutes: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  deal_create: { action: "deal_create", maxRequests: 10, windowMinutes: 60 },
  offer_create: { action: "offer_create", maxRequests: 20, windowMinutes: 60 },
  message_send: { action: "message_send", maxRequests: 100, windowMinutes: 60 },
  withdrawal: { action: "withdrawal", maxRequests: 5, windowMinutes: 60 },
  dispute_create: { action: "dispute_create", maxRequests: 3, windowMinutes: 60 },
  escrow_fund: { action: "escrow_fund", maxRequests: 10, windowMinutes: 60 },
};

/**
 * Check and record a rate-limited action. Throws RateLimitError if exceeded.
 */
export async function checkRateLimit(
  userId: string,
  actionKey: string
): Promise<void> {
  const config = RATE_LIMITS[actionKey];
  if (!config) return; // Unknown action — no limit

  const windowStart = new Date(
    Date.now() - config.windowMinutes * 60 * 1000
  ).toISOString();

  // Count recent actions
  const { count, error: countError } = await supabase
    .from("rate_limit_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", config.action)
    .gte("created_at", windowStart);

  if (countError) {
    // Don't block on rate limit DB errors — fail open but log
    return;
  }

  if ((count ?? 0) >= config.maxRequests) {
    throw new RateLimitError(config.action, config.maxRequests, config.windowMinutes);
  }

  // Record this action
  await supabase.from("rate_limit_entries").insert({
    user_id: userId,
    action_type: config.action,
  });
}

/**
 * Get current usage for a user/action (for UI display).
 */
export async function getRateLimitUsage(
  userId: string,
  actionKey: string
): Promise<{ used: number; limit: number; windowMinutes: number }> {
  const config = RATE_LIMITS[actionKey];
  if (!config) return { used: 0, limit: Infinity, windowMinutes: 0 };

  const windowStart = new Date(
    Date.now() - config.windowMinutes * 60 * 1000
  ).toISOString();

  const { count } = await supabase
    .from("rate_limit_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", config.action)
    .gte("created_at", windowStart);

  return {
    used: count ?? 0,
    limit: config.maxRequests,
    windowMinutes: config.windowMinutes,
  };
}
