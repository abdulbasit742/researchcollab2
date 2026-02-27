/**
 * GADEB — Global Adoption & Dominance Execution Blueprint
 * 
 * Phased domination model for institutional embedding, capital magnetism,
 * network gravity, and economic inevitability.
 */

// ============================================================
// SECTION 1 — PHASED DOMINATION MODEL
// ============================================================

export type AdoptionPhase = 'cluster_seeding' | 'institutional_embedding' | 'capital_integration' | 'global_expansion';

export interface PhaseDefinition {
  phase: AdoptionPhase;
  name: string;
  objective: string;
  metrics: PhaseMetric[];
  trustThresholds: Record<string, number>;
  capitalMilestones: string[];
  regionalPlan: string[];
  riskMitigations: string[];
  estimatedDurationMonths: number;
  prerequisitePhase: AdoptionPhase | null;
}

export interface PhaseMetric {
  key: string;
  label: string;
  target: number;
  unit: string;
  currentValue?: number;
}

export const DOMINATION_PHASES: Record<AdoptionPhase, PhaseDefinition> = {
  cluster_seeding: {
    phase: 'cluster_seeding',
    name: 'Phase 1 — High-Trust Cluster Seeding',
    objective: 'Create dense, high-signal trust cluster with verifiable execution outcomes',
    metrics: [
      { key: 'universities_onboarded', label: 'Universities Onboarded', target: 5, unit: 'institutions' },
      { key: 'startups_active', label: 'High-Performance Startups', target: 10, unit: 'startups' },
      { key: 'enterprises_engaged', label: 'Innovation Enterprises', target: 5, unit: 'enterprises' },
      { key: 'grant_agencies', label: 'Regional Grant Agencies', target: 2, unit: 'agencies' },
      { key: 'milestone_completion_rate', label: 'Milestone Completion Rate', target: 85, unit: '%' },
      { key: 'funding_release_efficiency', label: 'Funding Release Efficiency', target: 90, unit: '%' },
      { key: 'trust_density', label: 'Trust Density Score', target: 70, unit: 'score' },
      { key: 'startup_survival_rate', label: 'Startup Survival Rate', target: 75, unit: '%' },
      { key: 'institution_satisfaction', label: 'Institution Satisfaction', target: 80, unit: '%' },
      { key: 'funded_fyps', label: 'Funded FYPs', target: 500, unit: 'projects' },
    ],
    trustThresholds: { minClusterTrustDensity: 60, minInstitutionalTrust: 70, minECSAverage: 55 },
    capitalMilestones: [
      'First 100 escrow-funded projects',
      'PKR 10M+ total capital routed',
      '10+ successful milestone-based releases',
      '5+ case studies published',
    ],
    regionalPlan: ['Single country focus (Pakistan)', 'Top engineering universities', 'Lahore-Islamabad-Karachi triangle'],
    riskMitigations: [
      'Over-index on quality over quantity',
      'Manual onboarding for first 50 users',
      'Weekly trust audits',
      'Direct institutional relationship management',
    ],
    estimatedDurationMonths: 12,
    prerequisitePhase: null,
  },
  institutional_embedding: {
    phase: 'institutional_embedding',
    name: 'Phase 2 — Institutional Embedding',
    objective: 'Embed RCollab into institutional workflows making it operationally unavoidable',
    metrics: [
      { key: 'grant_systems_integrated', label: 'Grant Systems Integrated', target: 10, unit: 'systems' },
      { key: 'procurement_integrations', label: 'Enterprise Procurement Integrations', target: 5, unit: 'integrations' },
      { key: 'accelerator_funding_routed', label: 'Accelerator Funding Routed', target: 20, unit: 'programs' },
      { key: 'government_pilots', label: 'Government Pilot Programs', target: 3, unit: 'pilots' },
      { key: 'seid_verifications', label: 'SEID Verifications Performed', target: 5000, unit: 'verifications' },
      { key: 'switching_cost_index', label: 'Switching Cost Index', target: 75, unit: 'score' },
      { key: 'workflow_integration_depth', label: 'Workflow Integration Depth', target: 80, unit: '%' },
    ],
    trustThresholds: { minInstitutionalAdoptionRate: 60, minECSAdoptionRate: 70, minTrustGraphDensity: 65 },
    capitalMilestones: [
      'PKR 100M+ total capital routed',
      '50+ institutional escrow contracts',
      'Enterprise procurement pilot completed',
      'Government grant milestone tracking live',
    ],
    regionalPlan: ['Expand to 3 countries', 'Regional hub in UAE/Malaysia', 'Cross-border corridor pilot'],
    riskMitigations: [
      'Dedicated institutional success team',
      'SLA monitoring for integration uptime',
      'Compliance checkpoint automation',
      'Institutional override audit trails',
    ],
    estimatedDurationMonths: 12,
    prerequisitePhase: 'cluster_seeding',
  },
  capital_integration: {
    phase: 'capital_integration',
    name: 'Phase 3 — Capital Infrastructure Magnet',
    objective: 'Make RCollab the default capital routing rail for professional execution',
    metrics: [
      { key: 'public_grants_routed', label: 'Public Grants Routed', target: 50, unit: 'grants' },
      { key: 'enterprise_rd_budgets', label: 'Enterprise R&D Budgets Integrated', target: 10, unit: 'budgets' },
      { key: 'accelerator_investments', label: 'Accelerator Investment Programs', target: 15, unit: 'programs' },
      { key: 'development_bank_partnerships', label: 'Development Bank Partnerships', target: 2, unit: 'partnerships' },
      { key: 'regional_innovation_funds', label: 'Regional Innovation Funds', target: 5, unit: 'funds' },
      { key: 'capital_gravity_index', label: 'Capital Gravity Index', target: 80, unit: 'score' },
      { key: 'conditional_capital_rate', label: 'SEID+ECS Conditional Capital Rate', target: 70, unit: '%' },
    ],
    trustThresholds: { minCapitalComplianceRate: 90, minEscrowIntegrity: 99, minFundingTransparency: 95 },
    capitalMilestones: [
      'PKR 1B+ total capital routed',
      'Programmable milestone escrow standard adopted',
      'Capital conditional on SEID+ECS verified',
      'Development bank pilot completed',
    ],
    regionalPlan: ['5+ countries active', 'Multi-currency escrow live', 'Cross-border compliance framework deployed'],
    riskMitigations: [
      'Capital concentration monitoring',
      'Automated compliance audits',
      'Emergency freeze protocols tested',
      'Regulatory relationship management',
    ],
    estimatedDurationMonths: 12,
    prerequisitePhase: 'institutional_embedding',
  },
  global_expansion: {
    phase: 'global_expansion',
    name: 'Phase 4 — Government & Cross-Border Adoption',
    objective: 'Become default execution rail for governments and cross-border professional activity',
    metrics: [
      { key: 'ministry_partnerships', label: 'Ministry Partnerships', target: 5, unit: 'ministries' },
      { key: 'countries_active', label: 'Countries with Active Nodes', target: 10, unit: 'countries' },
      { key: 'economic_zones', label: 'Regional Economic Zones', target: 3, unit: 'zones' },
      { key: 'development_agencies', label: 'Development Agency Partnerships', target: 5, unit: 'agencies' },
      { key: 'cross_border_corridors', label: 'Active Cross-Border Corridors', target: 10, unit: 'corridors' },
      { key: 'default_rail_adoption', label: 'Default Rail Adoption Rate', target: 60, unit: '%' },
    ],
    trustThresholds: { minGlobalTrustNetwork: 80, minCrossBorderCompliance: 95, minGovernmentSatisfaction: 85 },
    capitalMilestones: [
      'PKR 10B+ total capital routed',
      'Multi-government funding transparency live',
      'Cross-border escrow standard established',
      'Regional economic dashboards operational',
    ],
    regionalPlan: ['10+ countries', 'Pan-Asian corridor', 'Middle East hub', 'European pilot'],
    riskMitigations: [
      'Geopolitical risk monitoring',
      'Regional data sovereignty compliance',
      'Diplomatic relationship management',
      'Currency volatility hedging protocols',
    ],
    estimatedDurationMonths: 12,
    prerequisitePhase: 'capital_integration',
  },
};

