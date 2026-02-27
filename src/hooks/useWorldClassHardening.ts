/**
 * WDIHP React Hooks — World-Class Dominance & Infrastructure Hardening Protocol
 * 
 * Hooks for trust hardening, escrow security, risk simulation,
 * enterprise/government readiness, and coherence auditing.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  computeVolatilityDampenedTrust,
  computeTrustRecovery,
  computeTrustConcentration,
  detectTrustAnomalies,
  validateEscrowRelease,
  simulateSystemicRisk,
  runCoherenceAudit,
  type TrustAnomalyDetection,
  type EscrowFreezeEvent,
  type SystemicRiskScenario,
  type RiskSimulationResult,
  type EscrowSecurityConfig,
  type EnterpriseOnboardingConfig,
  DEFAULT_ESCROW_SECURITY,
  ARCHITECTURE_PILLARS,
  STRATEGIC_IDENTITY,
  AI_GOVERNANCE_RULES,
  REVENUE_MODEL,
  FEED_SIGNAL_WEIGHTS,
} from '@/lib/professional/worldClassHardeningEngine';

// ============================================================
// TRUST HARDENING HOOKS
// ============================================================

export function useTrustAnomalies(userId: string) {
  return useQuery({
    queryKey: ['wdihp', 'trust-anomalies', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_trust_anomalies')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useDetectTrustAnomalies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      recentEvents: Array<{ type: string; delta: number; counterpartyId: string; timestamp: string }>;
      historicalStats: { meanDailyDelta: number; stdDevDailyDelta: number; trustAge: number };
    }) => {
      const anomalies = detectTrustAnomalies(params.userId, params.recentEvents, params.historicalStats);
      
      if (anomalies.length > 0) {
        const inserts = anomalies.map(a => ({
          user_id: a.userId,
          anomaly_type: a.anomalyType,
          severity: a.severity,
          detected_at: a.detectedAt,
          evidence: a.evidence as unknown as Record<string, string>,
          auto_mitigation_applied: a.autoMitigationApplied,
          mitigation_action: a.mitigationAction || null,
        }));
        const { error } = await supabase.from('wdihp_trust_anomalies').insert(inserts);
        if (error) throw error;
      }
      
      return anomalies;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'trust-anomalies', params.userId] });
    },
  });
}

export function useVolatilityDampening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      currentScore: number;
      rawNewScore: number;
      trustAge: number;
      recentVolatility: number;
    }) => {
      const result = computeVolatilityDampenedTrust(
        params.currentScore, params.rawNewScore, params.trustAge, params.recentVolatility
      );
      
      const { error } = await supabase.from('wdihp_trust_dampening').insert({
        user_id: params.userId,
        raw_delta: params.rawNewScore - params.currentScore,
        dampened_delta: result.dampenedScore - params.currentScore,
        volatility_factor: result.volatilityFactor,
        age_factor: Math.min(1, Math.log(params.trustAge + 1) / Math.log(365)),
        explanation: result.explanation,
      });
      if (error) throw error;
      
      return result;
    },
  });
}

export function useTrustRecovery(userId: string) {
  return useQuery({
    queryKey: ['wdihp', 'trust-recovery', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_trust_recovery')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useComputeTrustRecovery() {
  return useMutation({
    mutationFn: async (params: {
      preDisputeScore: number;
      currentScore: number;
      daysSinceDispute: number;
      consistentPositiveActions: number;
      institutionalMediationApplied: boolean;
    }) => {
      return computeTrustRecovery(
        params.preDisputeScore,
        params.currentScore,
        params.daysSinceDispute,
        params.consistentPositiveActions,
        params.institutionalMediationApplied
      );
    },
  });
}

export function useTrustConcentration(userId: string) {
  return useQuery({
    queryKey: ['wdihp', 'trust-concentration', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_trust_concentration')
        .select('*')
        .eq('user_id', userId)
        .order('computed_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!userId,
  });
}

export function useComputeTrustConcentration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; trustSourceAmounts: number[] }) => {
      const result = computeTrustConcentration(params.trustSourceAmounts);
      
      const { error } = await supabase.from('wdihp_trust_concentration').insert({
        user_id: params.userId,
        gini_coefficient: result.giniCoefficient,
        concentration_risk: result.concentrationRisk,
        top_source_percentage: result.topSourcePercentage,
        source_count: params.trustSourceAmounts.length,
      });
      if (error) throw error;
      
      return result;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'trust-concentration', params.userId] });
    },
  });
}

// ============================================================
// ESCROW SECURITY HOOKS
// ============================================================

export function useEscrowFreezeEvents(escrowId?: string) {
  return useQuery({
    queryKey: ['wdihp', 'escrow-freezes', escrowId],
    queryFn: async () => {
      let query = supabase.from('wdihp_escrow_freeze_events').select('*').order('frozen_at', { ascending: false });
      if (escrowId) query = query.eq('escrow_id', escrowId);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useFreezeEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<EscrowFreezeEvent, 'frozenAt'>) => {
      const { error } = await supabase.from('wdihp_escrow_freeze_events').insert([{
        escrow_id: event.escrowId,
        reason: event.reason,
        frozen_by: event.frozenBy,
        auto_detected: event.autoDetected,
        evidence: event.evidence as unknown as Record<string, string>,
        estimated_resolution_hours: event.estimatedResolutionHours,
        requires_governance_review: event.requiresGovernanceReview,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'escrow-freezes'] });
    },
  });
}

export function useValidateEscrowRelease() {
  return useMutation({
    mutationFn: async (params: {
      escrowId: string;
      escrowState: Parameters<typeof validateEscrowRelease>[0];
      config?: EscrowSecurityConfig;
      actorId: string;
    }) => {
      const result = validateEscrowRelease(params.escrowState, params.config);
      
      // Log the validation attempt
      await supabase.from('wdihp_escrow_security_log').insert({
        escrow_id: params.escrowId,
        action: 'release_validation',
        actor_id: params.actorId,
        validation_result: result as any,
        risk_level: result.riskLevel,
        blockers: result.blockers,
      });
      
      return result;
    },
  });
}

// ============================================================
// RISK SIMULATION HOOKS
// ============================================================

export function useRiskSimulations() {
  return useQuery({
    queryKey: ['wdihp', 'risk-simulations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_risk_simulations')
        .select('*')
        .order('simulated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useSimulateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      scenario: SystemicRiskScenario;
      platformMetrics: Parameters<typeof simulateSystemicRisk>[1];
      simulatedBy: string;
    }) => {
      const result = simulateSystemicRisk(params.scenario, params.platformMetrics);
      
      const { error } = await supabase.from('wdihp_risk_simulations').insert({
        scenario: params.scenario,
        impact_severity: result.impactSeverity,
        affected_pillars: result.affectedPillars,
        estimated_users_affected: result.estimatedUsersAffected,
        estimated_capital_at_risk: result.estimatedCapitalAtRisk,
        mitigation_steps: result.mitigationSteps,
        cascade_risk: result.cascadeRisk,
        recovery_time_days: result.recoveryTimeEstimateDays,
        simulated_by: params.simulatedBy,
        platform_metrics_snapshot: params.platformMetrics as any,
      });
      if (error) throw error;
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'risk-simulations'] });
    },
  });
}

// ============================================================
// ENTERPRISE & GOVERNMENT READINESS HOOKS
// ============================================================

export function useEnterpriseConfig(organizationId: string) {
  return useQuery({
    queryKey: ['wdihp', 'enterprise-config', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_enterprise_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useSaveEnterpriseConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: { organization_id: string } & Partial<EnterpriseOnboardingConfig>) => {
      const { error } = await supabase.from('wdihp_enterprise_configs').upsert({
        organization_id: config.organization_id,
        tier: config.complianceMode === 'government' ? 'government' : config.complianceMode === 'enhanced' ? 'enhanced' : 'standard',
        sso_enabled: config.ssoEnabled ?? false,
        sso_provider: config.ssoProvider ?? null,
        bulk_seid_verification: config.bulkSEIDVerification ?? false,
        compliance_mode: config.complianceMode ?? 'standard',
        procurement_api_enabled: config.procurementApiEnabled ?? false,
        grant_integration_enabled: config.grantIntegrationEnabled ?? false,
        audit_export_enabled: config.auditExportEnabled ?? true,
        policy_tracking_enabled: config.policyTrackingEnabled ?? false,
        data_localization: config.dataLocalization ?? null,
        custom_branding: config.customBranding ?? false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'organization_id' });
      if (error) throw error;
    },
    onSuccess: (_, config) => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'enterprise-config', config.organization_id] });
    },
  });
}

export function useGovernmentConfig(organizationId: string) {
  return useQuery({
    queryKey: ['wdihp', 'gov-config', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_government_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

// ============================================================
// COHERENCE AUDIT HOOKS
// ============================================================

export function useCoherenceAudits() {
  return useQuery({
    queryKey: ['wdihp', 'coherence-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_coherence_audits')
        .select('*')
        .order('audited_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useRunCoherenceAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      features: Array<{ name: string; context: Record<string, unknown> }>;
      auditedBy: string;
    }) => {
      const result = runCoherenceAudit(params.features);
      
      const { error } = await supabase.from('wdihp_coherence_audits').insert({
        audit_type: 'full',
        total_features: params.features.length,
        passed: result.passed,
        failed: result.failed,
        orphan_features: result.orphanFeatures,
        report: result.report as any,
        audited_by: params.auditedBy,
      });
      if (error) throw error;
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'coherence-audits'] });
    },
  });
}

// ============================================================
// EXECUTION SIGNALS HOOKS
// ============================================================

export function useExecutionSignals(limit = 20) {
  return useQuery({
    queryKey: ['wdihp', 'execution-signals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_execution_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useEmitExecutionSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      signalType: string;
      actorId: string;
      entityId?: string;
      entityType?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const weight = FEED_SIGNAL_WEIGHTS[params.signalType as keyof typeof FEED_SIGNAL_WEIGHTS] ?? 0.5;
      
      const { error } = await supabase.from('wdihp_execution_signals').insert([{
        signal_type: params.signalType,
        actor_id: params.actorId,
        entity_id: params.entityId ?? null,
        entity_type: params.entityType ?? null,
        signal_weight: weight,
        metadata: (params.metadata ?? {}) as unknown as Record<string, string>,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wdihp', 'execution-signals'] });
    },
  });
}

// ============================================================
// HARDENING STATUS HOOKS
// ============================================================

export function useHardeningStatus() {
  return useQuery({
    queryKey: ['wdihp', 'hardening-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wdihp_hardening_status')
        .select('*')
        .order('pillar', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// AGGREGATE DASHBOARD HOOK
// ============================================================

export function useWDIHPDashboard(userId: string) {
  const anomalies = useTrustAnomalies(userId);
  const concentration = useTrustConcentration(userId);
  const recovery = useTrustRecovery(userId);
  const escrowFreezes = useEscrowFreezeEvents();
  const riskSimulations = useRiskSimulations();
  const coherenceAudits = useCoherenceAudits();
  const executionSignals = useExecutionSignals();
  const hardeningStatus = useHardeningStatus();

  return {
    anomalies,
    concentration,
    recovery,
    escrowFreezes,
    riskSimulations,
    coherenceAudits,
    executionSignals,
    hardeningStatus,
    constants: {
      ARCHITECTURE_PILLARS,
      STRATEGIC_IDENTITY,
      AI_GOVERNANCE_RULES,
      REVENUE_MODEL,
      DEFAULT_ESCROW_SECURITY,
    },
    isLoading: anomalies.isLoading || concentration.isLoading || hardeningStatus.isLoading,
  };
}
