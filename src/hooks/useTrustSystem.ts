import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Trust score weights
const TRUST_WEIGHTS = {
  delivery: 0.40,
  financial: 0.25,
  collaboration: 0.15,
  institutional: 0.10,
  consistency: 0.10,
};

// Time decay rate (2% per 30 days of inactivity)
const DECAY_RATE = 0.02;
const DECAY_PERIOD_DAYS = 30;

export interface TrustBreakdown {
  delivery: number;
  financial: number;
  collaboration: number;
  institutional: number;
  consistency: number;
  overall: number;
  tier: TrustTier;
  volatility: "stable" | "rising" | "falling" | "volatile";
  lastActivity: Date | null;
  decayWarning: boolean;
  recoveryPath: RecoveryStep[];
}

export interface TrustEvent {
  id: string;
  type: "positive" | "negative" | "neutral";
  category: keyof typeof TRUST_WEIGHTS;
  delta: number;
  description: string;
  timestamp: Date;
  reversible: boolean;
}

export interface RecoveryStep {
  id: string;
  action: string;
  impact: number;
  difficulty: "easy" | "medium" | "hard";
  timeEstimate: string;
  completed: boolean;
}

export type TrustTier = "platinum" | "gold" | "silver" | "bronze" | "unverified";

export function getTrustTier(score: number): TrustTier {
  if (score >= 90) return "platinum";
  if (score >= 75) return "gold";
  if (score >= 50) return "silver";
  if (score >= 25) return "bronze";
  return "unverified";
}

