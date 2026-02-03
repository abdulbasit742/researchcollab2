import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// FOLLOW SYSTEM
// =====================================================

export function useFollowers(userId?: string) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          id,
          created_at,
          follower:profiles!user_follows_follower_id_fkey(id, full_name, first_name, last_name, role, university)
        `)
        .eq("following_id", userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId?: string) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          id,
          created_at,
          following:profiles!user_follows_following_id_fkey(id, full_name, first_name, last_name, role, university)
        `)
        .eq("follower_id", userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useIsFollowing(targetUserId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["isFollowing", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return false;
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFollowUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_follows")
        .insert({ follower_id: user.id, following_id: targetUserId });
      
      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      toast.success("Now following");
    },
    onError: () => {
      toast.error("Failed to follow user");
    },
  });
}

export function useUnfollowUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      
      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      toast.success("Unfollowed");
    },
    onError: () => {
      toast.error("Failed to unfollow user");
    },
  });
}

// =====================================================
// CONNECTION SYSTEM
// =====================================================

export function useConnections(userId?: string) {
  return useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_connections")
        .select(`
          id,
          connected_at,
          connection_strength,
          user_a:profiles!user_connections_user_a_id_fkey(id, full_name, first_name, last_name, role, university),
          user_b:profiles!user_connections_user_b_id_fkey(id, full_name, first_name, last_name, role, university)
        `)
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);
      
      if (error) throw error;
      
      // Return the other user in each connection
      return (data || []).map(conn => ({
        ...conn,
        connectedUser: conn.user_a?.id === userId ? conn.user_b : conn.user_a,
      }));
    },
    enabled: !!userId,
  });
}

export function useConnectionStatus(targetUserId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["connectionStatus", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return { status: "none" as const };
      
      // Normalize the order for the query
      const [userA, userB] = user.id < targetUserId 
        ? [user.id, targetUserId] 
        : [targetUserId, user.id];
      
      // Check if already connected
      const { data: connection } = await supabase
        .from("user_connections")
        .select("id")
        .eq("user_a_id", userA)
        .eq("user_b_id", userB)
        .maybeSingle();
      
      if (connection) return { status: "connected" as const };
      
      // Check for pending request I sent
      const { data: sentRequest } = await supabase
        .from("connection_requests")
        .select("id, status")
        .eq("requester_id", user.id)
        .eq("recipient_id", targetUserId)
        .eq("status", "pending")
        .maybeSingle();
      
      if (sentRequest) return { status: "pending_sent" as const, requestId: sentRequest.id };
      
      // Check for pending request I received
      const { data: receivedRequest } = await supabase
        .from("connection_requests")
        .select("id, status")
        .eq("requester_id", targetUserId)
        .eq("recipient_id", user.id)
        .eq("status", "pending")
        .maybeSingle();
      
      if (receivedRequest) return { status: "pending_received" as const, requestId: receivedRequest.id };
      
      return { status: "none" as const };
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
}

export function useSendConnectionRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("connection_requests")
        .insert({ requester_id: user.id, recipient_id: targetUserId, status: "pending" });
      
      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", user?.id, targetUserId] });
      toast.success("Connection request sent");
    },
    onError: () => {
      toast.error("Failed to send connection request");
    },
  });
}

export function useAcceptConnectionRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .eq("recipient_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      toast.success("Connection accepted");
    },
    onError: () => {
      toast.error("Failed to accept connection request");
    },
  });
}

export function useDeclineConnectionRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "declined" })
        .eq("id", requestId)
        .eq("recipient_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      toast.success("Connection request declined");
    },
    onError: () => {
      toast.error("Failed to decline request");
    },
  });
}

export function usePendingConnectionRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["pendingRequests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("connection_requests")
        .select(`
          id,
          created_at,
          requester:profiles!connection_requests_requester_id_fkey(id, full_name, first_name, last_name, role, university)
        `)
        .eq("recipient_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// NETWORK SUGGESTIONS
// =====================================================

export function useNetworkSuggestions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["networkSuggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("network_suggestions")
        .select(`
          id,
          reason,
          score,
          suggested_user:profiles!network_suggestions_suggested_user_id_fkey(id, full_name, first_name, last_name, role, university, bio)
        `)
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("score", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useDismissSuggestion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from("network_suggestions")
        .update({ is_dismissed: true })
        .eq("id", suggestionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networkSuggestions", user?.id] });
    },
  });
}

// =====================================================
// CONNECTION DEGREE
// =====================================================

export function useConnectionDegree(targetUserId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["connectionDegree", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return 0;
      
      const { data, error } = await supabase
        .from("connection_degrees")
        .select("degree")
        .eq("user_id", user.id)
        .eq("target_user_id", targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.degree || 0;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
}

export function useMutualConnectionsCount(targetUserId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["mutualConnections", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return 0;
      
      const { data, error } = await supabase
        .rpc("get_mutual_connections_count", { user_a: user.id, user_b: targetUserId });
      
      if (error) return 0;
      return data || 0;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
}

// =====================================================
// PROFILE VIEWS
// =====================================================

export function useRecordProfileView() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (viewedUserId: string) => {
      // Don't record self-views
      if (user?.id === viewedUserId) return;
      
      const { error } = await supabase
        .from("profile_views")
        .insert({ viewer_id: user?.id || null, viewed_user_id: viewedUserId });
      
      if (error && !error.message.includes("duplicate")) throw error;
    },
  });
}

export function useProfileViews() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["profileViews", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("profile_views")
        .select(`
          id,
          created_at,
          viewer:profiles!profile_views_viewer_id_fkey(id, full_name, first_name, last_name, role)
        `)
        .eq("viewed_user_id", user.id)
        .not("viewer_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
