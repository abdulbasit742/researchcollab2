import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SkillGap {
  skill: string;
  demand: number;
  priority: "high" | "medium" | "low";
  potential_projects: number;
}

export interface RecommendedAction {
  action: string;
  priority: string;
  impact: string;
  link: string;
}

export interface MarketCategory {
  category: string;
  demand: number;
  user_has_skill: boolean;
  competition: string;
}

export interface OpportunityIntelligence {
  opportunity_score: number;
  projected_income: number;
  skill_gap_index: number;
  skill_gaps: SkillGap[];
  trust_growth_potential: number;
  recommended_actions: RecommendedAction[];
  market_heat_map: MarketCategory[];
  snapshot_version: number;
  computed_at: string;
}

export function useOpportunityIntelligence() {
  const { user } = useAuth();

  const compute = useQuery({
    queryKey: ["opportunity-intelligence", user?.id],
    queryFn: async (): Promise<OpportunityIntelligence> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("opportunity-intelligence", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw res.error;
      return res.data as OpportunityIntelligence;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Historical snapshots for trend tracking
  const history = useQuery({
    queryKey: ["opportunity-intelligence-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_insights")
        .select("opportunity_score, projected_income, trust_growth_potential, created_at, snapshot_version")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []) as {
        opportunity_score: number;
        projected_income: number;
        trust_growth_potential: number;
        created_at: string;
        snapshot_version: number;
      }[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Badge: did score increase from previous snapshot?
  const scoreIncreased = (() => {
    const h = history.data;
    if (!h || h.length < 2) return false;
    return h[0].opportunity_score > h[1].opportunity_score;
  })();

  return {
    data: compute.data,
    isLoading: compute.isLoading,
    error: compute.error,
    refetch: compute.refetch,
    history: history.data || [],
    historyLoading: history.isLoading,
    scoreIncreased,
  };
}
