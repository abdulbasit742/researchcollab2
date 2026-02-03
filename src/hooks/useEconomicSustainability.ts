import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================
// FEATURE 27: Economic Sustainability & Monetization
// =============================================

export interface RevenueStream {
  id: string;
  stream_type: 'institutional_subscription' | 'tool_license' | 'enterprise_services' | 'archival_storage' | 'analytics_reports' | 'priority_support';
  name: string;
  description?: string;
  governed_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingModel {
  id: string;
  revenue_stream_id?: string;
  pricing_type: 'flat' | 'tiered' | 'usage_based' | 'subsidized' | 'free';
  pricing_rules: Record<string, unknown>;
  currency: string;
  review_cycle_months: number;
  last_reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
}

export interface ContributionReward {
  id: string;
  scholar_passport_id?: string;
  reward_type: 'fee_waiver' | 'priority_access' | 'recognition_credit' | 'archival_support' | 'analytics_access' | 'premium_features';
  reason: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface SubsidyProgram {
  id: string;
  name: string;
  eligible_group: 'low_resource_institutions' | 'early_career' | 'global_south' | 'students' | 'independent_researchers';
  subsidy_scope: 'fees' | 'storage' | 'analytics' | 'tools' | 'full_access';
  subsidy_percentage: number;
  funding_source?: string;
  eligibility_criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface FinancialTransparencyReport {
  id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  revenue_breakdown: Record<string, unknown>;
  subsidy_allocation: Record<string, unknown>;
  surplus_use: Record<string, unknown>;
  operating_costs: Record<string, unknown>;
  approved_by?: string;
  published_at?: string;
  created_at: string;
}

export function useRevenueStreams() {
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveStreams = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("revenue_streams")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setStreams((data || []) as RevenueStream[]);
    } catch (error) {
      console.error("Error fetching revenue streams:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    streams,
    isLoading,
    fetchActiveStreams
  };
}

export function usePricing() {
  const [models, setModels] = useState<PricingModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPricingModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pricing_models")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModels((data || []) as PricingModel[]);
    } catch (error) {
      console.error("Error fetching pricing models:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPricingForStream = useCallback(async (streamId: string) => {
    try {
      const { data, error } = await supabase
        .from("pricing_models")
        .select("*")
        .eq("revenue_stream_id", streamId)
        .single();

      if (error) throw error;
      return data as PricingModel;
    } catch (error) {
      console.error("Error fetching pricing:", error);
      return null;
    }
  }, []);

  return {
    models,
    isLoading,
    fetchPricingModels,
    getPricingForStream
  };
}

export function useContributionRewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<ContributionReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyRewards = useCallback(async (scholarPassportId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contribution_rewards")
        .select("*")
        .eq("scholar_passport_id", scholarPassportId)
        .eq("is_active", true)
        .order("granted_at", { ascending: false });

      if (error) throw error;
      setRewards((data || []) as ContributionReward[]);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const grantReward = useCallback(async (
    scholarPassportId: string,
    rewardType: ContributionReward['reward_type'],
    reason: string,
    expiresAt?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("contribution_rewards")
        .insert({
          scholar_passport_id: scholarPassportId,
          reward_type: rewardType,
          reason,
          granted_by: user.id,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Reward granted successfully");
      return data as ContributionReward;
    } catch (error) {
      console.error("Error granting reward:", error);
      toast.error("Failed to grant reward");
      return null;
    }
  }, [user]);

  return {
    rewards,
    isLoading,
    fetchMyRewards,
    grantReward
  };
}

export function useSubsidies() {
  const [programs, setPrograms] = useState<SubsidyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivePrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subsidy_programs")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setPrograms((data || []) as SubsidyProgram[]);
    } catch (error) {
      console.error("Error fetching subsidy programs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkEligibility = useCallback(async (programId: string, userCriteria: Record<string, unknown>) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return false;

    // Simple eligibility check - in production, this would be more sophisticated
    const criteria = program.eligibility_criteria;
    for (const [key, value] of Object.entries(criteria)) {
      if (userCriteria[key] !== value) {
        return false;
      }
    }
    return true;
  }, [programs]);

  return {
    programs,
    isLoading,
    fetchActivePrograms,
    checkEligibility
  };
}

export function useFinancialTransparency() {
  const [reports, setReports] = useState<FinancialTransparencyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublishedReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("financial_transparency_reports")
        .select("*")
        .not("published_at", "is", null)
        .order("reporting_period_end", { ascending: false });

      if (error) throw error;
      setReports((data || []) as FinancialTransparencyReport[]);
    } catch (error) {
      console.error("Error fetching financial reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    reports,
    isLoading,
    fetchPublishedReports
  };
}
