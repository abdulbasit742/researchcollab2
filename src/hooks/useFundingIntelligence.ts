/**
 * useFundingIntelligence — AI Funding Intelligence Layer hooks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FundingPrediction {
  id: string;
  entity_type: string;
  entity_id: string;
  prediction_type: string;
  risk_score: number;
  confidence: number;
  predicted_outcome: string | null;
  factors: any[];
  recommendation: string | null;
  severity: string;
  flagged_issues: any[];
  model_version: string;
  computed_at: string;
  status: string;
}

export function useFundingPredictions(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ["fundingPredictions", entityType, entityId],
    queryFn: async (): Promise<FundingPrediction[]> => {
      let query = (supabase as any)
        .from("funding_predictions")
        .select("*")
        .eq("status", "active")
        .order("computed_at", { ascending: false });

      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useHighRiskPredictions() {
  return useQuery({
    queryKey: ["highRiskPredictions"],
    queryFn: async (): Promise<FundingPrediction[]> => {
      const { data, error } = await (supabase as any)
        .from("funding_predictions")
        .select("*")
        .eq("status", "active")
        .gte("risk_score", 50)
        .order("risk_score", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePredictMilestoneFailure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data, error } = await supabase.functions.invoke("funding-intelligence", {
        body: { action: "predict_milestone_failure", deal_id: dealId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fundingPredictions"] });
      if (data.risk_score >= 50) {
        toast.warning(`High failure risk detected: ${data.risk_score}%`);
      } else {
        toast.success(`Deal risk: ${data.risk_score}% — On track`);
      }
    },
  });
}

export function useDetectSyntheticEndorsements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data, error } = await supabase.functions.invoke("funding-intelligence", {
        body: { action: "detect_synthetic_endorsements", user_id: targetUserId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fundingPredictions"] });
      if (data.verdict === "suspicious") {
        toast.warning("Suspicious endorsement patterns detected");
      } else {
        toast.success("No synthetic endorsement patterns found");
      }
    },
  });
}
