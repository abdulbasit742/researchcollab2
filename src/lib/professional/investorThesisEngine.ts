/**
 * IGITA — Investor-Grade Infrastructure Thesis Architecture
 * 
 * System-replacement thesis positioning RCollab as execution economy infrastructure.
 * Not a growth pitch. An infrastructure asset thesis.
 */

// ============================================================
// SECTION 1 — MACRO PROBLEM FRAMEWORK
// ============================================================

export interface MacroProblem {
  id: string;
  category: 'capital' | 'trust' | 'institutional' | 'execution' | 'regulatory' | 'knowledge';
  statement: string;
  consequence: string;
  annualCostEstimate: string;
  affectedActors: string[];
}

export const MACRO_PROBLEMS: MacroProblem[] = [
  { id: 'capital_milestone_disconnect', category: 'capital', statement: 'Capital is disconnected from milestones', consequence: 'Massive capital waste in unverified disbursements', annualCostEstimate: '$200B+ globally in misallocated grants and R&D', affectedActors: ['sponsors', 'governments', 'universities', 'investors'] },
  { id: 'trust_outcome_disconnect', category: 'trust', statement: 'Trust is disconnected from outcomes', consequence: 'Self-declared credentials create adverse selection', annualCostEstimate: '$50B+ in hiring friction and credential verification', affectedActors: ['enterprises', 'professionals', 'recruiters'] },
  { id: 'institutional_fragmentation', category: 'institutional', statement: 'Institutions are disconnected from each other', consequence: 'Duplicate research, siloed collaboration, wasted resources', annualCostEstimate: '$30B+ in duplicated academic R&D effort', affectedActors: ['universities', 'research labs', 'government agencies'] },
  { id: 'funding_opacity', category: 'capital', statement: 'Funding is opaque and unstructured', consequence: 'High corruption risk, low accountability, capital leakage', annualCostEstimate: '$100B+ in public funding inefficiency', affectedActors: ['governments', 'development agencies', 'taxpayers'] },
  { id: 'identity_unverifiable', category: 'trust', statement: 'Professional identity is unverifiable', consequence: 'Trust erosion across hiring, procurement, and collaboration', annualCostEstimate: '$40B+ in verification and fraud prevention costs', affectedActors: ['enterprises', 'professionals', 'institutions'] },
  { id: 'crossborder_friction', category: 'execution', statement: 'Cross-border collaboration is inefficient', consequence: 'Regional stagnation and innovation concentration', annualCostEstimate: '$80B+ in lost cross-border economic potential', affectedActors: ['startups', 'enterprises', 'governments', 'universities'] },
  { id: 'dispute_capital_destruction', category: 'capital', statement: 'Disputes destroy capital velocity', consequence: 'High dispute cost, project abandonment, trust collapse', annualCostEstimate: '$25B+ in dispute resolution and abandoned projects', affectedActors: ['sponsors', 'professionals', 'institutions'] },
  { id: 'knowledge_execution_gap', category: 'knowledge', statement: 'Knowledge is not structurally linked to execution', consequence: 'Research-to-implementation gap widens', annualCostEstimate: '$60B+ in unrealized research commercialization', affectedActors: ['universities', 'enterprises', 'governments'] },
  { id: 'procurement_trust_blind', category: 'institutional', statement: 'Procurement is trust-blind', consequence: 'Vendor selection based on cost not reliability', annualCostEstimate: '$45B+ in procurement failures and cost overruns', affectedActors: ['enterprises', 'governments'] },
  { id: 'public_funding_inefficiency', category: 'regulatory', statement: 'Public funding lacks milestone enforcement', consequence: 'Low ROI on public capital, taxpayer burden', annualCostEstimate: '$150B+ in misallocated public R&D investment', affectedActors: ['governments', 'taxpayers', 'universities'] },
];

// ============================================================
// SECTION 2 — INFRASTRUCTURE THESIS COMPONENTS
// ============================================================

export interface InfrastructureComponent {
  id: string;
  name: string;
  abbreviation: string;
  pillar: 'identity' | 'execution' | 'capital' | 'knowledge' | 'governance';
  description: string;
  replacesLegacy: string;
  economicFunction: string;
}

