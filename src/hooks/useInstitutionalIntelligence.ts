import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InstitutionalIntelligence {
  institution_id: string;
  total_members: number;
  avg_trust_score: number;
  avg_visibility_score: number;
  total_active_deals: number;
  total_completed_deals: number;
  avg_deal_health: number;
  skill_distribution: Record<string, number>;
  income_generated_last_90_days: number;
  skill_gaps: SkillGap[];
  forecast: TalentForecast;
  performance: PerformanceMetrics;
  health_index: number;
  badges: string[];
  calculated_at: string;
}

export interface SkillGap {
  skill_name: string;
  demand_index: number;
  supply_index: number;
  gap_score: number;
}

export interface TalentForecast {
  projected_growth_90_days: number;
  projected_income_90_days: number;
  projected_trust_growth: number;
  risk_alert_level: string;
}

export interface PerformanceMetrics {
  collaboration_score: number;
  reliability_score: number;
  dispute_ratio: number;
  economic_velocity: number;
  knowledge_output_score: number;
}

async function fetchIntelligence(institutionId: string): Promise<InstitutionalIntelligence> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke("compute-institutional-intelligence", {
    body: { institution_id: institutionId },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  return data as InstitutionalIntelligence;
}

export function useInstitutionalIntelligence(institutionId?: string) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: intelligence,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["institutional-intelligence", institutionId, refreshKey],
    queryFn: () => fetchIntelligence(institutionId!),
    enabled: !!institutionId && !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Historical snapshots
  const { data: snapshots = [] } = useQuery({
    queryKey: ["institutional-snapshots", institutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_talent_snapshots" as any)
        .select("*")
        .eq("institution_id", institutionId!)
        .order("calculated_at", { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!institutionId && !!user,
  });

  // Historical forecasts
  const { data: forecasts = [] } = useQuery({
    queryKey: ["talent-forecasts", institutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("talent_forecasts" as any)
        .select("*")
        .eq("institution_id", institutionId!)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data || []) as any[];
    },
    enabled: !!institutionId && !!user,
  });

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refetch();
  }, [refetch]);

  return {
    intelligence,
    isLoading,
    error: error ? (error as Error).message : null,
    snapshots,
    forecasts,
    refresh,
  };
}
