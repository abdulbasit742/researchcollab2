import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Recommendation {
  id: string;
  recommender_id: string;
  recommended_user_id: string;
  context_type: string;
  context_id: string | null;
  content: string;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
  recommender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    university: string | null;
  };
}

// =====================================================
// RECOMMENDATIONS RECEIVED
// =====================================================

export function useReceivedRecommendations(userId?: string) {
  return useQuery({
    queryKey: ["receivedRecommendations", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("recommendations")
        .select(`
          *,
          recommender:profiles!recommendations_recommender_id_fkey(id, full_name, role, university)
        `)
        .eq("recommended_user_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as Recommendation[];
    },
    enabled: !!userId,
  });
}

export function usePendingRecommendations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["pendingRecommendations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("recommendations")
        .select(`
          *,
          recommender:profiles!recommendations_recommender_id_fkey(id, full_name, role, university)
        `)
        .eq("recommended_user_id", user.id)
        .eq("status", "submitted")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as Recommendation[];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// RECOMMENDATIONS GIVEN
// =====================================================

export function useGivenRecommendations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["givenRecommendations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("recommendations")
        .select(`
          *,
          recommended_user:profiles!recommendations_recommended_user_id_fkey(id, full_name, role, university)
        `)
        .eq("recommender_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// WRITE RECOMMENDATION
// =====================================================

export function useWriteRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recommendation: {
      recommended_user_id: string;
      content: string;
      context_type?: string;
      context_id?: string;
      visibility?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("recommendations")
        .insert({
          recommender_id: user.id,
          recommended_user_id: recommendation.recommended_user_id,
          content: recommendation.content,
          context_type: recommendation.context_type || "general",
          context_id: recommendation.context_id || null,
          visibility: recommendation.visibility || "public",
          status: "submitted",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["givenRecommendations", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["pendingRecommendations", vars.recommended_user_id] });
      toast.success("Recommendation submitted for approval");
    },
    onError: () => {
      toast.error("Failed to submit recommendation");
    },
  });
}

// =====================================================
// APPROVE / HIDE RECOMMENDATION
// =====================================================

export function useApproveRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recommendationId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("recommendations")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", recommendationId)
        .eq("recommended_user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRecommendations", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["receivedRecommendations", user?.id] });
      toast.success("Recommendation approved and now visible");
    },
    onError: () => {
      toast.error("Failed to approve recommendation");
    },
  });
}

export function useHideRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recommendationId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("recommendations")
        .update({ status: "hidden", updated_at: new Date().toISOString() })
        .eq("id", recommendationId)
        .eq("recommended_user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRecommendations", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["receivedRecommendations", user?.id] });
      toast.success("Recommendation hidden");
    },
    onError: () => {
      toast.error("Failed to hide recommendation");
    },
  });
}

// =====================================================
// RECOMMENDATION REQUESTS
// =====================================================

export function useRecommendationRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["recommendationRequests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("recommendation_requests")
        .select(`
          *,
          requester:profiles!recommendation_requests_requester_id_fkey(id, full_name, role, university)
        `)
        .eq("target_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useRequestRecommendation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ targetUserId, message }: { targetUserId: string; message?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("recommendation_requests")
        .insert({
          requester_id: user.id,
          target_user_id: targetUserId,
          message: message || null,
          status: "pending",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendationRequests"] });
      toast.success("Recommendation request sent");
    },
    onError: () => {
      toast.error("Failed to send request");
    },
  });
}