export const INFRASTRUCTURE_COMPONENTS: InfrastructureComponent[] = [
  { id: 'seid', name: 'Sovereign Execution Identity', abbreviation: 'SEID', pillar: 'identity', description: 'Ledger-backed professional identity with verified execution history', replacesLegacy: 'LinkedIn profiles, resumes, self-declared credentials', economicFunction: 'Eliminates adverse selection in professional markets' },
  { id: 'gtl', name: 'Global Trust Ledger', abbreviation: 'GTL', pillar: 'identity', description: 'Immutable, cryptographically signed record of all trust-relevant events', replacesLegacy: 'References, endorsements, testimonials', economicFunction: 'Creates verifiable trust capital that compounds over time' },
  { id: 'ecs', name: 'Execution Credit Score', abbreviation: 'ECS', pillar: 'identity', description: 'Quantified execution reliability derived from verified outcomes', replacesLegacy: 'Credit scores, vendor ratings, performance reviews', economicFunction: 'Enables trust-weighted capital allocation and risk pricing' },
  { id: 'pec', name: 'Programmable Escrow Capital', abbreviation: 'PEC', pillar: 'capital', description: 'Milestone-locked, condition-based capital release infrastructure', replacesLegacy: 'Upfront payments, invoicing, grant disbursement', economicFunction: 'Converts capital from liability to performance-linked asset' },
  { id: 'tmu', name: 'Tokenized Milestone Units', abbreviation: 'TMU', pillar: 'execution', description: 'Standardized, verifiable units of professional execution', replacesLegacy: 'Timesheets, progress reports, status updates', economicFunction: 'Creates atomic unit of economic value in execution economy' },
  { id: 'iil', name: 'Institutional Integration Layer', abbreviation: 'IIL', pillar: 'governance', description: 'API-driven integration with university, enterprise, and government workflows', replacesLegacy: 'Manual reporting, spreadsheet tracking, disconnected ERPs', economicFunction: 'Reduces institutional overhead and creates operational lock-in' },
  { id: 'cbce', name: 'Cross-Border Compliance Engine', abbreviation: 'CBCE', pillar: 'governance', description: 'Multi-jurisdiction compliance mapping and enforcement', replacesLegacy: 'Legal teams, compliance consultants, manual audits', economicFunction: 'Reduces cross-border friction cost by 60-80%' },
  { id: 'kda', name: 'Knowledge & Debate Archive', abbreviation: 'KDA', pillar: 'knowledge', description: 'Structured, cited, peer-reviewed knowledge repository linked to execution', replacesLegacy: 'Journal databases, unstructured documentation', economicFunction: 'Accelerates knowledge-to-execution conversion rate' },
  { id: 'gie', name: 'Governance & Integrity Engine', abbreviation: 'GIE', pillar: 'governance', description: 'Constitutional governance with transparent audit trails', replacesLegacy: 'Manual oversight, periodic audits, whistleblower systems', economicFunction: 'Reduces governance cost while increasing accountability' },
  { id: 'ril', name: 'Regional Intelligence Layer', abbreviation: 'RIL', pillar: 'knowledge', description: 'Real-time innovation density, skill liquidity, and capital flow analytics', replacesLegacy: 'Census data, periodic surveys, consulting reports', economicFunction: 'Enables data-driven regional economic policy and investment' },
];

// ============================================================
// SECTION 3 — STRUCTURAL TIMING FACTORS
// ============================================================

export interface TimingFactor {
  factor: string;
  maturityLevel: 'early' | 'inflecting' | 'mature';
  relevance: string;
}

export const TIMING_FACTORS: TimingFactor[] = [
  { factor: 'Remote-first global workforce', maturityLevel: 'inflecting', relevance: 'Cross-border execution requires trust infrastructure not physical proximity' },
  { factor: 'AI-enabled execution monitoring', maturityLevel: 'inflecting', relevance: 'Enables automated milestone verification and anomaly detection at scale' },
  { factor: 'API-integrated institutional systems', maturityLevel: 'mature', relevance: 'Universities and enterprises can integrate via standard APIs' },
  { factor: 'Cross-border collaboration demand', maturityLevel: 'inflecting', relevance: 'Global talent access requires trust portability and compliance automation' },
  { factor: 'Capital efficiency pressure', maturityLevel: 'mature', relevance: 'Investors and institutions demand measurable ROI on capital deployment' },
  { factor: 'Public funding transparency demand', maturityLevel: 'inflecting', relevance: 'Governments face pressure to show grant outcomes and reduce waste' },
  { factor: 'Startup ecosystem maturity', maturityLevel: 'inflecting', relevance: 'Mature ecosystems need structured execution infrastructure not just capital' },
  { factor: 'Data infrastructure maturity', maturityLevel: 'mature', relevance: 'Cloud, encryption, and ledger technology enables trust infrastructure at scale' },
  { factor: 'Institutional digital transformation', maturityLevel: 'early', relevance: 'Universities and government agencies actively digitizing workflows' },
];

