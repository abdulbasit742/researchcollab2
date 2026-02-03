import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface FeatureFlag {
  id: string;
  feature_key: string;
  description: string | null;
  enabled: boolean;
  scope: string;
  conditions: Json;
  is_kill_switch: boolean | null;
  priority: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagAudit {
  id: string;
  feature_key: string;
  action: string;
  previous_state: Json | null;
  new_state: Json | null;
  admin_id: string | null;
  reason: string | null;
  created_at: string;
}

// Cache for feature flags to avoid repeated DB hits
const flagCache = new Map<string, { enabled: boolean; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function useFeatureFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [audits, setAudits] = useState<FeatureFlagAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("priority", { ascending: false });

    if (!error && data) {
      setFlags(data);
      // Update cache
      data.forEach((flag) => {
        flagCache.set(flag.feature_key, {
          enabled: flag.enabled,
          timestamp: Date.now(),
        });
      });
    }
    setLoading(false);
  }, []);

  const fetchAudits = useCallback(async (featureKey?: string) => {
    let query = supabase
      .from("feature_flag_audits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (featureKey) {
      query = query.eq("feature_key", featureKey);
    }

    const { data, error } = await query;
    if (!error && data) {
      setAudits(data);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
    fetchAudits();
  }, [fetchFlags, fetchAudits]);

  // Check if a feature is enabled (with caching)
  const isEnabled = useCallback(
    async (featureKey: string): Promise<boolean> => {
      // Check cache first
      const cached = flagCache.get(featureKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.enabled;
      }

      // Use the database function for accurate evaluation
      const { data, error } = await supabase.rpc("is_feature_enabled", {
        p_feature_key: featureKey,
        p_user_id: user?.id || null,
      });

      if (error) {
        console.error("Error checking feature flag:", error);
        return false; // Safe default
      }

      // Update cache
      flagCache.set(featureKey, {
        enabled: data as boolean,
        timestamp: Date.now(),
      });

      return data as boolean;
    },
    [user?.id]
  );

  // Synchronous check from local state (use for non-critical UI decisions)
  const isEnabledSync = useCallback(
    (featureKey: string): boolean => {
      const flag = flags.find((f) => f.feature_key === featureKey);
      if (!flag) return false;
      if (flag.is_kill_switch && !flag.enabled) return false;
      return flag.enabled;
    },
    [flags]
  );

  // Toggle a feature flag (admin only)
  const toggleFlag = useCallback(
    async (featureKey: string, enabled: boolean) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("feature_key", featureKey);

      if (error) {
        throw error;
      }

      // Invalidate cache
      flagCache.delete(featureKey);

      // Refresh flags
      await fetchFlags();
      await fetchAudits(featureKey);
    },
    [fetchFlags, fetchAudits]
  );

  // Create a new feature flag (admin only)
  const createFlag = useCallback(
    async (flag: {
      feature_key: string;
      description?: string;
      enabled?: boolean;
      scope?: string;
      is_kill_switch?: boolean;
      priority?: number;
      conditions?: Json;
    }) => {
      const { error } = await supabase.from("feature_flags").insert({
        feature_key: flag.feature_key,
        description: flag.description || null,
        enabled: flag.enabled ?? false,
        scope: flag.scope || "global",
        is_kill_switch: flag.is_kill_switch ?? false,
        priority: flag.priority ?? 0,
        conditions: flag.conditions ?? {},
        created_by: user?.id || null,
      });

      if (error) throw error;
      await fetchFlags();
    },
    [user?.id, fetchFlags]
  );

  // Update flag details (admin only)
  const updateFlag = useCallback(
    async (featureKey: string, updates: {
      description?: string;
      enabled?: boolean;
      scope?: string;
      is_kill_switch?: boolean;
      priority?: number;
      conditions?: Json;
    }) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("feature_key", featureKey);

      if (error) throw error;
      flagCache.delete(featureKey);
      await fetchFlags();
    },
    [fetchFlags]
  );

  // Delete a feature flag (admin only)
  const deleteFlag = useCallback(
    async (featureKey: string) => {
      const { error } = await supabase
        .from("feature_flags")
        .delete()
        .eq("feature_key", featureKey);

      if (error) throw error;
      flagCache.delete(featureKey);
      await fetchFlags();
    },
    [fetchFlags]
  );

  // Emergency: Disable all non-critical flags
  const emergencyDisableAll = useCallback(async () => {
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .neq("feature_key", "admin_actions"); // Keep admin actions enabled

    if (error) throw error;
    flagCache.clear();
    await fetchFlags();
  }, [fetchFlags]);

  // Get kill-switches only
  const killSwitches = flags.filter((f) => f.is_kill_switch);

  return {
    flags,
    killSwitches,
    audits,
    loading,
    isEnabled,
    isEnabledSync,
    toggleFlag,
    createFlag,
    updateFlag,
    deleteFlag,
    emergencyDisableAll,
    refresh: fetchFlags,
    fetchAudits,
  };
}
