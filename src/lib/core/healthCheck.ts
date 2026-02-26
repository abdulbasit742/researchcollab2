/**
 * Production Health Checks — comprehensive system diagnostics.
 * Admin-only. Checks DB connectivity, ledger consistency, escrow integrity.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "./logger";

const log = createLogger("healthCheck");

export interface HealthCheckResult {
  check: string;
  status: "pass" | "fail" | "warn";
  latencyMs?: number;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Check database connectivity.
 */
async function checkDbConnectivity(): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    const latency = Math.round(performance.now() - start);

    if (error) {
      return { check: "db_connectivity", status: "fail", latencyMs: latency, message: error.message };
    }
    return {
      check: "db_connectivity",
      status: latency > 3000 ? "warn" : "pass",
      latencyMs: latency,
      message: latency > 3000 ? `Slow response: ${latency}ms` : `OK (${latency}ms)`,
    };
  } catch (err) {
    return { check: "db_connectivity", status: "fail", message: String(err) };
  }
}

/**
 * Check storage connectivity.
 */
async function checkStorageConnectivity(): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    const latency = Math.round(performance.now() - start);

    if (error) {
      return { check: "storage_connectivity", status: "fail", latencyMs: latency, message: error.message };
    }
    return { check: "storage_connectivity", status: "pass", latencyMs: latency, message: `OK (${latency}ms)` };
  } catch (err) {
    return { check: "storage_connectivity", status: "fail", message: String(err) };
  }
}

/**
 * Check for wallets with negative balances.
 */
async function checkWalletConsistency(): Promise<HealthCheckResult> {
  try {
    const { count, error } = await supabase
      .from("wallets")
      .select("id", { count: "exact", head: true })
      .or("available_balance.lt.0,escrow_balance.lt.0");

    if (error) {
      return { check: "wallet_consistency", status: "fail", message: error.message };
    }

    if ((count ?? 0) > 0) {
      return {
        check: "wallet_consistency",
        status: "fail",
        message: `${count} wallet(s) with negative balances`,
        details: { negativeCount: count },
      };
    }
    return { check: "wallet_consistency", status: "pass", message: "All wallets consistent" };
  } catch (err) {
    return { check: "wallet_consistency", status: "fail", message: String(err) };
  }
}

/**
 * Check for deals stuck in funded status for >7 days with no activity.
 */
async function checkStaleEscrows(): Promise<HealthCheckResult> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from("deal_rooms")
      .select("id", { count: "exact", head: true })
      .eq("escrow_status", "funded")
      .lt("updated_at", sevenDaysAgo);

    if (error) {
      return { check: "stale_escrows", status: "fail", message: error.message };
    }

    if ((count ?? 0) > 0) {
      return {
        check: "stale_escrows",
        status: "warn",
        message: `${count} deal(s) funded but inactive for >7 days`,
        details: { staleCount: count },
      };
    }
    return { check: "stale_escrows", status: "pass", message: "No stale escrows" };
  } catch (err) {
    return { check: "stale_escrows", status: "fail", message: String(err) };
  }
}

/**
 * Check for unresolved user flags.
 */
async function checkUnresolvedFlags(): Promise<HealthCheckResult> {
  try {
    const { count, error } = await supabase
      .from("user_flags")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false)
      .in("severity", ["high", "critical"]);

    if (error) {
      return { check: "unresolved_flags", status: "fail", message: error.message };
    }

    if ((count ?? 0) > 0) {
      return {
        check: "unresolved_flags",
        status: "warn",
        message: `${count} high/critical unresolved flag(s)`,
        details: { flagCount: count },
      };
    }
    return { check: "unresolved_flags", status: "pass", message: "No critical flags" };
  } catch (err) {
    return { check: "unresolved_flags", status: "fail", message: String(err) };
  }
}

/**
 * Run all health checks and return summary.
 */
export async function checkSystemHealth(): Promise<{
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  timestamp: string;
}> {
  const checks = await Promise.all([
    checkDbConnectivity(),
    checkStorageConnectivity(),
    checkWalletConsistency(),
    checkStaleEscrows(),
    checkUnresolvedFlags(),
  ]);

  const hasFail = checks.some((c) => c.status === "fail");
  const hasWarn = checks.some((c) => c.status === "warn");

  const overall = hasFail ? "unhealthy" : hasWarn ? "degraded" : "healthy";

  log.info("Health check completed", { overall, checks: checks.length });

  return {
    overall,
    checks,
    timestamp: new Date().toISOString(),
  };
}
