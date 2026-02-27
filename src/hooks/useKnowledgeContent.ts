/**
 * React hooks for Verified Knowledge & Execution Content System.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  publishExecutionContent,
  searchExecutionContent,
  calculateAuthorCredibility,
  CONTENT_RANKING_TRANSPARENCY,
  type ExecutionContentInput,
  type ContentSearchFilters,
} from "@/lib/professional/knowledgeContentEngine";

export function usePublishExecutionContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExecutionContentInput) => {
      if (!user) throw new Error("Authentication required");
      return publishExecutionContent(user.id, input);
    },
    onSuccess: (result) => {
      const msg = result.warnings.length > 0
        ? `Published with ${result.warnings.length} warning(s)`
        : "Content published successfully";
      toast({ title: "Published", description: msg });
      queryClient.invalidateQueries({ queryKey: ["execution-content"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useExecutionContentSearch(filters: ContentSearchFilters, enabled = true) {
  return useQuery({
    queryKey: ["execution-content", filters],
    queryFn: () => searchExecutionContent(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAuthorCredibility(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["author-credibility", targetId],
    queryFn: () => calculateAuthorCredibility(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAwardKnowledgeBadge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contentId: string;
      badgeType: string;
      evidenceReference?: string;
      institutionId?: string;
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("knowledge_badges").insert({
        content_id: params.contentId,
        badge_type: params.badgeType,
        awarded_by: user.id,
        institution_id: params.institutionId,
        evidence_reference: params.evidenceReference,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Badge awarded", description: "Knowledge badge has been applied." });
      queryClient.invalidateQueries({ queryKey: ["execution-content"] });
    },
  });
}

export function useRecordContentRead() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      contentId: string;
      readDurationSeconds: number;
      completionPct: number;
      deliverableClicked?: boolean;
      crossReferencesClicked?: number;
    }) => {
      if (!user) return;
      await supabase.from("content_read_analytics").insert({
        content_id: params.contentId,
        reader_id: user.id,
        read_duration_seconds: params.readDurationSeconds,
        completion_pct: params.completionPct,
        deliverable_clicked: params.deliverableClicked ?? false,
        cross_references_clicked: params.crossReferencesClicked ?? 0,
      });
    },
  });
}

export function useContentReadAnalytics(contentId?: string) {
  return useQuery({
    queryKey: ["content-read-analytics", contentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_read_analytics")
        .select("*")
        .eq("content_id", contentId!);
      return data ?? [];
    },
    enabled: !!contentId,
  });
}

export function useStructuredDebates(contentId?: string) {
  return useQuery({
    queryKey: ["structured-debates", contentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("structured_debates")
        .select("*, debate_responses(*)")
        .eq("content_id", contentId!);
      return data ?? [];
    },
    enabled: !!contentId,
  });
}

export function useCreateDebate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contentId: string;
      topic: string;
      isFacultyModerated?: boolean;
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("structured_debates").insert({
        content_id: params.contentId,
        topic: params.topic,
        moderator_id: user.id,
        is_faculty_moderated: params.isFacultyModerated ?? false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Debate created" });
      queryClient.invalidateQueries({ queryKey: ["structured-debates"] });
    },
  });
}

export function useSubmitDebateResponse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      debateId: string;
      responseText: string;
      evidenceUrl?: string;
      projectReferenceId?: string;
    }) => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("debate_responses").insert({
        debate_id: params.debateId,
        author_id: user.id,
        response_text: params.responseText,
        evidence_url: params.evidenceUrl,
        project_reference_id: params.projectReferenceId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structured-debates"] });
    },
  });
}

export function useContentRankingTransparency() {
  return CONTENT_RANKING_TRANSPARENCY;
}
