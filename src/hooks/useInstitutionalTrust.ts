/**
 * useInstitutionalTrust — Institutional Reputation Graph hooks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InstitutionalTrustRecord {
  id: string;
  institution_id: string;
  institution_name: string;
  execution_score: number;
  dispute_ratio: number;
  capital_efficiency: number;
  peer_validation_score: number;
  cross_border_collab_score: number;
  research_output_score: number;
  composite_trust_score: number;
  rank_position: number | null;
  tier: string;
  period: string;
  computed_at: string;
}

export function useInstitutionalTrustIndex(period?: string) {
  return useQuery({
    queryKey: ["institutionalTrust", period],
    queryFn: async (): Promise<InstitutionalTrustRecord[]> => {
      let query = (supabase as any)
        .from("institutional_trust_index")
        .select("*")
        .order("composite_trust_score", { ascending: false });

      if (period) {
        query = query.eq("period", period);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useComputeInstitutionalTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (institutionId: string) => {
      const { data, error } = await supabase.functions.invoke("funding-intelligence", {
        body: { action: "compute_institutional_trust", institution_id: institutionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["institutionalTrust"] });
      toast.success("Institutional trust index computed");
    },
  });
}