// ============================================================
// SECTION 2 — NETWORK EFFECT LOOPS
// ============================================================

export interface NetworkEffectLoop {
  id: string;
  name: string;
  nodes: string[];
  reinforcementMechanism: string;
  compoundingRate: number; // expected growth multiplier per cycle
  currentCycleStrength: number; // 0-100
}

export const NETWORK_EFFECT_LOOPS: NetworkEffectLoop[] = [
  {
    id: 'loop_a_execution_capital',
    name: 'Loop A: Execution → Capital',
    nodes: ['Execution', 'Trust Increase', 'Capital Access', 'Bigger Execution'],
    reinforcementMechanism: 'Successful milestone completion increases trust, which unlocks higher-tier funding, enabling larger projects',
    compoundingRate: 1.15,
    currentCycleStrength: 0,
  },
  {
    id: 'loop_b_knowledge_visibility',
    name: 'Loop B: Knowledge → Visibility',
    nodes: ['Knowledge Publication', 'Debate', 'Institutional Endorsement', 'Visibility', 'Collaboration'],
    reinforcementMechanism: 'Publishing verified knowledge attracts institutional endorsement, increasing visibility and collaboration opportunities',
    compoundingRate: 1.10,
    currentCycleStrength: 0,
  },
  {
    id: 'loop_c_regional_density',
    name: 'Loop C: Regional Density',
    nodes: ['Regional Hub Growth', 'Enterprise Interest', 'Funding Flow', 'Startup Density', 'Trust Density'],
    reinforcementMechanism: 'Regional hub success attracts enterprise attention, increasing funding and startup density, which compounds trust',
    compoundingRate: 1.20,
    currentCycleStrength: 0,
  },
];

