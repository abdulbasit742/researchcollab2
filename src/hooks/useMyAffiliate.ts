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

export function useMyAffiliate() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAffiliate(null);
      setConversions([]);
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

        // Fetch conversions if affiliate exists
        if (affiliateData) {
          const { data: conversionsData, error: conversionsError } = await supabase
            .from("affiliate_conversions")
            .select("*")
            .eq("affiliate_id", affiliateData.id)
            .order("created_at", { ascending: false })
            .limit(50);

          if (conversionsError) throw conversionsError;
          setConversions(conversionsData || []);
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

  return {
    affiliate,
    conversions,
    loading,
    error,
    generateReferralLink,
  };
}
