import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export type SortField = "trust_score" | "successful_rate" | "total_earnings";

export interface LeaderboardFilters {
  sortBy: SortField;
  skill: string;
  institution: string;
  region: string;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  university: string | null;
  location: string | null;
  trust_score: number;
  trust_tier: string;
  total_projects_completed: number;
  successful_rate: number;
  total_earnings: number;
  escrow_success_rate: number;
  projects_completed: number;
  rank: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  avgTrustScore: number;
  totalEarnings: number;
}

const defaultFilters: LeaderboardFilters = {
  sortBy: "trust_score",
  skill: "",
  institution: "",
  region: "",
};

export function useLeaderboardData() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LeaderboardFilters>(defaultFilters);

  const resetFilters = () => setFilters(defaultFilters);

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", filters],
    queryFn: async () => {
      // If skill filter is set, first get matching user IDs
      let skillUserIds: string[] | null = null;
      if (filters.skill.trim()) {
        const { data: skillData } = await supabase
          .from("user_skills")
          .select("user_id")
          .ilike("skill_name", `%${filters.skill.trim()}%`);
        skillUserIds = skillData?.map((s) => s.user_id) ?? [];
        if (skillUserIds.length === 0) {
          return { entries: [], stats: { totalUsers: 0, avgTrustScore: 0, totalEarnings: 0 }, userRank: null };
        }
      }

      // Build main query
      let query = supabase
        .from("user_trust_profiles")
        .select(`
          user_id,
          trust_score,
          trust_tier,
          total_projects_completed,
          successful_rate,
          profiles!inner(id, full_name, university, location),
          profile_proof_metrics(total_earnings, escrow_success_rate, projects_completed)
        `)
        .eq("is_frozen", false);

      if (skillUserIds) {
        query = query.in("user_id", skillUserIds);
      }

      if (filters.institution.trim()) {
        query = query.ilike("profiles.university", `%${filters.institution.trim()}%`);
      }

      if (filters.region.trim()) {
        query = query.ilike("profiles.location", `%${filters.region.trim()}%`);
      }

      // Sort
      if (filters.sortBy === "trust_score") {
        query = query.order("trust_score", { ascending: false });
      } else if (filters.sortBy === "successful_rate") {
        query = query.order("successful_rate", { ascending: false, nullsFirst: false });
      } else {
        // For earnings, we sort client-side since it's from a joined table
        query = query.order("trust_score", { ascending: false });
      }

      query = query.limit(100);

      const { data: rawData, error: queryError } = await query;
      if (queryError) throw queryError;

      // Map to flat entries
      let entries: LeaderboardEntry[] = (rawData ?? []).map((row: any, i: number) => {
        const profile = row.profiles;
        const metrics = Array.isArray(row.profile_proof_metrics)
          ? row.profile_proof_metrics[0]
          : row.profile_proof_metrics;

        return {
          id: profile?.id ?? row.user_id,
          full_name: profile?.full_name ?? null,
          university: profile?.university ?? null,
          location: profile?.location ?? null,
          trust_score: row.trust_score ?? 0,
          trust_tier: row.trust_tier ?? "bronze",
          total_projects_completed: row.total_projects_completed ?? 0,
          successful_rate: row.successful_rate ?? 0,
          total_earnings: metrics?.total_earnings ?? 0,
          escrow_success_rate: metrics?.escrow_success_rate ?? 0,
          projects_completed: metrics?.projects_completed ?? 0,
          rank: i + 1,
        };
      });

      // Client-side sort for earnings
      if (filters.sortBy === "total_earnings") {
        entries.sort((a, b) => b.total_earnings - a.total_earnings);
        entries = entries.map((e, i) => ({ ...e, rank: i + 1 }));
      }

      // Stats
      const stats: LeaderboardStats = {
        totalUsers: entries.length,
        avgTrustScore: entries.length > 0
          ? Math.round(entries.reduce((s, e) => s + e.trust_score, 0) / entries.length)
          : 0,
        totalEarnings: entries.reduce((s, e) => s + e.total_earnings, 0),
      };

      // Current user rank
      const userRank = user ? entries.find((e) => e.id === user.id) ?? null : null;

      return { entries, stats, userRank };
    },
  });

  return {
    entries: data?.entries ?? [],
    stats: data?.stats ?? { totalUsers: 0, avgTrustScore: 0, totalEarnings: 0 },
    userRank: data?.userRank ?? null,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
  };
}
