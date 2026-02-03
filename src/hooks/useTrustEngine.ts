import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrustProfile {
  id: string;
  user_id: string;
  trust_score: number;
  trust_tier: "bronze" | "silver" | "gold" | "platinum";
  verification_level: string;
  is_verified_student: boolean;
  is_verified_researcher: boolean;
  is_verified_partner: boolean;
  total_projects_completed: number;
  total_projects_posted: number;
  successful_rate: number | null;
  response_time_hours: number | null;
  financial_reliability_score: number;
  dispute_rate: number;
  avg_milestone_approval_hours: number | null;
  is_frozen: boolean;
  frozen_reason: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrustScoreHistory {
  id: string;
  user_id: string;
  previous_score: number;
  new_score: number;
  change_reason: string;
  change_source: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TrustTierRequirement {
  tier: string;
  min_trust_score: number;
  min_projects_completed: number;
  requires_verification: boolean;
  max_budget_access: number | null;
  org_access_allowed: boolean;
  priority_support: boolean;
  description: string;
}

export function useTrustEngine(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [trustProfile, setTrustProfile] = useState<TrustProfile | null>(null);
  const [history, setHistory] = useState<TrustScoreHistory[]>([]);
  const [tierRequirements, setTierRequirements] = useState<TrustTierRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetUserId) {
      fetchTrustData();
    }
  }, [targetUserId]);

  const fetchTrustData = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch trust profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (profileError) throw profileError;
      setTrustProfile(profileData as TrustProfile);

      // Fetch history (only for own profile)
      if (targetUserId === user?.id) {
        const { data: historyData, error: historyError } = await supabase
          .from("trust_score_history")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (historyError) throw historyError;
        setHistory(historyData as TrustScoreHistory[]);
      }

      // Fetch tier requirements
      const { data: tierData, error: tierError } = await supabase
        .from("trust_tier_requirements")
        .select("*")
        .order("min_trust_score", { ascending: true });

      if (tierError) throw tierError;
      setTierRequirements(tierData as TrustTierRequirement[]);

    } catch (err: any) {
      console.error("Error fetching trust data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recalculateTrustScore = async () => {
    if (!targetUserId) return { success: false, error: "No user ID" };

    try {
      const { data, error } = await supabase
        .rpc("calculate_dynamic_trust_score", { p_user_id: targetUserId });

      if (error) throw error;
      
      await fetchTrustData();
      return { success: true, data };
    } catch (err: any) {
      console.error("Error recalculating trust score:", err);
      return { success: false, error: err.message };
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "text-purple-500";
      case "gold": return "text-amber-500";
      case "silver": return "text-slate-400";
      default: return "text-orange-600";
    }
  };

  const getTierBgColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-purple-500/10";
      case "gold": return "bg-amber-500/10";
      case "silver": return "bg-slate-400/10";
      default: return "bg-orange-600/10";
    }
  };

  return {
    trustProfile,
    history,
    tierRequirements,
    loading,
    error,
    refetch: fetchTrustData,
    recalculateTrustScore,
    getTierColor,
    getTierBgColor,
  };
}

export function useAdminTrustManagement() {
  const freezeTrustProfile = async (userId: string, freeze: boolean, reason?: string) => {
    try {
      const { data, error } = await supabase
        .rpc("admin_freeze_trust_profile", {
          p_user_id: userId,
          p_freeze: freeze,
          p_reason: reason || null,
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error freezing trust profile:", err);
      return { success: false, error: err.message };
    }
  };

  const overrideTrustScore = async (userId: string, newScore: number, reason: string) => {
    try {
      const { data, error } = await supabase
        .rpc("admin_override_trust_score", {
          p_user_id: userId,
          p_new_score: newScore,
          p_reason: reason,
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error overriding trust score:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    freezeTrustProfile,
    overrideTrustScore,
  };
}
