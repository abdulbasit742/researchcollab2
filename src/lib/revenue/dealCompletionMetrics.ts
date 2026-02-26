/**
 * Deal Completion Rate Tracker — per-tenant completion and dispute rates.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("dealCompletion");

export interface CompletionMetrics {
  totalDeals: number;
  completedDeals: number;
  disputedDeals: number;
  completionRate: number;
  disputeRate: number;
}

export async function calculateCompletionMetrics(tenantId?: string): Promise<CompletionMetrics> {
  let baseQuery = supabase.from("deal_rooms").select("id, status", { count: "exact" });
  if (tenantId) baseQuery = baseQuery.eq("tenant_id", tenantId);
  const { count: totalDeals } = await baseQuery;

  let completedQuery = supabase.from("deal_rooms").select("id", { count: "exact", head: true }).eq("status", "completed");
  if (tenantId) completedQuery = completedQuery.eq("tenant_id", tenantId);
  const { count: completedDeals } = await completedQuery;

  let disputedQuery = supabase.from("deal_rooms").select("id", { count: "exact", head: true }).eq("status", "disputed");
  if (tenantId) disputedQuery = disputedQuery.eq("tenant_id", tenantId);
  const { count: disputedDeals } = await disputedQuery;

  const total = totalDeals ?? 0;
  const completed = completedDeals ?? 0;
  const disputed = disputedDeals ?? 0;

  const metrics: CompletionMetrics = {
    totalDeals: total,
    completedDeals: completed,
    disputedDeals: disputed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    disputeRate: total > 0 ? Math.round((disputed / total) * 100) : 0,
  };

  log.info("Completion metrics calculated", { ...metrics });
  return metrics;
}
