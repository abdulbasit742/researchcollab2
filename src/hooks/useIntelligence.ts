import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HealthLevel = "green" | "yellow" | "red";

export interface IntelligenceScore {
  id: string;
  entity_type: string;
  entity_id: string;
  score_type: string;
  health_level: HealthLevel | null;
  scores: Record<string, any>;
  factors: Record<string, any>;
  recommendations: string[];
  computed_at: string;
}

export interface IntelligenceAnomaly {
  id: string;
  anomaly_type: string;
  severity: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  evidence: Record<string, any>;
  resolved: boolean;
  created_at: string;
}

export function useIntelligenceScores(scoreType?: string, entityId?: string) {
  return useQuery({
    queryKey: ["intelligence-scores", scoreType, entityId],
    queryFn: async () => {
      let query = supabase
        .from("intelligence_scores")
        .select("*")
        .order("computed_at", { ascending: false });
      if (scoreType) query = query.eq("score_type", scoreType);
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return (data ?? []) as IntelligenceScore[];
    },
  });
}

export function useIntelligenceAnomalies(resolved = false) {
  return useQuery({
    queryKey: ["intelligence-anomalies", resolved],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_anomalies")
        .select("*")
        .eq("resolved", resolved)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as IntelligenceAnomaly[];
    },
  });
}

export function useComputeIntelligence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scope: string) => {
      const { data, error } = await supabase.functions.invoke("compute-intelligence", {
        body: { scope },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligence-scores"] });
      queryClient.invalidateQueries({ queryKey: ["intelligence-anomalies"] });
    },
  });
}

export function useDealHealthScore(topicId?: string) {
  return useIntelligenceScores("deal_health", topicId);
}

export function useFundingLikelihood(topicId?: string) {
  return useIntelligenceScores("funding_likelihood", topicId);
}

export function useTrustPrediction(userId?: string) {
  return useIntelligenceScores("trust_prediction", userId);
}

export function useSponsorMatches(sponsorId?: string) {
  return useIntelligenceScores("sponsor_match", sponsorId);
}

export function useHiringPropensity(sponsorId?: string) {
  return useIntelligenceScores("hiring_propensity", sponsorId);
}

export function useCapitalVelocity() {
  return useIntelligenceScores("capital_velocity", "00000000-0000-0000-0000-000000000000");
}
