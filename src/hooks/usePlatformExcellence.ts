/**
 * Hooks for Platform Excellence modules:
 * - Research Workspace Documents
 * - Execution Timeline
 * - Execution Recommendations
 * - Public Profiles
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============= Workspace Documents =============

export function useWorkspaceDocs(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace-docs", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_documents")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspaceDoc() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, title }: { workspaceId: string; title: string }) => {
      const { data, error } = await supabase
        .from("workspace_documents")
        .insert({
          workspace_id: workspaceId,
          title,
          created_by: user!.id,
          content: { type: "doc", content: [] },
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workspace-docs", vars.workspaceId] });
    },
  });
}

export function useSaveWorkspaceDoc() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, content, title }: { docId: string; content: any; title?: string }) => {
      // Get current version
      const { data: current } = await supabase
        .from("workspace_documents")
        .select("version_number, workspace_id, content")
        .eq("id", docId)
        .single();

      if (!current) throw new Error("Document not found");

      // Save history
      await supabase.from("workspace_document_history").insert({
        document_id: docId,
        content: current.content,
        version_number: current.version_number,
        edited_by: user!.id,
      });

      // Update document
      const { error } = await supabase
        .from("workspace_documents")
        .update({
          content,
          ...(title ? { title } : {}),
          version_number: current.version_number + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", docId);

      if (error) throw error;
      return current.workspace_id;
    },
    onSuccess: (workspaceId) => {
      qc.invalidateQueries({ queryKey: ["workspace-docs", workspaceId] });
    },
  });
}

export function useDocumentHistory(docId?: string) {
  return useQuery({
    queryKey: ["doc-history", docId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_document_history")
        .select("*")
        .eq("document_id", docId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!docId,
  });
}

// ============= Execution Snapshots =============

export function useExecutionSnapshots(projectId?: string) {
  return useQuery({
    queryKey: ["execution-snapshots", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("execution_snapshots")
        .select("*")
        .eq("project_id", projectId!)
        .order("snapshot_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useTakeSnapshot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.functions.invoke("execution-assistant", {
        body: { action: "take_snapshot", project_id: projectId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, projectId) => {
      qc.invalidateQueries({ queryKey: ["execution-snapshots", projectId] });
    },
  });
}

// ============= Execution Recommendations =============

export function useExecutionRecommendations(projectId?: string) {
  return useQuery({
    queryKey: ["execution-recommendations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("execution_recommendations")
        .select("*")
        .eq("project_id", projectId!)
        .eq("is_dismissed", false)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useGenerateRecommendations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.functions.invoke("execution-assistant", {
        body: { action: "generate_recommendations", project_id: projectId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, projectId) => {
      qc.invalidateQueries({ queryKey: ["execution-recommendations", projectId] });
      toast({ title: "Recommendations generated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDismissRecommendation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("execution_recommendations")
        .update({ is_dismissed: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["execution-recommendations"] });
    },
  });
}

// ============= Public Profiles =============

export function usePublicProfile(username?: string) {
  return useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("username", username!)
        .eq("is_public", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });
}

export function useMyPublicProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-public-profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
}

export function useUpsertPublicProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profile: {
      username?: string;
      headline?: string;
      bio?: string;
      expertise_tags?: string[];
    }) => {
      // Check if profile exists
      const { data: existing } = await supabase
        .from("public_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("public_profiles")
          .update({ ...profile, updated_at: new Date().toISOString() })
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("public_profiles")
          .insert({ ...profile, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-public-profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