// ============================================================
// SECTION 4 — ECONOMIC IMPACT MODEL
// ============================================================

export interface EconomicImpactMetric {
  id: string;
  metric: string;
  currentBaseline: string;
  projectedImprovement: string;
  multiplierEffect: string;
  measurementMethod: string;
}

export const ECONOMIC_IMPACT_MODEL: EconomicImpactMetric[] = [
  { id: 'dispute_cost', metric: 'Dispute Cost Reduction', currentBaseline: '15-25% of project value lost to disputes', projectedImprovement: '60-80% reduction via escrow + milestone gates', multiplierEffect: 'Released capital re-enters execution cycle', measurementMethod: 'Dispute rate × average resolution cost vs baseline' },
  { id: 'milestone_punctuality', metric: 'Milestone Punctuality Increase', currentBaseline: '40-60% on-time milestone delivery', projectedImprovement: '80-90% with programmable escrow incentives', multiplierEffect: 'Cascading schedule improvements across dependencies', measurementMethod: 'On-time rate across verified milestones' },
  { id: 'capital_efficiency', metric: 'Capital Deployment Efficiency', currentBaseline: '30-50% of funded capital reaches intended outcomes', projectedImprovement: '75-90% with conditional milestone release', multiplierEffect: 'Each efficiently deployed dollar generates 2-4x downstream activity', measurementMethod: 'Capital routed to verified outcomes / total capital deployed' },
  { id: 'startup_survival', metric: 'Startup Survival Rate Improvement', currentBaseline: '10-20% 5-year survival rate', projectedImprovement: '30-45% with structured execution + capital discipline', multiplierEffect: 'Each surviving startup creates 5-10 jobs and spin-off activity', measurementMethod: 'Survival rate of escrow-funded vs traditionally-funded startups' },
  { id: 'grant_efficiency', metric: 'Grant Allocation Efficiency', currentBaseline: '$0.30-0.50 of outcome per grant dollar', projectedImprovement: '$0.70-0.85 with milestone enforcement', multiplierEffect: 'Efficient grant spending attracts additional funding', measurementMethod: 'Verified grant outcomes / total grant disbursement' },
  { id: 'procurement_reliability', metric: 'Procurement Reliability', currentBaseline: '25-40% vendor reliability issues', projectedImprovement: '85-95% with ECS-weighted vendor selection', multiplierEffect: 'Reliable procurement accelerates project timelines', measurementMethod: 'Vendor delivery rate in trust-scored vs blind procurement' },
  { id: 'crossborder_speed', metric: 'Cross-Border Collaboration Speed', currentBaseline: '3-6 months for cross-border project setup', projectedImprovement: '2-4 weeks with compliance engine + trust portability', multiplierEffect: 'Faster setup enables more international collaborations', measurementMethod: 'Time from initiation to first milestone in cross-border projects' },
  { id: 'knowledge_conversion', metric: 'Knowledge-to-Execution Conversion', currentBaseline: '5-10% of research reaches implementation', projectedImprovement: '20-35% with structured knowledge-execution linking', multiplierEffect: 'Each commercialized research output creates economic multiplier', measurementMethod: 'Research publications linked to funded execution projects' },
  { id: 'innovation_density', metric: 'Regional Innovation Density', currentBaseline: 'Innovation concentrated in 5-10 global hubs', projectedImprovement: '3-5x more distributed innovation nodes', multiplierEffect: 'Regional innovation creates local economic multiplier effects', measurementMethod: 'Innovation activity per capita in connected regions' },
];

// ============================================================
// SECTION 5 — REVENUE MODEL
// ============================================================

export interface RevenueStream {
  id: string;
  name: string;
  model: 'transaction' | 'subscription' | 'licensing' | 'premium' | 'analytics';
  scaleFactor: string;
  marginProfile: 'high' | 'very_high';
  yearAvailable: number;
  estimatedContribution: string;
}

