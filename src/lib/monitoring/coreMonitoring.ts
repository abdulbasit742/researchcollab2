/**
 * Core Monitoring Backbone — proactive anomaly detection and alerting.
 */

import { supabase } from "@/integrations/supabase/client";
import { validateEscrowInvariants } from "@/lib/escrow/escrowInvariants";
import { verifyLedgerChain } from "@/lib/ledger/ledgerIntegrity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("coreMonitoring");

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertAction = "log" | "notify" | "freeze" | "governance_review";

export interface MonitoringAlert {
  id: string;
  category: string;
  severity: AlertSeverity;
  message: string;
  recommendedAction: AlertAction;
  detectedAt: string;
}

export interface MonitoringReport {
  alerts: MonitoringAlert[];
  escrowHealth: boolean;
  ledgerHealth: boolean;
  overallHealth: boolean;
  checkedAt: string;
}

let alertCounter = 0;
function createAlert(category: string, severity: AlertSeverity, message: string, action: AlertAction): MonitoringAlert {
  return { id: `alert_${++alertCounter}_${Date.now()}`, category, severity, message, recommendedAction: action, detectedAt: new Date().toISOString() };
}

export async function runCoreMonitoring(): Promise<MonitoringReport> {
  const alerts: MonitoringAlert[] = [];

  // 1. Escrow invariants
  const escrow = await validateEscrowInvariants();
  if (!escrow.valid) {
    for (const v of escrow.violations) {
      alerts.push(createAlert("escrow", "critical", v, "freeze"));
    }
  }

  // 2. Ledger integrity
  const ledger = await verifyLedgerChain(undefined, 100);
  if (ledger.tamperDetected) {
    alerts.push(createAlert("ledger", "critical", `Ledger tamper detected: ${ledger.brokenLinks.length} broken links`, "freeze"));
  }

  // 3. Liquidity imbalance
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated, id");
  for (const p of pools ?? []) {
    const utilization = p.total_committed > 0 ? (p.total_allocated / p.total_committed) * 100 : 0;
    if (utilization > 90) {
      alerts.push(createAlert("liquidity", "warning", `Pool ${p.id} utilization at ${Math.round(utilization)}%`, "notify"));
    }
  }

  // 4. Trust volatility — check for rapid trust changes
  const { data: trustEvents } = await (supabase as any).from("trust_events")
    .select("user_id, score_change, created_at")
    .gte("created_at", new Date(Date.now() - 3600000).toISOString())
    .order("created_at", { ascending: false }).limit(100);
  const userChanges: Record<string, number> = {};
  for (const e of trustEvents ?? []) {
    userChanges[e.user_id] = (userChanges[e.user_id] ?? 0) + Math.abs(e.score_change ?? 0);
  }
  for (const [userId, totalChange] of Object.entries(userChanges)) {
    if (totalChange > 20) {
      alerts.push(createAlert("trust", "warning", `High trust volatility for user ${userId.slice(0, 8)}...: ${totalChange} points/hr`, "governance_review"));
    }
  }

  // 5. Compliance — check for wallets approaching limits
  const { data: wallets } = await supabase.from("wallets").select("id, available_balance").gt("available_balance", 500000);
  if (wallets && wallets.length > 0) {
    alerts.push(createAlert("compliance", "info", `${wallets.length} wallet(s) with high balance (>500K)`, "notify"));
  }

  const report: MonitoringReport = {
    alerts, escrowHealth: escrow.valid, ledgerHealth: !ledger.tamperDetected,
    overallHealth: escrow.valid && !ledger.tamperDetected && alerts.filter(a => a.severity === "critical").length === 0,
    checkedAt: new Date().toISOString(),
  };

  if (!report.overallHealth) log.warn("Core monitoring detected issues", { criticalAlerts: alerts.filter(a => a.severity === "critical").length });
  else log.info("Core monitoring healthy");

  return report;
}
