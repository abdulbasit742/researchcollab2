import { useState, useCallback, useMemo } from "react";

export interface DisputeRiskIndicator {
  id: string;
  type: "delayed_response" | "scope_creep" | "unclear_deliverables" | "payment_concern" | "communication_gap" | "milestone_slip";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: Date;
  suggestedAction: string;
  isResolved: boolean;
  resolvedAt?: Date;
}

export interface DealCommunicationAnalysis {
  dealId: string;
  totalMessages: number;
  averageResponseTime: number; // hours
  responseTimetrend: "improving" | "stable" | "declining";
  sentimentScore: number; // -1 to 1
  clarityScore: number; // 0 to 100
  lastActivityAt: Date;
  redFlags: string[];
}

export interface DisputeRiskAssessment {
  dealId: string;
  dealTitle: string;
  overallRiskScore: number; // 0-100
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  indicators: DisputeRiskIndicator[];
  communicationAnalysis: DealCommunicationAnalysis;
  recommendations: ProactiveRecommendation[];
  lastAssessedAt: Date;
}

export interface ProactiveRecommendation {
  id: string;
  priority: "immediate" | "soon" | "when_possible";
  category: "communication" | "documentation" | "milestone" | "payment" | "scope";
  title: string;
  description: string;
  actionLabel: string;
  estimatedImpact: number; // risk reduction percentage
}

const MOCK_ASSESSMENTS: DisputeRiskAssessment[] = [
  {
    dealId: "deal-1",
    dealTitle: "AI Research Partnership",
    overallRiskScore: 28,
    riskLevel: "low",
    indicators: [
      {
        id: "ind-1",
        type: "communication_gap",
        severity: "low",
        description: "Last meaningful exchange was 5 days ago",
        detectedAt: new Date(Date.now() - 86400000),
        suggestedAction: "Send a brief progress update to maintain communication flow",
        isResolved: false,
      },
    ],
    communicationAnalysis: {
      dealId: "deal-1",
      totalMessages: 47,
      averageResponseTime: 4.2,
      responseTimetrend: "stable",
      sentimentScore: 0.72,
      clarityScore: 85,
      lastActivityAt: new Date(Date.now() - 86400000 * 5),
      redFlags: [],
    },
    recommendations: [
      {
        id: "rec-1",
        priority: "when_possible",
        category: "communication",
        title: "Schedule Regular Check-ins",
        description: "Consider setting up bi-weekly sync calls to maintain alignment",
        actionLabel: "Schedule Call",
        estimatedImpact: 15,
      },
    ],
    lastAssessedAt: new Date(),
  },
  {
    dealId: "deal-2",
    dealTitle: "Data Analytics Consulting",
    overallRiskScore: 62,
    riskLevel: "elevated",
    indicators: [
      {
        id: "ind-2",
        type: "scope_creep",
        severity: "medium",
        description: "3 new requirements added without formal change request",
        detectedAt: new Date(Date.now() - 86400000 * 2),
        suggestedAction: "Document scope changes and discuss timeline/budget impact",
        isResolved: false,
      },
      {
        id: "ind-3",
        type: "delayed_response",
        severity: "medium",
        description: "Average response time increased from 6 hours to 48 hours",
        detectedAt: new Date(Date.now() - 86400000 * 3),
        suggestedAction: "Address response delays directly with counterparty",
        isResolved: false,
      },
      {
        id: "ind-4",
        type: "milestone_slip",
        severity: "high",
        description: "Milestone 2 is 5 days overdue with no update provided",
        detectedAt: new Date(Date.now() - 86400000 * 5),
        suggestedAction: "Request immediate status update and revised timeline",
        isResolved: false,
      },
    ],
    communicationAnalysis: {
      dealId: "deal-2",
      totalMessages: 23,
      averageResponseTime: 48,
      responseTimetrend: "declining",
      sentimentScore: 0.31,
      clarityScore: 58,
      lastActivityAt: new Date(Date.now() - 86400000 * 2),
      redFlags: ["Response time increasing", "Unclear deliverable definitions", "Missing acknowledgments"],
    },
    recommendations: [
      {
        id: "rec-2",
        priority: "immediate",
        category: "scope",
        title: "Formalize Scope Changes",
        description: "Create a change request document for the 3 new requirements with updated timeline and cost",
        actionLabel: "Create Change Request",
        estimatedImpact: 35,
      },
      {
        id: "rec-3",
        priority: "immediate",
        category: "milestone",
        title: "Address Milestone Delay",
        description: "Request written explanation for delay and new completion date with consequences",
        actionLabel: "Request Update",
        estimatedImpact: 25,
      },
      {
        id: "rec-4",
        priority: "soon",
        category: "communication",
        title: "Establish Response SLA",
        description: "Propose a 24-hour response time agreement for critical matters",
        actionLabel: "Propose SLA",
        estimatedImpact: 15,
      },
    ],
    lastAssessedAt: new Date(),
  },
];

export function useDisputePrevention(dealId?: string) {
  const [assessments] = useState<DisputeRiskAssessment[]>(MOCK_ASSESSMENTS);
  const [loading, setLoading] = useState(false);

  const currentAssessment = useMemo(() => 
    dealId ? assessments.find(a => a.dealId === dealId) : null,
    [dealId, assessments]
  );

  const highRiskDeals = useMemo(() => 
    assessments.filter(a => a.riskLevel === "elevated" || a.riskLevel === "high" || a.riskLevel === "critical"),
    [assessments]
  );

  const totalActiveIndicators = useMemo(() => 
    assessments.reduce((sum, a) => sum + a.indicators.filter(i => !i.isResolved).length, 0),
    [assessments]
  );

  const analyzeRisk = useCallback(async (targetDealId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return assessments.find(a => a.dealId === targetDealId);
  }, [assessments]);

  const resolveIndicator = useCallback(async (indicatorId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Resolving indicator:", indicatorId);
    setLoading(false);
    return { success: true };
  }, []);

  const implementRecommendation = useCallback(async (recommendationId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Implementing recommendation:", recommendationId);
    setLoading(false);
    return { success: true };
  }, []);

  const getRiskColor = useCallback((level: DisputeRiskAssessment["riskLevel"]): string => {
    switch (level) {
      case "low": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "elevated": return "text-orange-600";
      case "high": return "text-red-600";
      case "critical": return "text-red-800";
      default: return "text-muted-foreground";
    }
  }, []);

  return {
    assessments,
    currentAssessment,
    highRiskDeals,
    totalActiveIndicators,
    loading,
    analyzeRisk,
    resolveIndicator,
    implementRecommendation,
    getRiskColor,
  };
}