export const REVENUE_STREAMS: RevenueStream[] = [
  { id: 'escrow_fees', name: 'Escrow Transaction Fees', model: 'transaction', scaleFactor: 'Scales with capital volume routed', marginProfile: 'very_high', yearAvailable: 1, estimatedContribution: '35-45% of revenue' },
  { id: 'institutional_licensing', name: 'Institutional Integration Licensing', model: 'subscription', scaleFactor: 'Scales with institutions onboarded', marginProfile: 'very_high', yearAvailable: 1, estimatedContribution: '20-30% of revenue' },
  { id: 'enterprise_procurement', name: 'Enterprise Procurement Infrastructure', model: 'subscription', scaleFactor: 'Scales with enterprise count and GMV', marginProfile: 'high', yearAvailable: 2, estimatedContribution: '10-15% of revenue' },
  { id: 'ai_governance', name: 'AI Governance Services', model: 'premium', scaleFactor: 'Scales with compliance complexity', marginProfile: 'very_high', yearAvailable: 2, estimatedContribution: '5-8% of revenue' },
  { id: 'capital_orchestration', name: 'Capital Orchestration Premium', model: 'premium', scaleFactor: 'Scales with capital matching volume', marginProfile: 'very_high', yearAvailable: 2, estimatedContribution: '8-12% of revenue' },
  { id: 'crossborder_compliance', name: 'Cross-Border Compliance Module', model: 'licensing', scaleFactor: 'Scales with corridor count and transaction volume', marginProfile: 'high', yearAvailable: 3, estimatedContribution: '5-8% of revenue' },
  { id: 'regional_intelligence', name: 'Regional Intelligence Analytics', model: 'analytics', scaleFactor: 'Scales with regional nodes and data depth', marginProfile: 'very_high', yearAvailable: 3, estimatedContribution: '3-5% of revenue' },
  { id: 'api_licensing', name: 'API Licensing', model: 'licensing', scaleFactor: 'Scales with developer ecosystem', marginProfile: 'very_high', yearAvailable: 2, estimatedContribution: '2-4% of revenue' },
  { id: 'public_audit', name: 'Public Funding Audit Tools', model: 'licensing', scaleFactor: 'Scales with government partnerships', marginProfile: 'high', yearAvailable: 3, estimatedContribution: '3-5% of revenue' },
];

// ============================================================
// SECTION 6 — DEFENSIBILITY MATRIX
// ============================================================

export interface DefensibilityLayer {
  id: string;
  moat: string;
  timeToReplicate: string;
  compoundingMechanism: string;
  strengthOverTime: 'linear' | 'exponential' | 'logarithmic';
}

export const DEFENSIBILITY_LAYERS: DefensibilityLayer[] = [
  { id: 'trust_graph', moat: 'Trust graph compounding', timeToReplicate: '5-10 years of verified execution data', compoundingMechanism: 'Each verified milestone strengthens graph edges', strengthOverTime: 'exponential' },
  { id: 'execution_ledger', moat: 'Longitudinal execution ledger', timeToReplicate: 'Cannot be replicated — historical record', compoundingMechanism: 'Immutable append-only history', strengthOverTime: 'logarithmic' },
  { id: 'institutional_api', moat: 'Institutional API integration depth', timeToReplicate: '2-3 years of enterprise relationships', compoundingMechanism: 'Deeper integration increases switching cost', strengthOverTime: 'linear' },
  { id: 'capital_routing', moat: 'Capital routing dependency', timeToReplicate: '3-5 years of capital flow history', compoundingMechanism: 'Active escrow contracts create lock-in', strengthOverTime: 'exponential' },
  { id: 'ecs_portability', moat: 'Execution Credit Score portability', timeToReplicate: 'Requires years of outcome verification', compoundingMechanism: 'Score becomes professional currency', strengthOverTime: 'exponential' },
  { id: 'compliance_engine', moat: 'Cross-border compliance mapping', timeToReplicate: '2-4 years per jurisdiction', compoundingMechanism: 'Each corridor adds network value', strengthOverTime: 'linear' },
  { id: 'gov_workflow', moat: 'Government workflow embedding', timeToReplicate: '3-5 years of relationship building', compoundingMechanism: 'Procurement and audit dependency', strengthOverTime: 'logarithmic' },
];

