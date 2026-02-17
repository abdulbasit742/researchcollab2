import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Layer 18: Planetary & Interplanetary Economic Coordination

export function usePlanetaryNodeRegistry() {
  return useQuery({
    queryKey: ["planetary-node-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planetary_node_registry")
        .select("*")
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useColonyViabilityScores() {
  return useQuery({
    queryKey: ["colony-viability-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colony_viability_scores")
        .select("*")
        .order("overall_viability", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useResourceProductivityMetrics() {
  return useQuery({
    queryKey: ["resource-productivity-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_productivity_metrics")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInterplanetaryTreaties() {
  return useQuery({
    queryKey: ["interplanetary-treaties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interplanetary_treaty_registry")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useColonySimulations(nodeId?: string) {
  return useQuery({
    queryKey: ["colony-simulations", nodeId],
    queryFn: async () => {
      let query = supabase.from("colony_simulation_runs").select("*");
      if (nodeId) query = query.eq("planetary_node_id", nodeId);
      const { data, error } = await query.order("run_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}
