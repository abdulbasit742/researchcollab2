/**
 * Suspicious Activity Detection — triggers compliance alerts.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateAMLRiskScore } from "./amlEngine";
import { monitorUserTransactions } from "./transactionMonitor";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("suspiciousActivity");

export interface ComplianceAlert {
  userId: string;
  alertType: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
}

export async function runSuspiciousActivityScan(userId: string, regionId?: string): Promise<ComplianceAlert[]> {
  const alerts: ComplianceAlert[] = [];

  // AML check
  const aml = await calculateAMLRiskScore(userId);
  if (aml.amlScore >= 50) {
    alerts.push({ userId, alertType: "aml_high_risk", reason: `AML score ${aml.amlScore}: ${aml.reasons.join("; ")}`, severity: aml.amlScore >= 75 ? "critical" : "high" });
  }

  // Transaction monitoring
  const suspiciousTxs = await monitorUserTransactions(userId);
  if (suspiciousTxs.length > 3) {
    alerts.push({ userId, alertType: "multiple_suspicious_tx", reason: `${suspiciousTxs.length} suspicious transactions detected`, severity: "high" });
  }

  // Capital source verification gaps
  const { data: unverifiedSources } = await (supabase as any)
    .from("capital_source_profiles")
    .select("id").eq("contributor_id", userId).eq("source_verified", false);
  if ((unverifiedSources?.length ?? 0) > 2) {
    alerts.push({ userId, alertType: "unverified_capital_sources", reason: `${unverifiedSources!.length} unverified capital sources`, severity: "medium" });
  }

  // Persist alerts
  if (alerts.length > 0) {
    await (supabase as any).from("compliance_alerts").insert(
      alerts.map((a) => ({
        user_id: a.userId, alert_type: a.alertType, reason: a.reason, severity: a.severity, region_id: regionId ?? null,
      }))
    );
    log.warn("Compliance alerts generated", { userId, count: alerts.length });
  }

  return alerts;
}