// ============================================================
// SECTION 7 — RISK MITIGATION FRAMEWORK
// ============================================================

export interface RiskMitigation {
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
  systemComponent: string;
}

export const RISK_MITIGATIONS: RiskMitigation[] = [
  { risk: 'Trust manipulation', severity: 'high', mitigation: 'Immutable ledger + anomaly detection + volatility dampening', systemComponent: 'Global Trust Ledger + WDIHP Trust Engine' },
  { risk: 'Capital fraud', severity: 'high', mitigation: 'Programmable escrow with multi-signature approval simulation', systemComponent: 'Programmable Escrow Capital' },
  { risk: 'Institutional misuse', severity: 'medium', mitigation: 'Governance audit layer with constitutional enforcement', systemComponent: 'Governance & Integrity Engine' },
  { risk: 'Regulatory conflict', severity: 'medium', mitigation: 'Multi-jurisdiction compliance engine with pre-verified corridors', systemComponent: 'Cross-Border Compliance Engine' },
  { risk: 'Adoption resistance', severity: 'medium', mitigation: 'Dense cluster pilot model with institutional anchoring', systemComponent: 'GADEB Phase 1 Strategy' },
  { risk: 'Over-centralization', severity: 'low', mitigation: 'Transparent governance with sovereign node architecture', systemComponent: 'Governance & Integrity Engine' },
  { risk: 'AI risk', severity: 'medium', mitigation: 'Explainable AI layer with constitutional constraints', systemComponent: 'AI Governance Rules' },
];

// ============================================================
// SECTION 8 — VALUATION FRAMEWORK
// ============================================================

export interface ValuationMetric {
  id: string;
  metric: string;
  category: 'infrastructure' | 'economic_impact' | 'network' | 'capital';
  whyItMatters: string;
  targetAtScale: string;
}

export const VALUATION_METRICS: ValuationMetric[] = [
  { id: 'capital_routed', metric: 'Total Capital Routed (GMV)', category: 'capital', whyItMatters: 'Direct measure of economic rail utilization', targetAtScale: '$1B+ annually' },
  { id: 'milestones_verified', metric: 'Milestones Verified', category: 'infrastructure', whyItMatters: 'Atomic unit of execution economy throughput', targetAtScale: '1M+ annually' },
  { id: 'institutions_embedded', metric: 'Institutions Embedded', category: 'network', whyItMatters: 'Structural lock-in and recurring revenue base', targetAtScale: '500+ universities, 100+ enterprises' },
  { id: 'trust_ledger_scale', metric: 'Trust Ledger Entries', category: 'infrastructure', whyItMatters: 'Irreplaceable data asset growing with every interaction', targetAtScale: '100M+ entries' },
  { id: 'economic_multiplier', metric: 'Economic Impact Multiplier', category: 'economic_impact', whyItMatters: 'Each dollar routed generates downstream economic activity', targetAtScale: '3-5x multiplier verified' },
  { id: 'regional_gdp_correlation', metric: 'Regional GDP Contribution Correlation', category: 'economic_impact', whyItMatters: 'Demonstrates systemic economic infrastructure value', targetAtScale: 'Measurable correlation in 10+ regions' },
  { id: 'funding_efficiency_delta', metric: 'Funding Efficiency Delta', category: 'capital', whyItMatters: 'Quantified improvement over traditional funding channels', targetAtScale: '2-3x improvement vs baseline' },
];

// ============================================================
// SECTION 9 — SCALE PATH
// ============================================================

export interface ScalePhase {
  year: number;
  label: string;
  objective: string;
  keyMetrics: Record<string, string>;
  capitalTarget: string;
  institutionalTarget: string;
}

