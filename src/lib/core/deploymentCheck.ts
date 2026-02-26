/**
 * Deployment readiness check — verifies the system is safe to deploy.
 * Called pre-deploy by CI or manually by admin.
 */

import { checkSystemHealth } from "./healthCheck";
import { checkBackupStatus } from "./backupStatus";
import { createLogger } from "./logger";

const log = createLogger("deployment");

export interface DeploymentCheckResult {
  ready: boolean;
  checks: Array<{ name: string; passed: boolean; message: string }>;
}

/**
 * Verify deployment readiness.
 */
export async function runDeploymentChecks(): Promise<DeploymentCheckResult> {
  const results: Array<{ name: string; passed: boolean; message: string }> = [];

  // 1. Health check
  try {
    const health = await checkSystemHealth();
    results.push({
      name: "system_health",
      passed: health.overall !== "unhealthy",
      message: `System is ${health.overall}`,
    });
  } catch (err) {
    results.push({ name: "system_health", passed: false, message: String(err) });
  }

  // 2. Backup freshness
  try {
    const backup = await checkBackupStatus();
    results.push({
      name: "backup_freshness",
      passed: !backup.isStale,
      message: backup.isStale
        ? `Last backup ${backup.hoursAgo ?? "unknown"}h ago (>24h)`
        : `Backup current (${backup.hoursAgo}h ago)`,
    });
  } catch (err) {
    results.push({ name: "backup_freshness", passed: false, message: String(err) });
  }

  // 3. Environment validation
  const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  for (const v of requiredVars) {
    const val = import.meta.env[v];
    results.push({
      name: `env:${v}`,
      passed: !!val && val !== "undefined",
      message: val ? "Present" : "Missing",
    });
  }

  const ready = results.every((r) => r.passed);
  log.info("Deployment check completed", { ready, total: results.length });

  return { ready, checks: results };
}
