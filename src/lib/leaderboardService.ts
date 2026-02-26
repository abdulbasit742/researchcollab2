import { supabase } from "@/integrations/supabase/client";

/**
 * Leaderboard Service — fetches top users by various metrics.
 * The useLeaderboardData hook handles UI-level queries.
 * This service is for programmatic / edge-function use.
 */

export type LeaderboardSortKey =
  | "trust_score"
  | "successful_rate"
  | "total_earnings"
  | "reputation_score";

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  university: string | null;
  trust_score: number;
  trust_tier: string;
  successful_rate: number;
  total_projects_completed: number;
  total_earnings: number;
  reputation_score: number;
  rank: number;
}

export async function getLeaderboard(
  sortBy: LeaderboardSortKey = "trust_score",
  limit = 50
): Promise<LeaderboardEntry[]> {
  // Fetch trust profiles with joined profile data
  const { data, error } = await supabase
    .from("user_trust_profiles")
    .select(`
      user_id,
      trust_score,
      trust_tier,
      successful_rate,
      total_projects_completed,
      profiles!inner(id, full_name, university),
      profile_proof_metrics(total_earnings)
    `)
    .eq("is_frozen", false)
    .order(
      sortBy === "total_earnings" ? "trust_score" : sortBy,
      { ascending: false }
    )
    .limit(limit);

  if (error) throw error;

  let entries: LeaderboardEntry[] = (data ?? []).map((row: any, i: number) => {
    const metrics = Array.isArray(row.profile_proof_metrics)
      ? row.profile_proof_metrics[0]
      : row.profile_proof_metrics;

    return {
      user_id: row.user_id,
      full_name: row.profiles?.full_name ?? null,
      university: row.profiles?.university ?? null,
      trust_score: row.trust_score ?? 0,
      trust_tier: row.trust_tier ?? "bronze",
      successful_rate: row.successful_rate ?? 0,
      total_projects_completed: row.total_projects_completed ?? 0,
      total_earnings: metrics?.total_earnings ?? 0,
      reputation_score: 0, // would need separate compute
      rank: i + 1,
    };
  });

  // Client-side sort for total_earnings
  if (sortBy === "total_earnings") {
    entries.sort((a, b) => b.total_earnings - a.total_earnings);
    entries = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  }

  return entries;
}

export async function getUserRank(userId: string): Promise<number | null> {
  const entries = await getLeaderboard("trust_score", 500);
  const idx = entries.findIndex(e => e.user_id === userId);
  return idx >= 0 ? idx + 1 : null;
}