// ============================================================
// SECTION 3 — ECONOMIC LOCK-IN MECHANISMS
// ============================================================

export interface LockInMechanism {
  id: string;
  name: string;
  switchingCostType: 'data' | 'trust' | 'capital' | 'workflow' | 'compliance' | 'identity';
  switchingCostLevel: 'low' | 'medium' | 'high' | 'very_high';
  description: string;
  whatIsLostOnExit: string;
}

export const LOCK_IN_MECHANISMS: LockInMechanism[] = [
  { id: 'trust_ledger', name: 'Trust Ledger Portability', switchingCostType: 'trust', switchingCostLevel: 'very_high', description: 'Verified trust history built over years of execution', whatIsLostOnExit: 'Entire verified trust history and institutional endorsements' },
  { id: 'escrow_dependency', name: 'Capital Escrow Dependency', switchingCostType: 'capital', switchingCostLevel: 'very_high', description: 'Active escrow contracts and funding relationships', whatIsLostOnExit: 'Active escrow positions, funding relationships, capital flow history' },
  { id: 'institutional_apis', name: 'Institutional Integration APIs', switchingCostType: 'workflow', switchingCostLevel: 'high', description: 'Deep API integration with institutional workflows', whatIsLostOnExit: 'Grant management, procurement, and verification workflows' },
  { id: 'procurement_verification', name: 'Procurement Verification', switchingCostType: 'compliance', switchingCostLevel: 'high', description: 'Trust-based vendor verification for enterprise procurement', whatIsLostOnExit: 'Verified vendor status and procurement history' },
  { id: 'grant_workflows', name: 'Grant Management Workflows', switchingCostType: 'workflow', switchingCostLevel: 'high', description: 'Milestone-based grant tracking and reporting', whatIsLostOnExit: 'Grant compliance records and milestone verification history' },
  { id: 'cross_border_compliance', name: 'Cross-Border Compliance Map', switchingCostType: 'compliance', switchingCostLevel: 'high', description: 'Pre-verified cross-border compliance records', whatIsLostOnExit: 'Jurisdiction compliance history and cross-border trust scores' },
  { id: 'professional_identity', name: 'Sovereign Execution ID', switchingCostType: 'identity', switchingCostLevel: 'very_high', description: 'Longitudinal professional identity with verified outcomes', whatIsLostOnExit: 'Entire SEID with decades of verified execution history' },
  { id: 'ecs_dependency', name: 'Execution Credit Score', switchingCostType: 'trust', switchingCostLevel: 'very_high', description: 'Non-replicable execution credit score', whatIsLostOnExit: 'ECS score and all underlying verified data points' },
];

// ============================================================
// SECTION 4 — COMPETITOR DEFENSE MATRIX
// ============================================================

export interface CompetitorDefense {
  competitor: string;
  competitorStrength: string;
  rcollabAdvantage: string;
  defenseStrategy: string;
  moatType: 'execution' | 'trust' | 'capital' | 'knowledge' | 'integration' | 'transparency';
}

