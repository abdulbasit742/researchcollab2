/**
 * Trust Storm Simulator — fires rapid trust recompute triggers to test debounce.
 */

import { requireChaos } from "./chaosController";
import { buildChaosReport, logChaosReport, persistChaosReport, type ChaosResult } from "./chaosReport";
import { enqueueTrustRecompute, getPendingCount } from "@/lib/trust/recomputeQueue";

const noopRecompute = async (_uid: string) => { /* chaos test — no real recompute */ };

export async function simulateTrustStorm(userId: string, count = 100): Promise<void> {
  requireChaos();

  const results: ChaosResult[] = [];

  for (let i = 0; i < count; i++) {
    const start = performance.now();
    try {
      enqueueTrustRecompute(userId, noopRecompute);
      results.push({ operation: `trust_trigger_${i}`, success: true, durationMs: Math.round(performance.now() - start) });
    } catch (err) {
      results.push({ operation: `trust_trigger_${i}`, success: false, durationMs: Math.round(performance.now() - start), error: String(err) });
    }
  }

  const pendingCount = getPendingCount();
  const deduplicationWorked = pendingCount <= 5;

  results.push({
    operation: "trust_storm_dedup_check",
    success: deduplicationWorked,
    durationMs: 0,
    invariantViolation: !deduplicationWorked,
    error: deduplicationWorked ? undefined : `Pending: ${pendingCount}`,
  });

  const report = buildChaosReport("trust_recompute_storm", results);
  logChaosReport(report);
  await persistChaosReport(report);
}
