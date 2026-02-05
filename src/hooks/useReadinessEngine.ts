// ============================================
// SYSTEM 47: READINESS & RESPONSIBILITY ENGINE
// Compute readiness levels for different responsibility tiers
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ResponsibilityLevel,
  ReadinessScore,
  ReadinessFactor,
  ReadinessProfile,
  NextLevelRequirement,
  ReadinessBlocker,
} from "@/types/human-capital";

interface ReadinessState {
  profile: ReadinessProfile | null;
  isComputing: boolean;
}

export function useReadinessEngine(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [state, setState] = useState<ReadinessState>({
    profile: targetUserId ? generateMockProfile(targetUserId) : null,
    isComputing: false,
  });

  // Compute readiness for a specific level
  const computeReadiness = useCallback((level: ResponsibilityLevel): ReadinessScore => {
    const factors = computeReadinessFactors(level);
    const baseScore = factors.reduce((sum, f) => sum + f.contribution, 0);
    const variance = 10; // Uncertainty range

    return {
      level,
      readinessRange: [
        Math.max(0, baseScore - variance),
        Math.min(100, baseScore + variance),
      ],
      confidence: 0.75 + Math.random() * 0.2,
      factors,
      contexts: getRelevantContexts(level),
      explanation: generateExplanation(level, factors),
    };
  }, []);

  // Get full readiness profile
  const getProfile = useCallback((): ReadinessProfile | null => {
    return state.profile;
  }, [state.profile]);

  // Check if user is ready for a specific level
  const isReadyFor = useCallback((level: ResponsibilityLevel): boolean => {
    const score = computeReadiness(level);
    return score.readinessRange[0] >= 60; // Minimum threshold
  }, [computeReadiness]);

  // Get requirements for next level
  const getNextLevelRequirements = useCallback((currentLevel: ResponsibilityLevel): NextLevelRequirement => {
    const levels: ResponsibilityLevel[] = [
      "individual_execution",
      "team_leadership",
      "project_ownership",
      "institutional_responsibility",
      "policy_influence",
    ];
    
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[Math.min(currentIndex + 1, levels.length - 1)];

    const requirements: Record<ResponsibilityLevel, string[]> = {
      individual_execution: [],
      team_leadership: [
        "Complete 10+ successful individual outcomes",
        "Demonstrate peer collaboration",
        "Show conflict resolution ability",
      ],
      project_ownership: [
        "Lead 3+ team efforts successfully",
        "Manage cross-functional coordination",
        "Handle budget/resource allocation",
      ],
      institutional_responsibility: [
        "Own 5+ major projects end-to-end",
        "Develop and mentor others",
        "Navigate organizational complexity",
      ],
      policy_influence: [
        "Demonstrate institutional impact",
        "Build external reputation",
        "Show strategic thinking across domains",
      ],
    };

    return {
      level: nextLevel,
      requirements: requirements[nextLevel],
      estimatedTimeToReady: estimateTimeToReady(currentLevel, nextLevel),
      suggestedActions: getSuggestedActions(nextLevel),
    };
  }, []);

  // Identify blockers to advancement
  const getBlockers = useCallback((targetLevel: ResponsibilityLevel): ReadinessBlocker[] => {
    const score = computeReadiness(targetLevel);
    const blockers: ReadinessBlocker[] = [];

    for (const factor of score.factors) {
      if (factor.contribution < 0) {
        blockers.push({
          blocker: factor.factor,
          severity: factor.contribution < -10 ? "significant" : factor.contribution < -5 ? "moderate" : "minor",
          remediation: getRemediation(factor.factor),
        });
      }
    }

    return blockers;
  }, [computeReadiness]);

  // Compare readiness across users (anonymized)
  const compareReadiness = useCallback((
    level: ResponsibilityLevel,
    cohortType: "domain" | "institution" | "experience"
  ): {
    userPercentile: number;
    cohortAverage: number;
    topQuartileThreshold: number;
  } => {
    // Mock comparison data
    return {
      userPercentile: 65 + Math.random() * 20,
      cohortAverage: 55,
      topQuartileThreshold: 75,
    };
  }, []);

  // Summary
  const summary = useMemo(() => {
    if (!state.profile) return null;

    const highestReady = state.profile.scores
      .filter(s => s.readinessRange[0] >= 60)
      .sort((a, b) => {
        const levels: ResponsibilityLevel[] = [
          "individual_execution",
          "team_leadership",
          "project_ownership",
          "institutional_responsibility",
          "policy_influence",
        ];
        return levels.indexOf(b.level) - levels.indexOf(a.level);
      })[0];

    return {
      highestReadyLevel: highestReady?.level || "individual_execution",
      overallTrajectory: state.profile.overallTrajectory,
      blockerCount: state.profile.blockers.length,
      nextMilestone: state.profile.nextLevelRequirements[0]?.level,
    };
  }, [state.profile]);

  return {
    profile: state.profile,
    isComputing: state.isComputing,
    computeReadiness,
    getProfile,
    isReadyFor,
    getNextLevelRequirements,
    getBlockers,
    compareReadiness,
    summary,
  };
}

