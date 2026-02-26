/**
 * Observability — structured logging, health checks, latency tracking, system metrics.
 */

import { supabase } from "@/integrations/supabase/client";

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  components: Record<string, { status: string; latencyMs?: number; error?: string }>;
  timestamp: string;
}

interface LatencyMetric {
  operation: string;
  durationMs: number;
  timestamp: string;
}

const logBuffer: LogEntry[] = [];
const latencyBuffer: LatencyMetric[] = [];
const MAX_LOG_SIZE = 2000;
const MAX_LATENCY_SIZE = 500;

// ─── Structured Logging ───
export function log(level: LogLevel, context: string, message: string, metadata?: Record<string, any>) {
  const entry: LogEntry = { level, context, message, timestamp: new Date().toISOString(), metadata };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_SIZE) logBuffer.shift();

  if (level === "error" || level === "critical") {
    console.error(`[${level.toUpperCase()}:${context}]`, message, metadata ?? "");
  }
}

// ─── Latency Tracking ───
export function trackLatency(operation: string, startTime: number) {
  const durationMs = Date.now() - startTime;
  latencyBuffer.push({ operation, durationMs, timestamp: new Date().toISOString() });
  if (latencyBuffer.length > MAX_LATENCY_SIZE) latencyBuffer.shift();

  if (durationMs > 5000) {
    log("warn", "latency", `Slow operation: ${operation} took ${durationMs}ms`);
  }
}

export function measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  return fn().then(
    result => { trackLatency(operation, start); return result; },
    err => { trackLatency(operation, start); throw err; }
  );
}

// ─── Health Check ───
export async function healthCheck(): Promise<HealthStatus> {
  const components: HealthStatus["components"] = {};

  // Database connectivity
  const dbStart = Date.now();
  try {
    await supabase.from("profiles").select("id").limit(1);
    components.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (err) {
    components.database = { status: "unhealthy", latencyMs: Date.now() - dbStart, error: String(err) };
  }

  // Auth service
  try {
    const { data } = await supabase.auth.getSession();
    components.auth = { status: data.session ? "authenticated" : "anonymous" };
  } catch {
    components.auth = { status: "unhealthy" };
  }

  // Realtime
  components.realtime = { status: supabase.realtime ? "available" : "unavailable" };

  const unhealthy = Object.values(components).filter(c => c.status === "unhealthy").length;
  const overall = unhealthy > 1 ? "unhealthy" : unhealthy === 1 ? "degraded" : "healthy";

  return { overall, components, timestamp: new Date().toISOString() };
}

// ─── Metric Accessors ───
export function getRecentLogs(level?: LogLevel, limit = 100): LogEntry[] {
  const filtered = level ? logBuffer.filter(l => l.level === level) : logBuffer;
  return filtered.slice(-limit);
}

export function getLatencyMetrics(operation?: string): LatencyMetric[] {
  return operation ? latencyBuffer.filter(l => l.operation === operation) : [...latencyBuffer];
}

export function getAvgLatency(operation: string): number {
  const metrics = latencyBuffer.filter(l => l.operation === operation);
  if (metrics.length === 0) return 0;
  return Math.round(metrics.reduce((s, m) => s + m.durationMs, 0) / metrics.length);
}

export function getErrorRate(windowMs = 300000): number {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const recent = logBuffer.filter(l => l.timestamp > cutoff);
  if (recent.length === 0) return 0;
  const errors = recent.filter(l => l.level === "error" || l.level === "critical").length;
  return Math.round((errors / recent.length) * 100);
}
