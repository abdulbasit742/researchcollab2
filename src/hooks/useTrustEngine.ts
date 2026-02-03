import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface TrustProfile {
  user_id: string;
  base_trust_level: string;
  trust_score: number;
  verification_weight: number;
  is_manually_set: boolean;
  manual_set_by: string | null;
  manual_set_reason: string | null;
  last_computed_at: string;
  created_at: string;
}

export interface TrustSignal {
  id: string;
  user_id: string;
  signal_type: string;
  signal_value: number;
  weight: number;
  context_type: string | null;
  context_id: string | null;
  source_entity_type: string | null;
  source_entity_id: string | null;
  decays_at: string | null;
  generated_at: string;
}

export interface TrustContext {
  id: string;
  user_id: string;
  context_type: string;
  context_id: string;
  trust_state: string;
  context_score: number | null;
  computed_at: string;
}

export interface TrustIntervention {
  id: string;
  user_id: string;
  intervention_type: string;
  reason: string;
  details: Json;
  applied_by: string | null;
  applied_at: string;
  expires_at: string | null;
  lifted_at: string | null;
  lifted_by: string | null;
  lift_reason: string | null;
}

export interface GamingDetectionEvent {
  id: string;
  user_id: string;
  detection_type: string;
  severity: string;
  evidence_summary: string | null;
  related_users: string[];
  status: string;
  detected_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export function useTrustProfile(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("trust_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching trust profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getTrustLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      restricted: "Restricted",
      probationary: "Probationary",
      standard: "Standard",
      trusted: "Trusted",
      institutional: "Institutional",
      steward: "Steward",
    };
    return labels[level] || level;
  };

  const getTrustLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      restricted: "text-destructive",
      probationary: "text-orange-500",
      standard: "text-muted-foreground",
      trusted: "text-blue-500",
      institutional: "text-purple-500",
      steward: "text-emerald-500",
    };
    return colors[level] || "text-muted-foreground";
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    getTrustLevelLabel,
    getTrustLevelColor,
  };
}

export function useTrustSignals(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [signals, setSignals] = useState<TrustSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      if (!targetUserId) {
        setSignals([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("trust_signals")
          .select("*")
          .eq("user_id", targetUserId)
          .order("generated_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setSignals(data || []);
      } catch (err) {
        console.error("Error fetching trust signals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [targetUserId]);

  const getSignalsByType = useCallback((type: string) => {
    return signals.filter(s => s.signal_type === type);
  }, [signals]);

  const getAverageSignalValue = useCallback((type: string) => {
    const typeSignals = getSignalsByType(type);
    if (typeSignals.length === 0) return null;
    return typeSignals.reduce((sum, s) => sum + s.signal_value, 0) / typeSignals.length;
  }, [getSignalsByType]);

  return { signals, loading, getSignalsByType, getAverageSignalValue };
}

export function useTrustContext(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [contexts, setContexts] = useState<TrustContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContexts = async () => {
      if (!targetUserId) {
        setContexts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("trust_contexts")
          .select("*")
          .eq("user_id", targetUserId);

        if (error) throw error;
        setContexts(data || []);
      } catch (err) {
        console.error("Error fetching trust contexts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContexts();
  }, [targetUserId]);

  const getContextTrust = useCallback((type: string, id: string) => {
    return contexts.find(c => c.context_type === type && c.context_id === id);
  }, [contexts]);

  const getTrustStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      limited: "Limited Trust",
      normal: "Normal Trust",
      elevated: "Elevated Trust",
      expert: "Expert Trust",
    };
    return labels[state] || state;
  };

  return { contexts, loading, getContextTrust, getTrustStateLabel };
}

export function useTrustInterventions(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [interventions, setInterventions] = useState<TrustIntervention[]>([]);
  const [activeInterventions, setActiveInterventions] = useState<TrustIntervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      if (!targetUserId) {
        setInterventions([]);
        setActiveInterventions([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("trust_interventions")
          .select("*")
          .eq("user_id", targetUserId)
          .order("applied_at", { ascending: false });

        if (error) throw error;
        
        const all = data || [];
        setInterventions(all);
        
        // Filter active interventions
        const now = new Date();
        const active = all.filter(i => 
          !i.lifted_at && 
          (!i.expires_at || new Date(i.expires_at) > now)
        );
        setActiveInterventions(active);
      } catch (err) {
        console.error("Error fetching interventions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, [targetUserId]);

  const hasActiveIntervention = useCallback((type: string) => {
    return activeInterventions.some(i => i.intervention_type === type);
  }, [activeInterventions]);

  return { interventions, activeInterventions, loading, hasActiveIntervention };
}

// Admin functions for trust management
export function useAdminTrustManagement() {
  const { user } = useAuth();

  const applyIntervention = async (intervention: {
    user_id: string;
    intervention_type: string;
    reason: string;
    details?: Record<string, any>;
    expires_at?: string;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("trust_interventions")
        .insert({
          ...intervention,
          applied_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const liftIntervention = async (interventionId: string, reason: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("trust_interventions")
        .update({
          lifted_at: new Date().toISOString(),
          lifted_by: user.id,
          lift_reason: reason,
        })
        .eq("id", interventionId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setTrustLevel = async (userId: string, level: string, reason: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("trust_profiles")
        .upsert({
          user_id: userId,
          base_trust_level: level,
          is_manually_set: true,
          manual_set_by: user.id,
          manual_set_reason: reason,
          last_computed_at: new Date().toISOString(),
        } as any, {
          onConflict: "user_id",
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { applyIntervention, liftIntervention, setTrustLevel };
}

export function useGamingDetection() {
  const [events, setEvents] = useState<GamingDetectionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (status?: string) => {
    try {
      let query = supabase
        .from("gaming_detection_events")
        .select("*")
        .order("detected_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching gaming events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const reviewEvent = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("gaming_detection_events")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;
      await fetchEvents();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { events, loading, refetch: fetchEvents, reviewEvent };
}