// Helper functions

function generateMockProfile(userId: string): ReadinessProfile {
  const now = new Date();
  
  return {
    userId,
    computedAt: now,
    scores: [
      {
        level: "individual_execution",
        readinessRange: [78, 88],
        confidence: 0.9,
        factors: [
          { factor: "Outcome completion rate", contribution: 25, source: "outcomes", evidence: "15/18 projects completed" },
          { factor: "Trust consistency", contribution: 20, source: "trust_consistency", evidence: "Stable trust score" },
          { factor: "Self-management", contribution: 18, source: "outcomes", evidence: "On-time delivery 85%" },
        ],
        contexts: ["Research", "Data Analysis"],
        explanation: "Strong individual execution capability demonstrated through consistent outcome delivery.",
      },
      {
        level: "team_leadership",
        readinessRange: [55, 70],
        confidence: 0.8,
        factors: [
          { factor: "Collaboration outcomes", contribution: 18, source: "outcomes", evidence: "8 successful team projects" },
          { factor: "Peer signals", contribution: 12, source: "peer_signals", evidence: "3 leadership endorsements" },
          { factor: "Limited scope experience", contribution: -8, source: "outcomes", evidence: "Most projects <5 people" },
        ],
        contexts: ["Cross-functional teams", "Research groups"],
        explanation: "Developing team leadership capability. Need more experience with larger teams.",
      },
      {
        level: "project_ownership",
        readinessRange: [35, 50],
        confidence: 0.7,
        factors: [
          { factor: "End-to-end delivery", contribution: 15, source: "outcomes", evidence: "2 full project cycles" },
          { factor: "Resource management", contribution: 5, source: "outcomes", evidence: "Limited budget experience" },
          { factor: "Stakeholder management", contribution: -5, source: "outcomes", evidence: "No external stakeholder projects" },
        ],
        contexts: ["Academic projects"],
        explanation: "Emerging project ownership capability. Needs more end-to-end experience.",
      },
    ],
    overallTrajectory: "ascending",
    nextLevelRequirements: [
      {
        level: "team_leadership",
        requirements: ["Lead 2 more team projects", "Get peer leadership endorsements"],
        estimatedTimeToReady: "4-6 months",
        suggestedActions: ["Volunteer for team lead roles", "Seek mentorship from experienced leaders"],
      },
    ],
    blockers: [
      {
        blocker: "Limited large-team experience",
        severity: "moderate",
        remediation: "Seek opportunities with teams of 5+ members",
      },
    ],
  };
}

