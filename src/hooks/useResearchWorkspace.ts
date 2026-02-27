/**
 * useResearchWorkspace — Hooks for Research Intelligence Engine.
 * Manages workspaces, documents, queries, and AI responses.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// TYPES
// ============================================================

export interface ResearchWorkspace {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  institution_id: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchDocument {
  id: string;
  workspace_id: string;
  uploader_id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number;
  extracted_text: string | null;
  parsed_structure: Record<string, any>;
  document_chunks: any[];
  chunk_count: number;
  version_number: number;
  is_latest_version: boolean;
  processing_status: string;
  uploaded_at: string;
}

export interface ResearchQuery {
  id: string;
  workspace_id: string;
  user_id: string;
  query_text: string;
  status: string;
  created_at: string;
}

export interface ResearchResponse {
  id: string;
  query_id: string;
  ai_response: string;
  citation_map: CitationEntry[];
  confidence_score: number;
  model_used: string | null;
  created_at: string;
}

export interface CitationEntry {
  source_index: number;
  document_id: string;
  document_name: string;
  chunk_id: string;
  section_index: number;
  text_preview: string;
  relevance_score: number;
}

// ============================================================
// WORKSPACES
// ============================================================

export function useResearchWorkspaces() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["research-workspaces", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_workspaces")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ResearchWorkspace[];
    },
    enabled: !!user,
  });
}

export function useResearchWorkspace(workspaceId?: string) {
  return useQuery({
    queryKey: ["research-workspace", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_workspaces")
        .select("*")
        .eq("id", workspaceId!)
        .single();
      if (error) throw error;
      return data as ResearchWorkspace;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { title: string; description?: string; visibility?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("research_workspaces")
        .insert({
          owner_id: user.id,
          title: params.title,
          description: params.description || null,
          visibility: params.visibility || "private",
        })
        .select()
        .single();
      if (error) throw error;
      return data as ResearchWorkspace;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["research-workspaces"] });
      toast({ title: "Workspace created" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create workspace", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// DOCUMENTS
// ============================================================

export function useWorkspaceDocuments(workspaceId?: string) {
  return useQuery({
    queryKey: ["research-documents", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_documents")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .eq("is_latest_version", true)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ResearchDocument[];
    },
    enabled: !!workspaceId,
  });
}

export function useUploadResearchDocument() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      workspaceId: string;
      file: File;
      extractedText: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Insert document record with extracted text
      const { data: doc, error } = await supabase
        .from("research_documents")
        .insert({
          workspace_id: params.workspaceId,
          uploader_id: user.id,
          file_name: params.file.name,
          mime_type: params.file.type,
          file_size: params.file.size,
          extracted_text: params.extractedText,
          processing_status: "pending",
        })
        .select()
        .single();
      if (error) throw error;

      // Trigger parsing via edge function
      const { data: parseResult, error: parseErr } = await supabase.functions.invoke(
        "research-intelligence",
        { body: { action: "parse_document", document_id: doc.id } }
      );

      if (parseErr) {
        console.error("Parse error:", parseErr);
        toast({ title: "Document uploaded but parsing failed", variant: "destructive" });
      }

      return { doc, parseResult };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["research-documents", vars.workspaceId] });
      toast({ title: "Document uploaded and indexed" });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// QUERIES & RESPONSES
// ============================================================

export function useWorkspaceQueries(workspaceId?: string) {
  return useQuery({
    queryKey: ["research-queries", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_queries")
        .select("*, research_responses(*)")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as (ResearchQuery & { research_responses: ResearchResponse[] })[];
    },
    enabled: !!workspaceId,
  });
}

export function useResearchQuery() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { workspaceId: string; queryText: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "query",
          workspace_id: params.workspaceId,
          query_text: params.queryText,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as {
        query_id: string;
        response_id: string;
        ai_response: string;
        citation_map: CitationEntry[];
        confidence_score: number;
      };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["research-queries", vars.workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Query failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// RESEARCH ANALYTICS
// ============================================================

export function useResearchAnalytics(workspaceId?: string) {
  return useQuery({
    queryKey: ["research-analytics", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      const [docsRes, queriesRes] = await Promise.all([
        supabase.from("research_documents").select("id, chunk_count, processing_status")
          .eq("workspace_id", workspaceId).eq("is_latest_version", true),
        supabase.from("research_queries").select("id, status, created_at")
          .eq("workspace_id", workspaceId),
      ]);

      const docs = docsRes.data || [];
      const queries = queriesRes.data || [];

      return {
        document_count: docs.length,
        total_chunks: docs.reduce((sum, d) => sum + (d.chunk_count || 0), 0),
        processed_docs: docs.filter(d => d.processing_status === "completed").length,
        total_queries: queries.length,
        completed_queries: queries.filter(q => q.status === "completed").length,
      };
    },
    enabled: !!workspaceId,
  });
}
