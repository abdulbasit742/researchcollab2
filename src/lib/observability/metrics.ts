/**
 * Metrics Collection — lightweight operation metrics with batch persistence.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("metrics");

interface MetricRecord {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

const buffer: MetricRecord[] = [];
const FLUSH_INTERVAL = 30_000; // 30s
const MAX_BUFFER = 200;

let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Record a metric point.
 */
export function recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
  buffer.push({ name, value, tags, timestamp: Date.now() });

  if (buffer.length >= MAX_BUFFER) {
    flushMetrics();
  }
}

/**
 * Convenience: time an async operation and record its duration.
 */
export async function timedMetric<T>(name: string, fn: () => Promise<T>, tags: Record<string, string> = {}): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    recordMetric(name, Math.round(performance.now() - start), { ...tags, status: "ok" });
    return result;
  } catch (err) {
    recordMetric(name, Math.round(performance.now() - start), { ...tags, status: "error" });
    throw err;
  }
}

/**
 * Flush buffered metrics to DB.
 */
export async function flushMetrics(): Promise<void> {
  if (buffer.length === 0) return;

  const batch = buffer.splice(0, buffer.length);

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const rows = batch.map((m) => ({
      metric_name: m.name,
      metric_value: m.value,
      tags: m.tags,
      recorded_at: new Date(m.timestamp).toISOString(),
    }));

    await (supabase as any).from("system_metrics").insert(rows);
  } catch {
    log.warn("Failed to flush metrics", { count: batch.length });
    // Don't re-add to buffer to prevent infinite growth
  }
}

/**
 * Start auto-flush interval.
 */
export function startMetricsAutoFlush(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flushMetrics, FLUSH_INTERVAL);
}

/**
 * Stop auto-flush and flush remaining.
 */
export async function stopMetricsAutoFlush(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flushMetrics();
}
