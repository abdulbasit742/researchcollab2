/**
 * Error Reporter — centralized error logging with context.
 * Replaces silent catches throughout the codebase.
 * In production, this would forward to Sentry/LogRocket/etc.
 */

import { createLogger } from "./logger";
import { DomainError } from "./errors";

const log = createLogger("errorReporter");

interface ErrorContext {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Report an error with structured context.
 * Never logs sensitive data (passwords, tokens, etc).
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  const sanitized = sanitizeContext(context);

  if (error instanceof DomainError) {
    log.error(`[${error.code}] ${error.message}`, {
      ...sanitized,
      statusCode: error.statusCode,
      errorContext: error.context,
    });
  } else if (error instanceof Error) {
    log.error(error.message, {
      ...sanitized,
      stack: import.meta.env.MODE !== "production" ? error.stack : undefined,
    });
  } else {
    log.error(String(error), sanitized);
  }
}

/**
 * Strip sensitive fields from context before logging.
 */
function sanitizeContext(
  ctx?: ErrorContext
): Record<string, unknown> | undefined {
  if (!ctx) return undefined;

  const safe: Record<string, unknown> = {};
  if (ctx.action) safe.action = ctx.action;
  if (ctx.entityType) safe.entityType = ctx.entityType;
  if (ctx.entityId) safe.entityId = ctx.entityId;
  if (ctx.userId) safe.userId = ctx.userId;
  if (ctx.metadata) {
    // Strip any keys that look like secrets
    const cleanMeta: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx.metadata)) {
      if (!/secret|password|token|key|auth/i.test(k)) {
        cleanMeta[k] = v;
      }
    }
    safe.metadata = cleanMeta;
  }
  return safe;
}

/**
 * Wrap an async function with automatic error reporting.
 */
export async function withErrorReporting<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    reportError(err, context);
    throw err;
  }
}
