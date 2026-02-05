 import { useState, useCallback, useEffect } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 // ============================================
 // SELF-EXPLAINING CHANGES
 // Every system change logged and explainable
 // No silent rule shifts
 // ============================================
 
 export type ChangeCategory =
   | "trust"
   | "visibility"
   | "access"
   | "market"
   | "policy"
   | "feature";
 
 export interface SystemChange {
   id: string;
   userId: string;
   category: ChangeCategory;
   title: string;
   description: string;
   previousValue: unknown;
   newValue: unknown;
   reason: string;
   impact: string[];
   timestamp: Date;
   acknowledged: boolean;
   acknowledgedAt: Date | null;
   actionUrl?: string;
   helpUrl?: string;
 }
 
 export interface ChangeExplanation {
   what: string;
   why: string;
   howItAffects: string[];
   whatYouCanDo?: string;
 }
 
 export function useChangeExplainer() {
   const { user } = useAuth();
   const [changes, setChanges] = useState<SystemChange[]>([]);
   const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
   const [loading, setLoading] = useState(false);
 
   // Record a system change
   const recordChange = useCallback(async (params: {
     category: ChangeCategory;
     title: string;
     description: string;
     previousValue: unknown;
     newValue: unknown;
     reason: string;
     impact: string[];
     actionUrl?: string;
     helpUrl?: string;
   }): Promise<SystemChange> => {
     if (!user) throw new Error("User not authenticated");
 
     const change: SystemChange = {
       id: crypto.randomUUID(),
       userId: user.id,
       category: params.category,
       title: params.title,
       description: params.description,
       previousValue: params.previousValue,
       newValue: params.newValue,
       reason: params.reason,
       impact: params.impact,
       timestamp: new Date(),
       acknowledged: false,
       acknowledgedAt: null,
       actionUrl: params.actionUrl,
       helpUrl: params.helpUrl,
     };
 
     setChanges(prev => [change, ...prev.slice(0, 99)]);
     setUnacknowledgedCount(prev => prev + 1);
 
     return change;
   }, [user]);
 
   // Acknowledge a change
   const acknowledgeChange = useCallback((changeId: string) => {
     setChanges(prev => prev.map(c =>
       c.id === changeId
         ? { ...c, acknowledged: true, acknowledgedAt: new Date() }
         : c
     ));
     setUnacknowledgedCount(prev => Math.max(0, prev - 1));
   }, []);
 
   // Acknowledge all changes
   const acknowledgeAll = useCallback(() => {
     setChanges(prev => prev.map(c =>
       c.acknowledged ? c : { ...c, acknowledged: true, acknowledgedAt: new Date() }
     ));
     setUnacknowledgedCount(0);
   }, []);
 
   // Get explanation for a specific change
   const getExplanation = useCallback((changeId: string): ChangeExplanation | null => {
     const change = changes.find(c => c.id === changeId);
     if (!change) return null;
 
     let whatYouCanDo: string | undefined;
 
     switch (change.category) {
       case "trust":
         whatYouCanDo = "Complete more projects successfully to improve your trust score";
         break;
       case "visibility":
         whatYouCanDo = "Stay active on the platform to maintain visibility";
         break;
       case "access":
         whatYouCanDo = "Continue using the platform to unlock more features";
         break;
       case "market":
         whatYouCanDo = "Consider developing skills in high-demand areas";
         break;
     }
 
     return {
       what: `${change.title}: ${change.description}`,
       why: change.reason,
       howItAffects: change.impact,
       whatYouCanDo,
     };
   }, [changes]);
 
   // Create trust change
   const recordTrustChange = useCallback(async (
     previousScore: number,
     newScore: number,
     reason: string
   ): Promise<SystemChange> => {
     const direction = newScore > previousScore ? "increased" : "decreased";
     const diff = Math.abs(newScore - previousScore);
 
     return recordChange({
       category: "trust",
       title: `Trust Score ${direction}`,
       description: `Your trust score changed from ${previousScore} to ${newScore}`,
       previousValue: previousScore,
       newValue: newScore,
       reason,
       impact: [
         `Opportunity visibility ${direction}`,
         `Matching priority ${direction}`,
         diff > 10 ? `Rate limits ${direction}` : "No rate limit changes",
       ],
       actionUrl: "/profile/trust",
       helpUrl: "https://help.rcollab.com/trust",
     });
   }, [recordChange]);
 
   // Create visibility change
   const recordVisibilityChange = useCallback(async (
     previousLevel: string,
     newLevel: string,
     reason: string
   ): Promise<SystemChange> => {
     return recordChange({
       category: "visibility",
       title: "Profile Visibility Adjusted",
       description: `Your visibility changed from ${previousLevel} to ${newLevel}`,
       previousValue: previousLevel,
       newValue: newLevel,
       reason,
       impact: [
         "Affects how often you appear in searches",
         "Affects opportunity recommendations",
       ],
       actionUrl: "/settings/visibility",
     });
   }, [recordChange]);
 
   // Create access change
   const recordAccessChange = useCallback(async (
     feature: string,
     granted: boolean,
     reason: string
   ): Promise<SystemChange> => {
     return recordChange({
       category: "access",
       title: granted ? `Feature Unlocked: ${feature}` : `Feature Locked: ${feature}`,
       description: granted
         ? `You now have access to ${feature}`
         : `Access to ${feature} has been restricted`,
       previousValue: !granted,
       newValue: granted,
       reason,
       impact: [
         granted
           ? `You can now use ${feature}`
           : `${feature} is no longer available`,
       ],
       actionUrl: granted ? `/features/${feature.toLowerCase().replace(/\s/g, "-")}` : undefined,
     });
   }, [recordChange]);
 
   // Create market change notification
   const recordMarketChange = useCallback(async (
     category: string,
     previousState: string,
     newState: string,
     suggestion?: string
   ): Promise<SystemChange> => {
     return recordChange({
       category: "market",
       title: `Market Update: ${category}`,
       description: `Market conditions changed from ${previousState} to ${newState}`,
       previousValue: previousState,
       newValue: newState,
       reason: "Market dynamics have shifted",
       impact: [
         `${category} opportunities may be ${newState === "saturated" ? "more competitive" : "more available"}`,
         suggestion || "Consider adjusting your focus",
       ],
       actionUrl: "/opportunities",
     });
   }, [recordChange]);
 
   // Get recent changes
   const getRecentChanges = useCallback((
     daysBack: number = 7,
     category?: ChangeCategory
   ): SystemChange[] => {
     const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
     return changes.filter(c => {
       if (c.timestamp.getTime() < cutoff) return false;
       if (category && c.category !== category) return false;
       return true;
     });
   }, [changes]);
 
   // Get unacknowledged changes
   const getUnacknowledged = useCallback((): SystemChange[] => {
     return changes.filter(c => !c.acknowledged);
   }, [changes]);
 
   // Load initial changes
   useEffect(() => {
     if (user) {
       // Would load from database
       setUnacknowledgedCount(0);
     }
   }, [user]);
 
   return {
     changes,
     unacknowledgedCount,
     loading,
     recordChange,
     acknowledgeChange,
     acknowledgeAll,
     getExplanation,
     recordTrustChange,
     recordVisibilityChange,
     recordAccessChange,
     recordMarketChange,
     getRecentChanges,
     getUnacknowledged,
   };
 }