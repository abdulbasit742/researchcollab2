 import { useState, useEffect, useCallback, useMemo } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // POWER & RISK DAMPENING
 // Scale transparency and oversight with user power
 // As users gain power, increase requirements
 // ============================================
 
 export type PowerLevel = "low" | "medium" | "high";
 
 export interface PowerFactors {
   trustScore: number;
   networkCentrality: number; // Connections, warm intros
   dealVolume: number;
   platformTenureDays: number;
   institutionalRoles: string[];
 }
 
 export interface PowerRequirements {
   transparencyLevel: "standard" | "enhanced" | "full";
   auditFrequency: "monthly" | "weekly" | "daily";
   unilateralControlAllowed: boolean;
   explanationRequired: boolean;
   oversightCheckpoints: string[];
 }
 
 export interface PowerAuditEntry {
   id: string;
   userId: string;
   action: string;
   powerLevel: PowerLevel;
   timestamp: Date;
   reversible: boolean;
   explanation?: string;
   reviewed: boolean;
   reviewedBy?: string;
   reviewedAt?: Date;
 }
 
 export interface PowerCap {
   metric: string;
   currentValue: number;
   maxValue: number;
   reason: string;
 }
 
 // Thresholds for power levels
 const POWER_THRESHOLDS = {
   medium: 40,
   high: 75,
 };
 
 // Caps to prevent monopolies
 const POWER_CAPS: PowerCap[] = [
   { metric: "trust_benefit_multiplier", currentValue: 0, maxValue: 2.0, reason: "Prevent trust monopolies" },
   { metric: "intro_rate_per_week", currentValue: 0, maxValue: 20, reason: "Prevent network abuse" },
   { metric: "category_share", currentValue: 0, maxValue: 0.25, reason: "Prevent platform capture" },
 ];
 
 export function usePowerDampening(userId?: string) {
   const { user } = useAuth();
   const targetUserId = userId || user?.id;
 
   const [factors, setFactors] = useState<PowerFactors | null>(null);
   const [auditLog, setAuditLog] = useState<PowerAuditEntry[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Calculate power score
   const calculatePowerScore = useCallback((factors: PowerFactors): number => {
     const weights = {
       trustScore: 0.3,
       networkCentrality: 0.25,
       dealVolume: 0.2,
       tenure: 0.15,
       roles: 0.1,
     };
 
     const tenureScore = Math.min(100, factors.platformTenureDays / 3.65); // Max at 1 year
     const roleScore = factors.institutionalRoles.length * 20;
 
     return (
       factors.trustScore * weights.trustScore +
       factors.networkCentrality * weights.networkCentrality +
       factors.dealVolume * weights.dealVolume +
       tenureScore * weights.tenure +
       Math.min(100, roleScore) * weights.roles
     );
   }, []);
 
   // Determine power level
   const getPowerLevel = useCallback((score: number): PowerLevel => {
     if (score >= POWER_THRESHOLDS.high) return "high";
     if (score >= POWER_THRESHOLDS.medium) return "medium";
     return "low";
   }, []);
 
   // Get requirements based on power level
   const getRequirements = useCallback((level: PowerLevel): PowerRequirements => {
     switch (level) {
       case "low":
         return {
           transparencyLevel: "standard",
           auditFrequency: "monthly",
           unilateralControlAllowed: true,
           explanationRequired: false,
           oversightCheckpoints: [],
         };
       case "medium":
         return {
           transparencyLevel: "enhanced",
           auditFrequency: "weekly",
           unilateralControlAllowed: true,
           explanationRequired: false,
           oversightCheckpoints: ["dispute_resolution", "high_value_deals"],
         };
       case "high":
         return {
           transparencyLevel: "full",
           auditFrequency: "daily",
           unilateralControlAllowed: false,
           explanationRequired: true,
           oversightCheckpoints: [
             "dispute_resolution",
             "high_value_deals",
             "trust_modifications",
             "institutional_actions",
           ],
         };
     }
   }, []);
 
   // Fetch power factors
   const fetchPowerFactors = useCallback(async () => {
     if (!targetUserId) return;
     setLoading(true);
 
     try {
       // Fetch trust profile
       const { data: trustProfile } = await supabase
         .from("user_trust_profiles")
         .select("trust_score")
         .eq("user_id", targetUserId)
         .maybeSingle();
 
       // Fetch connections
       const { data: connections } = await supabase
         .from("connections" as any)
         .select("id")
         .or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
         .eq("status", "accepted");
 
       // Fetch deals
       const { data: deals } = await supabase
         .from("accountability_records")
         .select("id")
         .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`);
 
       // Fetch profile for tenure
       const { data: profile } = await supabase
         .from("profiles")
         .select("created_at")
         .eq("id", targetUserId)
         .maybeSingle();
 
       // Fetch institutional roles
       const { data: orgMemberships } = await supabase
         .from("organization_members")
         .select("role")
         .eq("user_id", targetUserId);
 
       const tenureDays = profile?.created_at
         ? Math.floor((Date.now() - new Date(profile.created_at as string).getTime()) / (1000 * 60 * 60 * 24))
         : 0;
 
       const networkCentrality = Math.min(100, (connections?.length || 0) * 5);
       const dealVolume = Math.min(100, (deals?.length || 0) * 10);
 
       setFactors({
         trustScore: (trustProfile as any)?.trust_score || 50,
         networkCentrality,
         dealVolume,
         platformTenureDays: tenureDays,
         institutionalRoles: (orgMemberships || []).map((m: any) => m.role),
       });
 
     } catch (error) {
       console.error("Error fetching power factors:", error);
     } finally {
       setLoading(false);
     }
   }, [targetUserId]);
 
   // Log an action
   const logAction = useCallback((
     action: string,
     reversible: boolean,
     explanation?: string
   ): PowerAuditEntry => {
     if (!targetUserId || !factors) {
       throw new Error("Cannot log action without user and factors");
     }
 
     const powerScore = calculatePowerScore(factors);
     const powerLevel = getPowerLevel(powerScore);
 
     const entry: PowerAuditEntry = {
       id: crypto.randomUUID(),
       userId: targetUserId,
       action,
       powerLevel,
       timestamp: new Date(),
       reversible,
       explanation,
       reviewed: powerLevel === "low", // Low power actions auto-reviewed
       reviewedBy: powerLevel === "low" ? "system" : undefined,
       reviewedAt: powerLevel === "low" ? new Date() : undefined,
     };
 
     setAuditLog(prev => [...prev.slice(-99), entry]);
     return entry;
   }, [targetUserId, factors, calculatePowerScore, getPowerLevel]);
 
   // Check if action requires explanation
   const requiresExplanation = useCallback((action: string): boolean => {
     if (!factors) return false;
 
     const powerScore = calculatePowerScore(factors);
     const level = getPowerLevel(powerScore);
     const requirements = getRequirements(level);
 
     if (!requirements.explanationRequired) return false;
 
     // High-impact actions always need explanation at high power
     const highImpactActions = [
       "resolve_dispute",
       "modify_trust",
       "approve_deal",
       "reject_application",
       "remove_member",
     ];
 
     return highImpactActions.includes(action);
   }, [factors, calculatePowerScore, getPowerLevel, getRequirements]);
 
   // Check power caps
   const checkPowerCaps = useCallback((): PowerCap[] => {
     return POWER_CAPS.map(cap => ({
       ...cap,
       currentValue: Math.random() * cap.maxValue, // Would be actual values
     })).filter(cap => cap.currentValue > cap.maxValue * 0.8);
   }, []);
 
   // Get power summary
   const powerSummary = useMemo(() => {
     if (!factors) return null;
 
     const score = calculatePowerScore(factors);
     const level = getPowerLevel(score);
     const requirements = getRequirements(level);
     const nearingCaps = checkPowerCaps();
 
     return {
       score,
       level,
       requirements,
       nearingCaps,
       recentActions: auditLog.filter(
         a => Date.now() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
       ).length,
       pendingReviews: auditLog.filter(a => !a.reviewed).length,
     };
   }, [factors, calculatePowerScore, getPowerLevel, getRequirements, checkPowerCaps, auditLog]);
 
   // Reverse an action
   const reverseAction = useCallback(async (entryId: string, reason: string): Promise<boolean> => {
     const entry = auditLog.find(e => e.id === entryId);
     if (!entry || !entry.reversible) return false;
 
     // Would implement actual reversal logic here
     console.log(`Reversing action ${entry.action}: ${reason}`);
     return true;
   }, [auditLog]);
 
   // Load on mount
   useEffect(() => {
     fetchPowerFactors();
   }, [fetchPowerFactors]);
 
   return {
     factors,
     powerSummary,
     auditLog,
     loading,
     refresh: fetchPowerFactors,
     logAction,
     requiresExplanation,
     checkPowerCaps,
     reverseAction,
     thresholds: POWER_THRESHOLDS,
   };
 }