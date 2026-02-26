/**
 * Distributed Tracing — lightweight trace context for correlating operations.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("tracing");

interface TraceSpan {
  traceId: string;
  operation: string;
  startTime: number;
  metadata: Record<string, unknown>;
}

const activeSpans = new Map<string, TraceSpan>();

function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Start a trace span. Returns a traceId for correlation.
 */
export function startTrace(operation: string, metadata: Record<string, unknown> = {}): string {
  const traceId = generateTraceId();
  activeSpans.set(traceId, {
    traceId,
    operation,
    startTime: performance.now(),
    metadata,
  });
  log.debug(`Trace started: ${operation}`, { traceId });
  return traceId;
}

/**
 * End a trace span. Logs duration and returns it.
 */
export function endTrace(traceId: string, extraMetadata: Record<string, unknown> = {}): number {
  const span = activeSpans.get(traceId);
  if (!span) {
    log.warn("Attempted to end unknown trace", { traceId });
    return 0;
  }

  const durationMs = Math.round(performance.now() - span.startTime);
  activeSpans.delete(traceId);

  log.debug(`Trace ended: ${span.operation} (${durationMs}ms)`, {
    traceId,
    durationMs,
    ...span.metadata,
    ...extraMetadata,
  });

  if (durationMs > 5000) {
    log.warn(`Slow trace: ${span.operation} took ${durationMs}ms`, { traceId });
  }

  return durationMs;
}

/**
 * Wrap an async operation with tracing.
 */
export async function withTrace<T>(
  operation: string,
  fn: (traceId: string) => Promise<T>,
  metadata: Record<string, unknown> = {}
): Promise<T> {
  const traceId = startTrace(operation, metadata);
  try {
    const result = await fn(traceId);
    endTrace(traceId, { status: "ok" });
    return result;
  } catch (err) {
    endTrace(traceId, { status: "error", error: err instanceof Error ? err.message : String(err) });
    throw err;
  }
}

/**
 * Get count of active spans (for diagnostics).
 */
export function getActiveSpanCount(): number {
  return activeSpans.size;
}
