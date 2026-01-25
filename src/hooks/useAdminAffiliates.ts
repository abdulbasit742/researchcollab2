import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuditLog } from "./useAdminAuditLog";

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  custom_commission_rate: number | null;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  pending_earnings: number;
  available_earnings: number;
  lifetime_earnings: number;
  status: "pending" | "active" | "suspended" | "blocked";
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  user_name?: string;
  user_email?: string;
}

export interface AffiliateConversion {
  id: string;
  affiliate_id: string;
  referred_user_id: string | null;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  status: "pending" | "approved" | "released" | "reversed";
  created_at: string;
}

export function useAdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAdminAuditLog();

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const { data: affiliatesData, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for affiliates
      if (affiliatesData && affiliatesData.length > 0) {
        const userIds = affiliatesData.map((a) => a.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name")
          .in("id", userIds);

        const enrichedAffiliates = affiliatesData.map((affiliate) => {
          const profile = profiles?.find((p) => p.id === affiliate.user_id);
          return {
            ...affiliate,
            user_name: profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Unknown",
          };
        });

        setAffiliates(enrichedAffiliates as Affiliate[]);
      } else {
        setAffiliates([]);
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversions = async (affiliateId?: string) => {
    try {
      let query = supabase
        .from("affiliate_conversions")
        .select("*")
        .order("created_at", { ascending: false });

      if (affiliateId) {
        query = query.eq("affiliate_id", affiliateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setConversions((data || []) as AffiliateConversion[]);
    } catch (error) {
      console.error("Error fetching conversions:", error);
    }
  };

  useEffect(() => {
    fetchAffiliates();
    fetchConversions();
  }, []);

  const approveAffiliate = async (affiliateId: string) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ status: "active" })
      .eq("id", affiliateId);

    if (!error) {
      await logAction("affiliate_approved", "affiliate", affiliateId, { status: "active" });
      await fetchAffiliates();
    }
    return { error };
  };

  const suspendAffiliate = async (affiliateId: string) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ status: "suspended" })
      .eq("id", affiliateId);

    if (!error) {
      await logAction("affiliate_suspended", "affiliate", affiliateId, { status: "suspended" });
      await fetchAffiliates();
    }
    return { error };
  };

  const blockAffiliate = async (affiliateId: string) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ status: "blocked" })
      .eq("id", affiliateId);

    if (!error) {
      await logAction("affiliate_blocked", "affiliate", affiliateId, { status: "blocked" });
      await fetchAffiliates();
    }
    return { error };
  };

  const updateCommissionRate = async (affiliateId: string, rate: number) => {
    const { error } = await supabase
      .from("affiliates")
      .update({ custom_commission_rate: rate })
      .eq("id", affiliateId);

    if (!error) {
      await logAction("affiliate_commission_updated", "affiliate", affiliateId, { custom_commission_rate: rate });
      await fetchAffiliates();
    }
    return { error };
  };

  const getStats = () => {
    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter((a) => a.status === "active").length;
    const pendingApproval = affiliates.filter((a) => a.status === "pending").length;
    const totalRevenue = affiliates.reduce((sum, a) => sum + (a.lifetime_earnings || 0), 0);
    const pendingCommissions = affiliates.reduce((sum, a) => sum + (a.pending_earnings || 0), 0);
    const totalConversions = affiliates.reduce((sum, a) => sum + (a.total_conversions || 0), 0);

    return {
      totalAffiliates,
      activeAffiliates,
      pendingApproval,
      totalRevenue,
      pendingCommissions,
      totalConversions,
    };
  };

  return {
    affiliates,
    conversions,
    loading,
    refetch: fetchAffiliates,
    fetchConversions,
    approveAffiliate,
    suspendAffiliate,
    blockAffiliate,
    updateCommissionRate,
    getStats,
  };
}
