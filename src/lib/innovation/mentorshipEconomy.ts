/**
 * Mentorship Economy — Additive service layer.
 * Trust-verified mentorship marketplace with structured engagements.
 */
import { supabase } from "@/integrations/supabase/client";

export async function getMentorshipListings(filters?: { domain?: string; is_active?: boolean }) {
  let q = (supabase as any).from("mentorship_listings").select("*").order("avg_rating", { ascending: false });
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.is_active !== undefined) q = q.eq("is_active", filters.is_active);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createMentorshipListing(input: {
  mentor_id: string; title: string; description?: string; domain?: string;
  expertise_areas?: string[]; session_rate_amount?: number;
  session_duration_minutes?: number; max_mentees?: number;
  trust_score_snapshot?: number;
}) {
  const { data, error } = await (supabase as any).from("mentorship_listings")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function startEngagement(input: {
  listing_id: string; mentor_id: string; mentee_id: string; goals?: string;
}) {
  const { data, error } = await (supabase as any).from("mentorship_engagements")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getMyEngagements(userId: string) {
  const { data, error } = await (supabase as any).from("mentorship_engagements")
    .select("*").or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMentorshipAnalytics() {
  const [{ data: listings }, { data: engagements }] = await Promise.all([
    (supabase as any).from("mentorship_listings").select("*").limit(500),
    (supabase as any).from("mentorship_engagements").select("*").limit(500),
  ]);
  const allListings = listings ?? [];
  const allEngagements = engagements ?? [];

  const domainMap: Record<string, number> = {};
  allListings.forEach((l: any) => {
    if (l.domain) domainMap[l.domain] = (domainMap[l.domain] || 0) + 1;
  });

  return {
    totalMentors: allListings.length,
    activeMentors: allListings.filter((l: any) => l.is_active).length,
    totalEngagements: allEngagements.length,
    activeEngagements: allEngagements.filter((e: any) => e.status === "active").length,
    totalSessions: allEngagements.reduce((s: number, e: any) => s + (e.sessions_completed || 0), 0),
    avgRating: allListings.length > 0 ? Math.round(allListings.reduce((s: number, l: any) => s + (l.avg_rating || 0), 0) / allListings.length * 10) / 10 : 0,
    byDomain: Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count })),
  };
}
