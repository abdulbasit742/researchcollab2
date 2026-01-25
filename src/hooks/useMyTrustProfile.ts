import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserTrustProfile {
  id: string;
  user_id: string;
  trust_score: number;
  verification_level: string;
  is_verified_student: boolean;
  is_verified_researcher: boolean;
  is_verified_partner: boolean;
  total_projects_completed: number;
  total_projects_posted: number;
  successful_rate: number | null;
  response_time_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  description: string | null;
  earned_at: string;
}

export function useMyTrustProfile() {
  const { user, profile } = useAuth();
  const [trustProfile, setTrustProfile] = useState<UserTrustProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrustProfile(null);
      setBadges([]);
      setLoading(false);
      return;
    }

    const fetchTrustData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch trust profile
        const { data: trustData, error: trustError } = await supabase
          .from("user_trust_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (trustError) throw trustError;
        setTrustProfile(trustData);

        // Fetch badges
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false });

        if (badgesError) throw badgesError;
        setBadges(badgesData || []);
      } catch (err: any) {
        console.error("Error fetching trust profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustData();
  }, [user]);

  return {
    trustProfile,
    badges,
    profile,
    loading,
    error,
  };
}
