/**
 * Abuse Resistance Hook
 * System 35 Enhanced: Economic Safety & Abuse Dampening
 * 
 * Client-side interface to the abuse resistance engine
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AbuseCheckResult {
  allowed: boolean;
  reason?: string;
  penalty_applied?: string;
  cooldown_seconds?: number;
  dampening_factor?: number;
  warnings?: string[];
}

export interface UserAbuseStatus {
  trust_status: {
    frozen: boolean;
    under_review: boolean;
    review_reason?: string;
    velocity_24h: number;
    velocity_7d: number;
  };
  economic_status: {
    wallet_frozen: boolean;
    wallet_under_review: boolean;
    velocity_24h: number;
    circular_flow_score: number;
    risk_score: number;
  };
  recent_flags: {
    pattern_type: string;
    severity: string;
    created_at: string;
    resolved: boolean;
  }[];
  rate_limits: {
    action_type: string;
    action_count: number;
    max_allowed: number;
    is_blocked: boolean;
    blocked_until?: string;
  }[];
}

export interface PatternDetectionResult {
  patterns_detected: string[];
  risk_score: number;
  actions_taken: string[];
}

export function useAbuseResistance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<AbuseCheckResult | null>(null);

  const callAbuseEngine = useCallback(async (
    action: string,
    data?: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    if (!user) throw new Error("User not authenticated");

    const { data: result, error } = await supabase.functions.invoke("abuse-resistance", {
      body: { action, user_id: user.id, data },
    });

    if (error) throw error;
    return result;
  }, [user]);

  // Check if a trust event is allowed
  const checkTrustEvent = useCallback(async (
    trustDelta: number,
    counterpartyId?: string
  ): Promise<AbuseCheckResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("check_trust_event", {
        trust_delta: trustDelta,
        counterparty_id: counterpartyId,
      });
      const checkResult = result as unknown as AbuseCheckResult;
      setLastCheck(checkResult);
      return checkResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Check if a transaction is allowed
  const checkTransaction = useCallback(async (
    amount: number,
    counterpartyId?: string
  ): Promise<AbuseCheckResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("check_transaction", {
        amount,
        counterparty_id: counterpartyId,
      });
      return result as unknown as AbuseCheckResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Check if opportunity posting is allowed
  const checkOpportunityPost = useCallback(async (): Promise<AbuseCheckResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("check_opportunity");
      return result as unknown as AbuseCheckResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Check if deal creation is allowed
  const checkDealCreation = useCallback(async (
    amount: number
  ): Promise<AbuseCheckResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("check_deal_creation", { amount });
      return result as unknown as AbuseCheckResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Check if AI usage is allowed
  const checkAIUsage = useCallback(async (): Promise<AbuseCheckResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("check_ai_usage");
      return result as unknown as AbuseCheckResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Run pattern detection for current user
  const detectPatterns = useCallback(async (): Promise<PatternDetectionResult> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("detect_patterns");
      return result as unknown as PatternDetectionResult;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Get current user's abuse status
  const getUserStatus = useCallback(async (): Promise<UserAbuseStatus> => {
    setLoading(true);
    try {
      const result = await callAbuseEngine("get_user_status");
      return result as unknown as UserAbuseStatus;
    } finally {
      setLoading(false);
    }
  }, [callAbuseEngine]);

  // Format cooldown for display
  const formatCooldown = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;
    return `${Math.ceil(seconds / 86400)} days`;
  }, []);

  // Get severity color
  const getSeverityColor = useCallback((severity: string): string => {
    switch (severity) {
      case "warning": return "text-yellow-600";
      case "moderate": return "text-orange-600";
      case "severe": return "text-red-600";
      default: return "text-gray-600";
    }
  }, []);

  return {
    loading,
    lastCheck,
    checkTrustEvent,
    checkTransaction,
    checkOpportunityPost,
    checkDealCreation,
    checkAIUsage,
    detectPatterns,
    getUserStatus,
    formatCooldown,
    getSeverityColor,
  };
}
