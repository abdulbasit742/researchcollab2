/**
 * Sponsor Retention Curve — deal-to-deal conversion and LTV analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sponsorRetentionCurve");

export interface SponsorRetentionCurveData {
  firstToSecondConversionRate: number;
  avgTimeBetweenDealsHours: number;
  repeatDealFrequencyPerMonth: number;
  avgSponsorLTV: number;
  totalSponsors: number;
  repeatSponsors: number;
}

export async function generateSponsorRetentionCurve(): Promise<SponsorRetentionCurveData> {
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("buyer_id, escrow_amount, created_at")
    .not("buyer_id", "is", null)
    .in("escrow_status", ["funded", "released"])
    .order("created_at", { ascending: true })
    .limit(2000);

  if (!deals || deals.length === 0) {
    return { firstToSecondConversionRate: 0, avgTimeBetweenDealsHours: 0, repeatDealFrequencyPerMonth: 0, avgSponsorLTV: 0, totalSponsors: 0, repeatSponsors: 0 };
  }

  const sponsorDeals = new Map<string, { dates: string[]; amounts: number[] }>();
  for (const d of deals) {
    const entry = sponsorDeals.get(d.buyer_id) ?? { dates: [], amounts: [] };
    entry.dates.push(d.created_at);
    entry.amounts.push(d.escrow_amount ?? 0);
    sponsorDeals.set(d.buyer_id, entry);
  }

  const totalSponsors = sponsorDeals.size;
  const repeatSponsors = [...sponsorDeals.values()].filter((v) => v.dates.length > 1).length;
  const firstToSecondConversionRate = totalSponsors > 0 ? Math.round((repeatSponsors / totalSponsors) * 100) : 0;

  // Average time between deals
  const gaps: number[] = [];
  for (const [, data] of sponsorDeals) {
    if (data.dates.length > 1) {
      for (let i = 1; i < data.dates.length; i++) {
        gaps.push((new Date(data.dates[i]).getTime() - new Date(data.dates[i - 1]).getTime()) / 3600_000);
      }
    }
  }
  const avgTimeBetweenDealsHours = gaps.length > 0
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : 0;

  const repeatDealFrequencyPerMonth = avgTimeBetweenDealsHours > 0
    ? Math.round((720 / avgTimeBetweenDealsHours) * 10) / 10
    : 0;

  // LTV = total GMV per sponsor average
  const ltvs = [...sponsorDeals.values()].map((v) => v.amounts.reduce((a, b) => a + b, 0));
  const avgSponsorLTV = ltvs.length > 0 ? Math.round(ltvs.reduce((a, b) => a + b, 0) / ltvs.length) : 0;

  log.info("Sponsor retention curve generated", { totalSponsors, repeatSponsors });
  return { firstToSecondConversionRate, avgTimeBetweenDealsHours, repeatDealFrequencyPerMonth, avgSponsorLTV, totalSponsors, repeatSponsors };
}
