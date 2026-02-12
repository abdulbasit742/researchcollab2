import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function computeMultiplier(trustScore: number, dealSuccessRate: number, outcomeValue: number): number {
  const trustFactor = Math.min(trustScore / 100, 1) * 0.4;
  const successFactor = Math.min(dealSuccessRate / 100, 1) * 0.35;
  const outcomeFactor = Math.min(outcomeValue / 500000, 1) * 0.25;
  return Math.round((1 + trustFactor + successFactor + outcomeFactor) * 100) / 100;
}

export function useOpportunityMultiplier() {
  const { user } = useAuth();

  const multiplierQuery = useQuery({
    queryKey: ["opportunity-multiplier", user?.id],
    queryFn: async () => {
      if (!user) return 1.0;
      const { data, error } = await supabase
        .from("profiles")
        .select("opportunity_visibility_multiplier")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return (data as any)?.opportunity_visibility_multiplier ?? 1.0;
    },
    enabled: !!user,
    staleTime: 120_000,
  });

  const logQuery = useQuery({
    queryKey: ["opportunity-multiplier-log", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("opportunity_multiplier_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 120_000,
  });

  return {
    multiplier: multiplierQuery.data ?? 1.0,
    log: logQuery.data ?? [],
    isLoading: multiplierQuery.isLoading,
    computeMultiplier,
  };
}