export const COMPETITOR_DEFENSE: CompetitorDefense[] = [
  { competitor: 'LinkedIn', competitorStrength: 'Network size + brand recognition', rcollabAdvantage: 'Execution-verified identity + escrow-backed outcomes', defenseStrategy: 'Make self-declared profiles look unreliable vs ledger-backed SEID', moatType: 'execution' },
  { competitor: 'Upwork', competitorStrength: 'Freelancer marketplace scale', rcollabAdvantage: 'Milestone trust ledger + institutional verification', defenseStrategy: 'Institutional-grade execution tracking vs gig-level reviews', moatType: 'trust' },
  { competitor: 'Kickstarter', competitorStrength: 'Crowdfunding brand + audience', rcollabAdvantage: 'Programmable milestone-locked capital + escrow', defenseStrategy: 'Conditional disbursement vs blind funding', moatType: 'capital' },
  { competitor: 'Slack', competitorStrength: 'Team communication dominance', rcollabAdvantage: 'Execution-linked communication with escrow context', defenseStrategy: 'Communication tied to milestones, not just messages', moatType: 'execution' },
  { competitor: 'Notion', competitorStrength: 'Documentation flexibility', rcollabAdvantage: 'Structured knowledge archive with citation + verification', defenseStrategy: 'Verifiable knowledge contributions vs editable docs', moatType: 'knowledge' },
  { competitor: 'VC Platforms', competitorStrength: 'Capital access + network', rcollabAdvantage: 'Transparent milestone capital + trust-weighted allocation', defenseStrategy: 'Programmable, auditable capital vs opaque VC decisions', moatType: 'transparency' },
  { competitor: 'Government Portals', competitorStrength: 'Regulatory authority', rcollabAdvantage: 'Funding transparency + execution intelligence', defenseStrategy: 'Partner, not compete — offer transparency layer', moatType: 'integration' },
];

// ============================================================
// SECTION 5 — CAPITAL MAGNET MECHANISM
// ============================================================

export interface CapitalIncentiveTier {
  ecsRange: [number, number];
  tierName: string;
  escrowFeeDiscount: number; // percentage reduction
  releaseSpeedMultiplier: number; // 1.0 = standard, 2.0 = 2x faster
  capitalMatchingPriority: 'standard' | 'elevated' | 'priority' | 'premium';
  institutionalBonusRate: number; // additional allocation percentage
}

export const CAPITAL_INCENTIVE_TIERS: CapitalIncentiveTier[] = [
  { ecsRange: [0, 30], tierName: 'Foundation', escrowFeeDiscount: 0, releaseSpeedMultiplier: 1.0, capitalMatchingPriority: 'standard', institutionalBonusRate: 0 },
  { ecsRange: [30, 55], tierName: 'Established', escrowFeeDiscount: 10, releaseSpeedMultiplier: 1.2, capitalMatchingPriority: 'elevated', institutionalBonusRate: 0.02 },
  { ecsRange: [55, 75], tierName: 'Proven', escrowFeeDiscount: 25, releaseSpeedMultiplier: 1.5, capitalMatchingPriority: 'priority', institutionalBonusRate: 0.05 },
  { ecsRange: [75, 100], tierName: 'Elite', escrowFeeDiscount: 40, releaseSpeedMultiplier: 2.0, capitalMatchingPriority: 'premium', institutionalBonusRate: 0.10 },
];

export function getCapitalIncentiveTier(ecsScore: number): CapitalIncentiveTier {
  return CAPITAL_INCENTIVE_TIERS.find(t => ecsScore >= t.ecsRange[0] && ecsScore < t.ecsRange[1])
    ?? CAPITAL_INCENTIVE_TIERS[0];
}

// ============================================================
// SECTION 6 — ENTERPRISE SALES FRAMEWORK
// ============================================================

export interface EnterpriseSalesProposition {
  capability: string;
  painPointAddressed: string;
  roiMetric: string;
  proofPoint: string;
}

export const ENTERPRISE_SALES_PROPOSITIONS: EnterpriseSalesProposition[] = [
  { capability: 'Procurement Transparency', painPointAddressed: 'Opaque vendor selection', roiMetric: 'Reduced dispute rate by 60%', proofPoint: 'Trust-weighted vendor scoring eliminates subjective evaluation' },
  { capability: 'Startup Scouting', painPointAddressed: 'Difficulty finding reliable startups', roiMetric: 'Higher startup conversion rate', proofPoint: 'ECS-based filtering surfaces execution-proven startups' },
  { capability: 'Milestone Capital Control', painPointAddressed: 'Uncontrolled project spending', roiMetric: 'Lower funding waste by 40%', proofPoint: 'Programmable escrow releases only on verified milestones' },
  { capability: 'Compliance Monitoring', painPointAddressed: 'Manual compliance tracking', roiMetric: 'Automated compliance reporting', proofPoint: 'Real-time compliance checkpoints with audit trails' },
  { capability: 'Cross-Border Execution', painPointAddressed: 'Complex international collaboration', roiMetric: 'Faster cross-border project completion', proofPoint: 'Pre-verified compliance mapping across jurisdictions' },
  { capability: 'Innovation Pipeline Tracking', painPointAddressed: 'Invisible R&D progress', roiMetric: 'Real-time R&D visibility', proofPoint: 'Milestone-linked innovation pipeline dashboards' },
];

