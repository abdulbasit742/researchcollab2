/**
 * usePeerReviews — Peer review submission, listing, and scoring for Knowledge Objects.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PeerReviewRequest {
  id: string;
  requester_id: string;
  target_type: string;
  target_id: string;
  review_type: string;
  status: string;
  instructions: string | null;
  created_at: string;
  requester_name?: string;
  target_title?: string;
}

export interface PeerReview {
  id: string;
  review_request_id: string;
  reviewer_id: string;
  overall_score: number | null;
  summary_feedback: string | null;
  is_anonymous: boolean;
  visibility: string;
  created_at: string;
  reviewer_name?: string;
}

export function usePeerReviewRequests(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["peerReviewRequests", status, user?.id],
    queryFn: async (): Promise<PeerReviewRequest[]> => {
      if (!user) return [];

      let query = supabase
        .from("peer_review_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with requester names and target titles
      const enriched = await Promise.all(
        (data || []).map(async (req: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", req.requester_id)
            .maybeSingle();

          let targetTitle = "";
          if (req.target_type === "knowledge_object") {
            const { data: ko } = await supabase
              .from("knowledge_objects")
              .select("title")
              .eq("id", req.target_id)
              .maybeSingle();
            targetTitle = ko?.title || "Unknown";
          }

          return {
            ...req,
            requester_name: profile?.full_name || "Unknown",
            target_title: targetTitle,
          };
        })
      );

      return enriched;
    },
    enabled: !!user,
  });
}

export function useMyPeerReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["myPeerReviews", user?.id],
    queryFn: async (): Promise<PeerReview[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("peer_reviews")
        .select("*")
        .eq("reviewer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PeerReview[];
    },
    enabled: !!user,
  });
}

export function useReviewsForRequest(requestId?: string) {
  return useQuery({
    queryKey: ["reviewsForRequest", requestId],
    queryFn: async (): Promise<PeerReview[]> => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from("peer_reviews")
        .select("*")
        .eq("review_request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with reviewer names (respecting anonymity)
      const enriched = await Promise.all(
        (data || []).map(async (review: any) => {
          if (review.is_anonymous) {
            return { ...review, reviewer_name: "Anonymous Reviewer" };
          }
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", review.reviewer_id)
            .maybeSingle();
          return { ...review, reviewer_name: profile?.full_name || "Unknown" };
        })
      );

      return enriched;
    },
    enabled: !!requestId,
  });
}

export function useCreateReviewRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      targetId: string;
      targetType: string;
      reviewType?: string;
      instructions?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("peer_review_requests")
        .insert({
          requester_id: user.id,
          target_id: params.targetId,
          target_type: params.targetType,
          review_type: params.reviewType || "standard",
          instructions: params.instructions || null,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["peerReviewRequests"] });
      toast.success("Review request created");
    },
    onError: (err: Error) => {
      toast.error(`Failed: ${err.message}`);
    },
  });
}

export function useSubmitReview() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      reviewRequestId: string;
      overallScore: number;
      summaryFeedback: string;
      isAnonymous?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      if (params.overallScore < 1 || params.overallScore > 10) {
        throw new Error("Score must be between 1 and 10");
      }

      const { data, error } = await supabase
        .from("peer_reviews")
        .insert({
          review_request_id: params.reviewRequestId,
          reviewer_id: user.id,
          overall_score: params.overallScore,
          summary_feedback: params.summaryFeedback.trim(),
          is_anonymous: params.isAnonymous ?? false,
          visibility: "public",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["peerReviewRequests"] });
      qc.invalidateQueries({ queryKey: ["reviewsForRequest"] });
      qc.invalidateQueries({ queryKey: ["myPeerReviews"] });
      toast.success("Review submitted");
    },
    onError: (err: Error) => {
      toast.error(`Failed: ${err.message}`);
    },
  });
}
