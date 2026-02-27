/**
 * useStructuredReview — Hooks for Structured Debate & Peer Review Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ReviewCycle {
  id: string;
  workspace_id: string;
  initiated_by: string;
  title: string;
  review_type: string;
  status: string;
  created_at: string;
  closed_at: string | null;
}

export interface ReviewComment {
  id: string;
  review_cycle_id: string;
  reviewer_id: string;
  claim_id: string | null;
  section_reference: string | null;
  comment_text: string;
  comment_type: string;
  severity_level: string;
  ai_analysis: Record<string, any> | null;
  is_resolved: boolean;
  created_at: string;
}

export interface ReviewOutcome {
  id: string;
  review_cycle_id: string;
  decision: string;
  summary: string;
  weighted_score: number | null;
  institutional_seal: boolean;
  created_at: string;
}

export interface DebateThread {
  id: string;
  review_cycle_id: string;
  claim_id: string | null;
  initiated_by: string;
  title: string;
  status: string;
  moderator_summary: string | null;
  created_at: string;
}

export interface DebateEntry {
  id: string;
  thread_id: string;
  author_id: string;
  entry_type: string;
  content: string;
  cited_claim_ids: string[];
  created_at: string;
}

export function useReviewCycles(workspaceId?: string) {
  return useQuery({
    queryKey: ["review-cycles", workspaceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("peer_review_cycles")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReviewCycle[];
    },
    enabled: !!workspaceId,
  });
}

export function useReviewComments(cycleId?: string) {
  return useQuery({
    queryKey: ["review-comments", cycleId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("review_comments")
        .select("*")
        .eq("review_cycle_id", cycleId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReviewComment[];
    },
    enabled: !!cycleId,
  });
}

export function useReviewOutcome(cycleId?: string) {
  return useQuery({
    queryKey: ["review-outcome", cycleId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("review_outcomes")
        .select("*")
        .eq("review_cycle_id", cycleId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ReviewOutcome | null;
    },
    enabled: !!cycleId,
  });
}

export function useDebateThreads(cycleId?: string) {
  return useQuery({
    queryKey: ["debate-threads", cycleId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("debate_threads")
        .select("*")
        .eq("review_cycle_id", cycleId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DebateThread[];
    },
    enabled: !!cycleId,
  });
}

export function useDebateEntries(threadId?: string) {
  return useQuery({
    queryKey: ["debate-entries", threadId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("debate_entries")
        .select("*")
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DebateEntry[];
    },
    enabled: !!threadId,
  });
}

export function useCreateReviewCycle() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { workspaceId: string; title: string; reviewType?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("peer_review_cycles")
        .insert({
          workspace_id: params.workspaceId,
          initiated_by: user.id,
          title: params.title,
          review_type: params.reviewType || "open",
        })
        .select().single();
      if (error) throw error;
      return data as ReviewCycle;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["review-cycles", vars.workspaceId] });
      toast({ title: "Review cycle created" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useAddReviewComment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      cycleId: string;
      claimId?: string;
      sectionRef?: string;
      text: string;
      type?: string;
      severity?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("review_comments")
        .insert({
          review_cycle_id: params.cycleId,
          reviewer_id: user.id,
          claim_id: params.claimId || null,
          section_reference: params.sectionRef || null,
          comment_text: params.text,
          comment_type: params.type || "evidence",
          severity_level: params.severity || "medium",
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["review-comments", vars.cycleId] });
      toast({ title: "Comment added" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useAIMethodologyReview() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { workspaceId: string; reviewCycleId?: string; claimIds?: string[] }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: {
          action: "ai_methodology_review",
          workspace_id: params.workspaceId,
          review_cycle_id: params.reviewCycleId,
          claim_ids: params.claimIds,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_d, vars) => {
      if (vars.reviewCycleId) qc.invalidateQueries({ queryKey: ["review-comments", vars.reviewCycleId] });
      toast({ title: "AI methodology review complete" });
    },
    onError: (err: Error) => {
      toast({ title: "AI review failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useGenerateReviewOutcome() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { reviewCycleId: string; workspaceId: string }) => {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "generate_review_outcome", review_cycle_id: params.reviewCycleId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["review-cycles", vars.workspaceId] });
      qc.invalidateQueries({ queryKey: ["review-outcome", vars.reviewCycleId] });
      toast({ title: "Review outcome generated" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useAddDebateEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { threadId: string; entryType?: string; content: string; citedClaimIds?: string[] }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("debate_entries")
        .insert({
          thread_id: params.threadId,
          author_id: user.id,
          entry_type: params.entryType || "argument",
          content: params.content,
          cited_claim_ids: params.citedClaimIds || [],
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["debate-entries", vars.threadId] });
    },
  });
}

export function useCreateDebateThread() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { cycleId: string; title: string; claimId?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("debate_threads")
        .insert({
          review_cycle_id: params.cycleId,
          initiated_by: user.id,
          title: params.title,
          claim_id: params.claimId || null,
        })
        .select().single();
      if (error) throw error;
      return data as DebateThread;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["debate-threads", vars.cycleId] });
      toast({ title: "Debate thread created" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });
}
