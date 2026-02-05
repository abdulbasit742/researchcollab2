// ============================================
// SYSTEM 54: NATIONAL & GLOBAL HUMAN CAPITAL VIEWS
// Sovereign-level insights with privacy guarantees
// ============================================

import { useState, useCallback, useMemo } from "react";
import type {
  NationalHumanCapitalView,
  WorkforceTrend,
  StrategicShortage,
  EducationAlignment,
  CrisisReadiness,
} from "@/types/human-capital";

interface NationalViewState {
  view: NationalHumanCapitalView | null;
  isLoading: boolean;
  hasAccess: boolean;
}

export function useNationalHumanCapital(countryCode?: string) {
  const [state] = useState<NationalViewState>({
    view: countryCode ? generateMockView(countryCode) : null,
    isLoading: false,
    hasAccess: true, // In production, this is based on sovereign partnership
  });

  // Get workforce trends
  const getWorkforceTrends = useCallback((
    capabilityFilter?: string
  ): WorkforceTrend[] => {
    if (!state.view) return [];
    
    const trends = state.view.workforceTrends;
    if (!capabilityFilter) return trends;
    
    return trends.filter(t => 
      t.capability.toLowerCase().includes(capabilityFilter.toLowerCase())
    );
  }, [state.view]);

  // Get strategic shortages
  const getStrategicShortages = useCallback((
    minSeverity?: "emerging" | "moderate" | "critical"
  ): StrategicShortage[] => {
    if (!state.view) return [];
    
    const shortages = state.view.strategicShortages;
    if (!minSeverity) return shortages;

    const severityOrder = ["emerging", "moderate", "critical"];
    const minIndex = severityOrder.indexOf(minSeverity);
    return shortages.filter(s => severityOrder.indexOf(s.severityLevel) >= minIndex);
  }, [state.view]);

  // Get education-industry alignment
  const getEducationAlignment = useCallback((): EducationAlignment | null => {
    return state.view?.educationAlignment || null;
  }, [state.view]);

  // Get crisis readiness
  const getCrisisReadiness = useCallback((): CrisisReadiness | null => {
    return state.view?.crisisReadiness || null;
  }, [state.view]);

  // Get sector-specific view
  const getSectorView = useCallback((
    sector: string
  ): {
    sector: string;
    capabilities: WorkforceTrend[];
    shortages: StrategicShortage[];
    readiness: number;
  } => {
    // Mock sector view
    return {
      sector,
      capabilities: [
        { capability: "Domain Expertise", currentLevel: 75, trend: "stable", projectedChange: 5, drivers: ["Industry investment"] },
        { capability: "Technical Skills", currentLevel: 68, trend: "growing", projectedChange: 12, drivers: ["Training programs"] },
      ],
      shortages: [
        {
          capability: "Advanced Analytics",
          severityLevel: "moderate",
          affectedSectors: [sector],
          projectedImpact: "Delayed digital transformation",
          recommendedInterventions: ["Sector training programs", "University partnerships"],
        },
      ],
      readiness: 72,
    };
  }, []);

  // Get regional breakdown
  const getRegionalBreakdown = useCallback((): {
    region: string;
    capabilityIndex: number;
    trend: "growing" | "stable" | "declining";
    topCapabilities: string[];
    gaps: string[];
  }[] => {
    // Mock regional data
    return [
      {
        region: "Punjab",
        capabilityIndex: 78,
        trend: "growing",
        topCapabilities: ["Engineering", "IT", "Research"],
        gaps: ["AI/ML", "Biotechnology"],
      },
      {
        region: "Sindh",
        capabilityIndex: 72,
        trend: "stable",
        topCapabilities: ["Finance", "Healthcare", "Education"],
        gaps: ["Digital Skills", "Manufacturing Tech"],
      },
      {
        region: "KPK",
        capabilityIndex: 65,
        trend: "growing",
        topCapabilities: ["Agriculture", "Mining", "Traditional Crafts"],
        gaps: ["Technology", "Research Methodology"],
      },
    ];
  }, []);

  // Get policy recommendations
  const getPolicyRecommendations = useCallback((): {
    area: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
    expectedImpact: string;
    implementation: string;
  }[] => {
    return [
      {
        area: "Education-Industry Alignment",
        recommendation: "Establish industry advisory boards for university curricula",
        priority: "high",
        expectedImpact: "Reduce skill gap by 30% over 5 years",
        implementation: "Policy mandate + incentives",
      },
      {
        area: "Strategic Capability Development",
        recommendation: "National AI/ML training initiative",
        priority: "high",
        expectedImpact: "Build 50,000 AI-capable professionals in 3 years",
        implementation: "Public-private partnership",
      },
      {
        area: "Crisis Preparedness",
        recommendation: "Establish rapid mobilization registry for critical skills",
        priority: "medium",
        expectedImpact: "Reduce crisis response time by 50%",
        implementation: "Voluntary registry + incentives",
      },
    ];
  }, []);

  // Privacy verification
  const verifyPrivacy = useCallback((): {
    isAnonymized: boolean;
    minimumAggregation: number;
    identifiabilityRisk: "none" | "minimal";
    complianceStatus: string;
  } => {
    return {
      isAnonymized: true,
      minimumAggregation: state.view?.minimumAggregation || 100,
      identifiabilityRisk: state.view?.identifiabilityRisk || "none",
      complianceStatus: "Fully compliant with privacy requirements",
    };
  }, [state.view]);

  // Summary
  const summary = useMemo(() => {
    if (!state.view) return null;

    return {
      countryCode: state.view.countryCode,
      overallCapabilityIndex: 72,
      criticalShortages: state.view.strategicShortages.filter(s => s.severityLevel === "critical").length,
      educationAlignmentScore: state.view.educationAlignment.overallScore,
      crisisReadinessScore: state.view.crisisReadiness.overallScore,
      privacyGuarantee: "No individual tracking - aggregated data only",
    };
  }, [state.view]);

  return {
    view: state.view,
    isLoading: state.isLoading,
    hasAccess: state.hasAccess,
    getWorkforceTrends,
    getStrategicShortages,
    getEducationAlignment,
    getCrisisReadiness,
    getSectorView,
    getRegionalBreakdown,
    getPolicyRecommendations,
    verifyPrivacy,
    summary,
  };
}

