 import { useState, useCallback, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 // ============================================
 // TRUST COMPUTATION ENGINE
 // Trust as a dynamic computation system, not a number
 // ============================================
 
 // Trust input sources
 export interface TrustInput {
   id: string;
   source: TrustInputSource;
   category: TrustCategory;
   value: number;
   weight: number;
   timestamp: Date;
   context: Record<string, unknown>;
   expiresAt: Date | null;
 }
 
 export type TrustInputSource =
   | "outcome_success"
   | "outcome_failure"
   | "peer_endorsement"
   | "peer_dispute"
   | "institution_verification"
   | "credential_verification"
   | "behavioral_signal"
   | "temporal_consistency"
   | "escrow_completion"
   | "collaboration_review";
 
 export type TrustCategory =
   | "delivery"
   | "financial"
   | "collaboration"
   | "institutional"
   | "consistency";
 
 // Trust transformations
 export interface TrustTransformation {
   type: "decay" | "recovery" | "amplification" | "penalty" | "bonus";
   amount: number;
   reason: string;
   appliedAt: Date;
   reversible: boolean;
 }
 
 // Contextual trust (per domain/role)
 export interface ContextualTrust {
   context: string; // e.g., "machine_learning", "project_management"
   score: number;
   inputCount: number;
   lastUpdated: Date;
   confidence: number;
 }
 
 // Temporal trust (evolution over time)
 export interface TemporalTrustPoint {
   timestamp: Date;
   score: number;
   delta: number;
   cause: string;
 }
 
 // Trust inheritance
 export interface TrustInheritance {
   fromEntityId: string;
   fromEntityType: "team" | "institution" | "project";
   inheritedScore: number;
   inheritanceWeight: number;
   validUntil: Date;
 }
 
 // Full trust profile
 export interface ComputedTrustProfile {
   userId: string;
   overallScore: number;
   tier: "platinum" | "gold" | "silver" | "bronze" | "unverified";
   categoryScores: Record<TrustCategory, number>;
   contextualScores: ContextualTrust[];
   temporalHistory: TemporalTrustPoint[];
   activeTransformations: TrustTransformation[];
   inheritedTrust: TrustInheritance[];
   computedAt: Date;
   nextDecayAt: Date;
   explanations: TrustExplanation[];
 }
 
 export interface TrustExplanation {
   category: TrustCategory;
   score: number;
   factors: { factor: string; impact: number; positive: boolean }[];
   recommendations: string[];
 }
 
 // Trust computation weights
 const CATEGORY_WEIGHTS: Record<TrustCategory, number> = {
   delivery: 0.40,
   financial: 0.25,
   collaboration: 0.15,
   institutional: 0.10,
   consistency: 0.10,
 };
 
 // Decay configuration
 const DECAY_CONFIG = {
   ratePerMonth: 0.02, // 2% per month
   gracePeriodDays: 30,
   maxDecay: 0.30, // Max 30% decay
 };
 
 // Penalty multipliers
 const PENALTY_MULTIPLIERS = {
   failure: 2.0, // Failures hurt 2x more than successes help
   dispute: 1.5,
   late_delivery: 1.2,
 };
 
 export function useTrustComputationEngine(userId?: string) {
   const { user } = useAuth();
   const targetUserId = userId || user?.id;
 
   const [inputs, setInputs] = useState<TrustInput[]>([]);
   const [transformations, setTransformations] = useState<TrustTransformation[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Compute category score from inputs
   const computeCategoryScore = useCallback((
     category: TrustCategory,
     categoryInputs: TrustInput[]
   ): number => {
     if (categoryInputs.length === 0) return 50; // Baseline
 
     const totalWeight = categoryInputs.reduce((sum, i) => sum + i.weight, 0);
     const weightedSum = categoryInputs.reduce(
       (sum, i) => sum + (i.value * i.weight),
       0
     );
 
     return Math.min(100, Math.max(0, weightedSum / totalWeight));
   }, []);
 
   // Apply transformations
   const applyTransformations = useCallback((
     baseScore: number,
     activeTransformations: TrustTransformation[]
   ): number => {
     let score = baseScore;
 
     activeTransformations.forEach(t => {
       switch (t.type) {
         case "decay":
           score *= (1 - t.amount);
           break;
         case "recovery":
           score += t.amount;
           break;
         case "amplification":
           score *= (1 + t.amount);
           break;
         case "penalty":
           score -= t.amount * PENALTY_MULTIPLIERS.failure;
           break;
         case "bonus":
           score += t.amount;
           break;
       }
     });
 
     return Math.min(100, Math.max(0, score));
   }, []);
 
   // Compute full trust profile
   const computeTrustProfile = useCallback(async (): Promise<ComputedTrustProfile | null> => {
     if (!targetUserId) return null;
     setLoading(true);
 
     try {
       // Fetch trust inputs from various sources
       const [
         { data: outcomes },
         { data: trustProfile },
       ] = await Promise.all([
         supabase
           .from("accountability_records")
           .select("*")
           .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`)
           .order("created_at", { ascending: false }),
         supabase
           .from("user_trust_profiles")
           .select("*")
           .eq("user_id", targetUserId)
           .maybeSingle(),
       ]);
 
       // Build trust inputs from outcomes
       const trustInputs: TrustInput[] = [];
 
       (outcomes || []).forEach((outcome: any) => {
         const isSuccess = outcome.outcome_status === "completed";
         const isExecutor = outcome.executor_id === targetUserId;
 
         trustInputs.push({
           id: `outcome_${outcome.id}`,
           source: isSuccess ? "outcome_success" : "outcome_failure",
           category: "delivery",
           value: isSuccess ? 70 + (outcome.trust_impact_executor || 0) : 30 - Math.abs(outcome.trust_impact_executor || 0),
           weight: isExecutor ? 1.0 : 0.5,
           timestamp: new Date(outcome.created_at),
           context: { outcomeId: outcome.id },
           expiresAt: null,
         });
 
         // Financial trust from escrow
         if (outcome.escrow_amount) {
           trustInputs.push({
             id: `escrow_${outcome.id}`,
             source: "escrow_completion",
             category: "financial",
             value: outcome.escrow_released_at ? 80 : 40,
             weight: Math.min(1.0, (outcome.escrow_amount || 0) / 10000),
             timestamp: new Date(outcome.created_at),
             context: { amount: outcome.escrow_amount },
             expiresAt: null,
           });
         }
       });
 
       setInputs(trustInputs);
 
       // Compute category scores
       const categoryScores: Record<TrustCategory, number> = {
         delivery: computeCategoryScore("delivery", trustInputs.filter(i => i.category === "delivery")),
         financial: computeCategoryScore("financial", trustInputs.filter(i => i.category === "financial")),
         collaboration: computeCategoryScore("collaboration", trustInputs.filter(i => i.category === "collaboration")),
         institutional: (trustProfile as any)?.verification_level === "verified" ? 75 : 40,
         consistency: trustInputs.length > 5 ? 70 : 50,
       };
 
       // Compute overall score
       let overallScore = Object.entries(categoryScores).reduce(
         (sum, [category, score]) => sum + score * CATEGORY_WEIGHTS[category as TrustCategory],
         0
       );
 
       // Apply active transformations
       overallScore = applyTransformations(overallScore, transformations);
 
       // Calculate decay
       const lastActivity = trustInputs.length > 0
         ? trustInputs[0].timestamp
         : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
       const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
       const monthsInactive = Math.max(0, (daysSinceActivity - DECAY_CONFIG.gracePeriodDays) / 30);
       const decayAmount = Math.min(DECAY_CONFIG.maxDecay, monthsInactive * DECAY_CONFIG.ratePerMonth);
 
       if (decayAmount > 0) {
         overallScore *= (1 - decayAmount);
       }
 
       // Determine tier
       const tier = overallScore >= 90 ? "platinum"
         : overallScore >= 75 ? "gold"
         : overallScore >= 50 ? "silver"
         : overallScore >= 25 ? "bronze"
         : "unverified";
 
       // Build explanations
       const explanations: TrustExplanation[] = Object.entries(categoryScores).map(
         ([category, score]) => ({
           category: category as TrustCategory,
           score,
           factors: [
             { factor: "Outcome history", impact: score * 0.6, positive: score > 50 },
             { factor: "Recency of activity", impact: score * 0.2, positive: daysSinceActivity < 30 },
             { factor: "Consistency", impact: score * 0.2, positive: true },
           ],
           recommendations: score < 70
             ? [`Improve ${category} score by completing more successful outcomes`]
             : [],
         })
       );
 
       const profile: ComputedTrustProfile = {
         userId: targetUserId,
         overallScore: Math.round(overallScore),
         tier,
         categoryScores,
         contextualScores: [],
         temporalHistory: trustInputs.slice(0, 20).map((input, i) => ({
           timestamp: input.timestamp,
           score: 50 + (20 - i) * 2,
           delta: input.source.includes("success") ? 2 : -3,
           cause: input.source,
         })),
         activeTransformations: transformations,
         inheritedTrust: [],
         computedAt: new Date(),
         nextDecayAt: new Date(Date.now() + DECAY_CONFIG.gracePeriodDays * 24 * 60 * 60 * 1000),
         explanations,
       };
 
       return profile;
     } catch (error) {
       console.error("Error computing trust profile:", error);
       return null;
     } finally {
       setLoading(false);
     }
   }, [targetUserId, transformations, computeCategoryScore, applyTransformations]);
 
   // Add trust input
   const addTrustInput = useCallback((input: Omit<TrustInput, "id" | "timestamp">) => {
     const newInput: TrustInput = {
       ...input,
       id: crypto.randomUUID(),
       timestamp: new Date(),
     };
     setInputs(prev => [newInput, ...prev]);
   }, []);
 
   // Apply transformation
   const applyTransformation = useCallback((
     type: TrustTransformation["type"],
     amount: number,
     reason: string
   ) => {
     const transformation: TrustTransformation = {
       type,
       amount,
       reason,
       appliedAt: new Date(),
       reversible: type !== "penalty",
     };
     setTransformations(prev => [...prev, transformation]);
   }, []);
 
   // Get contextual trust
   const getContextualTrust = useCallback((context: string): number => {
     const contextInputs = inputs.filter(
       i => (i.context as any)?.domain === context
     );
     if (contextInputs.length === 0) return 50;
     return computeCategoryScore("delivery", contextInputs);
   }, [inputs, computeCategoryScore]);
 
   // Get trust explanation for specific score
   const explainTrust = useCallback((score: number): string[] => {
     const explanations: string[] = [];
 
     if (score >= 90) {
       explanations.push("Exceptional track record with consistent delivery");
       explanations.push("High peer endorsement and institutional verification");
     } else if (score >= 75) {
       explanations.push("Strong delivery history with minimal disputes");
       explanations.push("Good financial reliability");
     } else if (score >= 50) {
       explanations.push("Moderate track record, building credibility");
       explanations.push("Some areas need improvement");
     } else {
       explanations.push("Limited history or recent issues affecting trust");
       explanations.push("Focus on completing outcomes successfully");
     }
 
     return explanations;
   }, []);
 
   // Get recovery path
   const getRecoveryPath = useCallback((currentScore: number, targetScore: number): {
     steps: { action: string; expectedImpact: number }[];
     estimatedTime: string;
   } => {
     const gap = targetScore - currentScore;
     const steps: { action: string; expectedImpact: number }[] = [];
 
     if (gap <= 0) {
       return { steps: [], estimatedTime: "Already at target" };
     }
 
     // Calculate needed actions
     const outcomesNeeded = Math.ceil(gap / 5);
     steps.push({
       action: `Complete ${outcomesNeeded} successful outcomes`,
       expectedImpact: outcomesNeeded * 5,
     });
 
     if (gap > 15) {
       steps.push({
         action: "Obtain institutional verification",
         expectedImpact: 10,
       });
     }
 
     if (gap > 25) {
       steps.push({
         action: "Build consistent activity for 60+ days",
         expectedImpact: 8,
       });
     }
 
     const weeksEstimate = Math.ceil(gap / 3);
     return {
       steps,
       estimatedTime: `${weeksEstimate}-${weeksEstimate * 2} weeks`,
     };
   }, []);
 
   return {
     inputs,
     transformations,
     loading,
     computeTrustProfile,
     addTrustInput,
     applyTransformation,
     getContextualTrust,
     explainTrust,
     getRecoveryPath,
     CATEGORY_WEIGHTS,
     DECAY_CONFIG,
   };
 }