// ============================================================
// SECTION 7 — GOVERNMENT ENTRY FRAMEWORK
// ============================================================

export interface GovernmentPitchProposition {
  capability: string;
  publicBenefit: string;
  corruptionReduction: string;
  transparencyGain: string;
}

export const GOVERNMENT_PITCH: GovernmentPitchProposition[] = [
  { capability: 'Public Funding Transparency Rail', publicBenefit: 'Complete visibility of public capital allocation', corruptionReduction: 'Milestone-locked releases prevent misallocation', transparencyGain: 'Real-time funding flow dashboards' },
  { capability: 'Trust-Based Contractor Scoring', publicBenefit: 'Objective contractor evaluation', corruptionReduction: 'ECS eliminates subjective favoritism', transparencyGain: 'Explainable trust scores with audit trails' },
  { capability: 'Regional Innovation Intelligence', publicBenefit: 'Data-driven innovation policy', corruptionReduction: 'N/A', transparencyGain: 'Innovation heatmaps and skill gap analysis' },
  { capability: 'Grant Milestone Tracker', publicBenefit: 'Verified grant outcome reporting', corruptionReduction: 'Immutable milestone records prevent false reporting', transparencyGain: 'Automated compliance and audit reports' },
  { capability: 'Policy Execution Dashboard', publicBenefit: 'Track policy implementation impact', corruptionReduction: 'Outcome-based metrics vs self-reported progress', transparencyGain: 'Cross-policy execution visibility' },
];

// ============================================================
// SECTION 8 — 3-YEAR DOMINANCE ROADMAP
// ============================================================

export interface RoadmapYear {
  year: number;
  label: string;
  objectives: string[];
  successMetrics: Record<string, string>;
  keyDeliverables: string[];
}

export const THREE_YEAR_ROADMAP: RoadmapYear[] = [
  {
    year: 1,
    label: 'Dense Cluster Success',
    objectives: [
      'Dense cluster success in Pakistan',
      'Institution pilot integration (5 universities)',
      'Capital proof-of-concept (PKR 10M+ routed)',
      '500+ funded FYPs',
      '10 startup spin-offs',
    ],
    successMetrics: {
      capital_routed: 'PKR 10M+',
      milestones_verified: '2,000+',
      institutions_embedded: '5',
      trust_density: '70+',
      startup_survival: '75%+',
    },
    keyDeliverables: [
      'Core escrow engine hardened',
      'Institutional dashboard live',
      'SEID v1 operational',
      'Trust ledger immutable',
      'Case studies published',
    ],
  },
  {
    year: 2,
    label: 'Cross-Region Expansion',
    objectives: [
      'Cross-region expansion (3 countries)',
      'Enterprise procurement adoption (5 enterprises)',
      'Accelerator integration (10 programs)',
      'Government pilot initiated',
    ],
    successMetrics: {
      capital_routed: 'PKR 100M+',
      milestones_verified: '20,000+',
      institutions_embedded: '25',
      trust_density: '80+',
      regional_improvement: 'Measurable',
    },
    keyDeliverables: [
      'Multi-currency escrow',
      'Enterprise SSO integration',
      'Cross-border corridor pilot',
      'Government funding dashboard',
      'Programmable capital standard',
    ],
  },
  {
    year: 3,
    label: 'Global Infrastructure Status',
    objectives: [
      'Government partnership (2+ ministries)',
      'Cross-border corridor live (5+ corridors)',
      'Regional economic dashboard operational',
      'Capital scale integration (development banks)',
      'Default execution rail in 3+ countries',
    ],
    successMetrics: {
      capital_routed: 'PKR 1B+',
      milestones_verified: '100,000+',
      institutions_embedded: '100+',
      trust_density: '85+',
      default_rail_adoption: '60%+',
    },
    keyDeliverables: [
      'Sovereign identity standard adopted',
      'Government procurement integration',
      'Cross-border compliance framework',
      'Regional intelligence dashboards',
      'API ecosystem with 50+ integrations',
    ],
  },
];

// ============================================================
// SECTION 9 — BRAND FRAMEWORK
// ============================================================

