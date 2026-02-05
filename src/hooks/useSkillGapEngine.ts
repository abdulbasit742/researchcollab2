// ============================================
// SYSTEM 49: SKILL GAP & RESKILLING ENGINE
// Proactive detection and resolution of capability gaps
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  SkillGap,
  GapAnalysis,
  GapLevel,
  EmergingRisk,
  GapRecommendation,
  ReskillingPath,
  ReskillingStep,
} from "@/types/human-capital";

interface SkillGapState {
  individualGaps: SkillGap[];
  teamGaps: SkillGap[];
  institutionalGaps: SkillGap[];
  reskillingPaths: ReskillingPath[];
}

export function useSkillGapEngine(entityId?: string, level: GapLevel = "individual") {
  const { user } = useAuth();
  const targetId = entityId || user?.id || "";

  const [state] = useState<SkillGapState>(() => ({
    individualGaps: generateMockGaps(targetId, "individual"),
    teamGaps: [],
    institutionalGaps: [],
    reskillingPaths: [],
  }));

  // Analyze gaps for an entity
  const analyzeGaps = useCallback((
    entityId: string,
    level: GapLevel
  ): GapAnalysis => {
    const gaps = level === "individual"
      ? state.individualGaps
      : level === "team"
      ? state.teamGaps
      : state.institutionalGaps;

    const criticalGaps = gaps.filter(g => g.gapSeverity === "critical");
    
    return {
      level,
      entityId,
      gaps,
      criticalGaps,
      emergingRisks: detectEmergingRisks(gaps),
      recommendations: generateRecommendations(gaps, level),
    };
  }, [state]);

  // Get individual skill gaps
  const getIndividualGaps = useCallback((userId?: string): SkillGap[] => {
    return state.individualGaps.filter(g => !userId || g.entityId === userId);
  }, [state.individualGaps]);

  // Get team capability gaps
  const getTeamGaps = useCallback((teamId: string): SkillGap[] => {
    // Mock team gap detection
    return [
      {
        id: "gap-team-1",
        level: "team",
        entityId: teamId,
        capability: "Project Management",
        currentStrength: 55,
        requiredStrength: 75,
        gapSeverity: "moderate",
        detectedAt: new Date(),
        trend: "stable",
      },
    ];
  }, []);

  // Detect emerging risks before they become critical
  const detectEmergingRisks = useCallback((gaps: SkillGap[]): EmergingRisk[] => {
    return [
      {
        capability: "AI/ML Integration",
        projectedGapIn: "6-12 months",
        confidence: 0.75,
        drivers: ["Industry shift toward AI", "Limited current training", "Competitor adoption"],
      },
      {
        capability: "Remote Collaboration",
        projectedGapIn: "3-6 months",
        confidence: 0.65,
        drivers: ["Increasing remote work", "New collaboration tools", "Changing team structures"],
      },
    ];
  }, []);

  // Generate a reskilling path
  const generateReskillingPath = useCallback((
    userId: string,
    targetCapability: string,
    targetLevel: number
  ): ReskillingPath => {
    const steps: ReskillingStep[] = [
      {
        order: 1,
        type: "learning",
        description: "Complete foundational course",
        resources: ["Online course", "Documentation", "Tutorials"],
        estimatedTime: "2 weeks",
        completionCriteria: "Pass assessment with 80%+",
      },
      {
        order: 2,
        type: "practice",
        description: "Apply in controlled environment",
        resources: ["Practice projects", "Sandbox environment"],
        estimatedTime: "2 weeks",
        completionCriteria: "Complete 3 practice exercises",
      },
      {
        order: 3,
        type: "project",
        description: "Apply in real project with support",
        resources: ["Mentor support", "Code review"],
        estimatedTime: "4 weeks",
        completionCriteria: "Successful project completion",
      },
      {
        order: 4,
        type: "assessment",
        description: "Validate capability through assessment",
        resources: ["Peer review", "Outcome verification"],
        estimatedTime: "1 week",
        completionCriteria: "Peer endorsement received",
      },
    ];

    return {
      userId,
      targetCapability,
      currentLevel: 45,
      targetLevel,
      steps,
      estimatedDuration: "9 weeks",
      mentorRecommendations: ["mentor-1", "mentor-2"],
    };
  }, []);

  // Get recommended learning paths
  const getRecommendedPaths = useCallback((userId: string): ReskillingPath[] => {
    const gaps = state.individualGaps.filter(g => g.entityId === userId);
    return gaps
      .filter(g => g.gapSeverity !== "minor")
      .map(gap => generateReskillingPath(userId, gap.capability, gap.requiredStrength));
  }, [state.individualGaps, generateReskillingPath]);

  // Find mentors for a skill gap
  const findMentors = useCallback((
    capability: string,
    context?: string
  ): { userId: string; matchScore: number; availability: string }[] => {
    // Mock mentor matching
    return [
      { userId: "mentor-1", matchScore: 92, availability: "available" },
      { userId: "mentor-2", matchScore: 85, availability: "limited" },
      { userId: "mentor-3", matchScore: 78, availability: "available" },
    ];
  }, []);

  // Get institutional intervention recommendations
  const getInstitutionalInterventions = useCallback((
    institutionId: string
  ): {
    intervention: string;
    priority: "high" | "medium" | "low";
    scope: string;
    estimatedCost: string;
    expectedImpact: string;
  }[] => {
    return [
      {
        intervention: "AI/ML Training Program",
        priority: "high",
        scope: "All technical staff",
        estimatedCost: "$$",
        expectedImpact: "Address emerging AI gap within 6 months",
      },
      {
        intervention: "Mentorship Program Enhancement",
        priority: "medium",
        scope: "Cross-department",
        estimatedCost: "$",
        expectedImpact: "Improve capability transfer rate by 30%",
      },
    ];
  }, []);

  // Summary
  const summary = useMemo(() => ({
    totalGaps: state.individualGaps.length,
    criticalGaps: state.individualGaps.filter(g => g.gapSeverity === "critical").length,
    emergingRisks: 2,
    activeReskillingPaths: state.reskillingPaths.length,
  }), [state]);

  return {
    gaps: state.individualGaps,
    analyzeGaps,
    getIndividualGaps,
    getTeamGaps,
    detectEmergingRisks,
    generateReskillingPath,
    getRecommendedPaths,
    findMentors,
    getInstitutionalInterventions,
    summary,
  };
}

