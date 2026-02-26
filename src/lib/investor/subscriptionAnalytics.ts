/**
 * MRR & ARR Calculator — subscription-level investor metrics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("subscriptionAnalytics");

export interface SubscriptionSnapshot {
  currentMRR: number;
  arr: number;
  activeSubscriptions: number;
  churnRate: number;
  netRevenueRetention: number;
  expansionRevenuePercent: number;
  subscriptionGrowthRate: number;
}

export async function generateSubscriptionSnapshot(): Promise<SubscriptionSnapshot> {
  const { data: allSubs } = await (supabase as any)
    .from("user_subscriptions")
    .select("id, status, plan_price, created_at, cancelled_at, plan_name")
    .limit(2000);

  const subs = allSubs ?? [];
  const active = subs.filter((s: any) => s.status === "active");
  const cancelled = subs.filter((s: any) => s.status === "cancelled");

  const currentMRR = active.reduce((s: number, sub: any) => s + (sub.plan_price ?? 0), 0);
  const arr = currentMRR * 12;
  const churnRate = subs.length > 0 ? Math.round((cancelled.length / subs.length) * 100) : 0;

  // Net revenue retention: (current MRR from cohort / starting MRR) * 100
  // Simplified: using churn as proxy
  const netRevenueRetention = Math.max(0, 100 - churnRate + 5); // +5% assumed expansion

  // Expansion revenue: upgrades as % of total
  const upgrades = subs.filter((s: any) => s.plan_name?.includes("business") || s.plan_name?.includes("elite"));
  const expansionRevenuePercent = active.length > 0
    ? Math.round((upgrades.length / active.length) * 100)
    : 0;

  // Growth rate: new subs in last 30 days vs previous 30 days
  const now = Date.now();
  const d30 = new Date(now - 30 * 86400_000).toISOString();
  const d60 = new Date(now - 60 * 86400_000).toISOString();
  const recent = subs.filter((s: any) => s.created_at >= d30).length;
  const previous = subs.filter((s: any) => s.created_at >= d60 && s.created_at < d30).length;
  const subscriptionGrowthRate = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;

  log.info("Subscription snapshot generated", { currentMRR, arr, churnRate });
  return {
    currentMRR,
    arr,
    activeSubscriptions: active.length,
    churnRate,
    netRevenueRetention,
    expansionRevenuePercent,
    subscriptionGrowthRate,
  };
}
