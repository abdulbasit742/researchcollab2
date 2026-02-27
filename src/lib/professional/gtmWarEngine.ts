/**
 * FGTMW — Full Global Go-To-Market War Strategy
 *
 * Strategic infrastructure capture. Not growth hacking.
 * Win by controlling execution rails, not attention.
 */

// ============================================================
// SECTION 1 — STRATEGIC WAR PRINCIPLES
// ============================================================

export const WAR_PRINCIPLES = {
  coreThesis: 'The platform that routes capital, verifies milestones, manages trust, and embeds into procurement becomes unavoidable infrastructure.',
  winBy: 'Controlling execution rails — not controlling attention.',
  rules: [
    'Do not chase mass adoption early',
    'Do not compete on marketing noise',
    'Do not position as social network',
    'Do not rely on virality',
    'Build density before expansion',
    'Anchor in capital before users',
    'Anchor in institutions before individuals',
    'Anchor in execution before branding',
  ],
} as const;

// ============================================================
// SECTION 2 — BATTLEFIELD SEGMENTATION
// ============================================================

export type BattlefieldSegment =
  | 'innovation_dense'
  | 'emerging_startup'
  | 'gov_innovation'
  | 'enterprise_rd'
  | 'development_agency';

export interface BattlefieldProfile {
  id: BattlefieldSegment;
  name: string;
  priorityOrder: number;
  selectionCriteria: string[];
  targetMetric: string;
  examples: string[];
}

export const BATTLEFIELD_SEGMENTS: BattlefieldProfile[] = [
  { id: 'innovation_dense', name: 'Innovation-Dense Regions', priorityOrder: 1, selectionCriteria: ['Strong university ecosystem', 'Active startup scene', 'High patent output', 'Existing grant infrastructure'], targetMetric: 'Execution density per capita', examples: ['Pakistan (Lahore-Islamabad-Karachi)', 'UAE (Dubai-Abu Dhabi)', 'Malaysia (KL-Penang)', 'Singapore'] },
  { id: 'emerging_startup', name: 'Emerging Startup Economies', priorityOrder: 2, selectionCriteria: ['Growing startup scene', 'Capital availability increasing', 'Government support emerging', 'Digital infrastructure maturing'], targetMetric: 'Capital flow growth rate', examples: ['Saudi Arabia', 'Indonesia', 'Turkey', 'Nigeria'] },
  { id: 'gov_innovation', name: 'Government Innovation Ministries', priorityOrder: 3, selectionCriteria: ['Digital transformation mandate', 'Innovation budget allocated', 'Grant modernization interest', 'Regulatory openness'], targetMetric: 'Regulatory openness score', examples: ['UAE Ministry of AI', 'Singapore GovTech', 'Malaysia MDEC', 'Estonia e-Governance'] },
  { id: 'enterprise_rd', name: 'Enterprise R&D-Heavy Corporations', priorityOrder: 4, selectionCriteria: ['Annual R&D budget >$10M', 'University collaboration history', 'Procurement modernization interest', 'Cross-border operations'], targetMetric: 'R&D budget accessible', examples: ['Telecom operators', 'Energy companies', 'Financial institutions', 'Tech conglomerates'] },
  { id: 'development_agency', name: 'Development & Multilateral Agencies', priorityOrder: 5, selectionCriteria: ['Innovation-focused mandates', 'Grant disbursement programs', 'Cross-border development goals', 'Transparency requirements'], targetMetric: 'Grant volume routable', examples: ['World Bank Innovation Labs', 'UNDP Accelerators', 'ADB Innovation', 'IsDB Transform Fund'] },
];

// ============================================================
// SECTION 3 — BEACHHEAD STRATEGY
// ============================================================

export interface BeachheadProfile {
  regionRequirements: string[];
  deploymentComponents: string[];
  outcome: string;
}

