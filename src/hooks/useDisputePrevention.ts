import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  averageResponseTime: number;
  responseTimetrend: "improving" | "stable" | "declining";
  sentimentScore: number;
  clarityScore: number;
  lastActivityAt: Date;
  redFlags: string[];
}

export interface DisputeRiskAssessment {
  dealId: string;
  dealTitle: string;
  overallRiskScore: number;
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
  estimatedImpact: number;
}

export function useDisputePrevention(dealId?: string) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<DisputeRiskAssessment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real deal data and compute risk assessments
  useEffect(() => {
    if (!user) return;

    const fetchDeals = async () => {
      setLoading(true);
      try {
        const { data: deals } = await supabase
          .from("deal_rooms")
          .select("id, title, status, buyer_id, seller_id, updated_at, deadline, agreed_amount")
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .not("status", "in", '("completed","cancelled")');

        if (!deals || deals.length === 0) {
          setAssessments([]);
          return;
        }

        const computed: DisputeRiskAssessment[] = deals.map((d: any) => {
          const indicators: DisputeRiskIndicator[] = [];
          let riskScore = 0;

          // Check deadline
          if (d.deadline) {
            const daysLeft = Math.ceil((new Date(d.deadline).getTime() - Date.now()) / 86400000);
            if (daysLeft < 0) {
              indicators.push({
                id: `${d.id}-overdue`,
                type: "milestone_slip",
                severity: daysLeft < -7 ? "high" : "medium",
                description: `Deal is ${Math.abs(daysLeft)} days past deadline`,
                detectedAt: new Date(),
                suggestedAction: "Request status update and revised timeline",
                isResolved: false,
              });
              riskScore += Math.min(40, Math.abs(daysLeft) * 5);
            }
          }

          // Check for disputed status
          if (d.status === "disputed") {
            indicators.push({
              id: `${d.id}-disputed`,
              type: "payment_concern",
              severity: "high",
              description: "Deal is in disputed state",
              detectedAt: new Date(),
              suggestedAction: "Engage in dispute resolution process",
              isResolved: false,
            });
            riskScore += 40;
          }

          // Check last activity
          const daysSinceUpdate = Math.ceil((Date.now() - new Date(d.updated_at).getTime()) / 86400000);
          if (daysSinceUpdate > 7) {
            indicators.push({
              id: `${d.id}-stale`,
              type: "communication_gap",
              severity: daysSinceUpdate > 14 ? "high" : "medium",
              description: `No activity for ${daysSinceUpdate} days`,
              detectedAt: new Date(),
              suggestedAction: "Send a progress check-in message",
              isResolved: false,
            });
            riskScore += Math.min(30, daysSinceUpdate * 2);
          }

          riskScore = Math.min(100, riskScore);
          const riskLevel = riskScore <= 20 ? "low" : riskScore <= 40 ? "moderate" : riskScore <= 60 ? "elevated" : riskScore <= 80 ? "high" : "critical";

          const recommendations: ProactiveRecommendation[] = [];
          if (daysSinceUpdate > 3) {
            recommendations.push({
              id: `${d.id}-comm`,
              priority: daysSinceUpdate > 7 ? "immediate" : "soon",
              category: "communication",
              title: "Re-establish Communication",
              description: "Send a progress update to maintain deal momentum",
              actionLabel: "Send Message",
              estimatedImpact: 20,
            });
          }

          return {
            dealId: d.id,
            dealTitle: d.title || "Untitled Deal",
            overallRiskScore: riskScore,
            riskLevel,
            indicators,
            communicationAnalysis: {
              dealId: d.id,
              totalMessages: 0,
              averageResponseTime: 0,
              responseTimetrend: "stable" as const,
              sentimentScore: 0.5,
              clarityScore: 70,
              lastActivityAt: new Date(d.updated_at),
              redFlags: [],
            },
            recommendations,
            lastAssessedAt: new Date(),
          };
        });

        setAssessments(computed);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [user]);

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
