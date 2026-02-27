/**
 * MPBSB — Master Product Build Sequencing Blueprint
 *
 * World-class infrastructure is built by sequencing correctly.
 * Build core before expansion. Build stability before scale.
 */

// ============================================================
// PHASE DEFINITIONS
// ============================================================

export type PhaseStatus = 'locked' | 'active' | 'stabilizing' | 'complete';

export interface BuildPhase {
  id: number;
  code: string;
  name: string;
  goal: string;
  deliverables: string[];
  prerequisites: number[];
  stabilityGate: string;
  sequencingRule: string;
}

export const BUILD_PHASES: BuildPhase[] = [
  {
    id: 0, code: 'CLEANUP', name: 'Architecture Cleanup',
    goal: 'Simplify before scaling — map all pages to 5 core pillars',
    deliverables: [
      'Map all pages to Identity / Execution / Capital / Knowledge / Governance',
      'Remove or hide low-signal pages',
      'Remove redundant visionary pages',
      'Remove duplicate dashboards',
      'Remove placeholder modules',
      'Lock routing: SEID profile, Project+Milestones, Escrow funding, Knowledge publishing, Governance panel',
    ],
    prerequisites: [],
    stabilityGate: 'All active routes map to exactly one pillar; zero orphan pages',
    sequencingRule: 'No new features until cleanup complete',
  },
  {
    id: 1, code: 'CORE', name: 'Core Infrastructure',
    goal: 'Functional trust + milestone + escrow loop',
    deliverables: [
      'SEID identity system (DB connected)',
      'Trust Ledger engine (append-only)',
      'Execution Credit Score calculator',
      'Project creation with milestone DB storage',
      'Escrow funding logic (real ledger integration)',
      'Milestone verification flow',
      'Dispute system (basic)',
      'Institutional verification API',
      'Minimal governance enforcement',
      'Execution-first dashboard',
    ],
    prerequisites: [0],
    stabilityGate: 'End-to-end: create project → fund escrow → complete milestone → trust update verified',
    sequencingRule: 'Do NOT expand beyond this until stable',
  },
  {
    id: 2, code: 'CAPITAL', name: 'Capital Hardening',
    goal: 'Make funding rail robust',
    deliverables: [
      'Programmable escrow conditions',
      'Partial milestone release logic',
      'Dispute freeze automation',
      'Capital risk scoring engine',
      'TMU (Tokenized Milestone Unit) registry',
      'Funding dashboard with compliance tracking',
      'Institutional funding routing API',
      'Cross-border compliance tags (basic)',
      'Escrow audit log export',
      'Capital performance analytics',
    ],
    prerequisites: [1],
    stabilityGate: 'Escrow invariants hold under 1000 concurrent transactions; zero capital leak',
    sequencingRule: 'Never expand cross-border before escrow stable',
  },
  {
    id: 3, code: 'INSTITUTIONAL', name: 'Institutional Embedding',
    goal: 'Embed in institutional workflow',
    deliverables: [
      'University grant routing mode',
      'Enterprise procurement mode',
      'Government pilot dashboard',
      'Institutional SSO',
      'SEID bulk verification',
      'Institutional audit export',
      'Role-based access control',
      'Department-level dashboards',
      'Compliance workflow tracking',
      'Public transparency toggle mode',
    ],
    prerequisites: [2],
    stabilityGate: '5+ institutional integrations operational; audit export validated',
    sequencingRule: 'Never integrate government before audit trail hardened',
  },
  {
    id: 4, code: 'REGIONAL', name: 'Regional Intelligence Layer',
    goal: 'System-level intelligence',
    deliverables: [
      'Regional hub dashboard',
      'Trust density index',
      'Capital heatmap',
      'Startup survival tracking',
      'Institutional collaboration graph',
      'Skill density heatmap',
      'Cross-border corridor map',
      'Innovation velocity metric',
      'Regional milestone velocity',
      'Macro capital efficiency index',
    ],
    prerequisites: [3],
    stabilityGate: 'Dashboard data accuracy >95% vs manual audit',
    sequencingRule: 'No visionary dashboards without real data backing',
  },
  {
    id: 5, code: 'KNOWLEDGE', name: 'Knowledge & Debate Full Integration',
    goal: 'Knowledge compounds into execution',
    deliverables: [
      'Structured publishing with citation engine',
      'Version control',
      'Debate engine with argument tagging',
      'AI summarization with explainability',
      'Knowledge impact index',
      'Knowledge-to-project linking',
      'Institutional publishing mode',
      'Knowledge trust weighting',
      'Archival storage logic',
      'Debate-to-document conversion tool',
    ],
    prerequisites: [3],
    stabilityGate: 'Knowledge-to-project link verified in 10+ real cases',
    sequencingRule: 'Knowledge must link to execution — no standalone publishing',
  },
  {
    id: 6, code: 'CROSSBORDER', name: 'Cross-Border Capital & Corridors',
    goal: 'Safe international scaling',
    deliverables: [
      'Jurisdiction compatibility matrix',
      'Cross-border capital filter',
      'Corridor management panel',
      'Regulatory compatibility tagging',
      'Currency logic layer',
      'Export control tagging',
      'Cross-border dispute routing',
      'Bilateral innovation dashboard',
      'Corridor trust score',
      'Cross-border funding analytics',
    ],
    prerequisites: [2, 4],
    stabilityGate: 'Cross-border transaction with compliance pass in 2+ jurisdictions',
    sequencingRule: 'Never expand cross-border before escrow stable and fraud detection active',
  },
  {
    id: 7, code: 'HARDENING', name: 'Hardening & Resilience',
    goal: 'Infrastructure-grade resilience',
    deliverables: [
      'Trust volatility dampening',
      'Anti-fraud anomaly engine',
      'Capital freeze emergency mode',
      'Multi-signature escrow simulation',
      'Crisis mode throttle',
      'Trust concentration monitor',
      'Governance performance index',
      'AI audit log transparency',
      'Institutional override tracking',
      'Risk simulation module',
    ],
    prerequisites: [6],
    stabilityGate: 'Stress test: 10x load with zero data corruption; fraud detection <5min latency',
    sequencingRule: 'Never scale before fraud detection active',
  },
  {
    id: 8, code: 'SCALE', name: 'Scale Optimization',
    goal: 'Scalability without fragility',
    deliverables: [
      'Graph database optimization',
      'Ledger indexing',
      'Real-time trust recalculation engine',
      'Caching layer for dashboards',
      'Distributed storage for milestone records',
      'Horizontal scalability planning',
      'API rate limiting',
      'Regional server cluster logic',
      'Backup redundancy architecture',
      'Disaster recovery blueprint',
    ],
    prerequisites: [7],
    stabilityGate: '1M+ simulated users with <200ms p95 latency',
    sequencingRule: 'Scale only after hardening complete',
  },
  {
    id: 9, code: 'AI', name: 'AI Orchestration Layer',
    goal: 'Explainable AI assistance across all pillars',
    deliverables: [
      'Trust trajectory prediction',
      'Capital risk forecast',
      'Skill gap detection',
      'Regional stagnation alerts',
      'Funding inefficiency detection',
      'Dispute likelihood prediction',
      'Corridor optimization suggestion',
      'Institutional risk warning',
      'Knowledge impact forecasting',
      'Execution bottleneck analysis',
    ],
    prerequisites: [7],
    stabilityGate: 'AI predictions validated against 6-month historical data; explainability audit passed',
    sequencingRule: 'AI must remain explainable — no black-box decisions',
  },
  {
    id: 10, code: 'DEPLOY', name: 'Global Deployment Package',
    goal: 'Deployable infrastructure',
    deliverables: [
      'Enterprise deployment kit',
      'Government deployment package',
      'Regional pilot starter kit',
      'Compliance configuration tool',
      'Institutional onboarding wizard',
      'Public transparency configuration',
      'Capital routing documentation',
      'API integration documentation',
      'Audit documentation templates',
      'Deployment case studies',
    ],
    prerequisites: [8, 9],
    stabilityGate: 'Full deployment in 1 region with zero critical issues for 90 days',
    sequencingRule: 'Deploy only after scale optimization and AI layer stable',
  },
];