export const BEACHHEAD_STRATEGY: BeachheadProfile = {
  regionRequirements: [
    'Strong university ecosystem (5+ engineering universities)',
    'Active startup scene (100+ funded startups)',
    'Moderate regulatory openness',
    'Government innovation interest (ministry or authority)',
    'Existing grant programs (public or institutional)',
  ],
  deploymentComponents: [
    'University FYP integration (5 universities)',
    'Accelerator funding integration (3-5 programs)',
    'Startup milestone escrow (10-20 startups)',
    'Regional intelligence dashboard',
    'Enterprise R&D pilot (3-5 enterprises)',
    'Government innovation pilot (1 ministry)',
  ],
  outcome: 'High-trust dense node with verifiable execution metrics and capital efficiency proof',
};

// ============================================================
// SECTION 4 — DENSITY THRESHOLD (EXPANSION GATE)
// ============================================================

export interface DensityThreshold {
  metric: string;
  minimumValue: number;
  unit: string;
  rationale: string;
}

export const DENSITY_THRESHOLDS: DensityThreshold[] = [
  { metric: 'Active SEIDs', minimumValue: 200, unit: 'identities', rationale: 'Critical mass for trust graph formation' },
  { metric: 'Funded milestone projects', minimumValue: 50, unit: 'projects', rationale: 'Sufficient escrow volume for capital efficiency proof' },
  { metric: 'Institutional integrations', minimumValue: 5, unit: 'institutions', rationale: 'Minimum workflow embedding for switching cost' },
  { metric: 'Enterprise pilots', minimumValue: 3, unit: 'enterprises', rationale: 'Procurement integration validation' },
  { metric: 'Public funding integrations', minimumValue: 2, unit: 'programs', rationale: 'Government infrastructure proof' },
  { metric: 'Milestone punctuality', minimumValue: 85, unit: '%', rationale: 'Execution reliability threshold' },
  { metric: 'Dispute rate', minimumValue: 5, unit: '% (max)', rationale: 'Trust stability indicator' },
  { metric: 'Capital efficiency gain', minimumValue: 20, unit: '% improvement', rationale: 'Visible ROI for expansion justification' },
];

export function checkDensityReady(metrics: Record<string, number>): { ready: boolean; score: number; blockers: string[] } {
  const blockers: string[] = [];
  let met = 0;
  for (const t of DENSITY_THRESHOLDS) {
    const val = metrics[t.metric] ?? 0;
    const isDispute = t.metric === 'Dispute rate';
    const passed = isDispute ? val <= t.minimumValue : val >= t.minimumValue;
    if (passed) met++; else blockers.push(`${t.metric}: ${val}/${isDispute ? '≤' : '≥'}${t.minimumValue} ${t.unit}`);
  }
  const score = (met / DENSITY_THRESHOLDS.length) * 100;
  return { ready: score >= 80, score, blockers };
}

// ============================================================
// SECTION 5 — REGIONAL FORTRESS MODEL
// ============================================================

export interface FortressComponent {
  id: string;
  component: string;
  function: string;
  lockInContribution: string;
}

export const FORTRESS_COMPONENTS: FortressComponent[] = [
  { id: 'trust_density', component: 'Trust Density', function: 'Dense verified trust graph within region', lockInContribution: 'Losing trust history means starting from zero' },
  { id: 'capital_routing', component: 'Capital Routing', function: 'Milestone-based escrow as default funding rail', lockInContribution: 'Active escrow contracts create immediate switching cost' },
  { id: 'institutional_embedding', component: 'Institutional Embedding', function: 'University and agency workflow integration', lockInContribution: 'Operational dependency on grant and project management' },
  { id: 'enterprise_integration', component: 'Enterprise Integration', function: 'Procurement and R&D pipeline integration', lockInContribution: 'Vendor scoring and procurement workflows locked in' },
  { id: 'startup_loop', component: 'Startup Survival Loop', function: 'Structured funding → execution → trust → more funding', lockInContribution: 'Execution history and ECS score non-portable' },
  { id: 'knowledge_production', component: 'Knowledge Production', function: 'Verified research and debate archive', lockInContribution: 'Publication history linked to execution outcomes' },
  { id: 'regional_intelligence', component: 'Regional Intelligence Dashboard', function: 'Real-time innovation and capital flow analytics', lockInContribution: 'Data depth increases with usage — irreplaceable over time' },
];

