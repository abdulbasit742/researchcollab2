/**
 * Sponsor Re-Engagement Engine — auto-triggers notifications for inactive sponsors.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("reEngagement");

const INACTIVE_THRESHOLD_DAYS = 30;
const MIN_DEALS_FOR_REENGAGEMENT = 1;
const MIN_TRUST_SCORE = 40;

export interface ReEngagementCandidate {
  userId: string;
  lastDealAt: string;
  totalDeals: number;
  daysSinceLastDeal: number;
}

export async function findReEngagementCandidates(tenantId?: string): Promise<ReEngagementCandidate[]> {
  const cutoff = new Date(Date.now() - INACTIVE_THRESHOLD_DAYS * 86400_000).toISOString();

  let query = supabase
    .from("deal_rooms")
    .select("buyer_id, created_at")
    .not("buyer_id", "is", null)
    .order("created_at", { ascending: false });

  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data: deals } = await query.limit(1000);

  if (!deals) return [];

  const sponsorMap = new Map<string, { count: number; lastAt: string }>();
  for (const d of deals) {
    const existing = sponsorMap.get(d.buyer_id);
    if (!existing || d.created_at > existing.lastAt) {
      sponsorMap.set(d.buyer_id, {
        count: (existing?.count ?? 0) + 1,
        lastAt: d.created_at,
      });
    } else {
      existing.count++;
    }
  }

  const candidates: ReEngagementCandidate[] = [];
  for (const [userId, info] of sponsorMap) {
    if (info.count >= MIN_DEALS_FOR_REENGAGEMENT && info.lastAt < cutoff) {
      candidates.push({
        userId,
        lastDealAt: info.lastAt,
        totalDeals: info.count,
        daysSinceLastDeal: Math.round((Date.now() - new Date(info.lastAt).getTime()) / 86400_000),
      });
    }
  }

  return candidates;
}

export async function triggerReEngagementNotifications(tenantId?: string): Promise<number> {
  const candidates = await findReEngagementCandidates(tenantId);
  if (candidates.length === 0) return 0;

  const notifications = candidates.map((c) => ({
    user_id: c.userId,
    type: "re_engagement",
    title: "We miss you! Post a new project",
    message: `You completed ${c.totalDeals} deal${c.totalDeals > 1 ? "s" : ""} on RCollab. Ready to start another?`,
    data: { link: "/post-problem", source: "re_engagement_engine" },
    ...(tenantId ? { tenant_id: tenantId } : {}),
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) {
    log.warn("Failed to send re-engagement notifications", { error: error.message });
    return 0;
  }

  log.info(`Re-engagement notifications sent: ${candidates.length}`);
  return candidates.length;
}
