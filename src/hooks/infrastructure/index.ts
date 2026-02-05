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
 
 // System 21: Autonomous Value Loops
 export { useAutonomousValueLoops } from "../useAutonomousValueLoops";
 
 // System 22: Context-Aware Notifications
 export { useContextAwareNotifications } from "../useContextAwareNotifications";
 
 // System 23: Silent Quality Control
 export { useSilentQualityControl } from "../useSilentQualityControl";
 
 // System 24: Market Balancer
 export { useMarketBalancer } from "../useMarketBalancer";
 
 // System 25: Personal Memory
 export { usePersonalMemory } from "../usePersonalMemory";
 
 // System 26: Institutional Feedback
 export { useInstitutionalFeedback } from "../useInstitutionalFeedback";
 
// System 27: Power Dampening
export { usePowerDampening } from "../usePowerDampening";

// System 28: Change Explainer
export { useChangeExplainer } from "../useChangeExplainer";

// ============================================
// KNOWLEDGE CIVILIZATION LAYER (Systems 37-45)
// ============================================

// System 37: Knowledge Object Standard
export { useKnowledgeObjects } from "../useKnowledgeObjects";

// System 38: Knowledge Intelligence Graph
export { useKnowledgeGraph } from "../useKnowledgeGraph";

// System 39: Failure Preservation
export { useFailurePreservation } from "../useFailurePreservation";

// System 40: Institutional Vaults
export { useInstitutionalVaults } from "../useInstitutionalVaults";

// System 41: Knowledge Validation
export { useKnowledgeValidation } from "../useKnowledgeValidation";

// System 42: AI Historian
export { useAIHistorian } from "../useAIHistorian";

// System 43: Legacy & Succession
export { useLegacySuccession } from "../useLegacySuccession";

// System 44: Knowledge Pipeline
export { useKnowledgePipeline } from "../useKnowledgePipeline";

// System 45: Anti-Capture Safeguards
export { useAntiCapture } from "../useAntiCapture";
 
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
 
 export type {
   // Autonomous Value Loops
   LoopType,
   LoopExecution,
   LoopStep,
   LoopOutcome,
   LoopDefinition,
 } from "../useAutonomousValueLoops";
 
 export type {
   // Silent Quality Control
   ContentQualityFactors,
   UserQualityFactors,
   DealQualityFactors,
 } from "../useSilentQualityControl";
 
 export type {
   // Market Balancer
   SupplyMetrics,
   DemandMetrics,
   BalanceIndicators,
   MarketAdjustment,
   SkillGap,
 } from "../useMarketBalancer";
 
 export type {
   // Personal Memory
   SuccessPattern,
   FailurePattern,
   PreferenceLearning,
   MemoryBasedRecommendation,
 } from "../usePersonalMemory";
 
 export type {
   // Institutional Feedback
   OutcomeQualityTrend,
   MemberPerformanceAggregate,
   OpportunityHealth,
   InstitutionStandard,
   InstitutionComparison,
 } from "../useInstitutionalFeedback";
 
 export type {
   // Power Dampening
   PowerLevel,
   PowerFactors,
   PowerRequirements,
   PowerAuditEntry,
   PowerCap,
 } from "../usePowerDampening";
 
 export type {
   // Change Explainer
   ChangeCategory,
   SystemChange,
   ChangeExplanation,
 } from "../useChangeExplainer";