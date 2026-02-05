// ============================================
// SYSTEM 51: INSTITUTIONAL TALENT STRATEGY DASHBOARDS
// Aggregated, anonymized views for authorized institutions
// ============================================

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  TalentStrategyDashboard,
  CapabilityDistribution,
  ReadinessHeatmap,
  SuccessionRisk,
  TalentBottleneck,
  WorkforceProjection,
  CapabilityCategory,
  ResponsibilityLevel,
} from "@/types/human-capital";

interface DashboardState {
  dashboard: TalentStrategyDashboard | null;
  isLoading: boolean;
  accessLevel: "full" | "aggregated" | "anonymized";
}

export function useTalentStrategyDashboard(institutionId?: string) {
  const { user } = useAuth();

  const [state] = useState<DashboardState>({
    dashboard: institutionId ? generateMockDashboard(institutionId) : null,
    isLoading: false,
    accessLevel: "aggregated",
  });

  // Get capability distribution
  const getCapabilityDistribution = useCallback((): CapabilityDistribution | null => {
    return state.dashboard?.capabilityDistribution || null;
  }, [state.dashboard]);

  // Get readiness heatmap
  const getReadinessHeatmap = useCallback((): ReadinessHeatmap | null => {
    return state.dashboard?.readinessHeatmap || null;
  }, [state.dashboard]);

  // Get succession risks
  const getSuccessionRisks = useCallback((
    minRiskLevel?: "low" | "medium" | "high" | "critical"
  ): SuccessionRisk[] => {
    if (!state.dashboard) return [];
    
    const risks = state.dashboard.successionRisks;
    if (!minRiskLevel) return risks;

    const riskOrder = ["low", "medium", "high", "critical"];
    const minIndex = riskOrder.indexOf(minRiskLevel);
    return risks.filter(r => riskOrder.indexOf(r.riskLevel) >= minIndex);
  }, [state.dashboard]);

  // Get talent bottlenecks
  const getTalentBottlenecks = useCallback((
    minSeverity?: number
  ): TalentBottleneck[] => {
    if (!state.dashboard) return [];
    
    const bottlenecks = state.dashboard.talentBottlenecks;
    if (!minSeverity) return bottlenecks;

    return bottlenecks.filter(b => b.bottleneckSeverity >= minSeverity);
  }, [state.dashboard]);

  // Get workforce projections
  const getWorkforceProjections = useCallback((
    scenario?: "baseline" | "growth" | "contraction"
  ): WorkforceProjection[] => {
    if (!state.dashboard) return [];
    
    const projections = state.dashboard.workforceProjections;
    if (!scenario) return projections;

    return projections.filter(p => p.scenario === scenario);
  }, [state.dashboard]);

  // Get critical roles needing attention
  const getCriticalRoles = useCallback((): {
    role: string;
    urgency: "immediate" | "near-term" | "strategic";
    action: string;
  }[] => {
    if (!state.dashboard) return [];

    const criticalRoles = state.dashboard.readinessHeatmap.criticalRoles
      .filter(r => r.riskLevel === "critical" || r.riskLevel === "high");

    return criticalRoles.map(role => ({
      role: role.role,
      urgency: role.riskLevel === "critical" ? "immediate" : "near-term",
      action: role.successorCount === 0
        ? "Identify and develop successors urgently"
        : "Accelerate successor development",
    }));
  }, [state.dashboard]);

  // Generate strategic recommendations
  const getStrategicRecommendations = useCallback((): {
    category: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
    timeframe: string;
  }[] => {
    if (!state.dashboard) return [];

    const recommendations = [];

    // Based on capability gaps
    if (state.dashboard.capabilityDistribution.gaps.length > 0) {
      recommendations.push({
        category: "Capability Development",
        recommendation: `Address gaps in: ${state.dashboard.capabilityDistribution.gaps.join(", ")}`,
        priority: "high" as const,
        timeframe: "3-6 months",
      });
    }

    // Based on succession risks
    const criticalSuccession = state.dashboard.successionRisks.filter(r => r.riskLevel === "critical");
    if (criticalSuccession.length > 0) {
      recommendations.push({
        category: "Succession Planning",
        recommendation: `${criticalSuccession.length} critical roles need succession attention`,
        priority: "high" as const,
        timeframe: "Immediate",
      });
    }

    // Based on bottlenecks
    const severeBottlenecks = state.dashboard.talentBottlenecks.filter(b => b.bottleneckSeverity > 0.7);
    if (severeBottlenecks.length > 0) {
      recommendations.push({
        category: "Talent Acquisition",
        recommendation: `Bottleneck in ${severeBottlenecks[0].capability} impacting ${severeBottlenecks[0].impact}`,
        priority: "high" as const,
        timeframe: "1-3 months",
      });
    }

    return recommendations;
  }, [state.dashboard]);

  // Summary
  const summary = useMemo(() => {
    if (!state.dashboard) return null;

    return {
      totalCapabilities: Object.values(state.dashboard.capabilityDistribution.byCategory).reduce((a, b) => a + b, 0),
      gapsCount: state.dashboard.capabilityDistribution.gaps.length,
      criticalSuccessionRisks: state.dashboard.successionRisks.filter(r => r.riskLevel === "critical").length,
      bottlenecksCount: state.dashboard.talentBottlenecks.length,
      accessLevel: state.dashboard.accessLevel,
    };
  }, [state.dashboard]);

  return {
    dashboard: state.dashboard,
    isLoading: state.isLoading,
    accessLevel: state.accessLevel,
    getCapabilityDistribution,
    getReadinessHeatmap,
    getSuccessionRisks,
    getTalentBottlenecks,
    getWorkforceProjections,
    getCriticalRoles,
    getStrategicRecommendations,
    summary,
  };
}

