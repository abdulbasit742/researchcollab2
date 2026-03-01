import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STALE = 10 * 60 * 1000;

export function useGovernanceAnomalies(institutionId?: string) {
  return useQuery({
    queryKey: ["gov-anomalies", institutionId],
    queryFn: async () => {
      let q = supabase
        .from("governance_anomaly_detection")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(30);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useReviewIntegrity(institutionId?: string) {
  return useQuery({
    queryKey: ["review-integrity", institutionId],
    queryFn: async () => {
      let q = supabase
        .from("review_integrity_metrics")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(20);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useApprovalPatterns(institutionId?: string) {
  return useQuery({
    queryKey: ["approval-patterns", institutionId],
    queryFn: async () => {
      let q = supabase
        .from("approval_pattern_analysis")
        .select("*")
        .order("anomaly_score", { ascending: false })
        .limit(20);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useDisputePatternIntelligence(institutionId?: string) {
  return useQuery({
    queryKey: ["dispute-pattern-intel", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("dispute_pattern_intelligence")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useEndorsementIntegrity(institutionId?: string) {
  return useQuery({
    queryKey: ["endorsement-integrity", institutionId],
    queryFn: async () => {
      let q = supabase
        .from("endorsement_integrity_analysis")
        .select("*")
        .order("anomaly_score", { ascending: false })
        .limit(20);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useGovernanceStabilityIndex(institutionId?: string) {
  return useQuery({
    queryKey: ["gov-stability-index", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("governance_stability_index")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useGovernanceStabilityHistory(institutionId?: string) {
  return useQuery({
    queryKey: ["gov-stability-history", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("governance_stability_index")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(12);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useBehavioralDrift(institutionId?: string) {
  return useQuery({
    queryKey: ["behavioral-drift", institutionId],
    queryFn: async () => {
      let q = supabase
        .from("behavioral_drift_monitor")
        .select("*")
        .order("drift_percentage", { ascending: false })
        .limit(20);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useGovernanceTransparencyReports(institutionId?: string) {
  return useQuery({
    queryKey: ["gov-transparency-reports", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("governance_transparency_reports")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}
