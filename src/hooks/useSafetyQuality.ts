import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Trust-based rate limits
export interface RateLimitConfig {
  postsPerDay: number;
  reactionsPerDay: number;
  messagesPerDay: number;
  opportunitiesPerWeek: number;
}

export function getTrustBasedRateLimits(trustScore: number): RateLimitConfig {
  if (trustScore >= 80) {
    // Platinum tier
    return {
      postsPerDay: 20,
      reactionsPerDay: 50,
      messagesPerDay: 100,
      opportunitiesPerWeek: 10,
    };
  } else if (trustScore >= 60) {
    // Gold tier
    return {
      postsPerDay: 10,
      reactionsPerDay: 30,
      messagesPerDay: 50,
      opportunitiesPerWeek: 5,
    };
  } else if (trustScore >= 40) {
    // Silver tier
    return {
      postsPerDay: 5,
      reactionsPerDay: 15,
      messagesPerDay: 20,
      opportunitiesPerWeek: 3,
    };
  } else {
    // Bronze tier
    return {
      postsPerDay: 2,
      reactionsPerDay: 5,
      messagesPerDay: 10,
      opportunitiesPerWeek: 1,
    };
  }
}

// Content quality scoring
export interface QualityScore {
  relevance: number;        // 0-100: How relevant to work/opportunity
  clarity: number;          // 0-100: How clear and actionable
  contextLinkage: number;   // 0-100: Whether linked to real work
  authorReliability: number;// 0-100: Author's historical reliability
  overall: number;          // 0-100: Weighted average
}

export function calculateContentQuality(content: {
  hasLinkedEntity: boolean;
  updateType: string;
  authorTrustScore: number;
  contentLength: number;
}): QualityScore {
  // Relevance: Higher for structured update types
  const structuredTypes = ['work_completed', 'research_milestone', 'case_outcome', 'lesson_learned'];
  const relevance = structuredTypes.includes(content.updateType) ? 80 : 40;
  
  // Clarity: Based on content length (not too short, not too long)
  const optimalLength = content.contentLength >= 50 && content.contentLength <= 500;
  const clarity = optimalLength ? 70 : 40;
  
  // Context linkage: Much higher if linked to actual work
  const contextLinkage = content.hasLinkedEntity ? 90 : 30;
  
  // Author reliability: Directly from trust score
  const authorReliability = content.authorTrustScore;
  
  // Weighted overall score
  const overall = Math.round(
    relevance * 0.25 +
    clarity * 0.15 +
    contextLinkage * 0.35 +
    authorReliability * 0.25
  );
  
  return {
    relevance,
    clarity,
    contextLinkage,
    authorReliability,
    overall,
  };
}

// Contextual reporting types
export type ContextualReportType =
  | 'misleading_outcome'
  | 'spam_opportunity'
  | 'low_effort_content'
  | 'unprofessional_conduct'
  | 'conflict_of_interest'
  | 'inaccurate_claims';

export const CONTEXTUAL_REPORT_TYPES: Record<ContextualReportType, {
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}> = {
  misleading_outcome: {
    label: "Misleading Outcome",
    description: "The claimed outcome is misleading or exaggerated",
    severity: 'high',
  },
  spam_opportunity: {
    label: "Spam Opportunity",
    description: "This opportunity appears to be spam or low-quality",
    severity: 'medium',
  },
  low_effort_content: {
    label: "Low-Effort Content",
    description: "This update lacks substance or professional value",
    severity: 'low',
  },
  unprofessional_conduct: {
    label: "Unprofessional Conduct",
    description: "The author is behaving unprofessionally",
    severity: 'medium',
  },
  conflict_of_interest: {
    label: "Conflict of Interest",
    description: "Undisclosed conflict of interest",
    severity: 'high',
  },
  inaccurate_claims: {
    label: "Inaccurate Claims",
    description: "Claims that cannot be verified or are known to be false",
    severity: 'high',
  },
};

// Hook for checking rate limits
export function useRateLimitCheck() {
  const { user } = useAuth();

  const checkRateLimit = useCallback(async (
    actionType: keyof RateLimitConfig,
    trustScore: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: string }> => {
    if (!user) {
      return { allowed: false, remaining: 0, resetIn: "Login required" };
    }

    const limits = getTrustBasedRateLimits(trustScore);
    const limit = limits[actionType];
    
    // Get count of actions in the relevant period
    const periodStart = actionType === 'opportunitiesPerWeek'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // This would query action counts from database
    // For now, return allowed
    const currentCount = 0; // Would be fetched from DB
    
    const remaining = Math.max(0, limit - currentCount);
    const resetTime = actionType === 'opportunitiesPerWeek' ? "7 days" : "24 hours";
    
    return {
      allowed: remaining > 0,
      remaining,
      resetIn: `Resets in ${resetTime}`,
    };
  }, [user]);

  return { checkRateLimit };
}

// Hook for contextual reporting
export function useContextualReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      reportType,
      explanation,
    }: {
      targetId: string;
      targetType: 'post' | 'comment' | 'opportunity' | 'user';
      reportType: ContextualReportType;
      explanation: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (explanation.length < 20) {
        throw new Error("Please provide a detailed explanation (at least 20 characters)");
      }

      // Map contextual report types to existing reason enum
      const reasonMapping: Record<ContextualReportType, "spam" | "misinformation" | "harassment" | "other"> = {
        'misleading_outcome': 'misinformation',
        'spam_opportunity': 'spam',
        'low_effort_content': 'spam',
        'unprofessional_conduct': 'harassment',
        'conflict_of_interest': 'other',
        'inaccurate_claims': 'misinformation',
      };

      // Map to existing reported_posts table
      const { error } = await supabase
        .from("reported_posts")
        .insert([{
          post_id: targetType === 'post' ? targetId : null,
          comment_id: targetType === 'comment' ? targetId : null,
          reporter_id: user.id,
          reason: reasonMapping[reportType],
          details: `[${reportType}] ${explanation}`,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Your contextual feedback helps maintain quality. Thank you.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot submit report",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Risk detection patterns
export interface RiskSignal {
  type: 'spam_pattern' | 'failed_deals' | 'trust_farming' | 'coordinated_activity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
}

export function useRiskDetection(userId: string) {
  return useQuery({
    queryKey: ["risk-signals", userId],
    queryFn: async (): Promise<RiskSignal[]> => {
      // This would analyze user patterns
      // For now, return empty (no risks detected)
      return [];
    },
    enabled: !!userId,
    staleTime: 60000, // Check every minute
  });
}

// Trust consequence system
export interface TrustConsequence {
  type: 'visibility_reduction' | 'messaging_limit' | 'opportunity_restriction' | 'review_required';
  reason: string;
  appliedAt: string;
  expiresAt: string | null;
  recoveryPath: string;
}

export function useTrustConsequences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trust-consequences", user?.id],
    queryFn: async (): Promise<TrustConsequence[]> => {
      if (!user) return [];
      
      // Would fetch from database
      // For now, return empty (no consequences)
      return [];
    },
    enabled: !!user,
  });
}
