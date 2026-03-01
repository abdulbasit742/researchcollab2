import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExecutionPattern {
  id: string;
  institution_id: string;
  pattern_type: string;
  pattern_data: Record<string, unknown>;
  sample_size: number;
  confidence_score: number;
  generated_at: string;
}

export interface AdaptiveRiskModel {
  id: string;
  institution_id: string;
  risk_model_version: number;
  delay_weight: number;
  activity_weight: number;
  review_weight: number;
  dispute_weight: number;
  confidence_score: number;
  generated_at: string;
}

export interface OptimizationSuggestion {
  id: string;
  project_id: string;
  institution_id: string | null;
  suggestion_type: string;
  suggestion_reason: string;
  impact_estimate: string | null;
  confidence_score: number;
  generated_at: string;
}

export interface PerformanceDrift {
  id: string;
  entity_type: string;
  entity_id: string;
  institution_id: string | null;
  baseline_score: number;
  current_score: number;
  drift_percentage: number;
  drift_direction: string;
  generated_at: string;
}

export interface ModelAccuracy {
  id: string;
  model_type: string;
  predicted_value: number | null;
  actual_value: number | null;
  accuracy_score: number | null;
  institution_id: string | null;
  evaluated_at: string;
}

export interface LearningTrend {
  id: string;
  institution_id: string;
  improvement_trend: number;
  stability_trend: number;
  governance_trend: number;
  engagement_trend: number;
  generated_at: string;
}

export interface EngagementAdaptiveModel {
  id: string;
  institution_id: string;
  engagement_factor_weights: Record<string, unknown>;
  retention_risk_score: number;
  predicted_dropoff_rate: number;
  generated_at: string;
}

export function useExecutionPatterns(institutionId?: string) {
  return useQuery({
    queryKey: ["execution-patterns", institutionId],
    queryFn: async (): Promise<ExecutionPattern[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("execution_history_patterns")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(20);
      return (data ?? []) as ExecutionPattern[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdaptiveRiskModel(institutionId?: string) {
  return useQuery({
    queryKey: ["adaptive-risk-model", institutionId],
    queryFn: async (): Promise<AdaptiveRiskModel | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("adaptive_risk_models")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as AdaptiveRiskModel | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOptimizationSuggestions(institutionId?: string) {
  return useQuery({
    queryKey: ["optimization-suggestions", institutionId],
    queryFn: async (): Promise<OptimizationSuggestion[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("adaptive_optimization_suggestions")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(15);
      return (data ?? []) as OptimizationSuggestion[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformanceDrift(institutionId?: string) {
  return useQuery({
    queryKey: ["performance-drift", institutionId],
    queryFn: async (): Promise<PerformanceDrift[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("performance_drift_analysis")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(20);
      return (data ?? []) as PerformanceDrift[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useModelAccuracy(institutionId?: string) {
  return useQuery({
    queryKey: ["model-accuracy", institutionId],
    queryFn: async (): Promise<ModelAccuracy[]> => {
      if (!institutionId) return [];
      let query = supabase
        .from("adaptive_model_accuracy")
        .select("*")
        .order("evaluated_at", { ascending: false })
        .limit(30);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as ModelAccuracy[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLearningTrend(institutionId?: string) {
  return useQuery({
    queryKey: ["learning-trend", institutionId],
    queryFn: async (): Promise<LearningTrend | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_learning_summary")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as LearningTrend | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEngagementAdaptiveModel(institutionId?: string) {
  return useQuery({
    queryKey: ["engagement-adaptive-model", institutionId],
    queryFn: async (): Promise<EngagementAdaptiveModel | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("engagement_adaptive_models")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as EngagementAdaptiveModel | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}
