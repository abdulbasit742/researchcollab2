import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OutcomeFeedItem {
  id: string;
  item_type: string;
  actor_id: string | null;
  actor_type: string;
  target_id: string | null;
  target_type: string | null;
  title: string;
  summary: string | null;
  proof_reference: unknown;
  visibility: string;
  relevance_tags: string[];
  is_verified: boolean;
  engagement_disabled: boolean;
  created_at: string;
  // Joined data
  actor_name?: string;
}

export interface WorkConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  connection_type: string;
  project_reference: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  // Joined data
  connected_user_name?: string;
}

export interface ProfileProofMetrics {
  id: string;
  user_id: string;
  projects_completed: number;
  escrow_success_rate: number;
  grants_won: number;
  total_earnings: number;
  earnings_visibility: string;
  peer_reviews_received: number;
  institutions_worked_with: string[];
  verification_count: number;
  dispute_loss_count: number;
  last_activity_at: string | null;
  computed_at: string;
}

export function useOutcomeFeed() {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<OutcomeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchFeed = useCallback(async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("outcome_feed_items")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // Enrich with actor names
      const enrichedItems = await Promise.all(
        (data || []).map(async (item) => {
          if (item.actor_id && item.actor_type === "user") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", item.actor_id)
              .maybeSingle();
            return { ...item, actor_name: profile?.full_name || "Unknown" };
          }
          if (item.actor_id && item.actor_type === "organization") {
            const { data: org } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", item.actor_id)
              .maybeSingle();
            return { ...item, actor_name: org?.name || "Unknown Organization" };
          }
          return item;
        })
      );

      if (pageNum === 0) {
        setFeedItems(enrichedItems);
      } else {
        setFeedItems((prev) => [...prev, ...enrichedItems]);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching outcome feed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(0);
  }, [fetchFeed]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  return {
    feedItems,
    loading,
    hasMore,
    loadMore,
    refetch: () => {
      setPage(0);
      fetchFeed(0);
    },
  };
}

export function useWorkConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WorkConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("work_connections")
        .select("*")
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with names
      const enriched = await Promise.all(
        (data || []).map(async (conn) => {
          const otherId = conn.user_id === user.id ? conn.connected_user_id : conn.user_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherId)
            .maybeSingle();
          return { ...conn, connected_user_name: profile?.full_name || "Unknown" };
        })
      );

      setConnections(enriched);
    } catch (error) {
      console.error("Error fetching work connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionsByType = (type: string) => connections.filter((c) => c.connection_type === type);

  const getVerifiedConnections = () => connections.filter((c) => c.verified);

  return {
    connections,
    loading,
    refetch: fetchConnections,
    getConnectionsByType,
    getVerifiedConnections,
  };
}

export function useProfileProofMetrics(userId?: string) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProfileProofMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchMetrics();
    }
  }, [targetUserId]);

  const fetchMetrics = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profile_proof_metrics")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching profile metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const recomputeMetrics = async () => {
    if (!targetUserId) return;
    try {
      await supabase.rpc("compute_profile_proof_metrics", { p_user_id: targetUserId });
      fetchMetrics();
    } catch (error) {
      console.error("Error recomputing metrics:", error);
    }
  };

  return {
    metrics,
    loading,
    refetch: fetchMetrics,
    recomputeMetrics,
  };
}
