/**
 * System Status — comprehensive status report for admin dashboards.
 * Extends healthCheck with version info and component status.
 */

import { checkSystemHealth } from "./healthCheck";
import { getAppVersion, getAppEnv } from "./environment";

export interface SystemStatus {
  version: string;
  environment: string;
  overall: "healthy" | "degraded" | "unhealthy";
  checks: Array<{
    check: string;
    status: "pass" | "fail" | "warn";
    latencyMs?: number;
    message: string;
  }>;
  timestamp: string;
}

/**
 * Full system status report.
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const health = await checkSystemHealth();

  return {
    version: getAppVersion(),
    environment: getAppEnv(),
    overall: health.overall,
    checks: health.checks,
    timestamp: health.timestamp,
  };
}
