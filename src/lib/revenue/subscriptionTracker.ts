/**
 * Subscription Revenue Tracker — MRR, churn, and upgrade tracking.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("subscriptionTracker");

export interface SubscriptionMetrics {
  activeCount: number;
  mrr: number;
  churnRate: number;
}

export async function calculateSubscriptionMetrics(tenantId?: string): Promise<SubscriptionMetrics> {
  let query = supabase
    .from("user_subscriptions" as any)
    .select("id, status, plan_price, cancelled_at")
    .limit(1000);

  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data } = await query;

  if (!data || data.length === 0) {
    return { activeCount: 0, mrr: 0, churnRate: 0 };
  }

  const active = data.filter((s: any) => s.status === "active");
  const cancelled = data.filter((s: any) => s.status === "cancelled");
  const mrr = active.reduce((sum: number, s: any) => sum + (s.plan_price ?? 0), 0);
  const churnRate = data.length > 0 ? Math.round((cancelled.length / data.length) * 100) : 0;

  const metrics: SubscriptionMetrics = {
    activeCount: active.length,
    mrr,
    churnRate,
  };

  log.info("Subscription metrics calculated", { ...metrics });
  return metrics;
}
