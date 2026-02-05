 // ============================================
 // INFRASTRUCTURE HOOKS EXPORTS
 // Core systems for professional infrastructure
 // ============================================
 
 // System 1: Universal Professional Object Model
 export { useUniversalObjectModel, OBJECT_TYPE_REGISTRY } from "../useUniversalObjectModel";
 
 // System 2: Trust Computation Engine
 export { useTrustComputationEngine } from "../useTrustComputationEngine";
 
 // System 3: Outcome Graph
 export { useOutcomeGraph } from "../useOutcomeGraph";
 
 // System 4: Continuous Matching Engine
 export { useContinuousMatchingEngine } from "../useContinuousMatchingEngine";
 
 // System 5: Deal Execution Runtime
 export { useDealExecutionRuntime } from "../useDealExecutionRuntime";
 
 // System 6: Long-Term Memory
 export { useLongTermMemory } from "../useLongTermMemory";
 
 // System 9: Extensibility & Composability
 export { useExtensibilitySystem } from "../useExtensibilitySystem";
 
 // Re-export types
 export type {
   // UPOM Types
   UPOMObject,
   UPOMObjectType,
   LifecycleState,
   VisibilityLevel,
   TrustSignal,
   AuditEntry,
   ObjectRelationship,
   RelationshipType,
   PersonObject,
   SkillObject,
   CredentialObject,
   OutcomeObject,
   DealObject,
   ProjectObject,
   InstitutionObject,
   OpportunityObject,
   ResearchArtifactObject,
 } from "@/types/upom";
 
 // Re-export hook types
 export type {
   // Outcome Graph
   OutcomeNode,
   OutcomeEdge,
   OutcomeMetrics,
   OutcomeComparison,
   OutcomeCluster,
 } from "../useOutcomeGraph";
 
 export type {
   // Deal Execution Runtime
   DealExecutionState,
   DealContext,
   DealParty,
   ScopeObject,
   MilestoneObject,
   EscrowObject,
   DealTemplate,
   SimulationResult,
 } from "../useDealExecutionRuntime";
 
 export type {
   // Trust Computation Engine
   TrustInput,
   TrustInputSource,
   TrustCategory,
   TrustTransformation,
   ContextualTrust,
   TemporalTrustPoint,
   ComputedTrustProfile,
   TrustExplanation,
 } from "../useTrustComputationEngine";
 
 export type {
   // Continuous Matching Engine
   MatchCandidate,
   MatchSource,
   FitScore,
   ReadinessIndicator,
   MatchReason,
   BroadcastConfig,
   MatchingPreferences,
   SuccessPrediction,
 } from "../useContinuousMatchingEngine";
 
 export type {
   // Long-Term Memory
   CareerTrajectoryPoint,
   SkillEvolution,
   InstitutionalContribution,
   HistoricalComparison,
   LegacyRecord,
   TimeTravelView,
 } from "../useLongTermMemory";
 
 export type {
   // Extensibility System
   PlatformEventType,
   PlatformEvent,
   Plugin,
   PluginPermission,
   Workflow,
   WorkflowTrigger,
   WorkflowStep,
   APIEndpoint,
   Webhook,
 } from "../useExtensibilitySystem";