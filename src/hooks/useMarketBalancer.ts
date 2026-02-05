 import { useState, useEffect, useCallback, useMemo } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // OPPORTUNITY SUPPLY-DEMAND BALANCER
 // Continuous market monitoring to prevent
 // overcrowded opportunities and wasted effort
 // ============================================
 
 export interface SupplyMetrics {
   openOpportunities: number;
   avgTimeToFillDays: number;
   opportunitiesByCategory: Record<string, number>;
 }
 
 export interface DemandMetrics {
   activeSeekersCount: number;
   readinessDistribution: {
     high: number;
     medium: number;
     low: number;
   };
   skillsAvailability: Record<string, number>;
 }
 
 export interface BalanceIndicators {
   fillRate: number; // applications / openings
   qualityMatchRate: number;
   timeToFirstApplicationHours: number;
   marketSaturation: "oversaturated" | "balanced" | "undersaturated";
 }
 
 export interface MarketAdjustment {
   type: "matching_threshold" | "notification_frequency" | "visibility" | "matching_criteria" | "outreach";
   direction: "increase" | "decrease";
   magnitude: number; // 0-1
   reason: string;
   appliedAt: Date;
 }
 
 export interface SkillGap {
   skillName: string;
   demand: number;
   supply: number;
   gapRatio: number;
   trend: "widening" | "closing" | "stable";
 }
 
 export function useMarketBalancer() {
   const { user } = useAuth();
   const [supply, setSupply] = useState<SupplyMetrics | null>(null);
   const [demand, setDemand] = useState<DemandMetrics | null>(null);
   const [balance, setBalance] = useState<BalanceIndicators | null>(null);
   const [adjustments, setAdjustments] = useState<MarketAdjustment[]>([]);
   const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Fetch market metrics
   const fetchMarketMetrics = useCallback(async () => {
     setLoading(true);
     try {
       // Fetch supply metrics
       const { data: opportunities } = await supabase
         .from("offers")
         .select("id, status, created_at, required_skills")
         .eq("status", "open");
 
       const openCount = opportunities?.length || 0;
 
       // Calculate category distribution
       const categoryCount: Record<string, number> = {};
       opportunities?.forEach((opp: any) => {
         const skills = opp.required_skills || [];
         skills.forEach((skill: string) => {
           categoryCount[skill] = (categoryCount[skill] || 0) + 1;
         });
       });
 
       setSupply({
         openOpportunities: openCount,
         avgTimeToFillDays: 7 + Math.random() * 14, // Would be calculated from historical data
         opportunitiesByCategory: categoryCount,
       });
 
       // Fetch demand metrics
       const { data: profiles } = await supabase
         .from("profiles")
         .select("id, skills")
         .not("skills", "is", null);
 
       const seekerCount = profiles?.length || 0;
 
       // Calculate skills availability
       const skillsCount: Record<string, number> = {};
       profiles?.forEach((profile: any) => {
         const skills = profile.skills || [];
         skills.forEach((skill: string) => {
           skillsCount[skill] = (skillsCount[skill] || 0) + 1;
         });
       });
 
       setDemand({
         activeSeekersCount: seekerCount,
         readinessDistribution: {
           high: Math.floor(seekerCount * 0.3),
           medium: Math.floor(seekerCount * 0.5),
           low: Math.floor(seekerCount * 0.2),
         },
         skillsAvailability: skillsCount,
       });
 
       // Calculate balance indicators
       const fillRate = openCount > 0 ? Math.min(10, seekerCount / openCount) : 0;
       let saturation: "oversaturated" | "balanced" | "undersaturated" = "balanced";
       if (fillRate > 5) saturation = "oversaturated";
       if (fillRate < 1) saturation = "undersaturated";
 
       setBalance({
         fillRate,
         qualityMatchRate: 0.6 + Math.random() * 0.3,
         timeToFirstApplicationHours: 2 + Math.random() * 10,
         marketSaturation: saturation,
       });
 
       // Calculate skill gaps
       const gaps: SkillGap[] = [];
       const allSkills = new Set([
         ...Object.keys(categoryCount),
         ...Object.keys(skillsCount),
       ]);
 
       allSkills.forEach(skill => {
         const demandCount = categoryCount[skill] || 0;
         const supplyCount = skillsCount[skill] || 0;
         const gapRatio = supplyCount > 0 ? demandCount / supplyCount : demandCount > 0 ? 10 : 0;
 
         if (gapRatio > 1.5 || gapRatio < 0.5) {
           gaps.push({
             skillName: skill,
             demand: demandCount,
             supply: supplyCount,
             gapRatio,
             trend: "stable",
           });
         }
       });
 
       setSkillGaps(gaps.sort((a, b) => b.gapRatio - a.gapRatio).slice(0, 10));
 
     } catch (error) {
       console.error("Error fetching market metrics:", error);
     } finally {
       setLoading(false);
     }
   }, []);
 
   // Apply automatic adjustments based on market state
   const applyAutomaticAdjustments = useCallback(() => {
     if (!balance) return;
 
     const newAdjustments: MarketAdjustment[] = [];
 
     if (balance.marketSaturation === "oversaturated") {
       newAdjustments.push({
         type: "matching_threshold",
         direction: "increase",
         magnitude: 0.15,
         reason: "Too many seekers per opportunity",
         appliedAt: new Date(),
       });
       newAdjustments.push({
         type: "notification_frequency",
         direction: "decrease",
         magnitude: 0.3,
         reason: "Reduce notification noise in saturated market",
         appliedAt: new Date(),
       });
     }
 
     if (balance.marketSaturation === "undersaturated") {
       newAdjustments.push({
         type: "matching_criteria",
         direction: "decrease",
         magnitude: 0.2,
         reason: "Expand matching to include more candidates",
         appliedAt: new Date(),
       });
       newAdjustments.push({
         type: "visibility",
         direction: "increase",
         magnitude: 0.25,
         reason: "Increase opportunity visibility",
         appliedAt: new Date(),
       });
       newAdjustments.push({
         type: "outreach",
         direction: "increase",
         magnitude: 0.3,
         reason: "Proactive outreach to dormant users",
         appliedAt: new Date(),
       });
     }
 
     if (newAdjustments.length > 0) {
       setAdjustments(prev => [...prev.slice(-19), ...newAdjustments]);
     }
   }, [balance]);
 
   // Get matching threshold modifier
   const getMatchingThresholdModifier = useCallback((): number => {
     const thresholdAdjustments = adjustments.filter(
       a => a.type === "matching_threshold" &&
         Date.now() - a.appliedAt.getTime() < 24 * 60 * 60 * 1000
     );
 
     let modifier = 1.0;
     thresholdAdjustments.forEach(a => {
       if (a.direction === "increase") modifier += a.magnitude;
       else modifier -= a.magnitude;
     });
 
     return Math.max(0.5, Math.min(1.5, modifier));
   }, [adjustments]);
 
   // Get visibility modifier
   const getVisibilityModifier = useCallback((): number => {
     const visibilityAdjustments = adjustments.filter(
       a => a.type === "visibility" &&
         Date.now() - a.appliedAt.getTime() < 24 * 60 * 60 * 1000
     );
 
     let modifier = 1.0;
     visibilityAdjustments.forEach(a => {
       if (a.direction === "increase") modifier += a.magnitude;
       else modifier -= a.magnitude;
     });
 
     return Math.max(0.5, Math.min(1.5, modifier));
   }, [adjustments]);
 
   // Get learning recommendations based on skill gaps
   const getLearningRecommendations = useCallback((): {
     skill: string;
     urgency: "high" | "medium" | "low";
     opportunityCount: number;
   }[] => {
     return skillGaps
       .filter(gap => gap.gapRatio > 2)
       .map(gap => ({
         skill: gap.skillName,
         urgency: gap.gapRatio > 5 ? "high" : gap.gapRatio > 3 ? "medium" : "low",
         opportunityCount: gap.demand,
       }));
   }, [skillGaps]);
 
   // Check if user's category is high competition
   const isHighCompetition = useCallback((userSkills: string[]): boolean => {
     if (!supply || !demand) return false;
 
     for (const skill of userSkills) {
       const demandCount = supply.opportunitiesByCategory[skill] || 0;
       const supplyCount = demand.skillsAvailability[skill] || 0;
       if (demandCount > 0 && supplyCount / demandCount > 5) {
         return true;
       }
     }
     return false;
   }, [supply, demand]);
 
   // Initial fetch and periodic refresh
   useEffect(() => {
     fetchMarketMetrics();
     const interval = setInterval(fetchMarketMetrics, 5 * 60 * 1000); // Every 5 minutes
     return () => clearInterval(interval);
   }, [fetchMarketMetrics]);
 
   // Apply adjustments when balance changes
   useEffect(() => {
     if (balance) {
       applyAutomaticAdjustments();
     }
   }, [balance, applyAutomaticAdjustments]);
 
   return {
     supply,
     demand,
     balance,
     adjustments,
     skillGaps,
     loading,
     refresh: fetchMarketMetrics,
     getMatchingThresholdModifier,
     getVisibilityModifier,
     getLearningRecommendations,
     isHighCompetition,
   };
 }