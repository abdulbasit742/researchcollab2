 import { useState, useEffect, useCallback, useRef } from "react";
 import { useAuth } from "@/contexts/AuthContext";
 import { useExtensibilitySystem, PlatformEvent, PlatformEventType } from "./useExtensibilitySystem";
 
 // ============================================
 // AUTONOMOUS VALUE LOOPS (AVL)
 // Closed-loop engines that operate without admin intervention
 // Action → Outcome → Signal → Adjustment → Better Next Action
 // ============================================
 
 export type LoopType =
   | "deal_excellence"
   | "skill_growth"
   | "correction"
   | "relationship_value";
 
 export interface LoopExecution {
   id: string;
   loopType: LoopType;
   triggeredBy: PlatformEventType;
   startedAt: Date;
   completedAt: Date | null;
   status: "running" | "completed" | "failed";
   steps: LoopStep[];
   outcome: LoopOutcome | null;
 }
 
 export interface LoopStep {
   name: string;
   status: "pending" | "running" | "completed" | "failed";
   startedAt: Date | null;
   completedAt: Date | null;
   result: unknown;
 }
 
 export interface LoopOutcome {
   trustAdjustment: number;
   visibilityChange: "increased" | "decreased" | "unchanged";
   matchingBoost: number;
   guidanceTriggered: boolean;
   recoveryOffered: boolean;
 }
 
 export interface LoopDefinition {
   type: LoopType;
   name: string;
   description: string;
   triggerEvents: PlatformEventType[];
   steps: string[];
   cooldownMs: number;
 }
 
 export const LOOP_DEFINITIONS: LoopDefinition[] = [
   {
     type: "deal_excellence",
     name: "Deal Excellence Loop",
     description: "Successful deals → Trust increase → Better opportunities → Higher-quality matches",
     triggerEvents: ["deal.completed", "milestone.approved"],
     steps: ["validate_outcome", "calculate_trust_impact", "update_matching_scores", "refresh_opportunities"],
     cooldownMs: 5000,
   },
   {
     type: "skill_growth",
     name: "Skill Growth Loop",
     description: "Learning completed → Skill validated → Higher matching weight → More skill-relevant opportunities",
     triggerEvents: ["credential.verified", "skill.endorsed"],
     steps: ["validate_credential", "update_skill_level", "recalculate_matches", "notify_opportunities"],
     cooldownMs: 10000,
   },
   {
     type: "correction",
     name: "Correction Loop",
     description: "Poor behavior → Trust penalty → Reduced visibility → Recovery path offered",
     triggerEvents: ["deal.disputed", "outcome.verified"],
     steps: ["assess_behavior", "apply_trust_penalty", "adjust_visibility", "generate_recovery_path"],
     cooldownMs: 30000,
   },
   {
     type: "relationship_value",
     name: "Relationship Value Loop",
     description: "Successful collaboration → Relationship strength → Warm intro probability → Network effects",
     triggerEvents: ["deal.completed"],
     steps: ["update_relationship_strength", "calculate_intro_probability", "update_network_graph"],
     cooldownMs: 5000,
   },
 ];
 
 // Safeguards against over-correction
 interface LoopSafeguards {
   maxTrustAdjustmentPerAction: number;
   maxVisibilityChangesPerWeek: number;
   stabilizationPeriodDays: number;
   humanEscalationThreshold: number;
 }
 
 const SAFEGUARDS: LoopSafeguards = {
   maxTrustAdjustmentPerAction: 10,
   maxVisibilityChangesPerWeek: 3,
   stabilizationPeriodDays: 14,
   humanEscalationThreshold: 3,
 };
 
 export function useAutonomousValueLoops() {
   const { user } = useAuth();
   const { subscribeToEvents, unsubscribeFromEvents, emitEvent } = useExtensibilitySystem();
   
   const [executions, setExecutions] = useState<LoopExecution[]>([]);
   const [isRunning, setIsRunning] = useState(false);
   const subscriptionIds = useRef<string[]>([]);
   const lastExecutionTimes = useRef<Map<LoopType, number>>(new Map());
   const weeklyVisibilityChanges = useRef<number>(0);
 
   // Execute a loop
   const executeLoop = useCallback(async (
     loopType: LoopType,
     triggerEvent: PlatformEvent
   ): Promise<LoopExecution> => {
     const definition = LOOP_DEFINITIONS.find(d => d.type === loopType);
     if (!definition) throw new Error(`Unknown loop type: ${loopType}`);
 
     // Check cooldown
     const lastExecution = lastExecutionTimes.current.get(loopType);
     if (lastExecution && Date.now() - lastExecution < definition.cooldownMs) {
       throw new Error("Loop in cooldown period");
     }
 
     const execution: LoopExecution = {
       id: crypto.randomUUID(),
       loopType,
       triggeredBy: triggerEvent.type,
       startedAt: new Date(),
       completedAt: null,
       status: "running",
       steps: definition.steps.map(name => ({
         name,
         status: "pending",
         startedAt: null,
         completedAt: null,
         result: null,
       })),
       outcome: null,
     };
 
     setExecutions(prev => [...prev.slice(-49), execution]);
     lastExecutionTimes.current.set(loopType, Date.now());
 
     try {
       // Execute steps
       for (let i = 0; i < execution.steps.length; i++) {
         execution.steps[i].status = "running";
         execution.steps[i].startedAt = new Date();
         
         // Simulate step execution
         await new Promise(resolve => setTimeout(resolve, 100));
         
         execution.steps[i].status = "completed";
         execution.steps[i].completedAt = new Date();
         execution.steps[i].result = { success: true };
       }
 
       // Calculate outcome based on loop type
       execution.outcome = calculateLoopOutcome(loopType, triggerEvent);
       execution.status = "completed";
       execution.completedAt = new Date();
 
       // Apply safeguards
       if (execution.outcome.trustAdjustment > SAFEGUARDS.maxTrustAdjustmentPerAction) {
         execution.outcome.trustAdjustment = SAFEGUARDS.maxTrustAdjustmentPerAction;
       }
       if (execution.outcome.trustAdjustment < -SAFEGUARDS.maxTrustAdjustmentPerAction) {
         execution.outcome.trustAdjustment = -SAFEGUARDS.maxTrustAdjustmentPerAction;
       }
 
       if (execution.outcome.visibilityChange !== "unchanged") {
         if (weeklyVisibilityChanges.current >= SAFEGUARDS.maxVisibilityChangesPerWeek) {
           execution.outcome.visibilityChange = "unchanged";
         } else {
           weeklyVisibilityChanges.current++;
         }
       }
 
     } catch (error) {
       execution.status = "failed";
       execution.completedAt = new Date();
       console.error(`Loop ${loopType} failed:`, error);
     }
 
     setExecutions(prev => prev.map(e => e.id === execution.id ? execution : e));
     return execution;
   }, []);
 
   // Calculate outcome based on loop type
   const calculateLoopOutcome = (loopType: LoopType, event: PlatformEvent): LoopOutcome => {
     switch (loopType) {
       case "deal_excellence":
         return {
           trustAdjustment: 5,
           visibilityChange: "increased",
           matchingBoost: 10,
           guidanceTriggered: false,
           recoveryOffered: false,
         };
       case "skill_growth":
         return {
           trustAdjustment: 2,
           visibilityChange: "unchanged",
           matchingBoost: 15,
           guidanceTriggered: false,
           recoveryOffered: false,
         };
       case "correction":
         return {
           trustAdjustment: -3,
           visibilityChange: "decreased",
           matchingBoost: -5,
           guidanceTriggered: true,
           recoveryOffered: true,
         };
       case "relationship_value":
         return {
           trustAdjustment: 1,
           visibilityChange: "unchanged",
           matchingBoost: 5,
           guidanceTriggered: false,
           recoveryOffered: false,
         };
       default:
         return {
           trustAdjustment: 0,
           visibilityChange: "unchanged",
           matchingBoost: 0,
           guidanceTriggered: false,
           recoveryOffered: false,
         };
     }
   };
 
   // Event handler
   const handleEvent = useCallback(async (event: PlatformEvent) => {
     const matchingLoops = LOOP_DEFINITIONS.filter(
       def => def.triggerEvents.includes(event.type)
     );
 
     for (const loop of matchingLoops) {
       try {
         await executeLoop(loop.type, event);
       } catch (error) {
         console.log(`Skipped loop ${loop.type}:`, error);
       }
     }
   }, [executeLoop]);
 
   // Start autonomous operation
   const startLoops = useCallback(() => {
     if (isRunning) return;
 
     const allTriggerEvents = new Set<PlatformEventType>();
     LOOP_DEFINITIONS.forEach(def => {
       def.triggerEvents.forEach(e => allTriggerEvents.add(e));
     });
 
     const subId = subscribeToEvents(
       Array.from(allTriggerEvents),
       handleEvent,
       { priority: 100 }
     );
     
     subscriptionIds.current.push(subId);
     setIsRunning(true);
   }, [isRunning, subscribeToEvents, handleEvent]);
 
   // Stop autonomous operation
   const stopLoops = useCallback(() => {
     subscriptionIds.current.forEach(id => unsubscribeFromEvents(id));
     subscriptionIds.current = [];
     setIsRunning(false);
   }, [unsubscribeFromEvents]);
 
   // Cleanup on unmount
   useEffect(() => {
     return () => {
       stopLoops();
     };
   }, [stopLoops]);
 
   // Get loop stats
   const getLoopStats = useCallback(() => {
     const stats: Record<LoopType, { executions: number; successRate: number; avgDuration: number }> = {
       deal_excellence: { executions: 0, successRate: 0, avgDuration: 0 },
       skill_growth: { executions: 0, successRate: 0, avgDuration: 0 },
       correction: { executions: 0, successRate: 0, avgDuration: 0 },
       relationship_value: { executions: 0, successRate: 0, avgDuration: 0 },
     };
 
     executions.forEach(exec => {
       const stat = stats[exec.loopType];
       stat.executions++;
       if (exec.status === "completed") {
         stat.successRate = (stat.successRate * (stat.executions - 1) + 100) / stat.executions;
       }
       if (exec.completedAt) {
         const duration = exec.completedAt.getTime() - exec.startedAt.getTime();
         stat.avgDuration = (stat.avgDuration * (stat.executions - 1) + duration) / stat.executions;
       }
     });
 
     return stats;
   }, [executions]);
 
   return {
     executions,
     isRunning,
     startLoops,
     stopLoops,
     executeLoop,
     getLoopStats,
     safeguards: SAFEGUARDS,
     loopDefinitions: LOOP_DEFINITIONS,
   };
 }