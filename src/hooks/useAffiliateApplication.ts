import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface EligibilitySnapshot {
  trust_score: number;
  trust_tier: string;
  account_age_days: number;
  outcomes_count: number;
  unresolved_disputes: number;
  spam_flags: number;
}

export interface EligibilityReason {
  rule: string;
  required?: number;
  current?: number;
  max_allowed?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: EligibilityReason[];
  snapshot: EligibilitySnapshot;
}

export interface AffiliateApplication {
  id: string;
  user_id: string;
  motivation: string;
  target_audience: string;
  value_proposition: string;
  acknowledged_rules: boolean;
  trust_score_at_application: number;
  trust_tier_at_application: string;
  account_age_days: number;
  has_completed_outcomes: boolean;
  has_unresolved_disputes: boolean;
  has_spam_flags: boolean;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejection_reason: string | null;
  affiliate_type: "standard" | "institutional" | "ambassador";
  created_at: string;
  updated_at: string;
}

export interface EligibilityRule {
  id: string;
  rule_name: string;
  rule_key: string;
  rule_value: number;
  description: string | null;
  is_active: boolean;
}

export interface CommissionTier {
  id: string;
  tier_name: string;
  min_trust_score: number;
  max_trust_score: number | null;
  trust_weight: number;
  base_commission_rate: number;
  description: string | null;
  is_active: boolean;
}

// =====================================================
// ELIGIBILITY CHECK HOOK
// =====================================================

export function useAffiliateEligibility() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["affiliateEligibility", user?.id],
    queryFn: async (): Promise<EligibilityResult | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc("check_affiliate_eligibility", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error checking eligibility:", error);
        throw error;
      }

      return data as unknown as EligibilityResult;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =====================================================
// ELIGIBILITY RULES HOOK
// =====================================================

