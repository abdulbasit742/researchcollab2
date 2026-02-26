/**
 * Structured Error Tracker — captures exceptions with context, redacts sensitive data.
 * Production-only by default.
 */

import { createLogger } from "@/lib/core/logger";
import { redactObject } from "./redaction";

const log = createLogger("errorTracker");

type Severity = "info" | "warning" | "error" | "fatal";

interface ErrorContext {
  userId?: string;
  dealId?: string;
  milestoneId?: string;
  operation?: string;
  [key: string]: unknown;
}

let globalUserContext: string | null = null;

/**
 * Attach user context for all subsequent error captures.
 */
export function attachUserContext(userId: string): void {
  globalUserContext = userId;
}

/**
 * Attach deal context (returns enriched context object).
 */
export function attachDealContext(dealId: string, ctx: ErrorContext = {}): ErrorContext {
  return { ...ctx, dealId };
}

/**
 * Capture an exception with structured context.
 */
export function captureException(error: unknown, context: ErrorContext = {}): void {
  const safeContext = redactObject({
    ...context,
    userId: context.userId ?? globalUserContext ?? "unknown",
    timestamp: new Date().toISOString(),
  });

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  log.error(`[EXCEPTION] ${message}`, { ...safeContext, stack });

  // In production, this would forward to Sentry/Datadog/etc.
  // For now, we persist to platform_events if available
  persistErrorEvent("exception", message, "error", safeContext);
}

/**
 * Capture a message with severity.
 */
export function captureMessage(message: string, severity: Severity = "info", context: ErrorContext = {}): void {
  const safeContext = redactObject({
    ...context,
    userId: context.userId ?? globalUserContext ?? "unknown",
  });

  if (severity === "error" || severity === "fatal") {
    log.error(`[${severity.toUpperCase()}] ${message}`, safeContext);
  } else {
    log.warn(`[${severity.toUpperCase()}] ${message}`, safeContext);
  }

  persistErrorEvent("message", message, severity, safeContext);
}

async function persistErrorEvent(
  type: string,
  message: string,
  severity: string,
  context: Record<string, unknown>
): Promise<void> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("platform_events").insert({
      event_type: `observability:${type}`,
      severity,
      payload: { message, ...context },
    });
  } catch {
    // Silent fail — don't crash app for observability
  }
}