// ============================================================
// SECTION 6 — CAPITAL ANCHOR STRATEGY
// ============================================================

export interface CapitalAnchorTarget {
  id: string;
  target: string;
  approach: string;
  gravityMechanism: string;
}

export const CAPITAL_ANCHORS: CapitalAnchorTarget[] = [
  { id: 'innovation_funds', target: 'Innovation Funds', approach: 'Programmable milestone funding with audit-grade transparency', gravityMechanism: 'Fund managers prefer structured disbursement over blind allocation' },
  { id: 'dev_banks', target: 'Development Banks', approach: 'Cross-border milestone tracking with compliance automation', gravityMechanism: 'Development capital flows to verifiable execution outcomes' },
  { id: 'grant_agencies', target: 'Public Grant Agencies', approach: 'Grant modernization with SEID verification and escrow routing', gravityMechanism: 'Public accountability pressure drives adoption of transparent rails' },
  { id: 'enterprise_rd', target: 'Enterprise R&D Capital Pools', approach: 'Trust-weighted vendor selection and milestone capital control', gravityMechanism: 'R&D budget efficiency gains justify procurement integration' },
  { id: 'accelerators', target: 'Accelerators', approach: 'Structured cohort funding with ECS-based graduation criteria', gravityMechanism: 'Accelerator success rates improve with execution infrastructure' },
];

// ============================================================
// SECTION 7 — ENTERPRISE TROJAN HORSE
// ============================================================

export interface TrojanHorseVector {
  id: string;
  entryPoint: string;
  initialValue: string;
  expansionPath: string;
  switchingCostCreation: string;
}

export const ENTERPRISE_TROJAN_HORSES: TrojanHorseVector[] = [
  { id: 'procurement', entryPoint: 'Procurement transparency', initialValue: 'ECS-weighted vendor scoring eliminates subjective selection', expansionPath: 'Procurement → vendor management → R&D pipeline → full capital routing', switchingCostCreation: 'Vendor reliability data accumulated over years becomes irreplaceable' },
  { id: 'scouting', entryPoint: 'Startup scouting', initialValue: 'Execution-verified startup discovery vs pitch-based evaluation', expansionPath: 'Scouting → pilot funding → milestone tracking → portfolio management', switchingCostCreation: 'Portfolio execution history and startup relationship graph' },
  { id: 'pilot_funding', entryPoint: 'Milestone-based pilot funding', initialValue: 'Conditional capital release reduces pilot risk by 50%+', expansionPath: 'Pilot funding → full project escrow → enterprise-wide adoption', switchingCostCreation: 'Active escrow contracts and milestone verification history' },
  { id: 'contractor_filter', entryPoint: 'Trust-weighted contractor filtering', initialValue: 'ECS replaces manual vendor qualification processes', expansionPath: 'Contractor filtering → vendor management → procurement integration', switchingCostCreation: 'Contractor reliability database built over months of transactions' },
  { id: 'crossborder_mapping', entryPoint: 'Cross-border project mapping', initialValue: 'Pre-verified compliance corridors for international collaboration', expansionPath: 'Mapping → corridor management → cross-border capital routing', switchingCostCreation: 'Cross-jurisdictional compliance history and relationship mapping' },
];

// ============================================================
// SECTION 8 — GOVERNMENT STRATEGIC ENTRY
// ============================================================

export interface GovEntryStrategy {
  id: string;
  entryType: string;
  proofMetrics: string[];
  scaleTrigger: string;
}

