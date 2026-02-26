/**
 * Tenant Health Check — verifies tenant data integrity.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { runLeakDetection, type LeakResult } from "./leakDetector";

const log = createLogger("tenantHealth");

export interface TenantHealthReport {
  tenantCount: number;
  activeTenants: number;
  suspendedTenants: number;
  usersWithoutTenant: number;
  leakResults: LeakResult[];
  healthy: boolean;
  timestamp: string;
}

/**
 * Run a comprehensive tenant health check.
 */
export async function runTenantHealthCheck(): Promise<TenantHealthReport> {
  log.info("Running tenant health check...");

  // Count tenants
  const { count: tenantCount } = await supabase
    .from("tenants")
    .select("id", { count: "exact", head: true });

  const { count: activeTenants } = await supabase
    .from("tenants")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: suspendedTenants } = await supabase
    .from("tenants")
    .select("id", { count: "exact", head: true })
    .eq("status", "suspended");

  // Check for profiles without tenant_id
  const { count: usersWithoutTenant } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .is("tenant_id", null);

  // Run leak detection
  const leakResults = await runLeakDetection();
  const hasLeaks = leakResults.some((r) => r.leaked);

  const report: TenantHealthReport = {
    tenantCount: tenantCount ?? 0,
    activeTenants: activeTenants ?? 0,
    suspendedTenants: suspendedTenants ?? 0,
    usersWithoutTenant: usersWithoutTenant ?? 0,
    leakResults,
    healthy: !hasLeaks && (usersWithoutTenant ?? 0) === 0,
    timestamp: new Date().toISOString(),
  };

  if (!report.healthy) {
    log.warn("Tenant health issues detected", { ...report });
  } else {
    log.info("Tenant health: OK");
  }

  return report;
}
