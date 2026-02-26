/**
 * Pool Health Monitor — detects risk conditions in capital pools.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("poolHealth");

export interface PoolHealthIssue {
  poolId: string;
  issue: string;
  severity: "warning" | "critical";
  detail: string;
}

export async function checkPoolHealth(poolId: string): Promise<PoolHealthIssue[]> {
  const issues: PoolHealthIssue[] = [];

  // Get pool wallet
  const { data: wallet } = await (supabase as any)
    .from("pool_wallets")
    .select("balance, locked_balance")
    .eq("pool_id", poolId)
    .maybeSingle();

  if (!wallet) return [{ poolId, issue: "no_wallet", severity: "critical", detail: "Pool has no wallet" }];

  const totalCapital = wallet.balance + wallet.locked_balance;

  // Check: idle capital > 80%
  if (totalCapital > 0 && wallet.balance / totalCapital > 0.8) {
    issues.push({ poolId, issue: "idle_capital", severity: "warning", detail: `${Math.round((wallet.balance / totalCapital) * 100)}% capital is idle` });
  }

  // Get allocations
  const { data: allocations } = await (supabase as any)
    .from("pool_allocations")
    .select("deal_id, amount, status")
    .eq("pool_id", poolId);

  const allocs = allocations ?? [];
  const activeAllocs = allocs.filter((a: any) => a.status === "allocated");

  // Check: over-concentration in single deal
  if (activeAllocs.length > 0 && totalCapital > 0) {
    for (const alloc of activeAllocs) {
      if ((alloc.amount ?? 0) / totalCapital > 0.5) {
        issues.push({
          poolId,
          issue: "over_concentration",
          severity: "critical",
          detail: `Single deal ${alloc.deal_id} holds ${Math.round(((alloc.amount ?? 0) / totalCapital) * 100)}% of pool`,
        });
      }
    }
  }

  // Check: high refund rate
  const refunded = allocs.filter((a: any) => a.status === "refunded").length;
  if (allocs.length > 5 && refunded / allocs.length > 0.3) {
    issues.push({
      poolId,
      issue: "high_refund_rate",
      severity: "warning",
      detail: `${Math.round((refunded / allocs.length) * 100)}% refund rate`,
    });
  }

  // Check: dispute exposure via deals
  const dealIds = activeAllocs.map((a: any) => a.deal_id).filter(Boolean);
  if (dealIds.length > 0) {
    const { data: deals } = await supabase
      .from("deal_rooms")
      .select("id, status")
      .in("id", dealIds.slice(0, 50));

    const disputedCount = (deals ?? []).filter((d) => d.status === "disputed").length;
    if (disputedCount > 0) {
      issues.push({
        poolId,
        issue: "dispute_exposure",
        severity: disputedCount > 2 ? "critical" : "warning",
        detail: `${disputedCount} active allocations in disputed deals`,
      });
    }
  }

  if (issues.length > 0) {
    log.warn("Pool health issues detected", { poolId, issueCount: issues.length });
  }

  return issues;
}

export async function runAllPoolHealthChecks(): Promise<PoolHealthIssue[]> {
  const { data: pools } = await (supabase as any)
    .from("capital_pools")
    .select("id")
    .limit(100);

  const allIssues: PoolHealthIssue[] = [];
  for (const pool of pools ?? []) {
    const issues = await checkPoolHealth(pool.id);
    allIssues.push(...issues);
  }

  log.info("All pool health checks completed", { totalIssues: allIssues.length });
  return allIssues;
}
