/**
 * Hooks for Research Workflow & Collaboration modules:
 * - Milestone Tasks
 * - Research Artifacts
 * - Review Workflow
 * - Activity Intelligence
 * - Activity Feed
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============= Milestone Tasks =============

export function useMilestoneTasks(milestoneId?: string) {
  return useQuery({
    queryKey: ["milestone-tasks", milestoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestone_tasks")
        .select("*")
        .eq("milestone_id", milestoneId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!milestoneId,
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: {
      milestone_id: string;
      title: string;
      description?: string;
      assigned_to?: string;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("milestone_tasks")
        .insert({ ...task, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Log activity
      await supabase.from("task_activity_logs").insert({
        task_id: data.id,
        action_type: "created",
        performed_by: user!.id,
      });

      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["milestone-tasks", data.milestone_id] });
      toast({ title: "Task created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateTask() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, milestoneId, ...updates }: {
      id: string;
      milestoneId: string;
      status?: string;
      title?: string;
      description?: string;
      assigned_to?: string;
      due_date?: string;
    }) => {
      const { error } = await supabase
        .from("milestone_tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      // Log activity
      const actionType = updates.status === "completed" ? "completed" : "updated";
      await supabase.from("task_activity_logs").insert({
        task_id: id,
        action_type: actionType,
        performed_by: user!.id,
        metadata: updates,
      });

      return milestoneId;
    },
    onSuccess: (milestoneId) => {
      qc.invalidateQueries({ queryKey: ["milestone-tasks", milestoneId] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, milestoneId }: { id: string; milestoneId: string }) => {
      const { error } = await supabase
        .from("milestone_tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return milestoneId;
    },
    onSuccess: (milestoneId) => {
      qc.invalidateQueries({ queryKey: ["milestone-tasks", milestoneId] });
    },
  });
}

// ============= Research Artifacts =============

export function useProjectArtifacts(projectId?: string) {
  return useQuery({
    queryKey: ["project-artifacts", projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("research_artifacts") as any)
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useUploadArtifact() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (artifact: {
      project_id: string;
      milestone_id?: string;
      artifact_type: string;
      title: string;
      file_url?: string;
      file_size?: number;
      mime_type?: string;
    }) => {
      const { data, error } = await (supabase
        .from("research_artifacts") as any)
        .insert({ ...artifact, uploaded_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Log to activity feed
      await supabase.from("activity_feed").insert({
        entity_type: "artifact",
        entity_id: data.id,
        action: "uploaded",
        performed_by: user!.id,
        project_id: artifact.project_id,
        metadata: { title: artifact.title, type: artifact.artifact_type },
      });

      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["project-artifacts", data.project_id] });
      toast({ title: "Artifact uploaded" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useArtifactVersions(artifactId?: string) {
  return useQuery({
    queryKey: ["artifact-versions", artifactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artifact_versions")
        .select("*")
        .eq("artifact_id", artifactId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!artifactId,
  });
}

// ============= Review Workflow =============

export function useReviewRequests(projectId?: string) {
  return useQuery({
    queryKey: ["review-requests", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useMyReviewRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-review-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("reviewer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateReview() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: {
      milestone_id: string;
      project_id: string;
      reviewer_id: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("review_requests")
        .insert({ ...review, requested_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      // Log to activity feed
      await supabase.from("activity_feed").insert({
        entity_type: "review",
        entity_id: data.id,
        action: "requested",
        performed_by: user!.id,
        project_id: review.project_id,
      });

      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["review-requests", data.project_id] });
      toast({ title: "Review requested" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateReviewStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, status }: { id: string; projectId: string; status: string }) => {
      const { error } = await supabase
        .from("review_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      await supabase.from("activity_feed").insert({
        entity_type: "review",
        entity_id: id,
        action: status,
        performed_by: user!.id,
        project_id: projectId,
      });

      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["review-requests", projectId] });
      qc.invalidateQueries({ queryKey: ["my-review-requests"] });
    },
  });
}

export function useSubmitFeedback() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: {
      review_request_id: string;
      feedback_text: string;
      rating_score: number;
    }) => {
      const { data, error } = await supabase
        .from("review_feedback")
        .insert({ ...feedback, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-requests"] });
      toast({ title: "Feedback submitted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useReviewFeedback(reviewId?: string) {
  return useQuery({
    queryKey: ["review-feedback", reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_feedback")
        .select("*")
        .eq("review_request_id", reviewId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!reviewId,
  });
}

// ============= Activity Intelligence =============

export function useProjectActivitySummary(projectId?: string) {
  return useQuery({
    queryKey: ["project-activity-summary", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_activity_summary")
        .select("*")
        .eq("project_id", projectId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useComputeActivityScore() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data, error } = await supabase.functions.invoke("research-workflow-engine", {
        body: { action: "compute_activity_score", project_id: projectId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, projectId) => {
      qc.invalidateQueries({ queryKey: ["project-activity-summary", projectId] });
    },
  });
}

// ============= Activity Feed =============

export function useActivityFeed(projectId?: string) {
  return useQuery({
    queryKey: ["activity-feed", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
}

export function useGlobalActivityFeed() {
  return useQuery({
    queryKey: ["global-activity-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}