export const GOV_ENTRY_STRATEGIES: GovEntryStrategy[] = [
  { id: 'innovation_pilot', entryType: 'Innovation pilot program', proofMetrics: ['30%+ milestone delay reduction', 'Audit trail completeness 100%', 'Capital efficiency improvement >20%'], scaleTrigger: 'Ministerial endorsement + 6-month metric proof' },
  { id: 'grant_modernization', entryType: 'Small grant modernization', proofMetrics: ['50%+ audit clarity improvement', '<5% dispute rate', 'Conditional release adoption >80%'], scaleTrigger: 'Grant agency expansion request' },
  { id: 'regional_dashboard', entryType: 'Regional development dashboard', proofMetrics: ['Real-time data vs quarterly reports', 'Policy response time improvement', 'Innovation density visibility'], scaleTrigger: 'Planning commission integration request' },
  { id: 'startup_oversight', entryType: 'Startup oversight program', proofMetrics: ['Startup survival rate improvement', 'Funding waste reduction', 'ECS adoption by funded startups'], scaleTrigger: 'Multi-program expansion' },
  { id: 'procurement_experiment', entryType: 'Procurement experiment', proofMetrics: ['Vendor reliability improvement >40%', 'Procurement cycle reduction >20%', 'Dispute cost reduction >50%'], scaleTrigger: 'Procurement authority formal adoption' },
];

// ============================================================
// SECTION 9 — COMPETITOR CONTAINMENT
// ============================================================

export interface CompetitorContainment {
  competitor: string;
  irrelevanceFactor: string;
  rcollabAdvantage: string;
  containmentStrategy: string;
}

export const COMPETITOR_CONTAINMENT: CompetitorContainment[] = [
  { competitor: 'LinkedIn', irrelevanceFactor: 'No execution verification capability', rcollabAdvantage: 'Ledger-backed SEID with milestone-verified history', containmentStrategy: 'Make self-declared profiles look unreliable vs execution-backed identity' },
  { competitor: 'Upwork', irrelevanceFactor: 'No milestone escrow infrastructure', rcollabAdvantage: 'Programmable conditional capital release with trust scoring', containmentStrategy: 'Position gig-level reviews as insufficient for institutional-grade work' },
  { competitor: 'Kickstarter', irrelevanceFactor: 'No programmable capital conditions', rcollabAdvantage: 'Milestone-locked escrow with compliance gating', containmentStrategy: 'Show blind funding failure rate vs conditional disbursement success' },
  { competitor: 'Slack', irrelevanceFactor: 'No execution linkage to communication', rcollabAdvantage: 'Context-first messaging tied to milestones and escrow', containmentStrategy: 'Communication without execution context is organizational noise' },
  { competitor: 'Notion', irrelevanceFactor: 'No trust ledger or verification layer', rcollabAdvantage: 'Knowledge archive linked to verified execution outcomes', containmentStrategy: 'Editable docs vs immutable verified knowledge contributions' },
  { competitor: 'Traditional procurement', irrelevanceFactor: 'No ECS or trust-weighted vendor selection', rcollabAdvantage: 'Execution-verified vendor scoring with audit trails', containmentStrategy: 'Lowest-bid procurement vs reliability-scored procurement ROI comparison' },
  { competitor: 'VC process', irrelevanceFactor: 'Opaque without milestone structuring', rcollabAdvantage: 'Transparent milestone-conditional capital with ECS filtering', containmentStrategy: 'Structured risk vs opaque evaluation pitch' },
];

// ============================================================
// SECTION 10 — ECONOMIC NETWORK EFFECTS
// ============================================================

export interface NetworkLoop {
  id: string;
  name: string;
  sequence: string[];
  reinforcement: string;
  compoundRate: string;
}

export const NETWORK_LOOPS: NetworkLoop[] = [
  { id: 'execution_capital', name: 'Execution → Capital Loop', sequence: ['More milestones completed', 'Trust scores increase', 'Better capital access unlocked', 'Bigger projects funded', 'More milestones initiated'], reinforcement: 'Each completed milestone creates trust capital that compounds future funding capacity', compoundRate: '15-20% per cycle' },
  { id: 'institutional_density', name: 'Institutional → Density Loop', sequence: ['More institutional integrations', 'More capital routed through platform', 'More startups funded', 'More regional density', 'More institutional interest'], reinforcement: 'Institutional embedding attracts capital which attracts startups which attracts more institutions', compoundRate: '20-30% per cycle' },
  { id: 'corridor_expansion', name: 'Corridor → Enterprise Loop', sequence: ['More cross-border corridors', 'More enterprise adoption', 'More capital routing', 'More trust compounding', 'More corridor demand'], reinforcement: 'Cross-border infrastructure attracts enterprise adoption which funds corridor expansion', compoundRate: '10-15% per cycle' },
];