function computeReadinessFactors(level: ResponsibilityLevel): ReadinessFactor[] {
  // Mock factor computation
  const baseFactors: Record<ResponsibilityLevel, ReadinessFactor[]> = {
    individual_execution: [
      { factor: "Task completion", contribution: 25, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Quality consistency", contribution: 20, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Self-direction", contribution: 15, source: "outcomes", evidence: "Mock evidence" },
    ],
    team_leadership: [
      { factor: "Collaboration success", contribution: 20, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Peer respect", contribution: 15, source: "peer_signals", evidence: "Mock evidence" },
      { factor: "Conflict resolution", contribution: 10, source: "outcomes", evidence: "Mock evidence" },
    ],
    project_ownership: [
      { factor: "End-to-end delivery", contribution: 25, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Resource management", contribution: 15, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Stakeholder handling", contribution: 10, source: "outcomes", evidence: "Mock evidence" },
    ],
    institutional_responsibility: [
      { factor: "Strategic impact", contribution: 20, source: "outcomes", evidence: "Mock evidence" },
      { factor: "People development", contribution: 15, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Institutional knowledge", contribution: 15, source: "institutional_signals", evidence: "Mock evidence" },
    ],
    policy_influence: [
      { factor: "External reputation", contribution: 20, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Cross-domain expertise", contribution: 15, source: "outcomes", evidence: "Mock evidence" },
      { factor: "Thought leadership", contribution: 15, source: "peer_signals", evidence: "Mock evidence" },
    ],
  };

  return baseFactors[level] || [];
}

function getRelevantContexts(level: ResponsibilityLevel): string[] {
  const contexts: Record<ResponsibilityLevel, string[]> = {
    individual_execution: ["Technical work", "Research", "Analysis"],
    team_leadership: ["Small teams", "Cross-functional", "Remote teams"],
    project_ownership: ["End-to-end projects", "Budget management", "Stakeholder relations"],
    institutional_responsibility: ["Department", "Organization", "Multi-team"],
    policy_influence: ["Industry", "Government", "Academia"],
  };
  return contexts[level] || [];
}

function generateExplanation(level: ResponsibilityLevel, factors: ReadinessFactor[]): string {
  const totalScore = factors.reduce((sum, f) => sum + f.contribution, 0);
  if (totalScore >= 70) {
    return `Strong readiness for ${level.replace(/_/g, " ")} demonstrated through consistent performance.`;
  } else if (totalScore >= 50) {
    return `Developing readiness for ${level.replace(/_/g, " ")}. Continue building experience.`;
  }
  return `Emerging readiness for ${level.replace(/_/g, " ")}. Focus on foundational experiences.`;
}

function estimateTimeToReady(current: ResponsibilityLevel, next: ResponsibilityLevel): string {
  const estimates: Record<string, string> = {
    "individual_execution->team_leadership": "3-6 months",
    "team_leadership->project_ownership": "6-12 months",
    "project_ownership->institutional_responsibility": "1-2 years",
    "institutional_responsibility->policy_influence": "2-5 years",
  };
  return estimates[`${current}->${next}`] || "Varies";
}

function getSuggestedActions(level: ResponsibilityLevel): string[] {
  const actions: Record<ResponsibilityLevel, string[]> = {
    individual_execution: ["Complete assigned tasks", "Seek feedback", "Build technical skills"],
    team_leadership: ["Volunteer for coordination", "Mentor juniors", "Lead small initiatives"],
    project_ownership: ["Take end-to-end ownership", "Manage budgets", "Handle external stakeholders"],
    institutional_responsibility: ["Drive strategic initiatives", "Develop talent", "Build external presence"],
    policy_influence: ["Publish thought leadership", "Engage with policymakers", "Build cross-sector networks"],
  };
  return actions[level] || [];
}

function getRemediation(blocker: string): string {
  const remediations: Record<string, string> = {
    "Limited large-team experience": "Seek opportunities with teams of 5+ members",
    "Conflict resolution": "Take conflict resolution training and practice in safe environments",
    "Stakeholder management": "Volunteer for projects with external stakeholders",
  };
  return remediations[blocker] || "Seek mentorship and targeted experiences";
}

export type { ReadinessProfile, ReadinessScore, ResponsibilityLevel };
