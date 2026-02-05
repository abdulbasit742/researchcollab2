// ============================================
// RCOLLAB MASTER ARCHITECTURE
// The Single Source of Truth for Platform Structure
// ============================================

/**
 * The Seven Canonical Layers
 * Every system belongs to exactly ONE layer.
 */
export const CANONICAL_LAYERS = {
  IDENTITY_TRUST: {
    id: 1,
    name: "Identity & Trust",
    description: "Who you are, how reliable you are, and why anyone should work with you",
    systems: [1, 2, 21, 23, 25, 27, 53],
    primaryHooks: ["useTrustComputationEngine", "useUniversalObjectModel", "usePersonalMemory"],
  },
  CAPABILITY_OUTCOMES: {
    id: 2,
    name: "Capability & Outcomes",
    description: "What you can do, what you've proven, and how you grow",
    systems: [3, 46, 47, 49, 50, 52],
    primaryHooks: ["useOutcomeGraph", "useCapabilityGraph", "useReadinessEngine"],
  },
  OPPORTUNITIES_EXECUTION: {
    id: 3,
    name: "Opportunities & Execution",
    description: "How work finds you, how deals execute, and how value is delivered",
    systems: [4, 5, 24, 48, 59],
    primaryHooks: ["useContinuousMatchingEngine", "useDealExecutionRuntime", "useTalentAllocation"],
  },
  ECONOMICS_INCENTIVES: {
    id: 4,
    name: "Economics & Incentives",
    description: "How money flows, how value is measured, and how incentives align",
    systems: [29, 30, 31, 32, 33, 34, 35, 36],
    primaryHooks: ["useEconomicEngine"],
  },
  KNOWLEDGE_MEMORY: {
    id: 5,
    name: "Knowledge & Memory",
    description: "What humanity learns, preserves, and passes on",
    systems: [6, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    primaryHooks: ["useKnowledgeObjects", "useLongTermMemory", "useKnowledgeGraph"],
  },
  INSTITUTIONS_GOVERNANCE: {
    id: 6,
    name: "Institutions & Governance",
    description: "How organizations, policies, and collective decisions operate",
    systems: [22, 26, 28, 51, 54, 55, 56, 57, 58, 60, 61, 62],
    primaryHooks: ["useCrisisMode", "useDecisionTraceability", "useContextAwareNotifications"],
  },
  INTELLIGENCE_AUTOMATION: {
    id: 7,
    name: "Intelligence & Automation",
    description: "How AI assists, automates, and augments without replacing human judgment",
    systems: [9],
    primaryHooks: ["useExtensibilitySystem", "useAIHistorian"],
  },
} as const;

/**
 * System Classification
 * Determines visibility and activation requirements
 */
export type SystemClassification = "core" | "extended" | "institutional" | "experimental";

export const SYSTEM_REGISTRY: Record<number, {
  name: string;
  layer: keyof typeof CANONICAL_LAYERS;
  classification: SystemClassification;
  buildPhase: "now" | "next" | "later" | "park";
  hook?: string;
  dependencies: number[];
}> = {
  // Layer 1: Identity & Trust
  1: { name: "Universal Professional Object Model", layer: "IDENTITY_TRUST", classification: "core", buildPhase: "now", hook: "useUniversalObjectModel", dependencies: [] },
  2: { name: "Trust Computation Engine", layer: "IDENTITY_TRUST", classification: "core", buildPhase: "now", hook: "useTrustComputationEngine", dependencies: [1] },
  21: { name: "Autonomous Value Loops", layer: "IDENTITY_TRUST", classification: "core", buildPhase: "next", hook: "useAutonomousValueLoops", dependencies: [2, 3] },
  23: { name: "Silent Quality Control", layer: "IDENTITY_TRUST", classification: "extended", buildPhase: "next", hook: "useSilentQualityControl", dependencies: [3] },
  25: { name: "Personal Memory", layer: "IDENTITY_TRUST", classification: "core", buildPhase: "next", hook: "usePersonalMemory", dependencies: [6] },
  27: { name: "Power Dampening", layer: "IDENTITY_TRUST", classification: "extended", buildPhase: "later", hook: "usePowerDampening", dependencies: [2] },
  53: { name: "Fairness, Bias & Access", layer: "IDENTITY_TRUST", classification: "core", buildPhase: "later", hook: "useFairnessBiasEngine", dependencies: [46, 48] },

  // Layer 2: Capability & Outcomes
  3: { name: "Outcome Graph", layer: "CAPABILITY_OUTCOMES", classification: "core", buildPhase: "now", hook: "useOutcomeGraph", dependencies: [1] },
  46: { name: "Capability Graph", layer: "CAPABILITY_OUTCOMES", classification: "core", buildPhase: "now", hook: "useCapabilityGraph", dependencies: [1, 3] },
  47: { name: "Readiness & Responsibility Engine", layer: "CAPABILITY_OUTCOMES", classification: "core", buildPhase: "next", hook: "useReadinessEngine", dependencies: [46] },
  49: { name: "Skill Gap & Reskilling", layer: "CAPABILITY_OUTCOMES", classification: "extended", buildPhase: "next", hook: "useSkillGapEngine", dependencies: [46] },
  50: { name: "Performance Without Surveillance", layer: "CAPABILITY_OUTCOMES", classification: "core", buildPhase: "next", hook: "usePerformanceOutcomes", dependencies: [3] },
  52: { name: "Career Evolution & Transition", layer: "CAPABILITY_OUTCOMES", classification: "extended", buildPhase: "later", hook: "useCareerEvolution", dependencies: [6, 46] },

  // Layer 3: Opportunities & Execution
  4: { name: "Continuous Matching Engine", layer: "OPPORTUNITIES_EXECUTION", classification: "core", buildPhase: "now", hook: "useContinuousMatchingEngine", dependencies: [2, 46] },
  5: { name: "Deal Execution Runtime", layer: "OPPORTUNITIES_EXECUTION", classification: "core", buildPhase: "now", hook: "useDealExecutionRuntime", dependencies: [1, 2] },
  24: { name: "Market Balancer", layer: "OPPORTUNITIES_EXECUTION", classification: "extended", buildPhase: "next", hook: "useMarketBalancer", dependencies: [4] },
  48: { name: "Talent Allocation Engine", layer: "OPPORTUNITIES_EXECUTION", classification: "institutional", buildPhase: "later", hook: "useTalentAllocation", dependencies: [46, 47] },
  59: { name: "Resource & Capability Allocation", layer: "OPPORTUNITIES_EXECUTION", classification: "institutional", buildPhase: "park", hook: "useResourceAllocation", dependencies: [48, 56] },

  // Layer 4: Economics & Incentives (29-36)
  29: { name: "Value Unit System", layer: "ECONOMICS_INCENTIVES", classification: "core", buildPhase: "now", dependencies: [3] },
  30: { name: "Pricing Engine", layer: "ECONOMICS_INCENTIVES", classification: "core", buildPhase: "now", dependencies: [2, 24] },
  31: { name: "Revenue Sharing Contracts", layer: "ECONOMICS_INCENTIVES", classification: "extended", buildPhase: "next", dependencies: [5] },
  32: { name: "Incentive Alignment", layer: "ECONOMICS_INCENTIVES", classification: "core", buildPhase: "now", dependencies: [2, 29] },
  33: { name: "Cost Transparency", layer: "ECONOMICS_INCENTIVES", classification: "core", buildPhase: "now", dependencies: [] },
  34: { name: "Institutional Funding", layer: "ECONOMICS_INCENTIVES", classification: "institutional", buildPhase: "later", dependencies: [5] },
  35: { name: "Economic Safety", layer: "ECONOMICS_INCENTIVES", classification: "core", buildPhase: "now", dependencies: [2, 29] },
  36: { name: "Economic Memory", layer: "ECONOMICS_INCENTIVES", classification: "extended", buildPhase: "next", dependencies: [6, 29] },

  // Layer 5: Knowledge & Memory
  6: { name: "Long-Term Memory", layer: "KNOWLEDGE_MEMORY", classification: "core", buildPhase: "next", hook: "useLongTermMemory", dependencies: [1] },
  37: { name: "Knowledge Object Standard", layer: "KNOWLEDGE_MEMORY", classification: "core", buildPhase: "now", hook: "useKnowledgeObjects", dependencies: [1] },
  38: { name: "Knowledge Intelligence Graph", layer: "KNOWLEDGE_MEMORY", classification: "extended", buildPhase: "next", hook: "useKnowledgeGraph", dependencies: [37] },
  39: { name: "Failure Preservation", layer: "KNOWLEDGE_MEMORY", classification: "core", buildPhase: "next", hook: "useFailurePreservation", dependencies: [37] },
  40: { name: "Institutional Vaults", layer: "KNOWLEDGE_MEMORY", classification: "institutional", buildPhase: "later", hook: "useInstitutionalVaults", dependencies: [37] },
  41: { name: "Knowledge Validation", layer: "KNOWLEDGE_MEMORY", classification: "extended", buildPhase: "next", hook: "useKnowledgeValidation", dependencies: [37, 2] },
  42: { name: "AI Historian", layer: "KNOWLEDGE_MEMORY", classification: "extended", buildPhase: "later", hook: "useAIHistorian", dependencies: [38] },
  43: { name: "Legacy & Succession", layer: "KNOWLEDGE_MEMORY", classification: "extended", buildPhase: "later", hook: "useLegacySuccession", dependencies: [6, 37] },
  44: { name: "Knowledge Pipeline", layer: "KNOWLEDGE_MEMORY", classification: "extended", buildPhase: "later", hook: "useKnowledgePipeline", dependencies: [37, 4] },
  45: { name: "Anti-Capture Safeguards", layer: "KNOWLEDGE_MEMORY", classification: "core", buildPhase: "next", hook: "useAntiCapture", dependencies: [37] },

  // Layer 6: Institutions & Governance
  22: { name: "Context-Aware Notifications", layer: "INSTITUTIONS_GOVERNANCE", classification: "core", buildPhase: "now", hook: "useContextAwareNotifications", dependencies: [] },
  26: { name: "Institutional Feedback", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "later", hook: "useInstitutionalFeedback", dependencies: [3] },
  28: { name: "Change Explainer", layer: "INSTITUTIONS_GOVERNANCE", classification: "core", buildPhase: "now", hook: "useChangeExplainer", dependencies: [] },
  51: { name: "Talent Strategy Dashboards", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "later", hook: "useTalentStrategyDashboard", dependencies: [46, 48] },
  54: { name: "National Human Capital", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useNationalHumanCapital", dependencies: [51] },
  55: { name: "Collective Mobilization", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useCollectiveMobilization", dependencies: [46, 47] },
  56: { name: "Crisis Mode", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useCrisisMode", dependencies: [] },
  57: { name: "Real-Time Coordination Graph", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useCoordinationGraph", dependencies: [56] },
  58: { name: "Decision Traceability", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useDecisionTraceability", dependencies: [] },
  60: { name: "Post-Crisis Learning", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "usePostCrisisLearning", dependencies: [56, 39] },
  61: { name: "Ethical & Power Safeguards", layer: "INSTITUTIONS_GOVERNANCE", classification: "core", buildPhase: "later", hook: "usePowerSafeguards", dependencies: [27] },
  62: { name: "Global Coordination", layer: "INSTITUTIONS_GOVERNANCE", classification: "institutional", buildPhase: "park", hook: "useGlobalCoordination", dependencies: [56] },

  // Layer 7: Intelligence & Automation
  9: { name: "Extensibility & Composability", layer: "INTELLIGENCE_AUTOMATION", classification: "extended", buildPhase: "later", hook: "useExtensibilitySystem", dependencies: [] },
};

/**
 * Get all systems for a specific build phase
 */
export function getSystemsByPhase(phase: "now" | "next" | "later" | "park") {
  return Object.entries(SYSTEM_REGISTRY)
    .filter(([_, system]) => system.buildPhase === phase)
    .map(([id, system]) => ({ id: Number(id), ...system }));
}

/**
 * Get all systems for a specific layer
 */
export function getSystemsByLayer(layer: keyof typeof CANONICAL_LAYERS) {
  return Object.entries(SYSTEM_REGISTRY)
    .filter(([_, system]) => system.layer === layer)
    .map(([id, system]) => ({ id: Number(id), ...system }));
}

/**
 * Check if a system should be visible to a user tier
 */
export function isSystemVisible(
  systemId: number, 
  userTier: "new" | "established" | "power" | "institutional"
): boolean {
  const system = SYSTEM_REGISTRY[systemId];
  if (!system) return false;

  switch (userTier) {
    case "new":
      return system.classification === "core" && system.buildPhase === "now";
    case "established":
      return system.classification === "core" || system.classification === "extended";
    case "power":
      return system.classification !== "institutional";
    case "institutional":
      return true;
  }
}

/**
 * Calculate build priority score
 */
export function getBuildPriority(systemId: number): number {
  const system = SYSTEM_REGISTRY[systemId];
  if (!system) return 0;

  const phaseScores = { now: 100, next: 50, later: 20, park: 0 };
  const classificationScores = { core: 30, extended: 20, institutional: 10, experimental: 5 };
  const dependencyPenalty = system.dependencies.length * 5;

  return phaseScores[system.buildPhase] + classificationScores[system.classification] - dependencyPenalty;
}

// Export summary statistics
export const ARCHITECTURE_STATS = {
  totalSystems: Object.keys(SYSTEM_REGISTRY).length,
  totalLayers: Object.keys(CANONICAL_LAYERS).length,
  byPhase: {
    now: getSystemsByPhase("now").length,
    next: getSystemsByPhase("next").length,
    later: getSystemsByPhase("later").length,
    park: getSystemsByPhase("park").length,
  },
  byClassification: {
    core: Object.values(SYSTEM_REGISTRY).filter(s => s.classification === "core").length,
    extended: Object.values(SYSTEM_REGISTRY).filter(s => s.classification === "extended").length,
    institutional: Object.values(SYSTEM_REGISTRY).filter(s => s.classification === "institutional").length,
  },
};