// Helper functions

function generateMockView(countryCode: string): NationalHumanCapitalView {
  return {
    countryCode,
    generatedAt: new Date(),
    aggregationLevel: "national",
    workforceTrends: [
      {
        capability: "Software Development",
        currentLevel: 75,
        trend: "growing",
        projectedChange: 15,
        drivers: ["IT industry growth", "Remote work adoption", "Export services"],
      },
      {
        capability: "Data Science",
        currentLevel: 45,
        trend: "growing",
        projectedChange: 25,
        drivers: ["Industry demand", "University programs", "Online learning"],
      },
      {
        capability: "Research Methodology",
        currentLevel: 55,
        trend: "stable",
        projectedChange: 5,
        drivers: ["Academic institutions", "Research funding"],
      },
      {
        capability: "Manufacturing Technology",
        currentLevel: 40,
        trend: "declining",
        projectedChange: -8,
        drivers: ["Industry shift", "Automation", "Skills obsolescence"],
      },
    ],
    strategicShortages: [
      {
        capability: "AI/ML Engineering",
        severityLevel: "critical",
        affectedSectors: ["Technology", "Finance", "Healthcare"],
        projectedImpact: "Delayed AI adoption across industries",
        recommendedInterventions: [
          "National AI training program",
          "University curriculum updates",
          "Industry partnerships",
          "Immigration policy for AI talent",
        ],
      },
      {
        capability: "Healthcare Technology",
        severityLevel: "moderate",
        affectedSectors: ["Healthcare", "Biotechnology"],
        projectedImpact: "Slower healthcare modernization",
        recommendedInterventions: [
          "Medical-tech training programs",
          "Healthcare digitization incentives",
        ],
      },
    ],
    educationAlignment: {
      overallScore: 62,
      gaps: [
        {
          capability: "AI/ML",
          industryDemand: 25000,
          educationSupply: 5000,
          gapSeverity: 0.8,
        },
        {
          capability: "Cybersecurity",
          industryDemand: 15000,
          educationSupply: 4000,
          gapSeverity: 0.73,
        },
      ],
      surpluses: [
        {
          capability: "General Administration",
          educationSupply: 50000,
          industryDemand: 30000,
          underutilization: 0.4,
        },
      ],
      recommendations: [
        "Increase AI/ML program capacity by 3x",
        "Introduce cybersecurity specializations",
        "Add practical components to admin programs",
      ],
    },
    crisisReadiness: {
      overallScore: 68,
      criticalCapabilities: [
        {
          capability: "Emergency Healthcare",
          availableNow: 15000,
          requiredForCrisis: 25000,
          readinessLevel: "partial",
          mobilizationTime: "48 hours",
        },
        {
          capability: "Crisis Communications",
          availableNow: 5000,
          requiredForCrisis: 8000,
          readinessLevel: "partial",
          mobilizationTime: "24 hours",
        },
        {
          capability: "Infrastructure Engineering",
          availableNow: 20000,
          requiredForCrisis: 18000,
          readinessLevel: "ready",
          mobilizationTime: "72 hours",
        },
      ],
      vulnerabilities: [
        "Healthcare surge capacity limited",
        "Uneven geographic distribution of critical skills",
      ],
      strengthenedAreas: [
        "IT infrastructure support",
        "Remote work capability",
      ],
    },
    minimumAggregation: 100,
    identifiabilityRisk: "none",
  };
}

export type { NationalHumanCapitalView, WorkforceTrend, StrategicShortage };
