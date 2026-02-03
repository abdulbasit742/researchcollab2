import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FeasibilityResult {
  feasibility_score: number;
  risk_level: "low" | "medium" | "high";
  risk_factors: string[];
  suggestions: string[];
  explanation: string;
}

export interface BidScoreResult {
  quality_score: number;
  ranking_factors: {
    value_alignment: number;
    bidder_credibility: number;
    communication_quality: number;
    timeline_realism: number;
  };
  explanation: string;
}

export interface MatchConfidenceResult {
  match_score: number;
  skill_alignment: number;
  skill_gaps: string[];
  recommendations: string[];
  explanation: string;
}

export interface ProfileStrengthResult {
  strength_score: number;
  completeness: {
    basic_info: number;
    academic_info: number;
    portfolio: number;
    verification: number;
  };
  improvement_suggestions: string[];
  priority_action: string;
}

export interface SuggestedPricingResult {
  suggested_min: number;
  suggested_max: number;
  market_benchmark: number;
  pricing_factors: string[];
  explanation: string;
}

export function useAIPlatformIntelligence() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = async <T>(payload: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-platform-intelligence", {
        body: payload,
      });

      if (fnError) throw fnError;
      
      if (!data.success) {
        throw new Error(data.error || "AI analysis failed");
      }

      return data.result as T;
    } catch (err: any) {
      console.error("AI Platform Intelligence error:", err);
      setError(err.message);
      
      if (err.message?.includes("Rate limit")) {
        toast({
          title: "Rate Limit Reached",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (err.message?.includes("credits")) {
        toast({
          title: "AI Credits Exhausted",
          description: "Please add more AI credits to continue using this feature.",
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkProjectFeasibility = async (
    title: string,
    description: string,
    budgetMin?: number,
    budgetMax?: number,
    deadlineDays?: number
  ): Promise<FeasibilityResult | null> => {
    return callAI<FeasibilityResult>({
      type: "feasibility",
      title,
      description,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deadline_days: deadlineDays,
    });
  };

  const scoreBid = async (
    bidAmount: number,
    deliveryDays: number,
    bidderTrustScore: number,
    bidderCompletedProjects: number,
    bidMessage?: string,
    projectBudgetMin?: number,
    projectBudgetMax?: number
  ): Promise<BidScoreResult | null> => {
    return callAI<BidScoreResult>({
      type: "bid-score",
      bid_amount: bidAmount,
      bid_message: bidMessage,
      delivery_days: deliveryDays,
      bidder_trust_score: bidderTrustScore,
      bidder_completed_projects: bidderCompletedProjects,
      project_budget_min: projectBudgetMin,
      project_budget_max: projectBudgetMax,
    });
  };

  const getMatchConfidence = async (
    projectTitle: string,
    projectDescription: string,
    projectTags: string[],
    candidateInterests: string[],
    candidateDepartment?: string,
    candidateEducationLevel?: string
  ): Promise<MatchConfidenceResult | null> => {
    return callAI<MatchConfidenceResult>({
      type: "match-confidence",
      project_title: projectTitle,
      project_description: projectDescription,
      project_tags: projectTags,
      candidate_interests: candidateInterests,
      candidate_department: candidateDepartment,
      candidate_education_level: candidateEducationLevel,
    });
  };

  const analyzeProfileStrength = async (
    fullName?: string,
    university?: string,
    department?: string,
    educationLevel?: string,
    interests: string[] = [],
    portfolioCount: number = 0,
    verificationStatus: { student: boolean; researcher: boolean; partner: boolean } = {
      student: false,
      researcher: false,
      partner: false,
    }
  ): Promise<ProfileStrengthResult | null> => {
    return callAI<ProfileStrengthResult>({
      type: "profile-strength",
      full_name: fullName,
      university,
      department,
      education_level: educationLevel,
      interests,
      portfolio_count: portfolioCount,
      verification_status: verificationStatus,
    });
  };

  const getSuggestedPricing = async (
    projectTitle: string,
    projectDescription: string,
    projectTags: string[],
    deadlineDays?: number
  ): Promise<SuggestedPricingResult | null> => {
    return callAI<SuggestedPricingResult>({
      type: "suggested-pricing",
      project_title: projectTitle,
      project_description: projectDescription,
      project_tags: projectTags,
      deadline_days: deadlineDays,
    });
  };

  return {
    loading,
    error,
    checkProjectFeasibility,
    scoreBid,
    getMatchConfidence,
    analyzeProfileStrength,
    getSuggestedPricing,
  };
}
