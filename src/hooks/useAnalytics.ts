import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileAnalytics {
  profile_views: number;
  search_appearances: number;
  connection_requests_received: number;
  endorsements_received: number;
  publication_views: number;
  post_impressions: number;
}

export interface AnalyticsSnapshot {
  metric_key: string;
  metric_value: number;
  period: string;
  period_start: string;
}

export function useUserAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [trends, setTrends] = useState<AnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setAnalytics(null);
      setTrends([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile analytics
      const { data: profileData, error: profileError } = await supabase
        .from("profile_analytics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      setAnalytics(profileData || {
        profile_views: 0,
        search_appearances: 0,
        connection_requests_received: 0,
        endorsements_received: 0,
        publication_views: 0,
        post_impressions: 0,
      });

      // Fetch trend data
      const { data: trendData, error: trendError } = await supabase
        .from("analytics_snapshots")
        .select("metric_key, metric_value, period, period_start")
        .eq("scope_type", "user")
        .eq("scope_id", user.id)
        .order("period_start", { ascending: false })
        .limit(30);

      if (trendError) throw trendError;
      setTrends((trendData || []) as AnalyticsSnapshot[]);
    } catch (err) {
      console.error("Error fetching user analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    trends,
    loading,
    refetch: fetchAnalytics,
  };
}

export function useOrgAnalytics(organizationId: string | undefined) {
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [trends, setTrends] = useState<AnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!organizationId) {
      setAnalytics({});
      setTrends([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch org snapshots
      const { data, error } = await supabase
        .from("analytics_snapshots")
        .select("metric_key, metric_value, period, period_start")
        .eq("scope_type", "organization")
        .eq("scope_id", organizationId)
        .order("period_start", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Aggregate latest values per metric
      const latestMetrics: Record<string, number> = {};
      ((data || []) as AnalyticsSnapshot[]).forEach((snapshot) => {
        if (!(snapshot.metric_key in latestMetrics)) {
          latestMetrics[snapshot.metric_key] = snapshot.metric_value;
        }
      });

      setAnalytics(latestMetrics);
      setTrends((data || []) as AnalyticsSnapshot[]);
    } catch (err) {
      console.error("Error fetching org analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    trends,
    loading,
    refetch: fetchAnalytics,
  };
}

export function useAdminAnalytics() {
  const [platformMetrics, setPlatformMetrics] = useState<Record<string, number>>({});
  const [trends, setTrends] = useState<AnalyticsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      // Fetch platform-wide snapshots
      const { data, error } = await supabase
        .from("analytics_snapshots")
        .select("metric_key, metric_value, period, period_start")
        .eq("scope_type", "platform")
        .is("scope_id", null)
        .order("period_start", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Aggregate latest values
      const latestMetrics: Record<string, number> = {};
      ((data || []) as AnalyticsSnapshot[]).forEach((snapshot) => {
        if (!(snapshot.metric_key in latestMetrics)) {
          latestMetrics[snapshot.metric_key] = snapshot.metric_value;
        }
      });

      setPlatformMetrics(latestMetrics);
      setTrends((data || []) as AnalyticsSnapshot[]);
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    platformMetrics,
    trends,
    loading,
    refetch: fetchAnalytics,
  };
}

export function useTrackEvent() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (
    eventType: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await supabase.from("analytics_events").insert({
        user_id: user?.id || null,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId || null,
        metadata: metadata || {},
        session_id: sessionStorage.getItem("session_id") || null,
      });
    } catch (err) {
      console.error("Error tracking event:", err);
    }
  }, [user]);

  return { trackEvent };
}
