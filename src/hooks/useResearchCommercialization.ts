import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCommercializationProfile(institutionId?: string) {
  return useQuery({
    queryKey: ["commercialization-profile", institutionId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("institution_commercialization_profiles")
        .select("*")
        .order("computed_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useResearchLiquidityPools(institutionId?: string) {
  return useQuery({
    queryKey: ["research-liquidity-pools", institutionId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("research_liquidity_pools")
        .select("*")
        .order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useExecutionProductivityRankings() {
  return useQuery({
    queryKey: ["execution-productivity-rankings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("execution_productivity_rankings")
        .select("*")
        .order("epr_score", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useIndustryPartnerships(researchId?: string) {
  return useQuery({
    queryKey: ["industry-partnerships", researchId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("industry_research_partnerships")
        .select("*")
        .order("created_at", { ascending: false });
      if (researchId) query = query.eq("research_id", researchId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useRoyaltyContracts(institutionId?: string) {
  return useQuery({
    queryKey: ["royalty-contracts", institutionId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("royalty_contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useResearchRevenueStreams(institutionId?: string) {
  return useQuery({
    queryKey: ["research-revenue-streams", institutionId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("research_revenue_streams")
        .select("*")
        .order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useFundingPledges(researchId?: string) {
  return useQuery({
    queryKey: ["funding-pledges", researchId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("research_funding_pledges")
        .select("*")
        .order("created_at", { ascending: false });
      if (researchId) query = query.eq("research_id", researchId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function useInstitutionEarnings(institutionId?: string) {
  return useQuery({
    queryKey: ["institution-earnings", institutionId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("institution_research_earnings")
        .select("*")
        .order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}
