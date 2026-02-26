/**
 * Final Launch Report — combines all audit results into a single go/no-go decision.
 */

import { createLogger } from "@/lib/core/logger";
import { runPreLaunchValidation, type PreLaunchReport } from "./preLaunchValidator";
import { runFinancialIntegrityAudit, type FinancialAuditReport } from "./financialAudit";
import { runTenantIsolationAudit, type TenantAuditReport } from "./tenantIsolationAudit";
import { runStripeSanityCheck, type StripeSanityReport } from "./stripeSanityCheck";
import { runSecurityAudit, type SecurityAuditReport } from "./securityAudit";
import { runStressCheck, type StressReport } from "./stressCheck";
import { generateGoLiveChecklist, type GoLiveChecklist } from "./goLiveChecklist";
import { unlockLaunch, lockLaunch } from "./launchLock";

const log = createLogger("launchReport");

export interface FinalLaunchReport {
  overallStatus: "GO" | "NO_GO";
  blockingIssues: string[];
  warnings: string[];
  preLaunch: PreLaunchReport;
  financial: FinancialAuditReport;
  tenant: TenantAuditReport;
  stripe: StripeSanityReport;
  security: SecurityAuditReport;
  stress: StressReport;
  checklist: GoLiveChecklist;
  timestamp: string;
}

/**
 * Run the complete launch validation suite and generate a final report.
 */
export async function generateFinalLaunchReport(): Promise<FinalLaunchReport> {
  log.info("=== GENERATING FINAL LAUNCH REPORT ===");

  const [preLaunch, financial, tenant, stripe, security, stress] = await Promise.all([
    runPreLaunchValidation(),
    runFinancialIntegrityAudit(),
    runTenantIsolationAudit(),
    runStripeSanityCheck(),
    runSecurityAudit(),
    runStressCheck(),
  ]);

  const checklist = generateGoLiveChecklist({
    preLaunchPassed: preLaunch.passed,
    financialPassed: financial.passed,
    tenantPassed: tenant.passed,
    stripePassed: stripe.passed,
    securityPassed: security.passed,
    stressPassed: stress.passed,
  });

  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  if (!preLaunch.passed) blockingIssues.push(`Pre-launch: ${preLaunch.blockers} blockers`);
  if (!financial.passed) blockingIssues.push(`Financial: ${financial.criticalCount} critical findings`);
  if (!tenant.passed) blockingIssues.push(`Tenant: ${tenant.totalViolations} violations`);
  if (!security.passed) blockingIssues.push(`Security: ${security.blockers} blockers`);

  if (!stripe.passed) warnings.push("Stripe not in live mode");
  if (!stress.passed) warnings.push("Stress test had failures");
  if (preLaunch.warnings > 0) warnings.push(`${preLaunch.warnings} pre-launch warnings`);

  const overallStatus = blockingIssues.length === 0 ? "GO" : "NO_GO";

  if (overallStatus === "GO") {
    unlockLaunch();
    log.info("🟢 LAUNCH STATUS: GO");
  } else {
    lockLaunch();
    log.warn("🔴 LAUNCH STATUS: NO_GO", { blockingIssues });
  }

  const report: FinalLaunchReport = {
    overallStatus,
    blockingIssues,
    warnings,
    preLaunch,
    financial,
    tenant,
    stripe,
    security,
    stress,
    checklist,
    timestamp: new Date().toISOString(),
  };

  // Persist report
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await (supabase as any).from("launch_reports").insert({
      summary: overallStatus,
      status: overallStatus === "GO" ? "approved" : "blocked",
      metadata: {
        blockingIssues,
        warnings,
        preLaunchPassed: preLaunch.passed,
        financialPassed: financial.passed,
        tenantPassed: tenant.passed,
        stripePassed: stripe.passed,
        securityPassed: security.passed,
        stressPassed: stress.passed,
      },
    });
  } catch {
    log.warn("Could not persist launch report");
  }

  return report;
}
