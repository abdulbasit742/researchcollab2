import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STALE = 10 * 60 * 1000;

export function useCapitalFlowEfficiency(institutionId?: string) {
  return useQuery({
    queryKey: ["capital-flow", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase.from("capital_flow_efficiency_metrics").select("*").eq("institution_id", institutionId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useCapitalBottlenecks(institutionId?: string) {
  return useQuery({
    queryKey: ["capital-bottlenecks", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase.from("capital_bottlenecks").select("*").eq("institution_id", institutionId).order("detected_at", { ascending: false }).limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useFundingAllocationInsights(institutionId?: string) {
  return useQuery({
    queryKey: ["funding-allocation", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase.from("funding_allocation_insights").select("*").eq("institution_id", institutionId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useCapitalHealth(institutionId?: string) {
  return useQuery({
    queryKey: ["capital-health", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase.from("institution_capital_health").select("*").eq("institution_id", institutionId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useCapitalGovernanceFlags(institutionId?: string) {
  return useQuery({
    queryKey: ["capital-flags", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase.from("capital_governance_flags").select("*").eq("institution_id", institutionId).eq("resolved", false).order("created_at", { ascending: false }).limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useCapitalSimulations(institutionId?: string) {
  return useQuery({
    queryKey: ["capital-simulations", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase.from("capital_simulation_results").select("*").eq("institution_id", institutionId).order("generated_at", { ascending: false }).limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}
