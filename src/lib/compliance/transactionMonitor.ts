/**
 * Transaction Monitoring — detects suspicious transaction patterns.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("transactionMonitor");

export interface SuspiciousTransaction {
  transactionId: string;
  userId: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
}

export async function monitorUserTransactions(userId: string): Promise<SuspiciousTransaction[]> {
  const suspicious: SuspiciousTransaction[] = [];
  const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();

  const { data: txs } = await (supabase as any)
    .from("wallet_transactions")
    .select("id, amount, type, created_at")
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo)
    .order("created_at", { ascending: false });

  const transactions = txs ?? [];

  // High-value single transaction
  for (const tx of transactions) {
    if ((tx.amount ?? 0) > 100000) {
      suspicious.push({ transactionId: tx.id, userId, reason: `High-value transaction: ${tx.amount}`, severity: "high" });
    }
  }

  // Velocity: >10 transactions in 1 hour windows
  if (transactions.length > 0) {
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const lastHour = transactions.filter((t: any) => t.created_at >= oneHourAgo);
    if (lastHour.length > 10) {
      suspicious.push({
        transactionId: lastHour[0]?.id ?? "batch",
        userId, reason: `${lastHour.length} transactions in 1 hour`, severity: "critical",
      });
    }
  }

  // Round-trip pattern (deposit immediately followed by withdrawal of same amount)
  for (let i = 0; i < transactions.length - 1; i++) {
    const curr = transactions[i];
    const next = transactions[i + 1];
    if (
      curr.type === "withdrawal" && next.type === "deposit" &&
      Math.abs((curr.amount ?? 0) - (next.amount ?? 0)) < 1
    ) {
      suspicious.push({
        transactionId: curr.id, userId,
        reason: `Round-trip pattern: deposit→withdrawal of ${curr.amount}`, severity: "high",
      });
    }
  }

  // Persist suspicious records
  if (suspicious.length > 0) {
    await (supabase as any).from("suspicious_transactions").insert(
      suspicious.map((s) => ({ transaction_id: s.transactionId, user_id: s.userId, reason: s.reason, severity: s.severity }))
    );

    await (supabase as any).from("compliance_audit_logs").insert(
      suspicious.map((s) => ({
        action: "suspicious_transaction_detected", entity_type: "wallet_transactions",
        entity_id: s.transactionId, user_id: s.userId, compliance_flag: true,
        details: { reason: s.reason, severity: s.severity },
      }))
    );

    log.warn("Suspicious transactions detected", { userId, count: suspicious.length });
  }

  return suspicious;
}