// Helper functions

function generateMockDashboard(institutionId: string): TalentStrategyDashboard {
  return {
    institutionId,
    generatedAt: new Date(),
    capabilityDistribution: {
      byCategory: {
        technical_skill: 145,
        applied_competence: 98,
        contextual_mastery: 67,
        decision_quality: 45,
        execution_reliability: 112,
        leadership_readiness: 38,
      },
      byStrength: {
        emerging: 85,
        developing: 156,
        established: 189,
        mastery: 75,
      },
      gaps: ["AI/ML", "Cloud Architecture", "Data Engineering"],
      surpluses: ["Project Management", "Research Methodology"],
    },
    readinessHeatmap: {
      byLevel: {
        individual_execution: { ready: 280, developing: 120, notReady: 45, avgTimeToReady: "N/A" },
        team_leadership: { ready: 85, developing: 145, notReady: 215, avgTimeToReady: "6 months" },
        project_ownership: { ready: 42, developing: 78, notReady: 325, avgTimeToReady: "12 months" },
        institutional_responsibility: { ready: 15, developing: 28, notReady: 402, avgTimeToReady: "2 years" },
        policy_influence: { ready: 5, developing: 12, notReady: 428, avgTimeToReady: "4 years" },
      },
      criticalRoles: [
        { role: "Director of Research", currentFilled: 1, required: 1, successorCount: 0, riskLevel: "critical" },
        { role: "Lead Data Scientist", currentFilled: 2, required: 3, successorCount: 1, riskLevel: "high" },
        { role: "Department Head", currentFilled: 4, required: 4, successorCount: 3, riskLevel: "medium" },
      ],
    },
    successionRisks: [
      {
        role: "Director of Research",
        currentHolder: "anon-001",
        riskLevel: "critical",
        successorReadiness: 35,
        timeToRisk: "18 months",
        mitigationOptions: ["Accelerate high-potential development", "External search", "Interim leadership plan"],
      },
      {
        role: "Lead Data Scientist",
        currentHolder: "anon-002",
        riskLevel: "high",
        successorReadiness: 55,
        timeToRisk: "24 months",
        mitigationOptions: ["Focused mentorship", "Stretch assignments", "External training"],
      },
    ],
    talentBottlenecks: [
      {
        capability: "Machine Learning",
        demand: 25,
        supply: 8,
        bottleneckSeverity: 0.85,
        impact: "Delayed AI initiatives",
        resolution: "Training program + targeted hiring",
      },
      {
        capability: "Cloud Architecture",
        demand: 15,
        supply: 6,
        bottleneckSeverity: 0.6,
        impact: "Slower infrastructure modernization",
        resolution: "Certification program",
      },
    ],
    workforceProjections: [
      {
        timeframe: "12 months",
        scenario: "baseline",
        projectedCapabilities: { "ML": 12, "Cloud": 10 },
        projectedGaps: ["Advanced AI", "Quantum Computing"],
        recommendedActions: ["Invest in AI training", "Partner with universities"],
      },
      {
        timeframe: "12 months",
        scenario: "growth",
        projectedCapabilities: { "ML": 20, "Cloud": 15 },
        projectedGaps: ["Leadership at scale"],
        recommendedActions: ["Accelerate hiring", "Leadership development program"],
      },
    ],
    accessLevel: "aggregated",
    dataScope: "All verified members",
  };
}

export type { TalentStrategyDashboard, SuccessionRisk, TalentBottleneck };
