 import { useState, useCallback, useEffect, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 // ============================================
 // CONTINUOUS MATCHING ENGINE
 // Replaces search with proactive opportunity discovery
 // Opportunities find people, not the other way around
 // ============================================
 
 export interface MatchCandidate {
   id: string;
   type: "opportunity" | "collaborator" | "project" | "grant" | "mentorship";
   title: string;
   description: string;
   source: MatchSource;
   fitScore: FitScore;
   successProbability: number;
   readinessIndicators: ReadinessIndicator[];
   matchReasons: MatchReason[];
   discoveredAt: Date;
   expiresAt: Date | null;
   urgency: "high" | "medium" | "low";
   status: "new" | "viewed" | "saved" | "applied" | "dismissed";
 }
 
 export interface MatchSource {
   type: "passive_discovery" | "active_broadcast" | "network_referral" | "ai_recommendation";
   origin: string;
   confidence: number;
 }
 
 export interface FitScore {
   overall: number;
   breakdown: {
     skills: number;
     trust: number;
     timing: number;
     experience: number;
     institutional: number;
   };
   explanation: string;
 }
 
 export interface ReadinessIndicator {
   dimension: string;
   score: number;
   status: "ready" | "almost_ready" | "needs_work" | "blocked";
   gaps: string[];
   actions: string[];
 }
 
 export interface MatchReason {
   type: "skill_match" | "trust_fit" | "timing_optimal" | "network_connection" | "past_success";
   description: string;
   strength: number;
 }
 
 export interface BroadcastConfig {
   id: string;
   type: "availability" | "seeking_collaboration" | "open_to_opportunities";
   active: boolean;
   filters: BroadcastFilter;
   visibility: "public" | "network" | "institution" | "invite_only";
   expiresAt: Date | null;
 }
 
 export interface BroadcastFilter {
   domains?: string[];
   minBudget?: number;
   maxBudget?: number;
   projectTypes?: string[];
   remoteOnly?: boolean;
   minTrustScore?: number;
 }
 
 export interface MatchingPreferences {
   enablePassiveDiscovery: boolean;
   enableActiveBroadcast: boolean;
   notifyOnHighFitMatches: boolean;
   autoDeclineThreshold: number; // Below this fit score, auto-decline
   priorityDomains: string[];
   excludedDomains: string[];
   preferredProjectSize: "small" | "medium" | "large" | "any";
   availabilityHoursPerWeek: number;
 }
 
 export interface SuccessPrediction {
   probability: number;
   confidence: number;
   factors: { factor: string; impact: number; direction: "positive" | "negative" }[];
   historicalBasis: { similarMatches: number; successRate: number };
   risks: { risk: string; likelihood: number; mitigation: string }[];
 }
 
 export function useContinuousMatchingEngine() {
   const { user, profile } = useAuth();
   const [matches, setMatches] = useState<MatchCandidate[]>([]);
   const [broadcasts, setBroadcasts] = useState<BroadcastConfig[]>([]);
   const [preferences, setPreferences] = useState<MatchingPreferences>({
     enablePassiveDiscovery: true,
     enableActiveBroadcast: false,
     notifyOnHighFitMatches: true,
     autoDeclineThreshold: 30,
     priorityDomains: [],
     excludedDomains: [],
     preferredProjectSize: "any",
     availabilityHoursPerWeek: 20,
   });
   const [loading, setLoading] = useState(false);
 
   // Calculate fit score for a match
   const calculateFitScore = useCallback((
     opportunity: any,
     userSkills: string[],
     userTrustScore: number
   ): FitScore => {
     const oppTags = opportunity.tags || [];
 
     // Skills match
     const skillMatches = userSkills.filter(skill =>
       oppTags.some((tag: string) =>
         tag.toLowerCase().includes(skill.toLowerCase()) ||
         skill.toLowerCase().includes(tag.toLowerCase())
       )
     );
     const skillScore = Math.min(100, (skillMatches.length / Math.max(oppTags.length, 1)) * 100);
 
     // Trust fit
     const requiredTrust = opportunity.min_trust_score || 30;
     const trustScore = userTrustScore >= requiredTrust ? 100 : (userTrustScore / requiredTrust) * 80;
 
     // Timing (deadline proximity)
     const daysUntilDeadline = opportunity.deadline_days || 30;
     const timingScore = daysUntilDeadline > 7 ? 100 : daysUntilDeadline > 3 ? 70 : 40;
 
     // Experience (based on past similar projects)
     const experienceScore = 60; // Would be calculated from user history
 
     // Institutional match
     const institutionalScore = 50; // Would check institution alignment
 
     const overall = (
       skillScore * 0.35 +
       trustScore * 0.25 +
       timingScore * 0.15 +
       experienceScore * 0.15 +
       institutionalScore * 0.10
     );
 
     return {
       overall: Math.round(overall),
       breakdown: {
         skills: Math.round(skillScore),
         trust: Math.round(trustScore),
         timing: Math.round(timingScore),
         experience: Math.round(experienceScore),
         institutional: Math.round(institutionalScore),
       },
       explanation: skillMatches.length > 0
         ? `Strong match in: ${skillMatches.slice(0, 3).join(", ")}`
         : "General alignment with your profile",
     };
   }, []);
 
   // Predict success probability
   const predictSuccess = useCallback((match: MatchCandidate): SuccessPrediction => {
     const baseProbability = match.fitScore.overall * 0.8;
 
    const factors: { factor: string; impact: number; direction: "positive" | "negative" }[] = [
       {
         factor: "Skill alignment",
         impact: match.fitScore.breakdown.skills * 0.3,
        direction: match.fitScore.breakdown.skills > 70 ? "positive" : "negative",
       },
       {
         factor: "Trust compatibility",
         impact: match.fitScore.breakdown.trust * 0.25,
        direction: match.fitScore.breakdown.trust > 70 ? "positive" : "negative",
       },
       {
         factor: "Timeline feasibility",
         impact: match.fitScore.breakdown.timing * 0.2,
        direction: match.fitScore.breakdown.timing > 60 ? "positive" : "negative",
       },
     ];
 
     const risks = [];
     if (match.fitScore.breakdown.skills < 60) {
       risks.push({
         risk: "Skill gap may require additional learning",
         likelihood: 0.4,
         mitigation: "Propose a skill-building phase in project scope",
       });
     }
     if (match.fitScore.breakdown.timing < 50) {
       risks.push({
         risk: "Tight deadline pressure",
         likelihood: 0.6,
         mitigation: "Negotiate extended timeline or reduced scope",
       });
     }
 
     return {
       probability: Math.round(baseProbability),
       confidence: 0.75,
       factors,
       historicalBasis: { similarMatches: 12, successRate: 0.78 },
       risks,
     };
   }, []);
 
   // Discover matches passively
   const discoverMatches = useCallback(async () => {
     if (!user || !preferences.enablePassiveDiscovery) return;
     setLoading(true);
 
     try {
       // Fetch open opportunities
       const { data: opportunities } = await supabase
         .from("earning_projects")
         .select("*")
         .eq("status", "open")
         .order("created_at", { ascending: false })
         .limit(50);
 
       // Get user's trust score
       const { data: trustProfile } = await supabase
         .from("user_trust_profiles")
         .select("trust_score")
         .eq("user_id", user.id)
         .maybeSingle();
 
       const userTrustScore = (trustProfile as any)?.trust_score || 50;
       const userSkills = profile?.interests || [];
 
       // Calculate matches
       const newMatches: MatchCandidate[] = (opportunities || [])
         .map((opp: any) => {
           const fitScore = calculateFitScore(opp, userSkills, userTrustScore);
 
           // Build readiness indicators
           const readinessIndicators: ReadinessIndicator[] = [
             {
               dimension: "Skills",
               score: fitScore.breakdown.skills,
               status: fitScore.breakdown.skills > 70 ? "ready" : fitScore.breakdown.skills > 50 ? "almost_ready" : "needs_work",
               gaps: fitScore.breakdown.skills < 70 ? ["May need additional expertise"] : [],
               actions: fitScore.breakdown.skills < 70 ? ["Review required skills"] : [],
             },
             {
               dimension: "Trust Level",
               score: fitScore.breakdown.trust,
               status: fitScore.breakdown.trust > 70 ? "ready" : "almost_ready",
               gaps: fitScore.breakdown.trust < 70 ? ["Trust score below requirement"] : [],
               actions: fitScore.breakdown.trust < 70 ? ["Complete more outcomes"] : [],
             },
           ];
 
           // Build match reasons
           const matchReasons: MatchReason[] = [];
           if (fitScore.breakdown.skills > 60) {
             matchReasons.push({
               type: "skill_match",
               description: "Your skills align well with requirements",
               strength: fitScore.breakdown.skills / 100,
             });
           }
           if (fitScore.breakdown.trust > 70) {
             matchReasons.push({
               type: "trust_fit",
               description: "Your trust level meets the threshold",
               strength: fitScore.breakdown.trust / 100,
             });
           }
 
           return {
             id: opp.id,
             type: "opportunity" as const,
             title: opp.title,
             description: opp.description || "",
             source: {
               type: "passive_discovery" as const,
               origin: "opportunity_scan",
               confidence: 0.85,
             },
             fitScore,
             successProbability: Math.round(fitScore.overall * 0.8),
             readinessIndicators,
             matchReasons,
             discoveredAt: new Date(),
             expiresAt: opp.deadline_days
               ? new Date(Date.now() + opp.deadline_days * 24 * 60 * 60 * 1000)
               : null,
            urgency: (opp.deadline_days && opp.deadline_days < 7 ? "high" : opp.deadline_days && opp.deadline_days < 14 ? "medium" : "low") as "high" | "medium" | "low",
             status: "new" as const,
           };
         })
         .filter(m => m.fitScore.overall >= preferences.autoDeclineThreshold)
         .sort((a, b) => b.fitScore.overall - a.fitScore.overall);
 
       setMatches(newMatches);
     } catch (error) {
       console.error("Error discovering matches:", error);
     } finally {
       setLoading(false);
     }
   }, [user, profile, preferences, calculateFitScore]);
 
   // Create broadcast
   const createBroadcast = useCallback(async (
     type: BroadcastConfig["type"],
     filters: BroadcastFilter,
     visibility: BroadcastConfig["visibility"],
     expiresInDays?: number
   ): Promise<{ success: boolean; broadcastId?: string }> => {
     const broadcast: BroadcastConfig = {
       id: crypto.randomUUID(),
       type,
       active: true,
       filters,
       visibility,
       expiresAt: expiresInDays
         ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
         : null,
     };
 
     setBroadcasts(prev => [...prev, broadcast]);
     return { success: true, broadcastId: broadcast.id };
   }, []);
 
   // Update broadcast
   const updateBroadcast = useCallback((broadcastId: string, updates: Partial<BroadcastConfig>) => {
     setBroadcasts(prev => prev.map(b =>
       b.id === broadcastId ? { ...b, ...updates } : b
     ));
   }, []);
 
   // Delete broadcast
   const deleteBroadcast = useCallback((broadcastId: string) => {
     setBroadcasts(prev => prev.filter(b => b.id !== broadcastId));
   }, []);
 
   // Update match status
   const updateMatchStatus = useCallback((
     matchId: string,
     status: MatchCandidate["status"]
   ) => {
     setMatches(prev => prev.map(m =>
       m.id === matchId ? { ...m, status } : m
     ));
   }, []);
 
   // Update preferences
   const updatePreferences = useCallback((updates: Partial<MatchingPreferences>) => {
     setPreferences(prev => ({ ...prev, ...updates }));
   }, []);
 
   // Get match statistics
   const matchStats = useMemo(() => ({
     total: matches.length,
     highFit: matches.filter(m => m.fitScore.overall >= 70).length,
     new: matches.filter(m => m.status === "new").length,
     saved: matches.filter(m => m.status === "saved").length,
     applied: matches.filter(m => m.status === "applied").length,
     avgFitScore: matches.length > 0
       ? Math.round(matches.reduce((sum, m) => sum + m.fitScore.overall, 0) / matches.length)
       : 0,
     byUrgency: {
       high: matches.filter(m => m.urgency === "high").length,
       medium: matches.filter(m => m.urgency === "medium").length,
       low: matches.filter(m => m.urgency === "low").length,
     },
   }), [matches]);
 
   // Auto-discover on mount and preferences change
   useEffect(() => {
     if (user && preferences.enablePassiveDiscovery) {
       discoverMatches();
     }
   }, [user, preferences.enablePassiveDiscovery]);
 
   return {
     matches,
     broadcasts,
     preferences,
     loading,
     matchStats,
     discoverMatches,
     createBroadcast,
     updateBroadcast,
     deleteBroadcast,
     updateMatchStatus,
     updatePreferences,
     predictSuccess,
   };
 }