// ============================================================
// CORE PILLARS
// ============================================================

export type CorePillar = 'identity' | 'execution' | 'capital' | 'knowledge' | 'governance';

export interface PillarDefinition {
  id: CorePillar;
  name: string;
  description: string;
  coreRoutes: string[];
  phaseIntroduced: number;
}

export const CORE_PILLARS: PillarDefinition[] = [
  { id: 'identity', name: 'Identity', description: 'SEID, Trust Ledger, Execution Credit Score', coreRoutes: ['/seid', '/profile', '/trust-ledger'], phaseIntroduced: 1 },
  { id: 'execution', name: 'Execution', description: 'Projects, Milestones, Verification, Disputes', coreRoutes: ['/projects', '/milestones', '/disputes'], phaseIntroduced: 1 },
  { id: 'capital', name: 'Capital', description: 'Escrow, Funding, TMU, Capital Analytics', coreRoutes: ['/escrow', '/funding', '/capital'], phaseIntroduced: 1 },
  { id: 'knowledge', name: 'Knowledge', description: 'Publishing, Debate, Citations, Archive', coreRoutes: ['/publish', '/debate', '/knowledge'], phaseIntroduced: 5 },
  { id: 'governance', name: 'Governance', description: 'Compliance, Integrity, Audit, Oversight', coreRoutes: ['/governance', '/compliance', '/audit'], phaseIntroduced: 1 },
];