export const BRAND_FRAMEWORK = {
  primaryIdentity: 'Execution Economy Infrastructure',
  identityLabels: [
    'Trust-Based Capital Network',
    'Institutional Operating Layer',
    'Programmable Funding Rail',
    'Sovereign Professional Identity System',
    'Global Trust Ledger',
    'Cross-Border Execution Engine',
  ],
  prohibitedDescriptions: [
    'social network',
    'social media',
    'networking app',
    'freelance marketplace',
    'gig economy platform',
    'content platform',
    'community platform',
  ],
  psychologicalPositioning: {
    tone: ['serious', 'calm', 'stable', 'non-noisy', 'institution-grade', 'long-term', 'execution-first', 'non-addictive', 'high-trust'],
    avoid: ['hype', 'crypto language', 'social media tone', 'influencer framing', 'startup buzzwords'],
    signal: 'Infrastructure',
  },
} as const;

// ============================================================
// SECTION 10 — ADOPTION TRACKING UTILITIES
// ============================================================

export interface ClusterHealthSnapshot {
  clusterId: string;
  region: string;
  phase: AdoptionPhase;
  institutionsActive: number;
  usersActive: number;
  capitalRouted: number;
  milestoneCompletionRate: number;
  trustDensity: number;
  networkEffectStrength: number;
  switchingCostIndex: number;
  snapshotAt: string;
}

export function computeAdoptionReadiness(
  currentPhase: AdoptionPhase,
  metrics: Record<string, number>
): { ready: boolean; readinessScore: number; blockers: string[] } {
  const phaseDef = DOMINATION_PHASES[currentPhase];
  const blockers: string[] = [];
  let metCount = 0;

  for (const metric of phaseDef.metrics) {
    const current = metrics[metric.key] ?? 0;
    if (current >= metric.target) {
      metCount++;
    } else {
      blockers.push(`${metric.label}: ${current}/${metric.target} ${metric.unit}`);
    }
  }

  const readinessScore = (metCount / phaseDef.metrics.length) * 100;
  return { ready: readinessScore >= 80, readinessScore, blockers };
}

export function computeSwitchingCostIndex(
  userMetrics: {
    trustLedgerEntries: number;
    activeEscrowContracts: number;
    institutionalVerifications: number;
    yearsOnPlatform: number;
    crossBorderCompliance: number;
    knowledgePublications: number;
  }
): { index: number; level: 'low' | 'medium' | 'high' | 'very_high'; breakdown: Record<string, number> } {
  const weights = {
    trustHistory: 0.25,
    capitalLockIn: 0.25,
    institutionalIntegration: 0.20,
    timeInvestment: 0.15,
    complianceHistory: 0.10,
    knowledgeContributions: 0.05,
  };

  const scores = {
    trustHistory: Math.min(100, userMetrics.trustLedgerEntries * 2),
    capitalLockIn: Math.min(100, userMetrics.activeEscrowContracts * 10),
    institutionalIntegration: Math.min(100, userMetrics.institutionalVerifications * 5),
    timeInvestment: Math.min(100, userMetrics.yearsOnPlatform * 20),
    complianceHistory: Math.min(100, userMetrics.crossBorderCompliance * 10),
    knowledgeContributions: Math.min(100, userMetrics.knowledgePublications * 5),
  };

  const index = Object.entries(weights).reduce((sum, [key, w]) => sum + scores[key as keyof typeof scores] * w, 0);
  const level = index >= 80 ? 'very_high' : index >= 60 ? 'high' : index >= 35 ? 'medium' : 'low';

  return { index, level, breakdown: scores };
}

export function computeNetworkEffectStrength(
  loopMetrics: Array<{ loopId: string; cycleCount: number; growthRate: number }>
): { overallStrength: number; strongestLoop: string; weakestLoop: string } {
  if (loopMetrics.length === 0) return { overallStrength: 0, strongestLoop: 'none', weakestLoop: 'none' };

  const scored = loopMetrics.map(m => ({
    ...m,
    strength: Math.min(100, m.cycleCount * m.growthRate * 10),
  }));

  const overallStrength = scored.reduce((s, m) => s + m.strength, 0) / scored.length;
  const strongest = scored.reduce((a, b) => a.strength > b.strength ? a : b);
  const weakest = scored.reduce((a, b) => a.strength < b.strength ? a : b);

  return { overallStrength, strongestLoop: strongest.loopId, weakestLoop: weakest.loopId };
}

export const GADEB_VERSION = '1.0.0';
export const GADEB_EFFECTIVE_DATE = '2026-02-27';
