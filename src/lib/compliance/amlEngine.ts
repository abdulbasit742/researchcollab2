/**
 * AML Risk Engine — detects suspicious financial patterns.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("amlEngine");

export interface AMLAssessment {
  userId: string;
  amlScore: number;
  flagged: boolean;
  reasons: string[];
}

export async function calculateAMLRiskScore(userId: string): Promise<AMLAssessment> {
  let score = 0;
  const reasons: string[] = [];

  // 1. Check large deposits (> threshold in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();

  const { data: walletTx } = await (supabase as any)
    .from("wallet_transactions")
    .select("amount, type, created_at")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo);

  const txs = walletTx ?? [];
  const deposits = txs.filter((t: any) => t.type === "deposit" || t.type === "credit");
  const withdrawals = txs.filter((t: any) => t.type === "withdrawal" || t.type === "debit");

  // Large single deposit
  const largeDeposits = deposits.filter((t: any) => (t.amount ?? 0) > 50000);
  if (largeDeposits.length > 0) {
    score += 20;
    reasons.push(`${largeDeposits.length} large deposit(s) > 50,000 in 30 days`);
  }

  // Rapid withdrawal pattern (>5 withdrawals in 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const recentWithdrawals = withdrawals.filter((t: any) => t.created_at >= sevenDaysAgo);
  if (recentWithdrawals.length > 5) {
    score += 25;
    reasons.push(`${recentWithdrawals.length} withdrawals in 7 days`);
  }

  // 2. High dispute rate
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("status")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  const allDeals = deals ?? [];
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  if (allDeals.length > 3 && disputed / allDeals.length > 0.3) {
    score += 20;
    reasons.push(`High dispute rate: ${Math.round((disputed / allDeals.length) * 100)}%`);
  }

  // 3. Repeated refund patterns
  const refunds = txs.filter((t: any) => t.type === "refund");
  if (refunds.length > 5) {
    score += 15;
    reasons.push(`${refunds.length} refunds in 30 days`);
  }

  // 4. Rapid transaction velocity (>20 transactions in 24 hours)
  const oneDayAgo = new Date(Date.now() - 86400_000).toISOString();
  const last24h = txs.filter((t: any) => t.created_at >= oneDayAgo);
  if (last24h.length > 20) {
    score += 20;
    reasons.push(`${last24h.length} transactions in 24 hours`);
  }

  score = Math.min(100, score);
  const flagged = score >= 50;

  // Upsert risk profile
  const { data: existing } = await (supabase as any)
    .from("compliance_risk_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await (supabase as any).from("compliance_risk_profiles").update({
      aml_score: score, flagged, flag_reason: reasons.join("; ") || null, last_assessed_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    await (supabase as any).from("compliance_risk_profiles").insert({
      user_id: userId, aml_score: score, flagged, flag_reason: reasons.join("; ") || null,
    });
  }

  if (flagged) log.warn("AML risk flagged", { userId, score, reasons });
  else log.info("AML assessment complete", { userId, score });

  return { userId, amlScore: score, flagged, reasons };
}