// ============================================================
// SEQUENCING RULES (INVARIANTS)
// ============================================================

export const SEQUENCING_RULES = {
  never: [
    'Expand modules without stability',
    'Add UI before DB wiring',
    'Add pages without backend logic',
    'Add visionary dashboards without data',
    'Expand cross-border before escrow stable',
    'Scale before fraud detection active',
    'Integrate government before audit trail hardened',
  ],
  always: [
    'Stabilize',
    'Measure',
    'Stress test',
    'Embed',
    'Then expand',
  ],
} as const;

// ============================================================
// PHASE TRANSITION LOGIC
// ============================================================

export interface PhaseProgress {
  phaseId: number;
  totalDeliverables: number;
  completedDeliverables: number;
  stabilityGatePassed: boolean;
}

export function canAdvancePhase(
  currentProgress: PhaseProgress,
  allProgress: Map<number, PhaseProgress>,
  phase: BuildPhase
): { canAdvance: boolean; blockers: string[] } {
  const blockers: string[] = [];

  // Check prerequisites
  for (const prereq of phase.prerequisites) {
    const prereqProgress = allProgress.get(prereq);
    if (!prereqProgress || prereqProgress.completedDeliverables < prereqProgress.totalDeliverables) {
      blockers.push(`Phase ${prereq} (${BUILD_PHASES[prereq]?.name}) not complete`);
    }
    if (prereqProgress && !prereqProgress.stabilityGatePassed) {
      blockers.push(`Phase ${prereq} stability gate not passed`);
    }
  }

  // Check current phase completion
  const completionRate = currentProgress.totalDeliverables > 0
    ? (currentProgress.completedDeliverables / currentProgress.totalDeliverables) * 100
    : 0;

  if (completionRate < 90) {
    blockers.push(`Current phase only ${completionRate.toFixed(0)}% complete (need 90%+)`);
  }

  if (!currentProgress.stabilityGatePassed) {
    blockers.push('Stability gate not yet passed');
  }

  return { canAdvance: blockers.length === 0, blockers };
}

// ============================================================
// PRODUCT OBJECTIVE
// ============================================================

export const PRODUCT_OBJECTIVE = {
  mustBe: [
    'Stable', 'Trust-compounding', 'Capital-routed', 'Institution-embedded',
    'Cross-border structured', 'Governance-hardened', 'AI-assisted',
    'Scalable', 'Calm', 'Serious', 'Deployable',
  ],
  mustNotBe: [
    'Noisy', 'Gamified', 'Hype-driven',
  ],
  identity: 'Infrastructure',
} as const;

export const MPBSB_VERSION = '1.0.0';
export const MPBSB_EFFECTIVE_DATE = '2026-02-27';
