import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SkillMetric {
  id: string;
  skill_name: string;
  total_active_projects: number;
  total_active_bids: number;
  avg_bid_price: number;
  avg_project_budget: number;
  deal_conversion_rate: number;
  trust_weighted_success_rate: number;
  liquidity_score: number;
  updated_at: string;
}

export function useLiquidityIndex(skillName?: string) {
  const { user } = useAuth();

  const metrics = useQuery({
    queryKey: ["liquidity-metrics", skillName],
    queryFn: async () => {
      let query = supabase.from("skill_market_metrics").select("*").order("liquidity_score", { ascending: false });
      if (skillName) query = query.eq("skill_name", skillName);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as SkillMetric[];
    },
  });

  const velocity = useQuery({
    queryKey: ["economic-velocity", skillName],
    queryFn: async () => {
      let query = supabase.from("economic_velocity_index").select("*").order("growth_rate", { ascending: false });
      if (skillName) query = query.eq("skill_name", skillName);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const compute = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("compute-liquidity-index", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data;
    },
  });

  const topSkill = metrics.data?.[0] ?? null;
  const avgLiquidity = metrics.data?.length
    ? Math.round(metrics.data.reduce((s, m) => s + m.liquidity_score, 0) / metrics.data.length * 10) / 10
    : 0;

  return {
    metrics: metrics.data ?? [],
    metricsLoading: metrics.isLoading,
    velocity: velocity.data ?? [],
    velocityLoading: velocity.isLoading,
    topSkill,
    avgLiquidity,
    compute: compute.mutateAsync,
    computing: compute.isPending,
  };
}
