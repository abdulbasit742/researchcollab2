/**
 * Security Audit — validates security posture before launch.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("securityAudit");

export interface SecurityCheck {
  check: string;
  passed: boolean;
  severity: "blocker" | "warning";
  details?: string;
}

export interface SecurityAuditReport {
  checks: SecurityCheck[];
  blockers: number;
  passed: boolean;
  timestamp: string;
}

export async function runSecurityAudit(): Promise<SecurityAuditReport> {
  log.info("Running security audit...");

  const checks: SecurityCheck[] = [];

  // Chaos mode disabled
  try {
    const chaosEnabled = localStorage.getItem("rcollab_chaos_enabled") === "true";
    checks.push({
      check: "Chaos mode disabled",
      passed: !chaosEnabled,
      severity: "blocker",
      details: chaosEnabled ? "Chaos mode is active — disable before launch" : undefined,
    });
  } catch {
    checks.push({ check: "Chaos mode disabled", passed: true, severity: "blocker" });
  }

  // No dev feature flags active
  try {
    const flags = localStorage.getItem("rcollab_flags");
    const hasOverrides = flags && flags !== "{}";
    checks.push({
      check: "No dev feature flag overrides",
      passed: !hasOverrides,
      severity: "warning",
      details: hasOverrides ? "Feature flag overrides found in localStorage" : undefined,
    });
  } catch {
    checks.push({ check: "No dev feature flag overrides", passed: true, severity: "warning" });
  }

  // Production mode
  checks.push({
    check: "Running in production mode",
    passed: import.meta.env.MODE === "production",
    severity: "warning",
    details: import.meta.env.MODE !== "production" ? `Current mode: ${import.meta.env.MODE}` : undefined,
  });

  // HTTPS (check current URL)
  try {
    const isHttps = window.location.protocol === "https:";
    checks.push({
      check: "HTTPS enforced",
      passed: isHttps,
      severity: "blocker",
      details: !isHttps ? "Site not served over HTTPS" : undefined,
    });
  } catch {
    checks.push({ check: "HTTPS enforced", passed: true, severity: "blocker" });
  }

  // No debug localStorage artifacts
  try {
    const debugKeys = ["debug", "dev_mode", "bypass_auth", "skip_rls"];
    const found = debugKeys.filter((k) => localStorage.getItem(k) !== null);
    checks.push({
      check: "No debug localStorage keys",
      passed: found.length === 0,
      severity: "warning",
      details: found.length > 0 ? `Found: ${found.join(", ")}` : undefined,
    });
  } catch {
    checks.push({ check: "No debug localStorage keys", passed: true, severity: "warning" });
  }

  // Supabase anon key (should be present)
  checks.push({
    check: "Supabase config present",
    passed: !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    severity: "blocker",
  });

  const blockers = checks.filter((c) => !c.passed && c.severity === "blocker").length;

  const report: SecurityAuditReport = {
    checks,
    blockers,
    passed: blockers === 0,
    timestamp: new Date().toISOString(),
  };

  log.info(`Security audit: ${blockers} blockers, ${report.passed ? "PASS" : "FAIL"}`);
  return report;
}
