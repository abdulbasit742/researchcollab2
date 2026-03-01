/**
 * useResearchAssets — Research Asset Registry hooks.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ResearchAsset {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  asset_type: string;
  linked_milestone_id: string | null;
  linked_experiment_id: string | null;
  reproducibility_hash: string | null;
  validation_status: string;
  validation_count: number;
  valuation_score: number;
  valuation_currency: string;
  ip_status: string;
  licensing_terms: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useMyResearchAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["researchAssets", user?.id],
    queryFn: async (): Promise<ResearchAsset[]> => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("research_assets")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useValidatedAssets() {
  return useQuery({
    queryKey: ["validatedAssets"],
    queryFn: async (): Promise<ResearchAsset[]> => {
      const { data, error } = await (supabase as any)
        .from("research_assets")
        .select("*")
        .eq("validation_status", "validated")
        .order("valuation_score", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateResearchAsset() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description?: string;
      assetType?: string;
      linkedMilestoneId?: string;
      linkedExperimentId?: string;
      reproducibilityHash?: string;
      ipStatus?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("research_assets")
        .insert({
          creator_id: user.id,
          title: params.title,
          description: params.description,
          asset_type: params.assetType || "research_output",
          linked_milestone_id: params.linkedMilestoneId,
          linked_experiment_id: params.linkedExperimentId,
          reproducibility_hash: params.reproducibilityHash,
          ip_status: params.ipStatus || "open",
          validation_status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["researchAssets"] });
      toast.success("Research asset registered");
    },
  });
}
