import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExecutiveCapitalMetrics {
  id: string;
  institution_id: string;
  total_milestones_funded: number;
  total_milestones_completed: number;
  funding_velocity_index: number;
  release_efficiency_ratio: number;
  dispute_financial_ratio: number;
  generated_at: string;
}

export interface GovernanceStability {
  id: string;
  institution_id: string;
  dispute_resolution_speed: number;
  review_accountability_score: number;
  role_integrity_score: number;
  anomaly_rate: number;
  audit_log_completeness: number;
  overall_stability_score: number;
  generated_at: string;
}

export interface ExecutivePrediction {
  id: string;
  institution_id: string;
  predicted_completion_rate_next_quarter: number | null;
  predicted_dispute_risk: number | null;
  predicted_engagement_trend: number | null;
  confidence_score: number | null;
  generated_at: string;
}

export interface DepartmentPerformance {
  id: string;
  institution_id: string;
  department_id: string;
  department_name: string | null;
  completion_rate: number;
  engagement_score: number;
  review_turnaround: number;
  dispute_ratio: number;
  generated_at: string;
}

export function useExecutiveCapital(institutionId?: string) {
  return useQuery({
    queryKey: ["executive-capital", institutionId],
    queryFn: async (): Promise<ExecutiveCapitalMetrics | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("executive_capital_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as ExecutiveCapitalMetrics | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGovernanceStability(institutionId?: string) {
  return useQuery({
    queryKey: ["governance-stability", institutionId],
    queryFn: async (): Promise<GovernanceStability | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("governance_stability_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as GovernanceStability | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useExecutivePredictions(institutionId?: string) {
  return useQuery({
    queryKey: ["executive-predictions", institutionId],
    queryFn: async (): Promise<ExecutivePrediction | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("executive_predictions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as ExecutivePrediction | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDepartmentPerformance(institutionId?: string) {
  return useQuery({
    queryKey: ["department-performance", institutionId],
    queryFn: async (): Promise<DepartmentPerformance[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("department_performance_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(20);
      return (data ?? []) as DepartmentPerformance[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}
