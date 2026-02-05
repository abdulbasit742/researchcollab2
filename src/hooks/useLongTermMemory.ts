 import { useState, useCallback, useMemo } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 // ============================================
 // LONG-TERM MEMORY SYSTEM
 // Remembers career trajectories, skill evolution,
 // institutional contributions, and national progress
 // ============================================
 
 export interface CareerTrajectoryPoint {
   id: string;
   timestamp: Date;
   eventType: "role_change" | "skill_acquired" | "outcome_achieved" | "trust_milestone" | "institution_joined" | "project_completed";
   title: string;
   description: string;
   impact: number;
   metadata: Record<string, unknown>;
 }
 
 export interface SkillEvolution {
   skillId: string;
   skillName: string;
   history: SkillSnapshot[];
   currentLevel: number;
   peakLevel: number;
   decayRate: number;
   lastDemonstrated: Date | null;
   projectedLevel: number; // 6 months from now
 }
 
 export interface SkillSnapshot {
   timestamp: Date;
   level: number;
   evidenceCount: number;
   endorsements: number;
   source: "outcome" | "endorsement" | "certification" | "decay";
 }
 
 export interface InstitutionalContribution {
   institutionId: string;
   institutionName: string;
   role: string;
   startDate: Date;
   endDate: Date | null;
   contributions: ContributionRecord[];
   impactScore: number;
   verification: "verified" | "pending" | "self_reported";
 }
 
 export interface ContributionRecord {
   id: string;
   type: "project" | "publication" | "mentorship" | "leadership" | "innovation";
   title: string;
   date: Date;
   impact: number;
   collaborators: string[];
 }
 
 export interface HistoricalComparison {
   metric: string;
   currentValue: number;
   pastValue: number;
   pastDate: Date;
   changePercent: number;
   trend: "improving" | "declining" | "stable";
 }
 
 export interface LegacyRecord {
   id: string;
   type: "achievement" | "milestone" | "recognition" | "impact";
   title: string;
   description: string;
   date: Date;
   evidence: string[];
   visibility: "public" | "connections" | "private";
   verifiedBy: string | null;
 }
 
 export interface KnowledgePreservationEntry {
   id: string;
   domain: string;
   knowledge: string;
   learnedFrom: string | null;
   learnedAt: Date;
   lastApplied: Date | null;
   applicationCount: number;
   decayStatus: "active" | "at_risk" | "decaying" | "archived";
 }
 
 export interface TimeTravelView {
   targetDate: Date;
   profile: {
     trustScore: number;
     trustTier: string;
     skills: { name: string; level: number }[];
     outcomes: number;
     institutions: string[];
   };
   differences: {
     field: string;
     then: unknown;
     now: unknown;
   }[];
 }
 
 export function useLongTermMemory(userId?: string) {
   const { user } = useAuth();
   const targetUserId = userId || user?.id;
 
   const [trajectory, setTrajectory] = useState<CareerTrajectoryPoint[]>([]);
   const [skillEvolutions, setSkillEvolutions] = useState<SkillEvolution[]>([]);
   const [institutionalContributions, setInstitutionalContributions] = useState<InstitutionalContribution[]>([]);
   const [legacyRecords, setLegacyRecords] = useState<LegacyRecord[]>([]);
   const [loading, setLoading] = useState(false);
 
   // Fetch career trajectory
   const fetchCareerTrajectory = useCallback(async () => {
     if (!targetUserId) return;
     setLoading(true);
 
     try {
       // Fetch from multiple sources to build trajectory
       const [
         { data: outcomes },
         { data: records },
         { data: trustProfile },
       ] = await Promise.all([
         supabase
           .from("accountability_records")
           .select("*")
           .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`)
           .eq("outcome_status", "completed")
           .order("created_at", { ascending: true }),
         supabase
           .from("academic_records")
           .select("*")
           .eq("user_id", targetUserId)
           .order("start_date", { ascending: true }),
         supabase
           .from("user_trust_profiles")
           .select("*")
           .eq("user_id", targetUserId)
           .maybeSingle(),
       ]);
 
       const trajectoryPoints: CareerTrajectoryPoint[] = [];
 
       // Add outcome events
       (outcomes || []).forEach((outcome: any) => {
         trajectoryPoints.push({
           id: `outcome_${outcome.id}`,
           timestamp: new Date(outcome.verified_at || outcome.created_at),
           eventType: "outcome_achieved",
           title: outcome.collaboration_type || "Project Completed",
           description: `Completed ${outcome.promised_deliverables?.join(", ") || "deliverables"}`,
           impact: outcome.trust_impact_executor || 0,
           metadata: { outcomeId: outcome.id, totalPaid: outcome.total_paid },
         });
       });
 
       // Add academic record events
       (records || []).forEach((record: any) => {
         trajectoryPoints.push({
           id: `record_${record.id}`,
           timestamp: new Date(record.start_date),
           eventType: record.record_type === "degree" ? "role_change" : "skill_acquired",
           title: record.title,
           description: record.description || "",
           impact: record.verification_status === "verified" ? 10 : 5,
           metadata: { recordId: record.id, recordType: record.record_type },
         });
       });
 
       // Add trust milestones
       if (trustProfile) {
         const trustMilestones = [25, 50, 75, 90];
         trustMilestones.forEach(milestone => {
           if ((trustProfile as any).trust_score >= milestone) {
             trajectoryPoints.push({
               id: `trust_${milestone}`,
               timestamp: new Date(), // Would be actual date in production
               eventType: "trust_milestone",
               title: `Reached ${milestone}% Trust Score`,
               description: `Achieved trust milestone`,
               impact: milestone / 10,
               metadata: { trustScore: milestone },
             });
           }
         });
       }
 
       // Sort by timestamp
       trajectoryPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
       setTrajectory(trajectoryPoints);
 
     } catch (error) {
       console.error("Error fetching career trajectory:", error);
     } finally {
       setLoading(false);
     }
   }, [targetUserId]);
 
   // Track skill evolution over time
   const trackSkillEvolution = useCallback(async (skillName: string): Promise<SkillEvolution | null> => {
     if (!targetUserId) return null;
 
     // Simulate skill evolution data
     const now = Date.now();
     const monthMs = 30 * 24 * 60 * 60 * 1000;
 
     const history: SkillSnapshot[] = [];
     let currentLevel = 30;
 
     // Generate 12 months of history
     for (let i = 11; i >= 0; i--) {
       const variance = Math.random() * 10 - 3;
       currentLevel = Math.max(0, Math.min(100, currentLevel + variance));
 
       history.push({
         timestamp: new Date(now - i * monthMs),
         level: Math.round(currentLevel),
         evidenceCount: Math.floor(Math.random() * 5),
         endorsements: Math.floor(Math.random() * 3),
         source: i % 3 === 0 ? "outcome" : i % 2 === 0 ? "endorsement" : "decay",
       });
     }
 
     const evolution: SkillEvolution = {
       skillId: crypto.randomUUID(),
       skillName,
       history,
       currentLevel: Math.round(currentLevel),
       peakLevel: Math.max(...history.map(h => h.level)),
       decayRate: 0.02,
       lastDemonstrated: history[history.length - 1]?.timestamp || null,
       projectedLevel: Math.max(0, Math.round(currentLevel * 0.94)), // 6 months decay
     };
 
     setSkillEvolutions(prev => {
       const existing = prev.findIndex(s => s.skillName === skillName);
       if (existing >= 0) {
         const updated = [...prev];
         updated[existing] = evolution;
         return updated;
       }
       return [...prev, evolution];
     });
 
     return evolution;
   }, [targetUserId]);
 
   // Time travel view - see profile at a past date
   const getTimeTravelView = useCallback(async (targetDate: Date): Promise<TimeTravelView> => {
     // Filter trajectory to get state at target date
     const eventsBeforeDate = trajectory.filter(
       t => t.timestamp.getTime() <= targetDate.getTime()
     );
 
     // Calculate trust score at that time (simplified)
     const trustImpact = eventsBeforeDate
       .filter(e => e.eventType === "outcome_achieved")
       .reduce((sum, e) => sum + e.impact, 0);
 
     const trustScoreThen = Math.min(100, 25 + trustImpact);
 
     // Get current profile for comparison
     const { data: currentProfile } = await supabase
       .from("profiles")
       .select("*")
       .eq("id", targetUserId)
       .maybeSingle();
 
     const { data: currentTrust } = await supabase
       .from("user_trust_profiles")
       .select("trust_score")
       .eq("user_id", targetUserId)
       .maybeSingle();
 
     const currentTrustScore = (currentTrust as any)?.trust_score || 50;
 
     return {
       targetDate,
       profile: {
         trustScore: trustScoreThen,
         trustTier: trustScoreThen >= 75 ? "gold" : trustScoreThen >= 50 ? "silver" : "bronze",
         skills: eventsBeforeDate
           .filter(e => e.eventType === "skill_acquired")
           .map(e => ({ name: e.title, level: 50 })),
         outcomes: eventsBeforeDate.filter(e => e.eventType === "outcome_achieved").length,
         institutions: eventsBeforeDate
           .filter(e => e.eventType === "institution_joined")
           .map(e => e.title),
       },
       differences: [
         {
           field: "Trust Score",
           then: trustScoreThen,
           now: currentTrustScore,
         },
         {
           field: "Completed Outcomes",
           then: eventsBeforeDate.filter(e => e.eventType === "outcome_achieved").length,
           now: trajectory.filter(e => e.eventType === "outcome_achieved").length,
         },
       ],
     };
   }, [trajectory, targetUserId]);
 
   // Historical comparisons
   const getHistoricalComparisons = useCallback((
     timeframeDays: number = 90
   ): HistoricalComparison[] => {
     const now = new Date();
     const pastDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
 
     const pastEvents = trajectory.filter(t => t.timestamp <= pastDate);
     const recentEvents = trajectory.filter(t => t.timestamp > pastDate);
 
     const pastOutcomes = pastEvents.filter(e => e.eventType === "outcome_achieved").length;
     const currentOutcomes = trajectory.filter(e => e.eventType === "outcome_achieved").length;
     const recentOutcomes = recentEvents.filter(e => e.eventType === "outcome_achieved").length;
 
     const pastImpact = pastEvents.reduce((sum, e) => sum + e.impact, 0);
     const totalImpact = trajectory.reduce((sum, e) => sum + e.impact, 0);
 
     return [
       {
         metric: "Completed Outcomes",
         currentValue: currentOutcomes,
         pastValue: pastOutcomes,
         pastDate,
         changePercent: pastOutcomes > 0 ? ((currentOutcomes - pastOutcomes) / pastOutcomes) * 100 : 100,
         trend: recentOutcomes > 2 ? "improving" : recentOutcomes > 0 ? "stable" : "declining",
       },
       {
         metric: "Total Impact Score",
         currentValue: totalImpact,
         pastValue: pastImpact,
         pastDate,
         changePercent: pastImpact > 0 ? ((totalImpact - pastImpact) / pastImpact) * 100 : 100,
         trend: totalImpact > pastImpact * 1.1 ? "improving" : totalImpact >= pastImpact ? "stable" : "declining",
       },
     ];
   }, [trajectory]);
 
   // Add legacy record
   const addLegacyRecord = useCallback(async (
     record: Omit<LegacyRecord, "id" | "verifiedBy">
   ): Promise<{ success: boolean; recordId?: string }> => {
     const newRecord: LegacyRecord = {
       ...record,
       id: crypto.randomUUID(),
       verifiedBy: null,
     };
 
     setLegacyRecords(prev => [...prev, newRecord]);
     return { success: true, recordId: newRecord.id };
   }, []);
 
   // Knowledge preservation
   const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgePreservationEntry[]>([]);
 
   const preserveKnowledge = useCallback(async (
     domain: string,
     knowledge: string,
     learnedFrom?: string
   ): Promise<{ success: boolean }> => {
     const entry: KnowledgePreservationEntry = {
       id: crypto.randomUUID(),
       domain,
       knowledge,
       learnedFrom: learnedFrom || null,
       learnedAt: new Date(),
       lastApplied: null,
       applicationCount: 0,
       decayStatus: "active",
     };
 
     setKnowledgeEntries(prev => [...prev, entry]);
     return { success: true };
   }, []);
 
   // Summary stats
   const memoryStats = useMemo(() => ({
     trajectoryLength: trajectory.length,
     oldestEvent: trajectory[0]?.timestamp || null,
     latestEvent: trajectory[trajectory.length - 1]?.timestamp || null,
     totalImpact: trajectory.reduce((sum, t) => sum + t.impact, 0),
     skillsTracked: skillEvolutions.length,
     institutionsCount: institutionalContributions.length,
     legacyRecordsCount: legacyRecords.length,
     knowledgeEntriesCount: knowledgeEntries.length,
   }), [trajectory, skillEvolutions, institutionalContributions, legacyRecords, knowledgeEntries]);
 
   return {
     trajectory,
     skillEvolutions,
     institutionalContributions,
     legacyRecords,
     knowledgeEntries,
     loading,
     memoryStats,
     fetchCareerTrajectory,
     trackSkillEvolution,
     getTimeTravelView,
     getHistoricalComparisons,
     addLegacyRecord,
     preserveKnowledge,
   };
 }