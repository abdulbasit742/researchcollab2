import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useGovernanceInfluence() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["governance-influence", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("governance_influence_registry")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useGovernanceProposals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const proposalsQuery = useQuery({
    queryKey: ["governance-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_proposals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const createProposal = useMutation({
    mutationFn: async (params: { title: string; description: string; proposal_type: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("governance_proposals")
        .insert({ ...params, author_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["governance-proposals"] }),
  });

  return { proposals: proposalsQuery.data || [], isLoading: proposalsQuery.isLoading, createProposal };
}

export function useCrisisEvents() {
  return useQuery({
    queryKey: ["crisis-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crisis_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePowerConcentration() {
  return useQuery({
    queryKey: ["power-concentration-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("power_concentration_metrics_v2")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAmendmentHistory() {
  return useQuery({
    queryKey: ["amendment-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amendment_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}