// ============================================================
// SECTION 11 — STRATEGIC PARTNERSHIPS
// ============================================================

export interface PartnershipTarget {
  category: string;
  targetProfile: string;
  engagementModel: string;
  avoid: string;
}

export const PARTNERSHIP_STRATEGY: PartnershipTarget[] = [
  { category: 'Innovation-focused countries', targetProfile: 'Countries with digital transformation mandates and innovation budgets', engagementModel: 'Sovereign pilot deployment with regional fortress build', avoid: 'Countries without regulatory framework for digital infrastructure' },
  { category: 'Forward-thinking ministries', targetProfile: 'Ministries with grant modernization or procurement reform mandates', engagementModel: 'Grant routing pilot → procurement integration → regional dashboard', avoid: 'Ministries focused on surveillance or control rather than transparency' },
  { category: 'Regional development agencies', targetProfile: 'Agencies tracking economic development with innovation mandates', engagementModel: 'Regional intelligence dashboard → capital flow tracking → policy integration', avoid: 'Agencies without actionable mandate or budget' },
  { category: 'Major universities', targetProfile: 'Top engineering/tech universities with FYP and research funding programs', engagementModel: 'FYP integration → faculty tools → institutional dashboard → enterprise bridge', avoid: 'Universities without funded project pipeline' },
  { category: 'Enterprise R&D leaders', targetProfile: 'Companies with $10M+ annual R&D and university collaboration programs', engagementModel: 'Procurement pilot → startup scouting → milestone capital → full integration', avoid: 'Companies seeking marketing partnerships rather than infrastructure adoption' },
  { category: 'Development finance institutions', targetProfile: 'DFIs with innovation funding mandates and cross-border programs', engagementModel: 'Cross-border corridor pilot → grant routing → regional impact tracking', avoid: 'Institutions with purely political rather than execution-focused mandates' },
];

// ============================================================
// SECTION 12 — BRAND WAR POSITIONING
// ============================================================

export const BRAND_WAR = {
  describeAs: [
    'Execution Infrastructure',
    'Trust-Based Capital Rail',
    'Institutional Operating Layer',
    'Sovereign Professional Identity System',
    'Programmable Funding Protocol',
    'Cross-Border Execution Engine',
  ],
  neverDescribeAs: [
    'Platform',
    'App',
    'Community',
    'Social network',
    'Marketplace',
    'Tool',
  ],
  marketingApproach: 'Infrastructure companies do not market. They embed. RCollab grows through integration depth, not marketing spend.',
} as const;

// ============================================================
// SECTION 13 — MULTI-REGION EXPANSION SEQUENCE
// ============================================================

export interface ExpansionYear {
  year: number;
  fortressTarget: number;
  objective: string;
  densityRequirement: string;
  interconnectionGoal: string;
}

export const EXPANSION_TIMELINE: ExpansionYear[] = [
  { year: 1, fortressTarget: 1, objective: 'Single fortress region with full density achievement', densityRequirement: 'All 8 density thresholds met', interconnectionGoal: 'N/A — single node' },
  { year: 2, fortressTarget: 3, objective: 'Three fortress regions with independent density', densityRequirement: 'Each region independently meets density thresholds', interconnectionGoal: 'Cross-region trust portability pilot' },
  { year: 3, fortressTarget: 8, objective: 'Eight interconnected fortress regions', densityRequirement: 'Regional density maintained while scaling', interconnectionGoal: 'Full cross-region trust and capital portability' },
  { year: 4, fortressTarget: 15, objective: 'Cross-border corridor network operational', densityRequirement: 'Corridor-specific density metrics added', interconnectionGoal: '10+ active cross-border corridors' },
  { year: 5, fortressTarget: 25, objective: 'Capital integration at macro scale', densityRequirement: 'Macro-level density: development bank integration', interconnectionGoal: 'Global trust ledger interoperability' },
];