export const SCALE_PATH: ScalePhase[] = [
  { year: 1, label: 'Dense Cluster Proof', objective: 'Prove capital efficiency and trust compounding in single region', keyMetrics: { milestones: '2,000+', institutions: '5', startups: '10', completion_rate: '85%+' }, capitalTarget: '$500K+ routed', institutionalTarget: '5 universities embedded' },
  { year: 2, label: 'Institutional Embedding', objective: 'Embed into institutional workflows creating operational dependency', keyMetrics: { milestones: '20,000+', institutions: '25', enterprises: '5', corridors: '2' }, capitalTarget: '$5M+ routed', institutionalTarget: '25 institutions, 5 enterprises' },
  { year: 3, label: 'Capital Integration', objective: 'Become default capital routing rail for professional execution', keyMetrics: { milestones: '100,000+', institutions: '100', corridors: '5' }, capitalTarget: '$50M+ routed', institutionalTarget: 'Development bank pilot' },
  { year: 4, label: 'Cross-Border Corridor', objective: 'Establish trusted cross-border execution corridors', keyMetrics: { countries: '10+', corridors: '10', compliance_jurisdictions: '20+' }, capitalTarget: '$200M+ routed', institutionalTarget: '3 government partnerships' },
  { year: 5, label: 'Government Rail Adoption', objective: 'Government procurement and public funding transparency rail', keyMetrics: { ministries: '5+', public_funding_tracked: '$100M+' }, capitalTarget: '$500M+ routed', institutionalTarget: 'National innovation platform status' },
  { year: 6, label: 'Global Execution Layer', objective: 'Default execution infrastructure for professional capital globally', keyMetrics: { countries: '25+', corridors: '50+', gdp_correlation: 'Verified' }, capitalTarget: '$1B+ routed', institutionalTarget: 'Global infrastructure asset status' },
];

// ============================================================
// SECTION 10 — INEVITABILITY THESIS
// ============================================================

export interface InevitabilityFactor {
  actor: string;
  preference: string;
  rcollabAlignment: string;
}

export const INEVITABILITY_FACTORS: InevitabilityFactor[] = [
  { actor: 'Capital', preference: 'Structured risk over blind deployment', rcollabAlignment: 'Programmable escrow with milestone-conditional release' },
  { actor: 'Institutions', preference: 'Transparency over opacity', rcollabAlignment: 'Real-time execution dashboards with audit trails' },
  { actor: 'Governments', preference: 'Auditability over trust-based allocation', rcollabAlignment: 'Immutable ledger with compliance-ready export' },
  { actor: 'Enterprises', preference: 'Reliability over lowest cost', rcollabAlignment: 'ECS-weighted vendor selection and procurement tracking' },
  { actor: 'Professionals', preference: 'Portable trust over platform-locked reputation', rcollabAlignment: 'Sovereign Execution ID with verifiable history' },
  { actor: 'Regions', preference: 'Innovation density over talent extraction', rcollabAlignment: 'Regional intelligence layer and capital flow coordination' },
  { actor: 'Investors', preference: 'Capital efficiency over growth-at-all-costs', rcollabAlignment: 'Infrastructure metrics: GMV, milestones, efficiency delta' },
];

// ============================================================
// SECTION 11 — EXIT SCENARIO FRAMEWORK
// ============================================================

export interface ExitScenario {
  scenario: string;
  probability: 'high' | 'medium' | 'low';
  valuationMultiple: string;
  strategicRationale: string;
}

export const EXIT_SCENARIOS: ExitScenario[] = [
  { scenario: 'Independent infrastructure asset (preferred)', probability: 'high', valuationMultiple: '10-20x ARR', strategicRationale: 'Infrastructure companies command premium multiples; independence preserves neutrality' },
  { scenario: 'Strategic integration into global financial infrastructure', probability: 'medium', valuationMultiple: '15-25x ARR', strategicRationale: 'Payment rails, development banks seeking execution verification layer' },
  { scenario: 'National innovation platform integration', probability: 'medium', valuationMultiple: '8-15x ARR', strategicRationale: 'Governments seeking execution infrastructure for public R&D accountability' },
  { scenario: 'Enterprise ERP ecosystem acquisition', probability: 'low', valuationMultiple: '12-20x ARR', strategicRationale: 'SAP/Oracle/Workday seeking trust and execution verification layer' },
];

// ============================================================
// SECTION 12 — PITCH NARRATIVE
// ============================================================

