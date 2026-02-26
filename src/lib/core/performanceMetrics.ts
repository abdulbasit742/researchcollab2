/**
 * Performance metrics — lightweight operation duration tracking.
 * Only active in development/staging or when explicitly enabled.
 */

import { createLogger } from "./logger";

const log = createLogger("perf");

interface MetricEntry {
  operation: string;
  durationMs: number;
  timestamp: number;
}

const metrics: MetricEntry[] = [];
const MAX_ENTRIES = 500;

/**
 * Measure the duration of an async operation.
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    recordMetric(operation, duration);
    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    recordMetric(`${operation}:error`, duration);
    throw err;
  }
}

/**
 * Measure sync operation.
 */
export function measureSync<T>(operation: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = Math.round(performance.now() - start);
  recordMetric(operation, duration);
  return result;
}

function recordMetric(operation: string, durationMs: number) {
  if (metrics.length >= MAX_ENTRIES) {
    metrics.splice(0, 100); // Trim oldest 100
  }
  metrics.push({ operation, durationMs, timestamp: Date.now() });

  // Log slow operations
  if (durationMs > 2000) {
    log.warn(`Slow operation: ${operation} took ${durationMs}ms`);
  }
}

/**
 * Get summary statistics for recent operations.
 */
export function getMetricsSummary(): Record<string, { count: number; avgMs: number; maxMs: number }> {
  const grouped: Record<string, number[]> = {};

  for (const m of metrics) {
    if (!grouped[m.operation]) grouped[m.operation] = [];
    grouped[m.operation].push(m.durationMs);
  }

  const summary: Record<string, { count: number; avgMs: number; maxMs: number }> = {};
  for (const [op, durations] of Object.entries(grouped)) {
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const max = Math.max(...durations);
    summary[op] = { count: durations.length, avgMs: avg, maxMs: max };
  }

  return summary;
}

/**
 * Clear all recorded metrics.
 */
export function clearMetrics(): void {
  metrics.length = 0;
}
