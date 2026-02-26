/**
 * Sponsor Retention Analytics — tracks repeat sponsor behavior.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sponsorRetention");

export interface SponsorMetrics {
  sponsorId: string;
  totalDeals: number;
  isRepeat: boolean;
  lastActiveAt: string | null;
}

export interface RetentionSummary {
  totalSponsors: number;
  repeatSponsors: number;
  repeatRate: number;
  avgDealsPerSponsor: number;
}

export async function calculateSponsorRetention(tenantId?: string): Promise<RetentionSummary> {
  let query = supabase
    .from("deal_rooms")
    .select("buyer_id, created_at")
    .not("buyer_id", "is", null);

  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data: deals } = await query.limit(1000);

  if (!deals || deals.length === 0) {
    return { totalSponsors: 0, repeatSponsors: 0, repeatRate: 0, avgDealsPerSponsor: 0 };
  }

  const sponsorMap = new Map<string, number>();
  for (const d of deals) {
    sponsorMap.set(d.buyer_id, (sponsorMap.get(d.buyer_id) ?? 0) + 1);
  }

  const totalSponsors = sponsorMap.size;
  const repeatSponsors = [...sponsorMap.values()].filter((c) => c > 1).length;
  const totalDeals = [...sponsorMap.values()].reduce((a, b) => a + b, 0);

  const summary: RetentionSummary = {
    totalSponsors,
    repeatSponsors,
    repeatRate: totalSponsors > 0 ? Math.round((repeatSponsors / totalSponsors) * 100) : 0,
    avgDealsPerSponsor: totalSponsors > 0 ? Math.round((totalDeals / totalSponsors) * 10) / 10 : 0,
  };

  log.info("Sponsor retention calculated", { ...summary });
  return summary;
}

export async function getSponsorMetrics(sponsorId: string, tenantId?: string): Promise<SponsorMetrics> {
  let query = supabase
    .from("deal_rooms")
    .select("id, created_at")
    .eq("buyer_id", sponsorId);

  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data } = await query.order("created_at", { ascending: false });

  return {
    sponsorId,
    totalDeals: data?.length ?? 0,
    isRepeat: (data?.length ?? 0) > 1,
    lastActiveAt: data?.[0]?.created_at ?? null,
  };
}
