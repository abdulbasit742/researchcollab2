import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIndexCalculations(indexName?: string) {
  return useQuery({
    queryKey: ["index-calculations", indexName],
    queryFn: async () => {
      let query = supabase.from("index_calculation_logs").select("*").order("calculated_at", { ascending: false }).limit(100);
      if (indexName) query = query.eq("index_name", indexName);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePredictiveRegions() {
  return useQuery({
    queryKey: ["predictive-regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictive_region_forecasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePredictiveSkills() {
  return useQuery({
    queryKey: ["predictive-skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("predictive_skill_models")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_health_snapshots")
        .select("*")
        .order("snapshot_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAntifragility() {
  return useQuery({
    queryKey: ["antifragility"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("antifragility_metrics")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useOptimizationProposals() {
  return useQuery({
    queryKey: ["optimization-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("optimization_proposals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}
