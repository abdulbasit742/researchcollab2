/**
 * React hooks for Economic Trust Graph Architecture.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateReputationIndex,
  detectNetworkGaming,
  detectCollaborationClusters,
  queryEconomicGraph,
  calculateTrustEdgeScore,
  TRUST_GRAPH_TRANSPARENCY,
} from "@/lib/professional/economicTrustGraph";
import { supabase } from "@/integrations/supabase/client";

export function useReputationIndex(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["reputation-index", targetId],
    queryFn: () => calculateReputationIndex(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrustEdges(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["trust-edges", targetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("trust_edges")
        .select("*")
        .or(`source_id.eq.${targetId},target_id.eq.${targetId}`)
        .order("trust_edge_score", { ascending: false });
      return data ?? [];
    },
    enabled: !!targetId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useNetworkGamingDetection(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["network-gaming", targetId],
    queryFn: () => detectNetworkGaming(targetId!),
    enabled: !!targetId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCollaborationClusters(domainCategory?: string) {
  return useQuery({
    queryKey: ["collaboration-clusters", domainCategory],
    queryFn: () => detectCollaborationClusters(domainCategory),
    staleTime: 10 * 60 * 1000,
  });
}

export function useEconomicGraphQuery(queryType: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: ["economic-graph-query", queryType, params],
    queryFn: () => queryEconomicGraph(queryType, params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfessionalStability(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["professional-stability", targetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("professional_stability")
        .select("*")
        .eq("user_id", targetId!)
        .order("snapshot_at", { ascending: false })
        .limit(12);
      return data ?? [];
    },
    enabled: !!targetId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTrustGraphTransparency() {
  return TRUST_GRAPH_TRANSPARENCY;
}

export { calculateTrustEdgeScore };
