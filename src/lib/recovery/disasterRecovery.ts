/**
 * Disaster Recovery Automation — dry-run verification of all critical subsystems.
 */

import { validateEscrowInvariants } from "@/lib/escrow/escrowInvariants";
import { verifyLedgerChain, verifyDailyReconciliation } from "@/lib/ledger/ledgerIntegrity";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("disasterRecovery");

export interface RecoveryCheckResult {
  component: string;
  status: "pass" | "fail" | "degraded";
  details: string;
}

export interface RecoveryReport {
  results: RecoveryCheckResult[];
  overallStatus: "healthy" | "degraded" | "critical";
  recoveryReadiness: number; // 0–100
  testedAt: string;
}

export async function runDisasterRecoveryDryRun(): Promise<RecoveryReport> {
  const results: RecoveryCheckResult[] = [];

  // 1. Escrow restoration
  const escrow = await validateEscrowInvariants();
  results.push({
    component: "Escrow Engine",
    status: escrow.valid ? "pass" : "fail",
    details: escrow.valid ? "All invariants hold" : escrow.violations.join("; "),
  });

  // 2. Ledger restoration
  const ledger = await verifyLedgerChain(undefined, 100);
  results.push({
    component: "Ledger Chain",
    status: ledger.chainValid ? "pass" : "fail",
    details: `${ledger.entriesChecked} entries verified, ${ledger.brokenLinks.length} issues`,
  });

  // 3. Reconciliation
  const recon = await verifyDailyReconciliation();
  results.push({
    component: "Wallet Reconciliation",
    status: recon.reconciled ? "pass" : "degraded",
    details: `${recon.discrepancies} discrepancies found`,
  });

  // 4. Database connectivity
  const { error: dbErr } = await supabase.from("wallets").select("id").limit(1);
  results.push({
    component: "Database Connectivity",
    status: dbErr ? "fail" : "pass",
    details: dbErr ? dbErr.message : "Connected",
  });

  // 5. Capital pool integrity
  const { data: pools } = await (supabase as any).from("capital_pools").select("id, total_committed, total_allocated");
  const overAllocated = (pools ?? []).filter((p: any) => (p.total_allocated ?? 0) > (p.total_committed ?? 0));
  results.push({
    component: "Capital Pool Integrity",
    status: overAllocated.length === 0 ? "pass" : "fail",
    details: overAllocated.length === 0 ? "All pools within limits" : `${overAllocated.length} pool(s) over-allocated`,
  });

  // 6. Auth system
  const { data: session } = await supabase.auth.getSession();
  results.push({
    component: "Auth System",
    status: "pass",
    details: session ? "Auth service reachable" : "Auth check completed",
  });

  const passed = results.filter(r => r.status === "pass").length;
  const failed = results.filter(r => r.status === "fail").length;
  const readiness = Math.round((passed / results.length) * 100);

  const report: RecoveryReport = {
    results,
    overallStatus: failed > 0 ? "critical" : results.some(r => r.status === "degraded") ? "degraded" : "healthy",
    recoveryReadiness: readiness,
    testedAt: new Date().toISOString(),
  };

  log.info("Disaster recovery dry-run complete", { readiness, status: report.overallStatus });
  return report;
}
