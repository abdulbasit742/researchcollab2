import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PeerReviewRequest {
  id: string;
  requester_id: string;
  target_type: "research_timeline" | "research_entry" | "publication";
  target_id: string;
  review_type: "private" | "invited" | "open";
  instructions: string | null;
  status: "open" | "in_review" | "closed";
  created_at: string;
}

interface PeerReview {
  id: string;
  review_request_id: string;
  reviewer_id: string;
  overall_score: number | null;
  summary_feedback: string | null;
  visibility: "private_to_author" | "public";
  is_anonymous: boolean;
  created_at: string;
}

interface PeerReviewSection {
  id: string;
  peer_review_id: string;
  section_type: "clarity" | "methodology" | "originality" | "ethics" | "references" | "contribution";
  score: number | null;
  feedback_text: string | null;
  created_at: string;
}

interface AIReviewAssist {
  id: string;
  target_type: string;
  target_id: string;
  ai_feedback_summary: string | null;
  strengths_detected: Record<string, unknown> | null;
  weaknesses_detected: Record<string, unknown> | null;
  suggestions: Record<string, unknown> | null;
  confidence_score: number | null;
  created_at: string;
}

interface ReviewerProfile {
  user_id: string;
  reviews_given: number;
  avg_review_quality_score: number | null;
  total_review_words: number;
  specialization_areas: string[] | null;
  last_review_at: string | null;
  updated_at: string;
}

export function usePeerReviewRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PeerReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("peer_review_requests")
      .select("*")
      .or(`requester_id.eq.${user.id},review_type.eq.open`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching review requests:", error);
    } else {
      setRequests(data as PeerReviewRequest[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (request: {
    target_type: PeerReviewRequest["target_type"];
    target_id: string;
    review_type?: PeerReviewRequest["review_type"];
    instructions?: string;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("peer_review_requests")
      .insert({ ...request, requester_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create review request");
      return { success: false, error };
    }

    toast.success("Review request created");
    await fetchRequests();
    return { success: true, data };
  };

  const updateRequestStatus = async (id: string, status: PeerReviewRequest["status"]) => {
    const { error } = await supabase
      .from("peer_review_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update request");
      return { success: false, error };
    }

    await fetchRequests();
    return { success: true };
  };

  return {
    requests,
    loading,
    fetchRequests,
    createRequest,
    updateRequestStatus,
  };
}

export function usePeerReviews(requestId: string | null) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("peer_reviews")
      .select("*")
      .eq("review_request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data as PeerReview[]);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (review: {
    overall_score?: number;
    summary_feedback?: string;
    visibility?: PeerReview["visibility"];
    is_anonymous?: boolean;
    sections?: Array<{
      section_type: PeerReviewSection["section_type"];
      score?: number;
      feedback_text?: string;
    }>;
  }) => {
    if (!user?.id || !requestId) return { success: false, error: "Invalid state" };

    const { data, error } = await supabase
      .from("peer_reviews")
      .insert({
        review_request_id: requestId,
        reviewer_id: user.id,
        overall_score: review.overall_score,
        summary_feedback: review.summary_feedback,
        visibility: review.visibility || "private_to_author",
        is_anonymous: review.is_anonymous || false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit review");
      return { success: false, error };
    }

    // Add review sections if provided
    if (review.sections && review.sections.length > 0) {
      const sections = review.sections.map((s) => ({
        peer_review_id: data.id,
        section_type: s.section_type,
        score: s.score,
        feedback_text: s.feedback_text,
      }));

      await supabase.from("peer_review_sections").insert(sections);
    }

    toast.success("Review submitted successfully");
    await fetchReviews();
    return { success: true, data };
  };

  return {
    reviews,
    loading,
    fetchReviews,
    submitReview,
  };
}

export function useReviewSections(reviewId: string | null) {
  const [sections, setSections] = useState<PeerReviewSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    if (!reviewId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("peer_review_sections")
      .select("*")
      .eq("peer_review_id", reviewId);

    if (error) {
      console.error("Error fetching sections:", error);
    } else {
      setSections(data as PeerReviewSection[]);
    }
    setLoading(false);
  }, [reviewId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    fetchSections,
  };
}

export function useAIReviewAssist() {
  const [aiAssist, setAiAssist] = useState<AIReviewAssist | null>(null);
  const [loading, setLoading] = useState(false);

  const getAIAssist = async (targetType: string, targetId: string) => {
    setLoading(true);

    // Check for existing AI assist
    const { data: existing, error: fetchError } = await supabase
      .from("peer_review_ai_assists")
      .select("*")
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setAiAssist(existing as AIReviewAssist);
      setLoading(false);
      return { success: true, data: existing };
    }

    // In production, this would call an AI edge function
    // For now, we create a placeholder
    const { data, error } = await supabase
      .from("peer_review_ai_assists")
      .insert({
        target_type: targetType,
        target_id: targetId,
        ai_feedback_summary: "AI analysis pending...",
        confidence_score: 0.0,
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      return { success: false, error };
    }

    setAiAssist(data as AIReviewAssist);
    setLoading(false);
    return { success: true, data };
  };

  return {
    aiAssist,
    loading,
    getAIAssist,
  };
}

export function useReviewerProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ReviewerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reviewer_profiles")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching reviewer profile:", error);
    } else {
      setProfile(data as ReviewerProfile | null);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    fetchProfile,
  };
}
