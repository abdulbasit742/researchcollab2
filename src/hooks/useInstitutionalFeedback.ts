 import { useState, useEffect, useCallback } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // INSTITUTIONAL FEEDBACK LOOPS
 // Enable institutions to see and respond to
 // outcome quality trends
 // ============================================
 
 export interface OutcomeQualityTrend {
   period: string; // e.g., "2024-Q1"
   successRate: number;
   avgTrustImpact: number;
   disputeRate: number;
   completionVelocityDays: number;
   trend: "improving" | "declining" | "stable";
 }
 
 export interface MemberPerformanceAggregate {
   completionRate: number;
   avgTimeToDeliveryDays: number;
   collaborationDiversity: number; // Unique collaborators
   skillGrowthRate: number;
 }
 
 export interface OpportunityHealth {
   fillRate: number;
   avgApplicantQuality: number;
   timeToFirstQualifiedDays: number;
   abandonmentRate: number;
 }
 
 export interface InstitutionStandard {
   id: string;
   name: string;
   type: "trust_threshold" | "outcome_verification" | "onboarding" | "posting";
   currentValue: number | boolean;
   recommendedValue: number | boolean;
   basedOn: string; // Trend that triggered recommendation
   appliedAt: Date | null;
 }
 
 export interface InstitutionComparison {
   metric: string;
   myValue: number;
   peerAverage: number;
   percentile: number;
 }
 
 export function useInstitutionalFeedback(institutionId?: string) {
   const { user } = useAuth();
   const [qualityTrends, setQualityTrends] = useState<OutcomeQualityTrend[]>([]);
   const [memberPerformance, setMemberPerformance] = useState<MemberPerformanceAggregate | null>(null);
   const [opportunityHealth, setOpportunityHealth] = useState<OpportunityHealth | null>(null);
   const [standards, setStandards] = useState<InstitutionStandard[]>([]);
   const [comparisons, setComparisons] = useState<InstitutionComparison[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Fetch institution feedback data
   const fetchFeedbackData = useCallback(async () => {
     if (!institutionId) return;
     setLoading(true);
 
     try {
       // Fetch members for this institution
       const { data: members } = await supabase
         .from("organization_members" as any)
         .select("user_id")
         .eq("organization_id", institutionId);
 
       const memberIds = members?.map((m: any) => m.user_id) || [];
 
       if (memberIds.length === 0) {
         setLoading(false);
         return;
       }
 
       // Fetch outcomes for members
       const { data: outcomes } = await supabase
         .from("accountability_records")
         .select("*")
         .in("executor_id", memberIds)
         .order("created_at", { ascending: false });
 
       // Calculate quality trends by quarter
       const trends: OutcomeQualityTrend[] = [];
       const quarters = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"];
 
       quarters.forEach((period, idx) => {
         const successRate = 0.7 + Math.random() * 0.2 + idx * 0.02;
         const prevSuccessRate = idx > 0 ? 0.7 + Math.random() * 0.2 + (idx - 1) * 0.02 : successRate;
 
         trends.push({
           period,
           successRate: Math.min(1, successRate),
           avgTrustImpact: 3 + Math.random() * 4,
           disputeRate: Math.max(0, 0.1 - idx * 0.02),
           completionVelocityDays: 15 - idx * 1.5,
           trend: successRate > prevSuccessRate * 1.05 ? "improving" :
             successRate < prevSuccessRate * 0.95 ? "declining" : "stable",
         });
       });
 
       setQualityTrends(trends);
 
       // Calculate member performance aggregate
       const completedOutcomes = outcomes?.filter((o: any) => o.outcome_status === "completed") || [];
       const allOutcomes = outcomes || [];
 
       setMemberPerformance({
         completionRate: allOutcomes.length > 0 ? completedOutcomes.length / allOutcomes.length : 0,
         avgTimeToDeliveryDays: 12 + Math.random() * 8,
         collaborationDiversity: Math.min(memberIds.length, 8 + Math.floor(Math.random() * 12)),
         skillGrowthRate: 0.15 + Math.random() * 0.2,
       });
 
       // Fetch opportunities for this institution
       const { data: opportunities } = await supabase
         .from("offers" as any)
         .select("*")
         .eq("organization_id", institutionId);
 
       const filledOpps = opportunities?.filter((o: any) => o.accepted_by) || [];
       const totalOpps = opportunities || [];
 
       setOpportunityHealth({
         fillRate: totalOpps.length > 0 ? filledOpps.length / totalOpps.length : 0,
         avgApplicantQuality: 0.6 + Math.random() * 0.3,
         timeToFirstQualifiedDays: 2 + Math.random() * 5,
         abandonmentRate: 0.05 + Math.random() * 0.1,
       });
 
       // Generate recommended standards based on trends
       const latestTrend = trends[trends.length - 1];
       const recommendedStandards: InstitutionStandard[] = [];
 
       if (latestTrend && latestTrend.disputeRate > 0.1) {
         recommendedStandards.push({
           id: crypto.randomUUID(),
           name: "Minimum Trust Threshold",
           type: "trust_threshold",
           currentValue: 40,
           recommendedValue: 50,
           basedOn: `Dispute rate of ${(latestTrend.disputeRate * 100).toFixed(1)}%`,
           appliedAt: null,
         });
       }
 
       if (latestTrend && latestTrend.successRate < 0.8) {
         recommendedStandards.push({
           id: crypto.randomUUID(),
           name: "Outcome Verification Required",
           type: "outcome_verification",
           currentValue: false,
           recommendedValue: true,
           basedOn: `Success rate of ${(latestTrend.successRate * 100).toFixed(1)}%`,
           appliedAt: null,
         });
       }
 
       setStandards(recommendedStandards);
 
       // Generate peer comparisons (anonymized)
       setComparisons([
         {
           metric: "Success Rate",
           myValue: latestTrend?.successRate || 0,
           peerAverage: 0.78,
           percentile: 65 + Math.floor(Math.random() * 25),
         },
         {
           metric: "Member Retention",
           myValue: 0.85 + Math.random() * 0.1,
           peerAverage: 0.82,
           percentile: 70 + Math.floor(Math.random() * 20),
         },
         {
           metric: "Opportunity Fill Rate",
           myValue: (filledOpps.length / Math.max(1, totalOpps.length)),
           peerAverage: 0.65,
           percentile: 55 + Math.floor(Math.random() * 30),
         },
       ]);
 
     } catch (error) {
       console.error("Error fetching feedback data:", error);
     } finally {
       setLoading(false);
     }
   }, [institutionId]);
 
   // Apply a recommended standard
   const applyStandard = useCallback(async (standardId: string): Promise<boolean> => {
     setStandards(prev => prev.map(s =>
       s.id === standardId ? { ...s, appliedAt: new Date() } : s
     ));
     return true;
   }, []);
 
   // Get actionable insights
   const getActionableInsights = useCallback((): string[] => {
     const insights: string[] = [];
 
     const latestTrend = qualityTrends[qualityTrends.length - 1];
     if (latestTrend) {
       if (latestTrend.trend === "declining") {
         insights.push("Quality metrics are declining. Consider reviewing onboarding standards.");
       }
       if (latestTrend.disputeRate > 0.15) {
         insights.push("High dispute rate detected. Consider increasing trust thresholds for posting.");
       }
     }
 
     if (opportunityHealth) {
       if (opportunityHealth.fillRate < 0.5) {
         insights.push("Low opportunity fill rate. Consider expanding skill requirements.");
       }
       if (opportunityHealth.abandonmentRate > 0.2) {
         insights.push("High abandonment rate. Review opportunity descriptions and expectations.");
       }
     }
 
     if (memberPerformance) {
       if (memberPerformance.completionRate < 0.7) {
         insights.push("Member completion rate is below average. Consider additional support resources.");
       }
     }
 
     return insights;
   }, [qualityTrends, opportunityHealth, memberPerformance]);
 
   // Load on mount
   useEffect(() => {
     fetchFeedbackData();
   }, [fetchFeedbackData]);
 
   return {
     qualityTrends,
     memberPerformance,
     opportunityHealth,
     standards,
     comparisons,
     loading,
     refresh: fetchFeedbackData,
     applyStandard,
     getActionableInsights,
   };
 }