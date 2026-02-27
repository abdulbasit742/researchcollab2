/**
 * useConstraintAwareQuery — Hook for CARC (Constraint-Aware Research Copilot) queries.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CARCEvidence {
  statement: string;
  source_index: number;
  strength: "empirically_strong" | "moderately_supported" | "preliminary" | "speculative" | "contested" | "unverified";
}

export interface CARCInference {
  statement: string;
  based_on_sources: number[];
  confidence: number;
  reasoning: string;
}

export interface CARCHypothesis {
  label: string;
  statement: string;
  supporting_evidence: number[];
  contradicting_evidence: number[];
  assumptions: string[];
  confidence: number;
}

export interface CARCCounterArgument {
  position: string;
  supporting_evidence: string;
  strength: number;
}

export interface CARCFallacyFlag {
  type: string;
  description: string;
  affected_claim: string;
}

export interface CARCComplianceFlag {
  type: "regulatory" | "export_control" | "ethics" | "privacy" | "funding" | "conflict_of_interest";
  description: string;
  severity: "low" | "medium" | "high";
}

export interface CARCResponse {
  query_id: string;
  summary: string;
  evidence: CARCEvidence[];
  inferences: CARCInference[];
  assumptions: Array<{ statement: string; justification: string }>;
  unknowns: Array<{ statement: string; what_would_help: string }>;
  confidence_score: number;
  data_completeness: number;
  evidence_density: number;
  contradiction_risk: number;
  risk_level: "low" | "moderate" | "high" | "exploratory";
  fallacy_flags: CARCFallacyFlag[];
  counter_arguments: CARCCounterArgument[];
  hypotheses?: CARCHypothesis[];
  compliance_flags?: CARCComplianceFlag[];
  citation_map: Array<{
    source_index: number;
    document_id: string;
    document_name: string;
    chunk_id: string;
    section_index: number;
    text_preview: string;
    relevance_score: number;
  }>;
  hallucination_check_passed: boolean;
  chunk_count: number;
  _parse_warning?: string;
}

export function useCARCQuery() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      workspaceId: string;
      queryText: string;
      complianceMode?: boolean;
      multiHypothesis?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "carc_query",
          workspace_id: params.workspaceId,
          query_text: params.queryText,
          compliance_mode: params.complianceMode ?? false,
          multi_hypothesis: params.multiHypothesis ?? false,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as CARCResponse;
    },
    onError: (err: Error) => {
      toast({ title: "CARC Query Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useReasoningLog(queryId?: string) {
  return useQuery({
    queryKey: ["reasoning-log", queryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_reasoning_logs")
        .select("*")
        .eq("query_id", queryId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!queryId,
  });
}
