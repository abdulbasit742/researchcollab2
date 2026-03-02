/**
 * Telemetry — structured event capture with trace correlation.
 * Append-only. No mutation of business data.
 */

import { supabase } from "@/integrations/supabase/client";

let currentTraceId: string | null = null;

export function generateTraceId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function setTraceId(id: string) {
  currentTraceId = id;
}

export function getTraceId(): string {
  if (!currentTraceId) currentTraceId = generateTraceId();
  return currentTraceId;
}

type Severity = "info" | "warning" | "error" | "critical";

interface TelemetryEvent {
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  institution_id?: string;
  node_id?: string;
  severity_level?: Severity;
  metadata?: Record<string, unknown>;
}

const buffer: TelemetryEvent[] = [];
const FLUSH_SIZE = 25;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function emitEvent(event: TelemetryEvent) {
  buffer.push({ ...event, severity_level: event.severity_level ?? "info" });
  if (buffer.length >= FLUSH_SIZE) flushTelemetry();
  else if (!flushTimer) flushTimer = setTimeout(flushTelemetry, 10_000);
}

export async function flushTelemetry() {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  if (buffer.length === 0) return;
  const batch = buffer.splice(0);
  try {
    const rows = batch.map(e => ({
      event_type: e.event_type,
      entity_type: e.entity_type ?? null,
      entity_id: e.entity_id ?? null,
      user_id: e.user_id ?? null,
      institution_id: e.institution_id ?? null,
      node_id: e.node_id ?? null,
      severity_level: e.severity_level ?? "info",
      trace_id: currentTraceId,
      metadata: e.metadata ?? {},
    }));
    await (supabase as any).from("system_event_telemetry").insert(rows);
  } catch {
    // fail silently — observability must not break app
  }
}

/**
 * Record a request trace entry.
 */
export async function traceRequest(data: {
  route: string;
  method: string;
  duration_ms: number;
  response_status: number;
  error_flag?: boolean;
  user_id?: string;
  institution_id?: string;
}) {
  try {
    await (supabase as any).from("request_traces").insert({
      trace_id: getTraceId(),
      route: data.route,
      method: data.method,
      duration_ms: data.duration_ms,
      response_status: data.response_status,
      error_flag: data.error_flag ?? false,
      user_id: data.user_id ?? null,
      institution_id: data.institution_id ?? null,
    });
  } catch { /* silent */ }
}

/**
 * Record an error to the error registry (deduplicated by hash).
 */
export async function recordError(data: {
  error_type: string;
  route?: string;
  severity?: string;
  stack_trace?: string;
}) {
  const hash = btoa(`${data.error_type}:${data.route ?? "unknown"}`).slice(0, 64);
  try {
    // Upsert: increment frequency if exists
    const { data: existing } = await (supabase as any)
      .from("error_registry")
      .select("id, frequency")
      .eq("error_hash", hash)
      .maybeSingle();

    if (existing) {
      await (supabase as any).from("error_registry")
        .update({ frequency: (existing.frequency ?? 0) + 1, last_seen: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await (supabase as any).from("error_registry").insert({
        error_hash: hash,
        error_type: data.error_type,
        route: data.route ?? null,
        severity: data.severity ?? "error",
        stack_trace_sanitized: data.stack_trace?.slice(0, 2000) ?? null,
      });
    }
  } catch { /* silent */ }
}