export function useEligibilityRules() {
  return useQuery({
    queryKey: ["affiliateEligibilityRules"],
    queryFn: async (): Promise<EligibilityRule[]> => {
      const { data, error } = await supabase
        .from("affiliate_eligibility_rules")
        .select("*")
        .eq("is_active", true)
        .order("rule_name");

      if (error) throw error;
      return (data || []) as EligibilityRule[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// =====================================================
// COMMISSION TIERS HOOK
// =====================================================

export function useCommissionTiers() {
  return useQuery({
    queryKey: ["affiliateCommissionTiers"],
    queryFn: async (): Promise<CommissionTier[]> => {
      const { data, error } = await supabase
        .from("affiliate_commission_tiers")
        .select("*")
        .eq("is_active", true)
        .order("min_trust_score");

      if (error) throw error;
      return (data || []) as CommissionTier[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// =====================================================
// APPLICATION STATUS HOOK
// =====================================================

export function useAffiliateApplicationStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["affiliateApplication", user?.id],
    queryFn: async (): Promise<AffiliateApplication | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("affiliate_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AffiliateApplication | null;
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// SUBMIT APPLICATION MUTATION
// =====================================================

export function useSubmitAffiliateApplication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      motivation: string;
      target_audience: string;
      value_proposition: string;
      affiliate_type?: "standard" | "institutional" | "ambassador";
      institution_id?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // First check eligibility
      const { data: eligibility, error: eligError } = await supabase.rpc(
        "check_affiliate_eligibility",
        { p_user_id: user.id }
      );

      if (eligError) throw eligError;

      const eligResult = eligibility as unknown as EligibilityResult;
      if (!eligResult.eligible) {
        throw new Error("You are not eligible to apply for the affiliate program");
      }

      // Submit application
      const { error } = await supabase.from("affiliate_applications").insert({
        user_id: user.id,
        motivation: data.motivation,
        target_audience: data.target_audience,
        value_proposition: data.value_proposition,
        acknowledged_rules: true,
        trust_score_at_application: eligResult.snapshot.trust_score,
        trust_tier_at_application: eligResult.snapshot.trust_tier,
        account_age_days: eligResult.snapshot.account_age_days,
        has_completed_outcomes: eligResult.snapshot.outcomes_count > 0,
        has_unresolved_disputes: eligResult.snapshot.unresolved_disputes > 0,
        has_spam_flags: eligResult.snapshot.spam_flags > 0,
        affiliate_type: data.affiliate_type || "standard",
        institution_id: data.institution_id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliateApplication"] });
      queryClient.invalidateQueries({ queryKey: ["affiliateEligibility"] });
      toast.success("Application submitted successfully! We'll review it shortly.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });
}

// =====================================================
// COMBINED AFFILIATE STATUS HOOK
// =====================================================

export type AffiliateLifecycleStatus =
  | "not_applied"
  | "applied"
  | "under_review"
  | "approved"
  | "active"
  | "paused"
  | "suspended"
  | "revoked"
  | "ineligible";

export interface AffiliateStatusInfo {
  status: AffiliateLifecycleStatus;
  statusLabel: string;
  statusDescription: string;
  nextAction: string | null;
  canApply: boolean;
}

export function useAffiliateStatus(): {
  status: AffiliateStatusInfo | null;
  eligibility: EligibilityResult | null;
  application: AffiliateApplication | null;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { data: eligibility, isLoading: eligLoading } = useAffiliateEligibility();
  const { data: application, isLoading: appLoading } = useAffiliateApplicationStatus();

  const [status, setStatus] = useState<AffiliateStatusInfo | null>(null);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }

    // Determine status based on application and eligibility
    let statusInfo: AffiliateStatusInfo;

    if (application) {
      switch (application.status) {
        case "pending":
          statusInfo = {
            status: "applied",
            statusLabel: "Application Pending",
            statusDescription: "Your application is being reviewed by our team.",
            nextAction: "Wait for review (typically 24-48 hours)",
            canApply: false,
          };
          break;
        case "under_review":
          statusInfo = {
            status: "under_review",
            statusLabel: "Under Review",
            statusDescription: "Your application is actively being reviewed.",
            nextAction: "A team member is reviewing your application",
            canApply: false,
          };
          break;
        case "approved":
          statusInfo = {
            status: "approved",
            statusLabel: "Approved",
            statusDescription: "Congratulations! Your application was approved.",
            nextAction: "Visit your affiliate dashboard to get started",
            canApply: false,
          };
          break;
        case "rejected":
          statusInfo = {
            status: "not_applied",
            statusLabel: "Application Rejected",
            statusDescription: application.rejection_reason || "Your application was not approved.",
            nextAction: "Improve your trust score and outcomes, then reapply",
            canApply: eligibility?.eligible || false,
          };
          break;
        default:
          statusInfo = {
            status: "not_applied",
            statusLabel: "Not Applied",
            statusDescription: "You haven't applied to the affiliate program yet.",
            nextAction: eligibility?.eligible ? "Submit your application" : "Meet eligibility requirements first",
            canApply: eligibility?.eligible || false,
          };
      }
    } else if (eligibility) {
      if (eligibility.eligible) {
        statusInfo = {
          status: "not_applied",
          statusLabel: "Eligible to Apply",
          statusDescription: "You meet all requirements to become an affiliate.",
          nextAction: "Submit your application to join the program",
          canApply: true,
        };
      } else {
        statusInfo = {
          status: "ineligible",
          statusLabel: "Not Yet Eligible",
          statusDescription: "You don't meet the requirements to apply yet.",
          nextAction: "Complete the requirements shown below to become eligible",
          canApply: false,
        };
      }
    } else {
      statusInfo = {
        status: "not_applied",
        statusLabel: "Loading...",
        statusDescription: "Checking your eligibility...",
        nextAction: null,
        canApply: false,
      };
    }

    setStatus(statusInfo);
  }, [user, eligibility, application]);

  return {
    status,
    eligibility,
    application,
    isLoading: eligLoading || appLoading,
  };
}
