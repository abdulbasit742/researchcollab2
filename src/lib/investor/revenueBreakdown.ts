/**
 * Revenue Breakdown Engine — platform fee and subscription revenue analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("revenueBreakdown");

export interface RevenueBreakdown {
  totalPlatformFeeRevenue: number;
  totalSubscriptionRevenue: number;
  revenueByTenant: { tenantId: string; revenue: number }[];
  revenueBySponsor: { sponsorId: string; revenue: number }[];
  revenueGrowthByMonth: { month: string; revenue: number; growthRate: number | null }[];
  avgRevenuePerDeal: number;
}

export async function generateRevenueBreakdown(): Promise<RevenueBreakdown> {
  // Platform fee revenue from wallet transactions (type = platform_fee or commission)
  const { data: feeTxns } = await supabase
    .from("wallet_transactions")
    .select("amount, tenant_id, created_at, wallet_id")
    .in("type", ["platform_fee", "commission", "fee"])
    .neq("status", "failed");

  const fees = feeTxns ?? [];
  const totalPlatformFeeRevenue = fees.reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);

  // Subscription revenue from user_subscriptions
  const { data: subs } = await (supabase as any)
    .from("user_subscriptions")
    .select("plan_price, status, tenant_id")
    .eq("status", "active");

  const activeSubs = subs ?? [];
  const totalSubscriptionRevenue = activeSubs.reduce((s: number, sub: any) => s + (sub.plan_price ?? 0), 0);

  // Revenue by tenant
  const tenantRevMap = new Map<string, number>();
  for (const t of fees) {
    const tid = t.tenant_id ?? "global";
    tenantRevMap.set(tid, (tenantRevMap.get(tid) ?? 0) + Math.abs(t.amount ?? 0));
  }
  const revenueByTenant = [...tenantRevMap.entries()].map(([tenantId, revenue]) => ({ tenantId, revenue }));

  // Revenue by sponsor (from deal escrow amounts as proxy)
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("buyer_id, escrow_amount")
    .in("escrow_status", ["funded", "released"]);

  const sponsorRevMap = new Map<string, number>();
  for (const d of deals ?? []) {
    if (d.buyer_id) {
      sponsorRevMap.set(d.buyer_id, (sponsorRevMap.get(d.buyer_id) ?? 0) + (d.escrow_amount ?? 0));
    }
  }
  const revenueBySponsor = [...sponsorRevMap.entries()]
    .map(([sponsorId, revenue]) => ({ sponsorId, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 50);

  // Monthly growth
  const monthMap = new Map<string, number>();
  for (const t of fees) {
    const month = (t.created_at ?? "").substring(0, 7);
    if (month) monthMap.set(month, (monthMap.get(month) ?? 0) + Math.abs(t.amount ?? 0));
  }
  const sorted = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const revenueGrowthByMonth = sorted.map(([month, revenue], i) => ({
    month,
    revenue,
    growthRate: i > 0 && sorted[i - 1][1] > 0
      ? Math.round(((revenue - sorted[i - 1][1]) / sorted[i - 1][1]) * 100)
      : null,
  }));

  const avgRevenuePerDeal = (deals?.length ?? 0) > 0
    ? Math.round(totalPlatformFeeRevenue / (deals?.length ?? 1))
    : 0;

  log.info("Revenue breakdown generated", { totalPlatformFeeRevenue, totalSubscriptionRevenue });
  return {
    totalPlatformFeeRevenue,
    totalSubscriptionRevenue,
    revenueByTenant,
    revenueBySponsor,
    revenueGrowthByMonth,
    avgRevenuePerDeal,
  };
}
