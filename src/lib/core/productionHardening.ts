/**
 * Production Hardening Utilities — idempotency, rate limiting, input guards.
 * Used across all financial endpoints.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("productionHardening");

// ─── Idempotency Guard ────────────────────────────────────────────────────

const processedKeys = new Map<string, { result: unknown; expiresAt: number }>();
const IDEMPOTENCY_TTL_MS = 300_000; // 5 minutes

/**
 * Execute an operation idempotently — same key returns cached result.
 */
export async function idempotent<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  // Clean expired entries
  const now = Date.now();
  for (const [k, v] of processedKeys) {
    if (v.expiresAt < now) processedKeys.delete(k);
  }

  const existing = processedKeys.get(key);
  if (existing && existing.expiresAt > now) {
    log.info("Idempotent hit — returning cached result", { key });
    return existing.result as T;
  }

  const result = await operation();
  processedKeys.set(key, { result, expiresAt: now + IDEMPOTENCY_TTL_MS });
  return result;
}

// ─── Rate Limiter ──────────────────────────────────────────────────────────

const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 };

/**
 * Check if an action is rate-limited. Returns true if allowed.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.windowStart > config.windowMs) {
    rateLimitBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= config.maxRequests) {
    log.warn("Rate limit exceeded", { key, count: bucket.count, max: config.maxRequests });
    return false;
  }

  bucket.count++;
  return true;
}

// ─── Financial Input Guards ────────────────────────────────────────────────

/**
 * Validate a monetary amount — must be positive, finite, and reasonable.
 */
export function validateMonetaryAmount(
  amount: unknown,
  label = "amount",
  maxAmount = 10_000_000
): number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new Error(`${label} must be a finite number`);
  }
  if (amount <= 0) {
    throw new Error(`${label} must be positive`);
  }
  if (amount > maxAmount) {
    throw new Error(`${label} exceeds maximum allowed (${maxAmount})`);
  }
  // Round to 2 decimal places to prevent floating point issues
  return Math.round(amount * 100) / 100;
}

/**
 * Validate a UUID string.
 */
export function validateUUID(value: unknown, label = "id"): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error(`${label} is not a valid UUID`);
  }
  return value;
}

/**
 * Sanitize a string for safe storage — trims and limits length.
 */
export function sanitizeString(value: unknown, label = "input", maxLength = 500): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} cannot be empty`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${label} exceeds maximum length (${maxLength})`);
  }
  return trimmed;
}
