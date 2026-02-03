import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number | null;
  custom_commission_rate: number | null;
  total_clicks: number | null;
  total_signups: number | null;
  total_conversions: number | null;
  pending_earnings: number | null;
  available_earnings: number | null;
  lifetime_earnings: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // New trust-linked fields
  lifecycle_status?: string | null;
  affiliate_type?: string | null;
  trust_score_at_activation?: number | null;
  current_trust_weight?: number | null;
  base_commission_rate?: number | null;
  effective_commission_rate?: number | null;
  total_outcomes?: number | null;
  outcome_conversion_rate?: number | null;
  referral_quality_score?: number | null;
  violation_count?: number | null;
}

export interface AffiliateConversion {
  id: string;
  affiliate_id: string | null;
  referred_user_id: string | null;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  status: string | null;
  created_at: string | null;
}

export interface AffiliateOutcome {
  id: string;
  affiliate_id: string;
  referred_user_id: string | null;
  outcome_type: string;
  outcome_value: number;
  commission_earned: number;
  commission_status: string;
  referred_user_trust_score: number | null;
  referred_user_retained: boolean;
  retention_days: number;
  created_at: string;
}

export interface AffiliateViolation {
  id: string;
  affiliate_id: string;
  violation_type: string;
  severity: string;
  description: string;
  trust_penalty: number;
  commission_penalty_percent: number;
  status: string;
  created_at: string;
}

export function useMyAffiliate() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [outcomes, setOutcomes] = useState<AffiliateOutcome[]>([]);
  const [violations, setViolations] = useState<AffiliateViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAffiliate(null);
      setConversions([]);
      setOutcomes([]);
      setViolations([]);
      setLoading(false);
      return;
    }

    const fetchAffiliateData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch affiliate profile
        const { data: affiliateData, error: affiliateError } = await supabase
          .from("affiliates")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (affiliateError) throw affiliateError;
        setAffiliate(affiliateData);

        // Fetch additional data if affiliate exists
        if (affiliateData) {
          // Fetch conversions
          const { data: conversionsData, error: conversionsError } = await supabase
            .from("affiliate_conversions")
            .select("*")
            .eq("affiliate_id", affiliateData.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (conversionsError) throw conversionsError;
          setConversions(conversionsData || []);

          // Fetch outcomes
          const { data: outcomesData, error: outcomesError } = await supabase
            .from("affiliate_referral_outcomes")
            .select("*")
            .eq("affiliate_id", affiliateData.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (!outcomesError && outcomesData) {
            setOutcomes(outcomesData as AffiliateOutcome[]);
          }

          // Fetch violations
          const { data: violationsData, error: violationsError } = await supabase
            .from("affiliate_violations")
            .select("*")
            .eq("affiliate_id", affiliateData.id)
            .eq("status", "active")
            .order("created_at", { ascending: false });

          if (!violationsError && violationsData) {
            setViolations(violationsData as AffiliateViolation[]);
          }
        }
      } catch (err: any) {
        console.error("Error fetching affiliate data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, [user]);

  const generateReferralLink = (code: string, type?: string, itemId?: string) => {
    const baseUrl = window.location.origin;
    if (type && itemId) {
      return `${baseUrl}/${type}s/${itemId}?ref=${code}`;
    }
    return `${baseUrl}?ref=${code}`;
  };

  // Calculate conversion funnel stats
  const getFunnelStats = () => {
    const signups = outcomes.filter(o => o.outcome_type === "signup").length;
    const onboarded = outcomes.filter(o => o.outcome_type === "onboarding_complete").length;
    const converted = outcomes.filter(o => 
      ["first_project_completed", "first_subscription", "first_earning", "tool_purchase", "bundle_purchase"]
        .includes(o.outcome_type)
    ).length;

    return {
      totalReferrals: signups,
      onboardedReferrals: onboarded,
      convertedReferrals: converted,
      onboardingRate: signups > 0 ? ((onboarded / signups) * 100).toFixed(1) : "0",
      conversionRate: signups > 0 ? ((converted / signups) * 100).toFixed(1) : "0",
    };
  };

  return {
    affiliate,
    conversions,
    outcomes,
    violations,
    loading,
    error,
    generateReferralLink,
    getFunnelStats,
  };
}
