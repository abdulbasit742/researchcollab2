import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGovernancePods() {
  const queryClient = useQueryClient();

  const podsQuery = useQuery({
    queryKey: ["agp-pods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agp_pods")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const decisionsQuery = useQuery({
    queryKey: ["agp-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agp_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const constitutionQuery = useQuery({
    queryKey: ["platform-constitution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_constitution")
        .select("*")
        .eq("is_active", true)
        .order("enacted_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const assemblePod = useMutation({
    mutationFn: async (params: { pod_type: string; min_trust_score?: number; pod_size?: number }) => {
      const { data, error } = await supabase.functions.invoke("assemble-governance-pod", { body: params });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agp-pods"] }),
  });

  const renderDecision = useMutation({
    mutationFn: async (params: { pod_id: string; issue_reference_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("governance-decision-engine", { body: params });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agp-decisions"] }),
  });

  return {
    pods: podsQuery.data || [],
    decisions: decisionsQuery.data || [],
    constitution: constitutionQuery.data || [],
    isLoading: podsQuery.isLoading,
    assemblePod,
    renderDecision,
  };
}