export function getTrustTierColor(tier: TrustTier): string {
  switch (tier) {
    case "platinum":
      return "bg-gradient-to-r from-slate-400 to-slate-600 text-white";
    case "gold":
      return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    case "silver":
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-800";
    case "bronze":
      return "bg-gradient-to-r from-orange-600 to-orange-800 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function useTrustSystem(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [breakdown, setBreakdown] = useState<TrustBreakdown | null>(null);
  const [events, setEvents] = useState<TrustEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateRecoveryPath = useCallback((breakdown: Partial<TrustBreakdown>): RecoveryStep[] => {
    const steps: RecoveryStep[] = [];
    
    // Analyze weak areas and suggest recovery
    if ((breakdown.delivery || 0) < 70) {
      steps.push({
        id: "delivery-1",
        action: "Complete 3 small projects successfully",
        impact: 15,
        difficulty: "medium",
        timeEstimate: "2-4 weeks",
        completed: false,
      });
    }
    
    if ((breakdown.financial || 0) < 70) {
      steps.push({
        id: "financial-1",
        action: "Maintain clean escrow history for 30 days",
        impact: 10,
        difficulty: "easy",
        timeEstimate: "30 days",
        completed: false,
      });
    }
    
    if ((breakdown.collaboration || 0) < 70) {
      steps.push({
        id: "collab-1",
        action: "Receive 5 positive collaboration reviews",
        impact: 8,
        difficulty: "medium",
        timeEstimate: "2-6 weeks",
        completed: false,
      });
    }
    
    if ((breakdown.institutional || 0) < 50) {
      steps.push({
        id: "inst-1",
        action: "Complete institution verification",
        impact: 12,
        difficulty: "easy",
        timeEstimate: "1-3 days",
        completed: false,
      });
    }
    
    if ((breakdown.consistency || 0) < 70) {
      steps.push({
        id: "consist-1",
        action: "Maintain regular platform activity for 60 days",
        impact: 6,
        difficulty: "easy",
        timeEstimate: "60 days",
        completed: false,
      });
    }
    
    return steps.sort((a, b) => b.impact - a.impact);
  }, []);

  const calculateVolatility = useCallback((events: TrustEvent[]): TrustBreakdown["volatility"] => {
    if (events.length < 5) return "stable";
    
    const recentEvents = events.slice(0, 10);
    const positiveCount = recentEvents.filter(e => e.type === "positive").length;
    const negativeCount = recentEvents.filter(e => e.type === "negative").length;
    
    if (positiveCount > 7) return "rising";
    if (negativeCount > 7) return "falling";
    if (positiveCount > 3 && negativeCount > 3) return "volatile";
    return "stable";
  }, []);

  const fetchTrustData = useCallback(async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch trust profile
      const { data: trustProfile, error: trustError } = await supabase
        .from("user_trust_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();
        
      if (trustError) throw trustError;
      
      // Calculate breakdown from profile or use defaults
      const trustScore = trustProfile?.trust_score || 50;
      const verificationLevel = trustProfile?.verification_level || "basic";
      
      // Simulate component scores based on overall score
      const baseBreakdown = {
        delivery: Math.min(100, trustScore + Math.random() * 10 - 5),
        financial: Math.min(100, trustScore + Math.random() * 10 - 5),
        collaboration: Math.min(100, trustScore + Math.random() * 10 - 5),
        institutional: verificationLevel === "verified" ? 85 : 40,
        consistency: Math.min(100, trustScore + Math.random() * 10 - 5),
      };
      
      // Calculate last activity
      const lastActivity = trustProfile?.updated_at 
        ? new Date(trustProfile.updated_at)
        : null;
        
      // Check for decay warning
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const decayWarning = daysSinceActivity > DECAY_PERIOD_DAYS - 7;
      
      // Mock events for now
      const mockEvents: TrustEvent[] = [
        {
          id: "1",
          type: "positive",
          category: "delivery",
          delta: 3,
          description: "Successfully completed project milestone",
          timestamp: new Date(Date.now() - 86400000),
          reversible: false,
        },
        {
          id: "2",
          type: "neutral",
          category: "financial",
          delta: 0,
          description: "Escrow released on time",
          timestamp: new Date(Date.now() - 172800000),
          reversible: false,
        },
      ];
      
      const volatility = calculateVolatility(mockEvents);
      const recoveryPath = calculateRecoveryPath(baseBreakdown);
      
      setBreakdown({
        ...baseBreakdown,
        overall: trustScore,
        tier: getTrustTier(trustScore),
        volatility,
        lastActivity,
        decayWarning,
        recoveryPath,
      });
      
      setEvents(mockEvents);
    } catch (err: any) {
      console.error("Error fetching trust data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, calculateVolatility, calculateRecoveryPath]);

  useEffect(() => {
    fetchTrustData();
  }, [fetchTrustData]);

  // Calculate improvement suggestions
  const improvementSuggestions = useMemo(() => {
    if (!breakdown) return [];
    
    const suggestions: { category: string; suggestion: string; priority: number }[] = [];
    
    if (breakdown.delivery < 70) {
      suggestions.push({
        category: "Delivery",
        suggestion: "Focus on completing current projects before taking new ones",
        priority: 1,
      });
    }
    
    if (breakdown.financial < 70) {
      suggestions.push({
        category: "Financial",
        suggestion: "Ensure timely responses to escrow milestones",
        priority: 2,
      });
    }
    
    if (breakdown.institutional < 50) {
      suggestions.push({
        category: "Verification",
        suggestion: "Complete your institutional verification for higher trust",
        priority: 3,
      });
    }
    
    return suggestions.sort((a, b) => a.priority - b.priority);
  }, [breakdown]);

  return {
    breakdown,
    events,
    loading,
    error,
    improvementSuggestions,
    refresh: fetchTrustData,
    weights: TRUST_WEIGHTS,
  };
}

// Hook for trust comparison
export function useTrustComparison(userIds: string[]) {
  const [comparisons, setComparisons] = useState<Map<string, TrustBreakdown>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisons = async () => {
      const results = new Map<string, TrustBreakdown>();
      
      for (const userId of userIds) {
        const { data } = await supabase
          .from("user_trust_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
          
        if (data) {
          results.set(userId, {
            delivery: data.trust_score || 50,
            financial: data.trust_score || 50,
            collaboration: data.trust_score || 50,
            institutional: 50,
            consistency: data.trust_score || 50,
            overall: data.trust_score || 50,
            tier: getTrustTier(data.trust_score || 50),
            volatility: "stable",
            lastActivity: null,
            decayWarning: false,
            recoveryPath: [],
          });
        }
      }
      
      setComparisons(results);
      setLoading(false);
    };
    
    if (userIds.length > 0) {
      fetchComparisons();
    }
  }, [userIds]);

  return { comparisons, loading };
}

// Hook for trust audit trail
export function useTrustAuditTrail(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [auditTrail, setAuditTrail] = useState<TrustEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from a trust_events table
    const mockAuditTrail: TrustEvent[] = [
      {
        id: "audit-1",
        type: "positive",
        category: "delivery",
        delta: 5,
        description: "Project completed with positive review",
        timestamp: new Date(Date.now() - 86400000 * 7),
        reversible: false,
      },
      {
        id: "audit-2",
        type: "positive",
        category: "institutional",
        delta: 10,
        description: "Institution verification completed",
        timestamp: new Date(Date.now() - 86400000 * 14),
        reversible: false,
      },
      {
        id: "audit-3",
        type: "negative",
        category: "delivery",
        delta: -8,
        description: "Missed project deadline",
        timestamp: new Date(Date.now() - 86400000 * 30),
        reversible: false,
      },
    ];
    
    setAuditTrail(mockAuditTrail);
    setLoading(false);
  }, [targetUserId]);

  return { auditTrail, loading };
}
