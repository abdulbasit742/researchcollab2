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

// =====================================================
// NEW: Trust Score Components (5-dimension weighted system)
// =====================================================

export interface TrustScoreComponents {
  id: string;
  user_id: string;
  // Delivery Score (40% weight)
  delivery_score: number;
  projects_completed: number;
  projects_failed: number;
  partial_deliveries: number;
  on_time_rate: number;
  // Financial Reliability (25% weight)
  financial_score: number;
  escrow_releases_successful: number;
  disputes_raised: number;
  disputes_lost: number;
  refunds_issued: number;
  escrow_cancellations: number;
  // Collaboration Quality (15% weight)
  collaboration_score: number;
  peer_reviews_received: number;
  avg_peer_rating: number | null;
  repeat_collaborations: number;
  abandoned_collaborations: number;
  avg_response_hours: number | null;
  // Institutional Confidence (10% weight)
  institutional_score: number;
  verifications_count: number;
  institutional_affiliations: number;
  grants_executed: number;
  institutional_disputes: number;
  // Time & Consistency (10% weight)
  consistency_score: number;
  active_months: number;
  longest_inactive_days: number;
  trust_volatility: number;
  trend_direction: "improving" | "stable" | "declining";
  // Total
  total_trust_score: number;
  last_decay_applied_at: string | null;
  computed_at: string;
}

export interface FeatureAccessGate {
  id: string;
  feature_name: string;
  minimum_trust_score: number;
  minimum_projects_completed: number;
  minimum_account_age_days: number;
  requires_verification: boolean;
  requires_escrow_history: boolean;
  max_disputes_allowed: number | null;
  description: string | null;
  is_active: boolean;
}

export interface TrustDecayEvent {
  id: string;
  user_id: string;
  decay_amount: number;
  decay_reason: string;
  days_inactive: number | null;
  previous_score: number;
  new_score: number;
  applied_at: string;
}

export interface HardPenalty {
  id: string;
  user_id: string;
  penalty_type: string;
  penalty_points: number;
  recovery_months: number;
  evidence_reference: string | null;
  applied_at: string;
  expires_at: string | null;
  is_active: boolean;
}

// Main hook for trust score components (5-dimension weighted system)
export function useTrustScoreComponents(userId?: string) {
  const { user } = useAuth();
  const [components, setComponents] = useState<TrustScoreComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  const fetchComponents = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("trust_score_components")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setComponents(data as TrustScoreComponents | null);
    } catch (err: any) {
      console.error("Error fetching trust components:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Calculate trust score breakdown for display
  const getBreakdown = useCallback(() => {
    if (!components) return null;
    return {
      delivery: { weight: 40, score: components.delivery_score, weighted: components.delivery_score * 0.4 },
      financial: { weight: 25, score: components.financial_score, weighted: components.financial_score * 0.25 },
      collaboration: { weight: 15, score: components.collaboration_score, weighted: components.collaboration_score * 0.15 },
      institutional: { weight: 10, score: components.institutional_score, weighted: components.institutional_score * 0.1 },
      consistency: { weight: 10, score: components.consistency_score, weighted: components.consistency_score * 0.1 },
    };
  }, [components]);

  // Get tier based on trust score
  const getTier = useCallback(() => {
    const score = components?.total_trust_score ?? 0;
    if (score >= 80) return { name: "Platinum", color: "purple", minScore: 80 };
    if (score >= 60) return { name: "Gold", color: "amber", minScore: 60 };
    if (score >= 40) return { name: "Silver", color: "gray", minScore: 40 };
    return { name: "Bronze", color: "orange", minScore: 0 };
  }, [components]);

  // Recalculate trust score
  const recalculateScore = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const { data, error } = await supabase.rpc("calculate_trust_score", { p_user_id: targetUserId });
      if (error) throw error;
      await fetchComponents();
      return data;
    } catch (err) {
      console.error("Error recalculating trust score:", err);
      throw err;
    }
  }, [targetUserId, fetchComponents]);

  return {
    components,
    loading,
    error,
    refetch: fetchComponents,
    getBreakdown,
    getTier,
    recalculateScore,
  };
}

// Hook for checking feature access
export function useFeatureAccess() {
  const { user } = useAuth();
  const [gates, setGates] = useState<FeatureAccessGate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGates() {
      const { data } = await supabase
        .from("feature_access_gates")
        .select("*")
        .eq("is_active", true);
      setGates((data as FeatureAccessGate[]) || []);
      setLoading(false);
    }
    fetchGates();
  }, []);

  // Check if user can access a feature
  const checkAccess = useCallback(async (featureName: string): Promise<{ allowed: boolean; reason?: string }> => {
    if (!user?.id) return { allowed: false, reason: "Not authenticated" };

    try {
      const { data, error } = await supabase.rpc("check_feature_access", {
        p_user_id: user.id,
        p_feature_name: featureName,
      });
      
      if (error) throw error;
      
      if (!data) {
        const gate = gates.find(g => g.feature_name === featureName);
        return { 
          allowed: false, 
          reason: gate ? `Requires ${gate.minimum_trust_score}+ trust score and ${gate.minimum_projects_completed}+ completed projects` : "Access denied"
        };
      }
      
      return { allowed: true };
    } catch (err) {
      console.error("Error checking feature access:", err);
      return { allowed: false, reason: "Error checking access" };
    }
  }, [user?.id, gates]);

  // Get gate requirements for a feature
  const getGateRequirements = useCallback((featureName: string) => {
    return gates.find(g => g.feature_name === featureName);
  }, [gates]);

  return {
    gates,
    loading,
    checkAccess,
    getGateRequirements,
  };
}

// Hook for trust decay history
export function useTrustDecayHistory(userId?: string) {
  const { user } = useAuth();
  const [events, setEvents] = useState<TrustDecayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    async function fetchDecayEvents() {
      if (!targetUserId) return;
      
      const { data } = await supabase
        .from("trust_decay_log")
        .select("*")
        .eq("user_id", targetUserId)
        .order("applied_at", { ascending: false })
        .limit(20);
      
      setEvents((data as TrustDecayEvent[]) || []);
      setLoading(false);
    }
    fetchDecayEvents();
  }, [targetUserId]);

  return { events, loading };
}

// Hook for hard penalties
export function useHardPenalties(userId?: string) {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState<HardPenalty[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    async function fetchPenalties() {
      if (!targetUserId) return;
      
      const { data } = await supabase
        .from("trust_hard_penalties")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("is_active", true)
        .order("applied_at", { ascending: false });
      
      setPenalties((data as HardPenalty[]) || []);
      setLoading(false);
    }
    fetchPenalties();
  }, [targetUserId]);

  const totalPenaltyPoints = penalties.reduce((sum, p) => sum + p.penalty_points, 0);

  return { penalties, loading, totalPenaltyPoints };
}

// Hook for collaboration cooldowns
export function useCollaborationCooldown() {
  const { user } = useAuth();

  const getDampeningFactor = useCallback(async (otherUserId: string) => {
    if (!user?.id) return 1.0;

    try {
      const { data, error } = await supabase.rpc("get_collaboration_dampening", {
        p_user_a: user.id,
        p_user_b: otherUserId,
      });
      
      if (error) throw error;
      return data as number;
    } catch (err) {
      console.error("Error getting dampening factor:", err);
      return 1.0;
    }
  }, [user?.id]);

  return { getDampeningFactor };
}
