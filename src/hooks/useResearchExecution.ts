import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExecutionTracks(researchId?: string) {
  return useQuery({
    queryKey: ["research-execution-tracks", researchId],
    queryFn: async () => {
      let query = supabase
        .from("research_execution_tracks")
        .select("*")
        .order("created_at", { ascending: false });
      if (researchId) query = query.eq("research_id", researchId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useResearchMilestones(trackId?: string) {
  return useQuery({
    queryKey: ["research-milestones", trackId],
    queryFn: async () => {
      let query = supabase
        .from("research_milestones")
        .select("*")
        .order("milestone_order", { ascending: true });
      if (trackId) query = query.eq("track_id", trackId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!trackId,
  });
}

export function useResearchFunding(trackId?: string) {
  return useQuery({
    queryKey: ["research-funding-rounds", trackId],
    queryFn: async () => {
      let query = supabase
        .from("research_funding_rounds")
        .select("*")
        .order("created_at", { ascending: false });
      if (trackId) query = query.eq("track_id", trackId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCommercializationLedger(trackId?: string) {
  return useQuery({
    queryKey: ["research-commercialization", trackId],
    queryFn: async () => {
      let query = supabase
        .from("research_commercialization_ledger")
        .select("*")
        .order("created_at", { ascending: false });
      if (trackId) query = query.eq("track_id", trackId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useImplementationMetrics(researchId?: string) {
  return useQuery({
    queryKey: ["implementation-metrics", researchId],
    queryFn: async () => {
      let query = supabase
        .from("research_implementation_metrics")
        .select("*")
        .order("implementation_impact_score", { ascending: false });
      if (researchId) query = query.eq("research_id", researchId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInstitutionResearchProductivity(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-research-productivity", institutionId],
    queryFn: async () => {
      let query = supabase
        .from("institution_research_productivity")
        .select("*")
        .order("computed_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useResearchAdoption(researchId?: string) {
  return useQuery({
    queryKey: ["research-adoption", researchId],
    queryFn: async () => {
      let query = supabase
        .from("research_adoption_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (researchId) query = query.eq("research_id", researchId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
