/**
 * useCrossSynthesis — Hooks for cross-document claim extraction, synthesis, and graph.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ResearchClaim {
  id: string;
  workspace_id: string;
  document_id: string;
  chunk_id: string;
  claim_text: string;
  claim_type: string;
  confidence_score: number;
  evidence_strength: number;
  created_at: string;
}

export interface ClaimRelationship {
  id: string;
  workspace_id: string;
  claim_id_a: string;
  claim_id_b: string;
  relationship_type: string;
  similarity_score: number;
  ai_reasoning: string | null;
  created_at: string;
}

export interface ConsensusClusters {
  topic: string;
  consensus_level: string;
  claim_ids: string[];
  summary: string;
}

export interface Contradiction {
  claim_a: string;
  claim_b: string;
  nature: string;
  possible_cause: string;
}

export interface ResearchGapItem {
  topic: string;
  description: string;
  severity: string;
}

export interface SynthesisReport {
  id: string;
  workspace_id: string;
  generated_by: string;
  title: string;
  report_type: string;
  content: { markdown: string; claim_count: number; relationship_count: number; generated_at: string };
  claim_ids: string[];
  version_number: number;
  is_locked: boolean;
  institutional_endorsement: boolean;
  created_at: string;
}

// ============================================================
// CLAIMS
// ============================================================

export function useWorkspaceClaims(workspaceId?: string) {
  return useQuery({
    queryKey: ["research-claims", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_claims")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ResearchClaim[];
    },
    enabled: !!workspaceId,
  });
}

export function useExtractClaims() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "extract_claims", workspace_id: workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; total_claims: number };
    },
    onSuccess: (data, workspaceId) => {
      qc.invalidateQueries({ queryKey: ["research-claims", workspaceId] });
      toast({ title: `Extracted ${data.total_claims} claims` });
    },
    onError: (err: Error) => {
      toast({ title: "Claim extraction failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// RELATIONSHIPS & SYNTHESIS
// ============================================================

export function useClaimRelationships(workspaceId?: string) {
  return useQuery({
    queryKey: ["claim-relationships", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claim_relationships")
        .select("*")
        .eq("workspace_id", workspaceId!);
      if (error) throw error;
      return (data ?? []) as unknown as ClaimRelationship[];
    },
    enabled: !!workspaceId,
  });
}

export function useCrossSynthesize() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "cross_synthesize", workspace_id: workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as {
        success: boolean;
        relationships_count: number;
        consensus_clusters: ConsensusClusters[];
        contradictions: Contradiction[];
        research_gaps: ResearchGapItem[];
        evidence_scores: Array<{ claim_id: string; score: number; reasoning: string }>;
      };
    },
    onSuccess: (data, workspaceId) => {
      qc.invalidateQueries({ queryKey: ["claim-relationships", workspaceId] });
      qc.invalidateQueries({ queryKey: ["research-claims", workspaceId] });
      toast({ title: `Synthesis complete: ${data.relationships_count} relationships found` });
    },
    onError: (err: Error) => {
      toast({ title: "Synthesis failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// SYNTHESIS REPORTS
// ============================================================

export function useSynthesisReports(workspaceId?: string) {
  return useQuery({
    queryKey: ["synthesis-reports", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_synthesis_reports")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SynthesisReport[];
    },
    enabled: !!workspaceId,
  });
}

export function useGenerateSynthesisReport() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { workspaceId: string; reportType?: string; title?: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "generate_synthesis_report",
          workspace_id: params.workspaceId,
          report_type: params.reportType || "synthesis",
          title: params.title,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; report: SynthesisReport };
    },
    onSuccess: (_data, params) => {
      qc.invalidateQueries({ queryKey: ["synthesis-reports", params.workspaceId] });
      toast({ title: "Synthesis report generated" });
    },
    onError: (err: Error) => {
      toast({ title: "Report generation failed", description: err.message, variant: "destructive" });
    },
  });
}
