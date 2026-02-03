import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for accessibility & inclusion
export interface AccessibilityPreferences {
  user_id: string;
  preferred_contrast: "standard" | "high" | "inverted";
  text_scaling: number;
  reduced_motion: boolean;
  screen_reader_mode: boolean;
  keyboard_navigation_enhanced: boolean;
  audio_descriptions_enabled: boolean;
  updated_at: string;
}

export interface ConnectivityProfile {
  user_id: string;
  avg_bandwidth_kbps: number | null;
  offline_mode_enabled: boolean;
  low_data_mode: boolean;
  preferred_media_quality: "auto" | "low" | "medium" | "high";
  last_detected_at: string;
}

export interface LanguageSupportProfile {
  user_id: string;
  primary_language: string;
  secondary_languages: string[];
  translation_assist_enabled: boolean;
  preferred_academic_language: string | null;
  updated_at: string;
}

export interface EquityAdjustmentRule {
  id: string;
  rule_name: string;
  rule_type: "funding_access" | "discovery_weighting" | "review_visibility" | "resource_allocation" | "deadline_extension";
  target_group: "low_resource_institutions" | "early_career" | "underrepresented_regions" | "accessibility_needs" | "language_minority";
  adjustment_logic: Record<string, unknown>;
  adjustment_bounds: Record<string, unknown>;
  is_active: boolean;
  approved_by: string | null;
  created_at: string;
}

export interface EquityMetricsSnapshot {
  id: string;
  scope_type: "platform" | "institution" | "region" | "domain";
  scope_id: string | null;
  participation_distribution: Record<string, unknown>;
  funding_access_stats: Record<string, unknown>;
  review_visibility_stats: Record<string, unknown>;
  inclusion_indicators: Record<string, unknown>;
  computed_at: string;
}

export function useAccessibility() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AccessibilityPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's accessibility preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accessibility_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      setPreferences(data as AccessibilityPreferences | null);
      return data as AccessibilityPreferences | null;
    } catch (err) {
      console.error("Error fetching accessibility preferences:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save accessibility preferences
  const savePreferences = useCallback(async (
    updates: Partial<Omit<AccessibilityPreferences, "user_id" | "updated_at">>
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("accessibility_preferences")
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    setPreferences(data as AccessibilityPreferences);
    return data as AccessibilityPreferences;
  }, [user]);

  // Apply preferences to document
  const applyPreferences = useCallback((prefs: AccessibilityPreferences | null) => {
    if (!prefs) return;
    
    const root = document.documentElement;
    
    // Apply text scaling
    root.style.fontSize = `${prefs.text_scaling * 100}%`;
    
    // Apply reduced motion
    if (prefs.reduced_motion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    
    // Apply high contrast
    if (prefs.preferred_contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPreferences().then(applyPreferences);
    }
  }, [user, fetchPreferences, applyPreferences]);

  return {
    preferences,
    loading,
    fetchPreferences,
    savePreferences,
    applyPreferences,
  };
}

export function useConnectivity() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ConnectivityProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch connectivity profile
  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("connectivity_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data as ConnectivityProfile | null);
      return data as ConnectivityProfile | null;
    } catch (err) {
      console.error("Error fetching connectivity profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update connectivity profile
  const updateProfile = useCallback(async (
    updates: Partial<Omit<ConnectivityProfile, "user_id">>
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("connectivity_profiles")
      .upsert({
        user_id: user.id,
        ...updates,
        last_detected_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data as ConnectivityProfile);
    return data as ConnectivityProfile;
  }, [user]);

  // Detect bandwidth (simplified)
  const detectBandwidth = useCallback(async () => {
    // Use Network Information API if available
    const connection = (navigator as any).connection;
    if (connection) {
      const bandwidth = connection.downlink * 1000; // Convert Mbps to Kbps
      await updateProfile({ avg_bandwidth_kbps: Math.round(bandwidth) });
      return bandwidth;
    }
    return null;
  }, [updateProfile]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    detectBandwidth,
  };
}

export function useLanguageSupport() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LanguageSupportProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch language profile
  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("language_support_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      setProfile(data as LanguageSupportProfile | null);
      return data as LanguageSupportProfile | null;
    } catch (err) {
      console.error("Error fetching language profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update language profile
  const updateProfile = useCallback(async (
    updates: Partial<Omit<LanguageSupportProfile, "user_id" | "updated_at">>
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("language_support_profiles")
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    setProfile(data as LanguageSupportProfile);
    return data as LanguageSupportProfile;
  }, [user]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
  };
}

export function useEquityMetrics() {
  const [rules, setRules] = useState<EquityAdjustmentRule[]>([]);
  const [snapshots, setSnapshots] = useState<EquityMetricsSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch active equity rules
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("equity_adjustment_rules")
        .select("*")
        .eq("is_active", true)
        .order("rule_name");
      
      if (error) throw error;
      setRules(data as EquityAdjustmentRule[]);
      return data as EquityAdjustmentRule[];
    } catch (err) {
      console.error("Error fetching equity rules:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch equity metrics snapshots
  const fetchSnapshots = useCallback(async (scopeType?: string, scopeId?: string) => {
    setLoading(true);
    try {
      let query = supabase.from("equity_metrics_snapshots").select("*");
      
      if (scopeType) {
        query = query.eq("scope_type", scopeType);
      }
      if (scopeId) {
        query = query.eq("scope_id", scopeId);
      }
      
      const { data, error } = await query.order("computed_at", { ascending: false });
      
      if (error) throw error;
      setSnapshots(data as EquityMetricsSnapshot[]);
      return data as EquityMetricsSnapshot[];
    } catch (err) {
      console.error("Error fetching equity snapshots:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rules,
    snapshots,
    loading,
    fetchRules,
    fetchSnapshots,
  };
}
