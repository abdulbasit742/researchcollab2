import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProofOfValueMetrics {
  time_to_funding_days: number;
  time_to_completion_days: number;
  milestone_success_rate: number;
  escrow_accuracy_rate: number;
  sponsor_satisfaction_score: number;
  student_completion_rate: number;
  trust_delta_avg: number;
  hiring_conversion_rate: number;
  startup_count: number;
  repeat_sponsor_rate: number;
  platform_impact_index: number;
  total_escrow_volume: number;
  total_funded_fyps: number;
  total_hires: number;
}

export function useProofOfValue(institutionId?: string, sponsorId?: string) {
  return useQuery({
    queryKey: ["proof-of-value", institutionId, sponsorId],
    queryFn: async (): Promise<ProofOfValueMetrics> => {
      const { data, error } = await supabase.functions.invoke("compute-impact-metrics", {
        body: { institution_id: institutionId, sponsor_id: sponsorId },
      });
      if (error) throw error;
      return data.metrics;
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}

export function useProofOfValueSnapshot(institutionId?: string) {
  return useQuery({
    queryKey: ["pov-snapshot", institutionId],
    queryFn: async () => {
      let query = supabase
        .from("proof_of_value_snapshots" as any)
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(1);
      
      if (institutionId) {
        query = query.eq("institution_id", institutionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as any)?.[0] as ProofOfValueMetrics | null;
    },
  });
}
