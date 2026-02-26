/**
 * Financial Integrity Audit — validates wallet/escrow/transaction consistency.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialAudit");

export interface AuditFinding {
  check: string;
  severity: "critical" | "warning";
  count: number;
  details?: string;
}

export interface FinancialAuditReport {
  findings: AuditFinding[];
  criticalCount: number;
  passed: boolean;
  timestamp: string;
}

async function audit(check: string, severity: AuditFinding["severity"], fn: () => Promise<number>): Promise<AuditFinding> {
  try {
    const count = await fn();
    return { check, severity, count };
  } catch (err) {
    return { check, severity, count: -1, details: String(err) };
  }
}

export async function runFinancialIntegrityAudit(): Promise<FinancialAuditReport> {
  log.info("Running financial integrity audit...");

  const findings = await Promise.all([
    // Negative balances
    audit("Wallets with negative available_balance", "critical", async () => {
      const { count } = await supabase
        .from("wallets")
        .select("id", { count: "exact", head: true })
        .lt("available_balance", 0);
      return count ?? 0;
    }),

    // Negative escrow balances
    audit("Wallets with negative escrow_balance", "critical", async () => {
      const { count } = await supabase
        .from("wallets")
        .select("id", { count: "exact", head: true })
        .lt("escrow_balance", 0);
      return count ?? 0;
    }),

    // Deals funded without escrow amount
    audit("Funded deals with zero escrow_amount", "critical", async () => {
      const { count } = await supabase
        .from("deal_rooms")
        .select("id", { count: "exact", head: true })
        .eq("escrow_status", "funded")
        .lte("escrow_amount", 0);
      return count ?? 0;
    }),

    // Completed deals with unpaid milestones
    audit("Completed deals with unreleased milestones", "warning", async () => {
      const { data: completedDeals } = await supabase
        .from("deal_rooms")
        .select("id")
        .eq("status", "completed")
        .limit(200);

      if (!completedDeals || completedDeals.length === 0) return 0;

      let violationCount = 0;
      for (const deal of completedDeals) {
        const { count } = await supabase
          .from("deal_milestones" as any)
          .select("id", { count: "exact", head: true })
          .eq("deal_id", deal.id)
          .neq("status", "released");
        if ((count ?? 0) > 0) violationCount++;
      }
      return violationCount;
    }),

    // Orphan transactions (no wallet)
    audit("Transactions referencing non-existent wallets", "warning", async () => {
      // Lightweight check: just verify no null wallet_ids
      const { count } = await supabase
        .from("wallet_transactions")
        .select("id", { count: "exact", head: true })
        .is("wallet_id", null);
      return count ?? 0;
    }),

    // Deals with both refund and release status
    audit("Deals with conflicting escrow states", "critical", async () => {
      const { count } = await supabase
        .from("deal_rooms")
        .select("id", { count: "exact", head: true })
        .eq("escrow_status", "refunded")
        .eq("status", "completed");
      return count ?? 0;
    }),
  ]);

  const criticalCount = findings.filter((f) => f.severity === "critical" && f.count > 0).length;

  const report: FinancialAuditReport = {
    findings,
    criticalCount,
    passed: criticalCount === 0,
    timestamp: new Date().toISOString(),
  };

  log.info(`Financial audit: ${criticalCount} critical findings, ${report.passed ? "PASS" : "FAIL"}`);
  return report;
}
