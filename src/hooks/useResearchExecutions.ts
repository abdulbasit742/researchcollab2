import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useMyResearchExecutions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["researchExecutions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("research_executions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useComputeProofs(executionId?: string) {
  return useQuery({
    queryKey: ["computeProofs", executionId],
    queryFn: async () => {
      let query = (supabase as any).from("compute_proofs").select("*");
      if (executionId) query = query.eq("research_execution_id", executionId);
      query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!executionId,
  });
}

export function useGenerateExecutionHash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      milestoneId?: string;
      projectId?: string;
      environmentSnapshot?: Record<string, unknown>;
      datasetSignature?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.functions.invoke("research-proof-engine", {
        body: {
          action: "generate_execution_hash",
          title: params.title,
          milestone_id: params.milestoneId,
          project_id: params.projectId,
          environment_snapshot: params.environmentSnapshot,
          dataset_signature: params.datasetSignature,
          metadata: params.metadata,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["researchExecutions"] });
      toast.success("Research execution recorded with cryptographic proof");
    },
  });
}

export function useVerifyReproducibility() {
  return useMutation({
    mutationFn: async (executionId: string) => {
      const { data, error } = await supabase.functions.invoke("research-proof-engine", {
        body: { action: "verify_reproducibility", execution_id: executionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.is_verified) {
        toast.success("Reproducibility verified ✓");
      } else {
        toast.error("Reproducibility verification failed — hash mismatch");
      }
    },
  });
}

export function useAttachComputeProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { executionId: string; computeMetadata: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("research-proof-engine", {
        body: {
          action: "attach_compute_proof",
          execution_id: params.executionId,
          compute_metadata: params.computeMetadata,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["computeProofs"] });
      toast.success("Compute proof attached");
    },
  });
}
