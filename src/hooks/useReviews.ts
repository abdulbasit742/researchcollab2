import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ProjectReview {
  id: string;
  offer_id: string;
  reviewer_id: string;
  reviewee_id: string;
  overall_rating: number;
  communication_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  comment: string | null;
  is_visible: boolean;
  visibility_unlocked_at: string | null;
  moderation_status: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total_reviews: number;
  avg_overall: number;
  avg_communication: number;
  avg_quality: number;
  avg_timeliness: number;
}

export interface ReviewUnlockQueue {
  id: string;
  offer_id: string;
  reviewer_a_id: string;
  reviewer_b_id: string;
  review_a_submitted: boolean;
  review_b_submitted: boolean;
  unlock_deadline: string;
  unlocked_at: string | null;
  created_at: string;
}

export function useReviews(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetUserId) {
      fetchReviews();
    }
  }, [targetUserId]);

  const fetchReviews = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch visible reviews for user
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("project_reviews")
        .select("*")
        .eq("reviewee_id", targetUserId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as ProjectReview[]);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc("get_user_review_stats", { p_user_id: targetUserId });

      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0] as ReviewStats);
      }

    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    stats,
    loading,
    error,
    refetch: fetchReviews,
  };
}

export function useSubmitReview() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async (
    offerId: string,
    ratings: {
      overall: number;
      communication: number;
      quality: number;
      timeliness: number;
    },
    comment?: string
  ) => {
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .rpc("submit_review", {
          p_offer_id: offerId,
          p_overall_rating: ratings.overall,
          p_communication_rating: ratings.communication,
          p_quality_rating: ratings.quality,
          p_timeliness_rating: ratings.timeliness,
          p_comment: comment || null,
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted. It will be visible once both parties have reviewed or after 7 days.",
      });

      return { success: true, reviewId: data };
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitReview,
    submitting,
  };
}

export function usePendingReviews() {
  const { user } = useAuth();
  const [pendingOffers, setPendingOffers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPendingReviews();
    }
  }, [user]);

  const fetchPendingReviews = async () => {
    if (!user) return;

    try {
      // Get unlock queues where user hasn't submitted yet
      const { data, error } = await supabase
        .from("review_unlock_queue")
        .select("*")
        .or(`reviewer_a_id.eq.${user.id},reviewer_b_id.eq.${user.id}`)
        .is("unlocked_at", null);

      if (error) throw error;

      const pending = (data as ReviewUnlockQueue[])
        .filter(queue => {
          if (queue.reviewer_a_id === user.id && !queue.review_a_submitted) return true;
          if (queue.reviewer_b_id === user.id && !queue.review_b_submitted) return true;
          return false;
        })
        .map(queue => queue.offer_id);

      setPendingOffers(pending);
    } catch (err) {
      console.error("Error fetching pending reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    pendingOffers,
    loading,
    refetch: fetchPendingReviews,
  };
}