// Helper functions

function generateMockGaps(entityId: string, level: GapLevel): SkillGap[] {
  const now = new Date();
  
  return [
    {
      id: "gap-1",
      level,
      entityId,
      capability: "Machine Learning",
      currentStrength: 35,
      requiredStrength: 70,
      gapSeverity: "critical",
      detectedAt: now,
      trend: "widening",
    },
    {
      id: "gap-2",
      level,
      entityId,
      capability: "Cloud Architecture",
      currentStrength: 50,
      requiredStrength: 75,
      gapSeverity: "moderate",
      detectedAt: now,
      trend: "stable",
    },
    {
      id: "gap-3",
      level,
      entityId,
      capability: "Technical Writing",
      currentStrength: 60,
      requiredStrength: 70,
      gapSeverity: "minor",
      detectedAt: now,
      trend: "narrowing",
    },
  ];
}

function generateRecommendations(gaps: SkillGap[], level: GapLevel): GapRecommendation[] {
  const recommendations: GapRecommendation[] = [];
  
  for (const gap of gaps) {
    if (gap.gapSeverity === "critical") {
      recommendations.push({
        type: "learning_path",
        priority: "high",
        description: `Urgent: Address ${gap.capability} gap`,
        estimatedImpact: 25,
        estimatedTime: "2-3 months",
        resources: ["Intensive training", "Dedicated mentor"],
      });
    } else if (gap.gapSeverity === "moderate") {
      recommendations.push({
        type: "mentorship",
        priority: "medium",
        description: `Build ${gap.capability} through mentorship`,
        estimatedImpact: 15,
        estimatedTime: "3-6 months",
        resources: ["Mentor pairing", "Practice projects"],
      });
    }
  }
  
  if (level === "institution" && recommendations.length > 3) {
    recommendations.push({
      type: "institutional_intervention",
      priority: "high",
      description: "Consider organization-wide training program",
      estimatedImpact: 40,
      estimatedTime: "6-12 months",
      resources: ["Training budget", "External consultants"],
    });
  }

  return recommendations;
}

export type { SkillGap, GapAnalysis, ReskillingPath, GapLevel };
