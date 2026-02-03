import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// CAREER CO-PILOT: AI-POWERED PROFESSIONAL GUIDANCE
// =====================================================

export interface CareerInsight {
  type: "opportunity" | "trust" | "skill" | "risk" | "growth";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: {
    label: string;
    href: string;
  };
}

export interface CareerAdvice {
  question: string;
  answer: string;
  insights: CareerInsight[];
  nextSteps: string[];
  confidenceLevel: "high" | "medium" | "low";
}

export interface TrustAnalysis {
  current_score: number;
  trajectory: "improving" | "stable" | "declining";
  blockers: string[];
  accelerators: string[];
  timeline_to_next_tier: string;
}

export interface OpportunityRecommendation {
  id: string;
  title: string;
  match_confidence: number;
  match_reasons: string[];
  risk_factors: string[];
  recommended_bid_range?: { min: number; max: number };
}

export function useCareerCopilot() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askCopilot = async (question: string): Promise<CareerAdvice | null> => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the Career Co-pilot.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-copilot", {
        body: {
          type: "ask",
          question,
          user_id: user.id,
        },
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      return data.result as CareerAdvice;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Co-pilot Error",
        description: "Unable to get advice right now. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrust = async (): Promise<TrustAnalysis | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-copilot", {
        body: {
          type: "trust-analysis",
          user_id: user.id,
        },
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      return data.result as TrustAnalysis;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOpportunityAdvice = async (
    opportunityId: string
  ): Promise<OpportunityRecommendation | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-copilot", {
        body: {
          type: "opportunity-advice",
          opportunity_id: opportunityId,
          user_id: user.id,
        },
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      return data.result as OpportunityRecommendation;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFailureRecoveryPlan = async (projectId: string): Promise<{
    analysis: string;
    root_causes: string[];
    recovery_steps: string[];
    timeline: string;
    trust_recovery_estimate: number;
  } | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-copilot", {
        body: {
          type: "failure-recovery",
          project_id: projectId,
          user_id: user.id,
        },
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      return data.result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyInsights = async (): Promise<CareerInsight[] | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-copilot", {
        body: {
          type: "weekly-insights",
          user_id: user.id,
        },
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      return data.result as CareerInsight[];
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    askCopilot,
    analyzeTrust,
    getOpportunityAdvice,
    getFailureRecoveryPlan,
    getWeeklyInsights,
  };
}
