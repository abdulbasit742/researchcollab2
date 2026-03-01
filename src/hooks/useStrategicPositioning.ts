import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STALE = 10 * 60 * 1000;

export function usePlatformIdentity() {
  return useQuery({
    queryKey: ["platform-identity"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_identity_config").select("*").limit(1).maybeSingle();
      return data as any | null;
    },
    staleTime: STALE,
  });
}

export function useCompetitiveMatrix() {
  return useQuery({
    queryKey: ["competitive-matrix"],
    queryFn: async () => {
      const { data } = await supabase.from("competitive_positioning_matrix").select("*").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useValueProofMetrics(institutionId?: string) {
  return useQuery({
    queryKey: ["value-proof", institutionId],
    queryFn: async () => {
      let q = supabase.from("value_proof_metrics").select("*").order("generated_at", { ascending: false }).limit(1);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data?.[0] ?? null) as any | null;
    },
    staleTime: STALE,
  });
}

export function useImpactReports(institutionId?: string) {
  return useQuery({
    queryKey: ["impact-reports", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase.from("impact_reports").select("*").eq("institution_id", institutionId).order("generated_at", { ascending: false }).limit(10);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: STALE,
  });
}

export function useMarketDifferentiation(institutionId?: string) {
  return useQuery({
    queryKey: ["market-diff", institutionId],
    queryFn: async () => {
      let q = supabase.from("market_differentiation_insights").select("*").order("generated_at", { ascending: false }).limit(1);
      if (institutionId) q = q.eq("institution_id", institutionId);
      const { data } = await q;
      return (data?.[0] ?? null) as any | null;
    },
    staleTime: STALE,
  });
}
