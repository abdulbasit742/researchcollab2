import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useCreditProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credit-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("professional_credit_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCapitalAdvances() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const advancesQuery = useQuery({
    queryKey: ["capital-advances", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("capital_advances")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const requestAdvance = useMutation({
    mutationFn: async (params: { deal_id?: string; milestone_id?: string; amount: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("capital_advances")
        .insert({
          user_id: user.id,
          deal_id: params.deal_id,
          milestone_id: params.milestone_id,
          requested_amount: params.amount,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital-advances"] });
      toast({ title: "Advance Requested", description: "Your capital advance request has been submitted for review." });
    },
    onError: (err: any) => {
      toast({ title: "Request Failed", description: err.message, variant: "destructive" });
    },
  });

  return {
    advances: advancesQuery.data || [],
    isLoading: advancesQuery.isLoading,
    requestAdvance: requestAdvance.mutate,
    isRequesting: requestAdvance.isPending,
  };
}

export function useFundingPools() {
  return useQuery({
    queryKey: ["funding-pools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funding_pools")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRiskExposure() {
  return useQuery({
    queryKey: ["risk-exposure"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_exposure_log")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useYieldTracking(poolId?: string) {
  return useQuery({
    queryKey: ["yield-tracking", poolId],
    queryFn: async () => {
      let query = supabase
        .from("yield_tracking")
        .select("*")
        .order("period_start", { ascending: false })
        .limit(50);
      if (poolId) query = query.eq("pool_id", poolId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