export const PITCH_NARRATIVE = {
  opening: 'We are not building another platform. We are building the execution rail for the global economy.',
  thesis: [
    'Trust is ledger-backed, not self-declared.',
    'Capital is programmable, not blindly disbursed.',
    'Milestones are verifiable, not self-reported.',
    'Institutions integrate directly, not through manual workflows.',
    'Regions coordinate intelligently, not in isolation.',
    'Cross-border collaboration is structured, not ad hoc.',
    'Professional identity is sovereign, not platform-locked.',
    'Knowledge compounds through structured debate, not vanity publishing.',
    'Governance is transparent and constitutional, not discretionary.',
    'Capital flows conditionally on verified execution, not promises.',
  ],
  close: 'This is not a bet on social behavior. This is a bet on capital efficiency, institutional modernization, trust-based economy, cross-border collaboration growth, and execution over engagement. RCollab is the economic coordination layer for the next generation of global professional activity.',
  investorPositioning: [
    'Infrastructure builders',
    'Economic rail architects',
    'Capital efficiency enablers',
    'Trust economy backers',
    'Institutional modernization partners',
    'Global coordination catalysts',
  ],
} as const;

// ============================================================
// SECTION 13 — INVESTOR DECK SLIDE STRUCTURE
// ============================================================

export interface InvestorSlide {
  slideNumber: number;
  title: string;
  keyMessage: string;
  dataPoints: string[];
}

export const INVESTOR_DECK: InvestorSlide[] = [
  { slideNumber: 1, title: 'The Macro Problem', keyMessage: 'Global professional execution is fragmented — $780B+ in annual waste', dataPoints: MACRO_PROBLEMS.slice(0, 4).map(p => p.statement) },
  { slideNumber: 2, title: 'The Infrastructure Thesis', keyMessage: 'Parallel professional infrastructure replacing fragmented tools', dataPoints: INFRASTRUCTURE_COMPONENTS.slice(0, 5).map(c => `${c.abbreviation}: ${c.name}`) },
  { slideNumber: 3, title: 'Why Now', keyMessage: 'Structural timing — not trend-chasing', dataPoints: TIMING_FACTORS.filter(t => t.maturityLevel === 'inflecting').map(t => t.factor) },
  { slideNumber: 4, title: 'Economic Impact', keyMessage: 'Capital velocity accelerator with measurable ROI', dataPoints: ECONOMIC_IMPACT_MODEL.slice(0, 4).map(e => `${e.metric}: ${e.projectedImprovement}`) },
  { slideNumber: 5, title: 'Entry Strategy', keyMessage: 'Dense trust cluster → institutional embedding → capital integration', dataPoints: ['5 universities', '10 startups', '5 enterprises', '2 grant agencies', 'Single-region focus'] },
  { slideNumber: 6, title: 'Revenue Model', keyMessage: 'Revenue scales with economic activity, not attention', dataPoints: REVENUE_STREAMS.slice(0, 5).map(r => `${r.name} (${r.estimatedContribution})`) },
  { slideNumber: 7, title: 'Defensibility', keyMessage: 'Compounding moats that strengthen with every transaction', dataPoints: DEFENSIBILITY_LAYERS.slice(0, 4).map(d => `${d.moat}: ${d.timeToReplicate}`) },
  { slideNumber: 8, title: 'Risk Mitigation', keyMessage: 'Every risk has a structural mitigation, not a reactionary patch', dataPoints: RISK_MITIGATIONS.filter(r => r.severity === 'high').map(r => `${r.risk} → ${r.mitigation}`) },
  { slideNumber: 9, title: 'Scale Path', keyMessage: 'Dense proof → institutional embedding → global infrastructure', dataPoints: SCALE_PATH.slice(0, 4).map(s => `Year ${s.year}: ${s.label} (${s.capitalTarget})`) },
  { slideNumber: 10, title: 'Inevitability', keyMessage: 'Aligned with incentive direction of every actor in the ecosystem', dataPoints: INEVITABILITY_FACTORS.slice(0, 4).map(f => `${f.actor}: ${f.preference}`) },
  { slideNumber: 11, title: 'Valuation Framework', keyMessage: 'Infrastructure metrics, not vanity metrics', dataPoints: VALUATION_METRICS.slice(0, 4).map(v => `${v.metric}: ${v.targetAtScale}`) },
  { slideNumber: 12, title: 'Exit Framework', keyMessage: 'Independent infrastructure asset or strategic integration', dataPoints: EXIT_SCENARIOS.slice(0, 3).map(e => `${e.scenario} (${e.valuationMultiple})`) },
  { slideNumber: 13, title: 'The Close', keyMessage: PITCH_NARRATIVE.close, dataPoints: [...PITCH_NARRATIVE.investorPositioning] },
];

export const IGITA_VERSION = '1.0.0';
export const IGITA_EFFECTIVE_DATE = '2026-02-27';
