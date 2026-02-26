/**
 * Stress Check — lightweight concurrency probe for launch readiness.
 * Does NOT mutate production data — only reads or uses dry-run patterns.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("stressCheck");

export interface StressResult {
  test: string;
  concurrency: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  maxDurationMs: number;
}

export interface StressReport {
  results: StressResult[];
  passed: boolean;
  timestamp: string;
}

async function stressTest(
  name: string,
  concurrency: number,
  fn: () => Promise<void>
): Promise<StressResult> {
  const durations: number[] = [];
  let failures = 0;

  const tasks = Array.from({ length: concurrency }, async () => {
    const start = performance.now();
    try {
      await fn();
      durations.push(performance.now() - start);
    } catch {
      failures++;
      durations.push(performance.now() - start);
    }
  });

  await Promise.all(tasks);

  return {
    test: name,
    concurrency,
    successCount: concurrency - failures,
    failureCount: failures,
    avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    maxDurationMs: Math.round(Math.max(...durations)),
  };
}

export async function runStressCheck(): Promise<StressReport> {
  log.info("Running stress checks (read-only)...");

  const results = await Promise.all([
    // Concurrent profile reads
    stressTest("concurrent_profile_reads", 100, async () => {
      await supabase.from("profiles").select("id, display_name").limit(5);
    }),

    // Concurrent deal reads
    stressTest("concurrent_deal_reads", 50, async () => {
      await supabase.from("deal_rooms").select("id, title, status").limit(5);
    }),

    // Concurrent wallet reads
    stressTest("concurrent_wallet_reads", 50, async () => {
      await supabase.from("wallets").select("id, available_balance").limit(5);
    }),

    // Concurrent notification reads
    stressTest("concurrent_notification_reads", 100, async () => {
      await supabase.from("notifications").select("id, title").limit(5);
    }),

    // Concurrent tenant reads
    stressTest("concurrent_tenant_reads", 50, async () => {
      await supabase.from("tenants").select("id, name").limit(5);
    }),
  ]);

  const totalFailures = results.reduce((s, r) => s + r.failureCount, 0);

  const report: StressReport = {
    results,
    passed: totalFailures === 0,
    timestamp: new Date().toISOString(),
  };

  log.info(`Stress check: ${totalFailures} total failures, ${report.passed ? "PASS" : "FAIL"}`);
  return report;
}
