import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OpportunityNode {
  id: string;
  user_id: string;
  opportunity_type: string;
  title: string;
  description: string | null;
  source_entity_type: string | null;
  source_entity_id: string | null;
  relevance_score: number;
  skill_match_score: number;
  trust_match_score: number;
  outcome_match_score: number;
  network_proximity_score: number;
  readiness_score: number;
  composite_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityEdge {
  id: string;
  user_id: string;
  opportunity_id: string;
  edge_type: string;
  weight: number;
  metadata: Record<string, any>;
  created_at: string;
}

function computeComposite(node: OpportunityNode): number {
  return (
    node.skill_match_score * 0.3 +
    node.trust_match_score * 0.25 +
    node.outcome_match_score * 0.2 +
    node.network_proximity_score * 0.15 +
    node.readiness_score * 0.1
  );
}

export function useOpportunityGraph(filters?: { type?: string; status?: string }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["opportunity-graph", user?.id, filters],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("opportunity_graph")
        .select("*")
        .eq("user_id", user.id)
        .order("composite_score", { ascending: false });

      if (filters?.type) query = query.eq("opportunity_type", filters.type);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return (data || []).map((node: any) => ({
        ...node,
        composite_score: computeComposite(node),
      })) as OpportunityNode[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useOpportunityPipeline() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["opportunity-pipeline", user?.id],
    queryFn: async () => {
      if (!user) return { active: 0, applied: 0, matched: 0, total: 0, topMatches: [] };

      const { data, error } = await supabase
        .from("opportunity_graph")
        .select("*")
        .eq("user_id", user.id)
        .order("composite_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      const items = (data || []) as OpportunityNode[];

      return {
        active: items.filter(i => i.status === "active").length,
        applied: items.filter(i => i.status === "applied").length,
        matched: items.filter(i => i.status === "matched").length,
        total: items.length,
        topMatches: items.slice(0, 5),
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useOpportunityScore() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["opportunity-score", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("opportunity_graph")
        .select("skill_match_score, trust_match_score, outcome_match_score, network_proximity_score, readiness_score, composite_score")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(50);

      if (error) throw error;
      const items = data || [];
      if (items.length === 0) {
        return {
          overall: 0,
          skill: 0,
          trust: 0,
          outcomes: 0,
          network: 0,
          readiness: 0,
        };
      }

      const avg = (key: string) =>
        items.reduce((sum: number, i: any) => sum + (i[key] || 0), 0) / items.length;

      return {
        overall: Math.round(avg("composite_score")),
        skill: Math.round(avg("skill_match_score")),
        trust: Math.round(avg("trust_match_score")),
        outcomes: Math.round(avg("outcome_match_score")),
        network: Math.round(avg("network_proximity_score")),
        readiness: Math.round(avg("readiness_score")),
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}
