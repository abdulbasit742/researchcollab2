/**
 * useResearchMemory — Hooks for longitudinal research memory, versioning, and consensus tracking.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkspaceVersion {
  id: string;
  workspace_id: string;
  version_number: number;
  summary_snapshot: string | null;
  consensus_snapshot: any;
  claim_graph_snapshot: any;
  document_count: number;
  claim_count: number;
  is_locked: boolean;
  is_archived: boolean;
  institutional_certification: any;
  created_by: string | null;
  created_at: string;
}

export interface TopicConsensusEntry {
  id: string;
  workspace_id: string;
  topic: string;
  version_number: number;
  consensus_score: number;
  reinforcement_count: number;
  contradiction_count: number;
  evidence_density: number;
  claim_count: number;
  created_at: string;
}

export interface ClaimMutationEntry {
  id: string;
  claim_id: string;
  workspace_id: string;
  mutation_type: string;
  old_values: any;
  new_values: any;
  reason: string | null;
  mutated_by: string | null;
  created_at: string;
}

export interface ConsensusShift {
  topic: string;
  from_version: number;
  to_version: number;
  from_score: number;
  to_score: number;
  delta: number;
  direction: string;
}

export interface ConsensusAlert {
  topic: string;
  severity: string;
  message: string;
}

export interface ImpactEvent {
  id: string;
  workspace_id: string;
  version_number: number | null;
  event_type: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  trust_delta: number;
  metadata: any;
  created_at: string;
}

// ============================================================
// VERSIONS
// ============================================================

export function useWorkspaceVersions(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-versions", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_versions")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as WorkspaceVersion[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateVersionSnapshot() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { workspaceId: string; summary?: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "create_version_snapshot", workspace_id: params.workspaceId, summary: params.summary },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; version: WorkspaceVersion };
    },
    onSuccess: (_data, params) => {
      qc.invalidateQueries({ queryKey: ["workspace-versions", params.workspaceId] });
      toast({ title: `Version ${_data.version.version_number} snapshot created` });
    },
    onError: (err: Error) => {
      toast({ title: "Snapshot failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useLockVersion() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { versionId: string; workspaceId: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "lock_version", version_id: params.versionId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, params) => {
      qc.invalidateQueries({ queryKey: ["workspace-versions", params.workspaceId] });
      toast({ title: "Version locked" });
    },
    onError: (err: Error) => {
      toast({ title: "Lock failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useArchiveVersion() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { versionId: string; workspaceId: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "archive_version", version_id: params.versionId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, params) => {
      qc.invalidateQueries({ queryKey: ["workspace-versions", params.workspaceId] });
      toast({ title: "Version archived" });
    },
    onError: (err: Error) => {
      toast({ title: "Archive failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CONSENSUS TRACKING
// ============================================================

export function useTopicConsensusHistory(workspaceId?: string) {
  return useQuery({
    queryKey: ["topic-consensus", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_consensus_history")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("version_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TopicConsensusEntry[];
    },
    enabled: !!workspaceId,
  });
}

export function useConsensusShifts() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "detect_consensus_shifts", workspace_id: workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { shifts: ConsensusShift[]; alerts: ConsensusAlert[] };
    },
    onError: (err: Error) => {
      toast({ title: "Shift detection failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// CLAIM MUTATIONS
// ============================================================

export function useClaimMutationLog(workspaceId?: string) {
  return useQuery({
    queryKey: ["claim-mutations", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claim_mutation_log")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as ClaimMutationEntry[];
    },
    enabled: !!workspaceId,
  });
}

// ============================================================
// IMPACT EVENTS
// ============================================================

export function useImpactEvents(workspaceId?: string) {
  return useQuery({
    queryKey: ["impact-events", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_impact_events")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ImpactEvent[];
    },
    enabled: !!workspaceId,
  });
}
