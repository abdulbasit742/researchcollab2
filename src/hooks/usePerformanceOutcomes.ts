// ============================================
// SYSTEM 50: PERFORMANCE WITHOUT SURVEILLANCE
// Track performance via outcomes, not micrometrics
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PerformanceProfile,
  OutcomeMetrics,
  ReliabilityMetrics,
  RecoveryMetrics,
  CollaborationMetrics,
} from "@/types/human-capital";

// Explicitly define what we DON'T track
const EXCLUDED_METRICS = [
  "Hours worked",
  "Time online",
  "Keystrokes",
  "Mouse movements",
  "Screen time",
  "Message response time",
  "Break frequency",
  "Location tracking",
  "App usage",
  "Browser history",
];

interface PerformanceState {
  profile: PerformanceProfile | null;
  isLoading: boolean;
}

export function usePerformanceOutcomes(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [state] = useState<PerformanceState>({
    profile: targetUserId ? generateMockProfile(targetUserId) : null,
    isLoading: false,
  });

  // Get outcome metrics
  const getOutcomeMetrics = useCallback((): OutcomeMetrics | null => {
    return state.profile?.outcomeMetrics || null;
  }, [state.profile]);

  // Get reliability metrics
  const getReliabilityMetrics = useCallback((): ReliabilityMetrics | null => {
    return state.profile?.reliabilityMetrics || null;
  }, [state.profile]);

  // Get recovery metrics
  const getRecoveryMetrics = useCallback((): RecoveryMetrics | null => {
    return state.profile?.recoveryMetrics || null;
  }, [state.profile]);

  // Get collaboration metrics
  const getCollaborationMetrics = useCallback((): CollaborationMetrics | null => {
    return state.profile?.collaborationMetrics || null;
  }, [state.profile]);

  // Get what we explicitly don't track
  const getExcludedMetrics = useCallback((): string[] => {
    return EXCLUDED_METRICS;
  }, []);

  // Compute overall performance (outcome-based only)
  const computePerformance = useCallback((): {
    score: number;
    trend: "improving" | "stable" | "declining";
    factors: { factor: string; contribution: number; source: string }[];
  } => {
    if (!state.profile) {
      return { score: 0, trend: "stable", factors: [] };
    }

    const { outcomeMetrics, reliabilityMetrics, recoveryMetrics, collaborationMetrics } = state.profile;

    // Weight factors
    const factors = [
      { factor: "Outcome success rate", contribution: outcomeMetrics.successRate * 0.3, source: "outcomes" },
      { factor: "Quality consistency", contribution: outcomeMetrics.qualityConsistency * 0.2, source: "outcomes" },
      { factor: "On-time delivery", contribution: reliabilityMetrics.onTimeDelivery * 0.2, source: "reliability" },
      { factor: "Recovery ability", contribution: recoveryMetrics.recoveryRate * 0.15, source: "resilience" },
      { factor: "Collaboration quality", contribution: collaborationMetrics.teamOutcomes * 0.15 / 10, source: "collaboration" },
    ];

    const score = factors.reduce((sum, f) => sum + f.contribution, 0);

    return {
      score: Math.round(score),
      trend: state.profile.performanceTrend,
      factors,
    };
  }, [state.profile]);

  // Compare with peers (anonymized)
  const compareWithPeers = useCallback((
    dimension: "outcomes" | "reliability" | "recovery" | "collaboration"
  ): {
    userScore: number;
    peerAverage: number;
    percentile: number;
  } => {
    // Mock peer comparison
    const scores: Record<string, number> = {
      outcomes: state.profile?.outcomeMetrics.successRate || 0,
      reliability: state.profile?.reliabilityMetrics.onTimeDelivery || 0,
      recovery: state.profile?.recoveryMetrics.recoveryRate || 0,
      collaboration: (state.profile?.collaborationMetrics.teamOutcomes || 0) * 10,
    };

    return {
      userScore: scores[dimension],
      peerAverage: 72,
      percentile: 65 + Math.random() * 20,
    };
  }, [state.profile]);

  // Get improvement suggestions
  const getImprovementSuggestions = useCallback((): {
    area: string;
    currentScore: number;
    suggestion: string;
    potentialGain: number;
  }[] => {
    if (!state.profile) return [];

    const suggestions = [];

    if (state.profile.reliabilityMetrics.onTimeDelivery < 80) {
      suggestions.push({
        area: "On-time delivery",
        currentScore: state.profile.reliabilityMetrics.onTimeDelivery,
        suggestion: "Set earlier internal deadlines to buffer for unexpected delays",
        potentialGain: 15,
      });
    }

    if (state.profile.outcomeMetrics.qualityConsistency < 75) {
      suggestions.push({
        area: "Quality consistency",
        currentScore: state.profile.outcomeMetrics.qualityConsistency,
        suggestion: "Implement peer review checkpoints before delivery",
        potentialGain: 12,
      });
    }

    if (state.profile.collaborationMetrics.peerEndorsements < 5) {
      suggestions.push({
        area: "Peer relationships",
        currentScore: state.profile.collaborationMetrics.peerEndorsements * 10,
        suggestion: "Actively seek and provide peer feedback on projects",
        potentialGain: 10,
      });
    }

    return suggestions;
  }, [state.profile]);

  // Summary
  const summary = useMemo(() => {
    if (!state.profile) return null;

    return {
      overallPerformance: state.profile.overallPerformance,
      trend: state.profile.performanceTrend,
      completedOutcomes: state.profile.outcomeMetrics.completedOutcomes,
      successRate: state.profile.outcomeMetrics.successRate,
      onTimeRate: state.profile.reliabilityMetrics.onTimeDelivery,
      // Emphasis on what we DON'T track
      privacyGuarantee: "No surveillance metrics collected",
    };
  }, [state.profile]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    getOutcomeMetrics,
    getReliabilityMetrics,
    getRecoveryMetrics,
    getCollaborationMetrics,
    getExcludedMetrics,
    computePerformance,
    compareWithPeers,
    getImprovementSuggestions,
    summary,
    excludedMetrics: EXCLUDED_METRICS,
  };
}

// Helper functions

function generateMockProfile(userId: string): PerformanceProfile {
  return {
    userId,
    computedAt: new Date(),
    outcomeMetrics: {
      completedOutcomes: 24,
      successRate: 87,
      impactScore: 72,
      qualityConsistency: 81,
    },
    reliabilityMetrics: {
      onTimeDelivery: 84,
      commitmentHonoring: 91,
      responsiveness: 78,
      predictability: 85,
    },
    recoveryMetrics: {
      failureCount: 3,
      recoveryRate: 100,
      avgRecoveryTime: "2 weeks",
      learningDemonstrated: 85,
    },
    collaborationMetrics: {
      teamOutcomes: 12,
      peerEndorsements: 8,
      mentorshipImpact: 65,
      conflictResolution: 90,
    },
    overallPerformance: 82,
    performanceTrend: "improving",
    excludedMetrics: EXCLUDED_METRICS,
  };
}

export type { PerformanceProfile, OutcomeMetrics, ReliabilityMetrics };
