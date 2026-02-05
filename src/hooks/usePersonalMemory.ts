 import { useState, useCallback, useEffect } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // PERSONAL MEMORY ENGINE
 // Remembers what helped succeed, what caused failures,
 // and uses memory to improve recommendations
 // ============================================
 
 export interface SuccessPattern {
   id: string;
   type: "project_type" | "collaboration_style" | "skill_application" | "timeline" | "communication";
   description: string;
   frequency: number;
   lastOccurred: Date;
   associatedOutcomes: string[];
   confidence: number; // 0-1
 }
 
 export interface FailurePattern {
   id: string;
   type: "project_type" | "timeline" | "collaboration_mismatch" | "scope_creep" | "communication";
   description: string;
   frequency: number;
   lastOccurred: Date;
   associatedDisputes: string[];
   recoveryApplied: boolean;
   confidence: number;
 }
 
 export interface PreferenceLearning {
   preferredProjectSizes: ("small" | "medium" | "large")[];
   communicationFrequency: "high" | "medium" | "low";
   riskTolerance: "conservative" | "moderate" | "aggressive";
   workStyle: "independent" | "collaborative" | "mixed";
   preferredDomains: string[];
   avoidedDomains: string[];
 }
 
 export interface MemoryBasedRecommendation {
   type: "boost" | "warn" | "suggest";
   entityType: "opportunity" | "collaboration" | "skill" | "path";
   entityId?: string;
   reason: string;
   confidence: number;
   basedOn: "success_pattern" | "failure_pattern" | "preference";
 }
 
 export function usePersonalMemory() {
   const { user } = useAuth();
   const [successPatterns, setSuccessPatterns] = useState<SuccessPattern[]>([]);
   const [failurePatterns, setFailurePatterns] = useState<FailurePattern[]>([]);
   const [preferences, setPreferences] = useState<PreferenceLearning | null>(null);
   const [loading, setLoading] = useState(false);
 
   // Load memory from database
   const loadMemory = useCallback(async () => {
     if (!user) return;
     setLoading(true);
 
     try {
       // Analyze past outcomes for success patterns
       const { data: outcomes } = await supabase
         .from("accountability_records")
         .select("*")
         .or(`initiator_id.eq.${user.id},executor_id.eq.${user.id}`)
         .eq("outcome_status", "completed")
         .order("created_at", { ascending: false })
         .limit(50);
 
       // Analyze disputes for failure patterns
       const { data: disputes } = await supabase
         .from("academic_disputes")
         .select("*")
         .eq("raised_by_user_id", user.id)
         .order("created_at", { ascending: false })
         .limit(20);
 
       // Extract patterns
       const successPats: SuccessPattern[] = [];
       const failurePats: FailurePattern[] = [];
 
       // Analyze collaboration types from outcomes
       const collabTypes: Record<string, { count: number; outcomes: string[] }> = {};
       (outcomes || []).forEach((o: any) => {
         const type = o.collaboration_type || "general";
         if (!collabTypes[type]) collabTypes[type] = { count: 0, outcomes: [] };
         collabTypes[type].count++;
         collabTypes[type].outcomes.push(o.id);
       });
 
       Object.entries(collabTypes).forEach(([type, data]) => {
         if (data.count >= 2) {
           successPats.push({
             id: crypto.randomUUID(),
             type: "project_type",
             description: `Successful with ${type} projects`,
             frequency: data.count,
             lastOccurred: new Date(),
             associatedOutcomes: data.outcomes,
             confidence: Math.min(1, data.count / 5),
           });
         }
       });
 
       // Analyze dispute patterns
       const disputeTypes: Record<string, { count: number; disputes: string[] }> = {};
       (disputes || []).forEach((d: any) => {
         const type = d.dispute_type || "general";
         if (!disputeTypes[type]) disputeTypes[type] = { count: 0, disputes: [] };
         disputeTypes[type].count++;
         disputeTypes[type].disputes.push(d.id);
       });
 
       Object.entries(disputeTypes).forEach(([type, data]) => {
         if (data.count >= 1) {
           failurePats.push({
             id: crypto.randomUUID(),
             type: type.includes("timeline") ? "timeline" : "project_type",
             description: `Issues with ${type}`,
             frequency: data.count,
             lastOccurred: new Date(),
             associatedDisputes: data.disputes,
             recoveryApplied: false,
             confidence: Math.min(1, data.count / 3),
           });
         }
       });
 
       setSuccessPatterns(successPats);
       setFailurePatterns(failurePats);
 
       // Infer preferences
       setPreferences({
         preferredProjectSizes: outcomes && outcomes.length > 10 ? ["medium", "large"] : ["small", "medium"],
         communicationFrequency: "medium",
         riskTolerance: failurePats.length > 2 ? "conservative" : "moderate",
         workStyle: successPats.some(p => p.type === "collaboration_style") ? "collaborative" : "mixed",
         preferredDomains: Object.keys(collabTypes).slice(0, 3),
         avoidedDomains: Object.keys(disputeTypes).slice(0, 2),
       });
 
     } catch (error) {
       console.error("Error loading memory:", error);
     } finally {
       setLoading(false);
     }
   }, [user]);
 
   // Get memory-based recommendations
   const getRecommendations = useCallback((context: {
     opportunityType?: string;
     collaboratorId?: string;
     skillRequired?: string;
   }): MemoryBasedRecommendation[] => {
     const recommendations: MemoryBasedRecommendation[] = [];
 
     // Check against success patterns
     successPatterns.forEach(pattern => {
       if (context.opportunityType && pattern.description.toLowerCase().includes(context.opportunityType.toLowerCase())) {
         recommendations.push({
           type: "boost",
           entityType: "opportunity",
           reason: `You've succeeded ${pattern.frequency} times with similar projects`,
           confidence: pattern.confidence,
           basedOn: "success_pattern",
         });
       }
     });
 
     // Check against failure patterns
     failurePatterns.forEach(pattern => {
       if (context.opportunityType && pattern.description.toLowerCase().includes(context.opportunityType.toLowerCase())) {
         recommendations.push({
           type: "warn",
           entityType: "opportunity",
           reason: `You've had ${pattern.frequency} issues with similar projects`,
           confidence: pattern.confidence,
           basedOn: "failure_pattern",
         });
       }
     });
 
     // Preference-based suggestions
     if (preferences && context.opportunityType) {
       if (preferences.avoidedDomains.some(d => context.opportunityType?.includes(d))) {
         recommendations.push({
           type: "warn",
           entityType: "opportunity",
           reason: "This domain has been problematic in the past",
           confidence: 0.6,
           basedOn: "preference",
         });
       }
     }
 
     return recommendations;
   }, [successPatterns, failurePatterns, preferences]);
 
   // Explain a past success
   const explainSuccess = useCallback((outcomeId: string): string | null => {
     const pattern = successPatterns.find(p => p.associatedOutcomes.includes(outcomeId));
     if (pattern) {
       return `This worked because: ${pattern.description}. You've had ${pattern.frequency} similar successes.`;
     }
     return null;
   }, [successPatterns]);
 
   // Generate recovery advice based on past recoveries
   const getRecoveryAdvice = useCallback((failureType: string): string | null => {
     const pattern = failurePatterns.find(p => 
       p.type === failureType && p.recoveryApplied
     );
     if (pattern) {
       return `Last time you recovered from this by addressing ${pattern.description}`;
     }
     return "Focus on clear communication and scope definition to recover";
   }, [failurePatterns]);
 
   // View what the system knows
   const viewMyMemory = useCallback((): {
     successes: string[];
     failures: string[];
     preferences: string[];
   } => {
     return {
       successes: successPatterns.map(p => p.description),
       failures: failurePatterns.map(p => p.description),
       preferences: preferences ? [
         `Preferred project sizes: ${preferences.preferredProjectSizes.join(", ")}`,
         `Communication style: ${preferences.communicationFrequency}`,
         `Risk tolerance: ${preferences.riskTolerance}`,
         `Work style: ${preferences.workStyle}`,
       ] : [],
     };
   }, [successPatterns, failurePatterns, preferences]);
 
   // Reset memory (user-initiated)
   const resetMemory = useCallback(async (): Promise<boolean> => {
     setSuccessPatterns([]);
     setFailurePatterns([]);
     setPreferences(null);
     return true;
   }, []);
 
   // Record new pattern
   const recordPattern = useCallback((
     type: "success" | "failure",
     pattern: Omit<SuccessPattern | FailurePattern, "id">
   ) => {
     const newPattern = { ...pattern, id: crypto.randomUUID() };
     if (type === "success") {
       setSuccessPatterns(prev => [...prev, newPattern as SuccessPattern]);
     } else {
       setFailurePatterns(prev => [...prev, newPattern as FailurePattern]);
     }
   }, []);
 
   // Load on mount
   useEffect(() => {
     loadMemory();
   }, [loadMemory]);
 
   return {
     successPatterns,
     failurePatterns,
     preferences,
     loading,
     reload: loadMemory,
     getRecommendations,
     explainSuccess,
     getRecoveryAdvice,
     viewMyMemory,
     resetMemory,
     recordPattern,
   };
 }