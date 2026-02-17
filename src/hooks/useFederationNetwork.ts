import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Layer 16: Interoperable Multi-Civilization Economic Network

export function useFederationRegistry() {
  return useQuery({
    queryKey: ["federation-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("federation_registry")
        .select("*")
        .eq("handshake_status", "active")
        .order("established_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTrustTranslationMatrix() {
  return useQuery({
    queryKey: ["trust-translation-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_translation_matrix")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCrossNodeCapitalFlows() {
  return useQuery({
    queryKey: ["cross-node-capital-flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cross_node_capital_flows")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useNodeReputationScores() {
  return useQuery({
    queryKey: ["node-reputation-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("node_reputation_scores")
        .select("*")
        .order("overall_score", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMultiNodeIndexData() {
  return useQuery({
    queryKey: ["multi-node-index-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("multi_node_index_data")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useFederationArbitration() {
  return useQuery({
    queryKey: ["federation-arbitration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("federation_arbitration_registry")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}
