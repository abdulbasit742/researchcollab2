/**
 * Chaos Report Generator — collects and persists chaos test results.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("chaosReport");

export interface ChaosResult {
  operation: string;
  success: boolean;
  durationMs: number;
  error?: string;
  invariantViolation?: boolean;
}

export interface ChaosReport {
  testType: string;
  totalOperations: number;
  totalFailures: number;
  invariantViolations: number;
  avgDurationMs: number;
  maxDurationMs: number;
  results: ChaosResult[];
  summary: "PASS" | "FAIL";
  createdAt: string;
}

/**
 * Build a report from individual results.
 */
export function buildChaosReport(testType: string, results: ChaosResult[]): ChaosReport {
  const totalFailures = results.filter((r) => !r.success).length;
  const invariantViolations = results.filter((r) => r.invariantViolation).length;
  const durations = results.map((r) => r.durationMs);
  const avgDurationMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const maxDurationMs = durations.length ? Math.max(...durations) : 0;

  return {
    testType,
    totalOperations: results.length,
    totalFailures,
    invariantViolations,
    avgDurationMs,
    maxDurationMs,
    results,
    summary: invariantViolations > 0 ? "FAIL" : "PASS",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Persist a chaos report to the database.
 */
export async function persistChaosReport(report: ChaosReport): Promise<void> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await (supabase as any).from("chaos_reports").insert({
      test_type: report.testType,
      summary: report.summary,
      failure_count: report.totalFailures,
      invariant_violations: report.invariantViolations,
      metadata: {
        totalOperations: report.totalOperations,
        avgDurationMs: report.avgDurationMs,
        maxDurationMs: report.maxDurationMs,
      },
    });
    log.info(`Chaos report persisted: ${report.testType} → ${report.summary}`);
  } catch {
    log.warn("Failed to persist chaos report (table may not exist)");
  }
}

/**
 * Log a chaos report summary.
 */
export function logChaosReport(report: ChaosReport): void {
  const icon = report.summary === "PASS" ? "✅" : "❌";
  log.info(`${icon} Chaos: ${report.testType} | Ops: ${report.totalOperations} | Fail: ${report.totalFailures} | Violations: ${report.invariantViolations} | Avg: ${report.avgDurationMs}ms`);
}