// ============================================================
// SECTION 14 — FAILURE CONTAINMENT PLAN
// ============================================================

export interface FailureResponse {
  trigger: string;
  immediateAction: string;
  stabilizationAction: string;
  recoveryAction: string;
  expansionRule: string;
}

export const FAILURE_CONTAINMENT: FailureResponse[] = [
  { trigger: 'Regional trust density drops below 50%', immediateAction: 'Freeze capital routing to/from affected region', stabilizationAction: 'Deploy governance team for trust audit', recoveryAction: 'Institutional confidence restoration program', expansionRule: 'No expansion from weak nodes — density must recover first' },
  { trigger: 'Dispute rate exceeds 10%', immediateAction: 'Pause new project onboarding in region', stabilizationAction: 'Conduct milestone and escrow audit', recoveryAction: 'Dispute resolution backlog clearance + policy reform', expansionRule: 'Region quarantined until dispute rate <5% for 3 months' },
  { trigger: 'Institutional partner withdrawal', immediateAction: 'Assess impact on regional density score', stabilizationAction: 'Activate institutional success team for recovery', recoveryAction: 'Replace or supplement institutional anchor', expansionRule: 'Minimum 5 institutional integrations required to maintain fortress status' },
  { trigger: 'Capital efficiency gain reversal', immediateAction: 'Root cause analysis on capital flow', stabilizationAction: 'Tighten escrow release conditions', recoveryAction: 'Restore capital efficiency metrics with structural fixes', expansionRule: 'Expansion paused until 20%+ efficiency gain restored' },
  { trigger: 'Cross-border corridor compliance failure', immediateAction: 'Freeze corridor capital routing', stabilizationAction: 'Compliance audit with both jurisdictions', recoveryAction: 'Regulatory relationship repair + compliance update', expansionRule: 'Corridor suspended until compliance fully restored' },
];

// ============================================================
// SECTION 15 — WIN CONDITION
// ============================================================

export interface WinCondition {
  condition: string;
  indicator: string;
  switchingCostCreated: string;
}

export const WIN_CONDITIONS: WinCondition[] = [
  { condition: 'Governments route grants through milestone escrow', indicator: '3+ government programs using RCollab for grant management', switchingCostCreated: 'Losing audit-grade grant tracking and milestone verification history' },
  { condition: 'Enterprises use ECS for procurement', indicator: '10+ enterprises with ECS-integrated procurement workflows', switchingCostCreated: 'Losing vendor reliability data and procurement optimization history' },
  { condition: 'Startups structure funding via TMUs', indicator: '100+ startups using tokenized milestone units for funding', switchingCostCreated: 'Losing execution history and capital access advantage' },
  { condition: 'Institutions verify SEID for collaboration', indicator: '25+ institutions requiring SEID for project participation', switchingCostCreated: 'Losing institutional verification and collaboration eligibility' },
  { condition: 'Cross-border corridors run through RCollab', indicator: '10+ active cross-border corridors with compliance automation', switchingCostCreated: 'Losing cross-border compliance mapping and trust portability' },
  { condition: 'Capital prefers programmable milestone rail', indicator: 'Capital flowing through RCollab exceeds traditional channels by 2x', switchingCostCreated: 'Losing programmatic capital access and trust-weighted allocation' },
  { condition: 'Trust ledger becomes required verification', indicator: 'Industry and government standards reference RCollab trust verification', switchingCostCreated: 'Losing verified execution history — equivalent to losing professional credit score' },
];

export const FGTMW_VERSION = '1.0.0';
export const FGTMW_EFFECTIVE_DATE = '2026-02-27';
