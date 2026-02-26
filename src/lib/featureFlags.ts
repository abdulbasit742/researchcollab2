/**
 * Production Feature Flags — Phase 10 deployment gate.
 *
 * Core (always ON):  Auth, Profiles, Deals, Escrow, Wallet, Messaging, Trust, Files, Org Dashboard
 * Gated (OFF by default): Phases 6-9 autonomous/intelligence/infrastructure modules
 *
 * Toggle via localStorage `rcollab_flags` for dev, or environment variable for deploy.
 */

export type FeatureModule =
  // Core — always enabled
  | "auth"
  | "profiles"
  | "deals"
  | "escrow"
  | "wallet"
  | "messaging"
  | "trust"
  | "files"
  | "org_dashboard"
  | "notifications"
  | "offers"
  | "matching"
  // Phase 6 — Capital & Institutional
  | "capital_marketplace"
  | "liquidity_marketplace"
  | "investor_infrastructure"
  | "ipo_engine"
  | "institutional_intelligence"
  // Phase 7 — Infrastructure
  | "multi_region"
  | "data_sharding"
  | "edge_orchestration"
  | "event_bus"
  | "job_queue"
  | "observability"
  | "analytics_warehouse"
  | "ai_trust_model"
  | "governance_engine"
  | "cache_layer"
  | "high_availability"
  | "disaster_recovery"
  | "deployment_manager"
  | "sla_tracking"
  | "security_hardening"
  // Phase 8 — Intelligence
  | "negotiation_ai"
  | "capital_allocation_ai"
  | "credit_scoring"
  | "dynamic_pricing"
  | "execution_forecast"
  | "dispute_prediction"
  | "reputation_volatility"
  | "hedging_engine"
  | "portfolio_optimizer"
  | "economic_simulator"
  | "fee_optimizer"
  | "growth_intelligence"
  // Phase 9 — Autonomous
  | "self_learning_trust"
  | "governance_voting"
  | "reputation_exchange"
  | "incentive_engine"
  | "economic_balancer"
  | "network_evolution"
  | "macro_stability"
  | "capital_sustainability"
  | "coordination_efficiency"
  | "equilibrium_monitor"
  | "policy_simulator"
  | "incentive_recalibration";

// Core modules — always enabled, cannot be disabled
const CORE_MODULES: FeatureModule[] = [
  "auth", "profiles", "deals", "escrow", "wallet",
  "messaging", "trust", "files", "org_dashboard",
  "notifications", "offers", "matching",
];

// Production defaults — everything from Phases 6-9 OFF
const PRODUCTION_DEFAULTS: Record<FeatureModule, boolean> = {
  // Core — ON
  auth: true, profiles: true, deals: true, escrow: true, wallet: true,
  messaging: true, trust: true, files: true, org_dashboard: true,
  notifications: true, offers: true, matching: true,
  // Phase 6 — OFF
  capital_marketplace: false, liquidity_marketplace: false,
  investor_infrastructure: false, ipo_engine: false,
  institutional_intelligence: false,
  // Phase 7 — OFF
  multi_region: false, data_sharding: false, edge_orchestration: false,
  event_bus: false, job_queue: false, observability: false,
  analytics_warehouse: false, ai_trust_model: false, governance_engine: false,
  cache_layer: false, high_availability: false, disaster_recovery: false,
  deployment_manager: false, sla_tracking: false, security_hardening: false,
  // Phase 8 — OFF
  negotiation_ai: false, capital_allocation_ai: false, credit_scoring: false,
  dynamic_pricing: false, execution_forecast: false, dispute_prediction: false,
  reputation_volatility: false, hedging_engine: false, portfolio_optimizer: false,
  economic_simulator: false, fee_optimizer: false, growth_intelligence: false,
  // Phase 9 — OFF
  self_learning_trust: false, governance_voting: false, reputation_exchange: false,
  incentive_engine: false, economic_balancer: false, network_evolution: false,
  macro_stability: false, capital_sustainability: false,
  coordination_efficiency: false, equilibrium_monitor: false,
  policy_simulator: false, incentive_recalibration: false,
};

let overrides: Partial<Record<FeatureModule, boolean>> = {};

// Load overrides from localStorage (dev only)
function loadOverrides(): void {
  try {
    const raw = localStorage.getItem("rcollab_flags");
    if (raw) overrides = JSON.parse(raw);
  } catch {
    overrides = {};
  }
}

loadOverrides();

/**
 * Check if a feature module is enabled.
 */
export function isFeatureEnabled(module: FeatureModule): boolean {
  // Core modules are always on
  if (CORE_MODULES.includes(module)) return true;
  // Check override, then default
  if (module in overrides) return overrides[module]!;
  return PRODUCTION_DEFAULTS[module] ?? false;
}

/**
 * Enable/disable a feature at runtime (dev use).
 */
export function setFeatureFlag(module: FeatureModule, enabled: boolean): void {
  if (CORE_MODULES.includes(module)) return; // Can't disable core
  overrides[module] = enabled;
  try {
    localStorage.setItem("rcollab_flags", JSON.stringify(overrides));
  } catch { /* noop */ }
}

/**
 * Get all flags and their current state.
 */
export function getAllFlags(): Record<FeatureModule, boolean> {
  const result = { ...PRODUCTION_DEFAULTS };
  for (const [key, val] of Object.entries(overrides)) {
    (result as any)[key] = val;
  }
  // Ensure core stays on
  for (const core of CORE_MODULES) {
    result[core] = true;
  }
  return result;
}

/**
 * Get only enabled modules.
 */
export function getEnabledModules(): FeatureModule[] {
  return (Object.keys(PRODUCTION_DEFAULTS) as FeatureModule[]).filter(isFeatureEnabled);
}

/**
 * Reset all overrides to production defaults.
 */
export function resetFlags(): void {
  overrides = {};
  try { localStorage.removeItem("rcollab_flags"); } catch { /* noop */ }
}

/**
 * Phase-level enable/disable.
 */
const PHASE_MODULES: Record<number, FeatureModule[]> = {
  6: ["capital_marketplace", "liquidity_marketplace", "investor_infrastructure", "ipo_engine", "institutional_intelligence"],
  7: ["multi_region", "data_sharding", "edge_orchestration", "event_bus", "job_queue", "observability", "analytics_warehouse", "ai_trust_model", "governance_engine", "cache_layer", "high_availability", "disaster_recovery", "deployment_manager", "sla_tracking", "security_hardening"],
  8: ["negotiation_ai", "capital_allocation_ai", "credit_scoring", "dynamic_pricing", "execution_forecast", "dispute_prediction", "reputation_volatility", "hedging_engine", "portfolio_optimizer", "economic_simulator", "fee_optimizer", "growth_intelligence"],
  9: ["self_learning_trust", "governance_voting", "reputation_exchange", "incentive_engine", "economic_balancer", "network_evolution", "macro_stability", "capital_sustainability", "coordination_efficiency", "equilibrium_monitor", "policy_simulator", "incentive_recalibration"],
};

export function enablePhase(phase: number): void {
  const modules = PHASE_MODULES[phase];
  if (!modules) return;
  modules.forEach(m => setFeatureFlag(m, true));
}

export function disablePhase(phase: number): void {
  const modules = PHASE_MODULES[phase];
  if (!modules) return;
  modules.forEach(m => setFeatureFlag(m, false));
}
