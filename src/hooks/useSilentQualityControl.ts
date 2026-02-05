 import { useState, useCallback, useMemo } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // SILENT QUALITY CONTROL (SQC)
 // Invisible quality scoring that affects ranking
 // Never shows raw scores or shames users
 // ============================================
 
 export interface ContentQualityFactors {
   hasLinkedEntity: boolean;
   isStructuredUpdate: boolean;
   contentLength: number;
   authorTrustScore: number;
 }
 
 export interface UserQualityFactors {
   completionRate: number;
   disputeRate: number;
   responseTimeHours: number;
   consistencyScore: number;
 }
 
 export interface DealQualityFactors {
   communicationFrequency: number;
   milestoneVelocity: number;
   sentimentTrend: number;
   paymentPromptness: number;
 }
 
 interface QualityThresholds {
   lowQualityContent: number;
   highQualityUser: number;
   abusivePatternThreshold: number;
 }
 
 const THRESHOLDS: QualityThresholds = {
   lowQualityContent: 40,
   highQualityUser: 80,
   abusivePatternThreshold: 30,
 };
 
 // Quality actions - all silent, never exposed to users
 type QualityAction =
   | "reduce_feed_visibility"
   | "exclude_from_featured"
   | "skip_target_notification"
   | "reduce_rate_limits"
   | "extend_cooling_period"
   | "block_from_recommendations"
   | "increase_match_visibility"
   | "priority_in_queues"
   | "unlock_trust_multiplier";
 
 interface QualityAdjustment {
   action: QualityAction;
   appliedAt: Date;
   expiresAt: Date | null;
   reason: string; // Internal only
 }
 
 export function useSilentQualityControl() {
   const { user } = useAuth();
   const [adjustments, setAdjustments] = useState<QualityAdjustment[]>([]);
 
   // Calculate content quality score (0-100)
   const calculateContentQuality = useCallback((factors: ContentQualityFactors): number => {
     let score = 0;
 
     // Has linked entity (project, deal, outcome): +30
     if (factors.hasLinkedEntity) score += 30;
 
     // Structured update type: +20
     if (factors.isStructuredUpdate) score += 20;
 
     // Appropriate length (50-500 chars): +15
     if (factors.contentLength >= 50 && factors.contentLength <= 500) score += 15;
     else if (factors.contentLength >= 20 && factors.contentLength <= 1000) score += 8;
 
     // Author trust score factor: +0-35
     score += Math.min(35, factors.authorTrustScore * 0.35);
 
     return Math.min(100, Math.round(score));
   }, []);
 
   // Calculate user quality score (0-100)
   const calculateUserQuality = useCallback((factors: UserQualityFactors): number => {
     let score = 0;
 
     // Completion rate: 0-100 scaled to 0-40
     score += factors.completionRate * 0.4;
 
     // Dispute rate: 0 to -50 (penalty)
     score -= Math.min(50, factors.disputeRate * 5);
 
     // Response time score: faster = better, max 30
     const responseScore = Math.max(0, 30 - factors.responseTimeHours);
     score += responseScore;
 
     // Consistency score: 0-20
     score += Math.min(20, factors.consistencyScore * 0.2);
 
     return Math.max(0, Math.min(100, Math.round(score)));
   }, []);
 
   // Calculate deal quality score (0-100)
   const calculateDealQuality = useCallback((factors: DealQualityFactors): number => {
     const score = (
       factors.communicationFrequency * 0.25 +
       factors.milestoneVelocity * 0.25 +
       factors.sentimentTrend * 0.25 +
       factors.paymentPromptness * 0.25
     );
     return Math.min(100, Math.round(score));
   }, []);
 
   // Apply quality-based adjustments (silent, internal only)
   const applyQualityAdjustments = useCallback((
     entityType: "content" | "user" | "deal",
     entityId: string,
     qualityScore: number
   ): QualityAction[] => {
     const actions: QualityAction[] = [];
 
     if (entityType === "content") {
       if (qualityScore < THRESHOLDS.lowQualityContent) {
         actions.push("reduce_feed_visibility");
         actions.push("exclude_from_featured");
         actions.push("skip_target_notification");
       }
     }
 
     if (entityType === "user") {
       if (qualityScore < THRESHOLDS.abusivePatternThreshold) {
         actions.push("reduce_rate_limits");
         actions.push("extend_cooling_period");
         actions.push("block_from_recommendations");
       } else if (qualityScore >= THRESHOLDS.highQualityUser) {
         actions.push("increase_match_visibility");
         actions.push("priority_in_queues");
         actions.push("unlock_trust_multiplier");
       }
     }
 
     // Record adjustments internally
     const newAdjustments: QualityAdjustment[] = actions.map(action => ({
       action,
       appliedAt: new Date(),
       expiresAt: action.includes("reduce") || action.includes("block")
         ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
         : null,
       reason: `Quality score ${qualityScore} for ${entityType} ${entityId}`,
     }));
 
     setAdjustments(prev => [...prev.slice(-99), ...newAdjustments]);
     return actions;
   }, []);
 
   // Check if content should be visible in feeds
   const shouldShowInFeed = useCallback((contentQuality: number): boolean => {
     return contentQuality >= THRESHOLDS.lowQualityContent;
   }, []);
 
   // Check if content should be featured
   const shouldFeature = useCallback((contentQuality: number, userQuality: number): boolean => {
     return contentQuality >= 70 && userQuality >= 60;
   }, []);
 
   // Get visibility multiplier for matching (higher quality = more visible)
   const getVisibilityMultiplier = useCallback((userQuality: number): number => {
     if (userQuality >= THRESHOLDS.highQualityUser) return 1.5;
     if (userQuality >= 60) return 1.2;
     if (userQuality >= THRESHOLDS.lowQualityContent) return 1.0;
     if (userQuality >= THRESHOLDS.abusivePatternThreshold) return 0.7;
     return 0.4;
   }, []);
 
   // Get rate limit multiplier (low quality = reduced limits)
   const getRateLimitMultiplier = useCallback((userQuality: number): number => {
     if (userQuality >= THRESHOLDS.highQualityUser) return 1.5;
     if (userQuality >= 60) return 1.0;
     if (userQuality >= THRESHOLDS.lowQualityContent) return 0.8;
     return 0.5;
   }, []);
 
   // Detect abusive patterns
   const detectAbusivePatterns = useCallback(async (userId: string): Promise<{
     detected: boolean;
     patterns: string[];
   }> => {
     // Would analyze user behavior patterns
     // For now, return no patterns
     return { detected: false, patterns: [] };
   }, []);
 
   // Get quality summary (internal, not for user display)
   const getQualitySummary = useCallback((userId: string): {
     tier: "high" | "standard" | "monitored";
     activeAdjustments: number;
   } => {
     const userAdjustments = adjustments.filter(a => 
       !a.expiresAt || a.expiresAt > new Date()
     );
 
     const hasPositive = userAdjustments.some(a => 
       a.action === "increase_match_visibility" || a.action === "priority_in_queues"
     );
     const hasNegative = userAdjustments.some(a =>
       a.action === "reduce_rate_limits" || a.action === "block_from_recommendations"
     );
 
     let tier: "high" | "standard" | "monitored" = "standard";
     if (hasPositive && !hasNegative) tier = "high";
     if (hasNegative) tier = "monitored";
 
     return {
       tier,
       activeAdjustments: userAdjustments.length,
     };
   }, [adjustments]);
 
   return {
     calculateContentQuality,
     calculateUserQuality,
     calculateDealQuality,
     applyQualityAdjustments,
     shouldShowInFeed,
     shouldFeature,
     getVisibilityMultiplier,
     getRateLimitMultiplier,
     detectAbusivePatterns,
     getQualitySummary,
     thresholds: THRESHOLDS,
   };
 }