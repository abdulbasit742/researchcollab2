/**
 * GADEB React Hooks — Global Adoption & Dominance Execution Blueprint
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  computeAdoptionReadiness,
  computeSwitchingCostIndex,
  computeNetworkEffectStrength,
  getCapitalIncentiveTier,
  DOMINATION_PHASES,
  NETWORK_EFFECT_LOOPS,
  LOCK_IN_MECHANISMS,
  COMPETITOR_DEFENSE,
  CAPITAL_INCENTIVE_TIERS,
  ENTERPRISE_SALES_PROPOSITIONS,
  GOVERNMENT_PITCH,
  THREE_YEAR_ROADMAP,
  BRAND_FRAMEWORK,
  type AdoptionPhase,
} from '@/lib/professional/globalAdoptionEngine';

// ============================================================
// CLUSTER HEALTH
// ============================================================

export function useClusterHealth(clusterId?: string) {
  return useQuery({
    queryKey: ['gadeb', 'cluster-health', clusterId],
    queryFn: async () => {
      let query = supabase.from('gadeb_cluster_health').select('*').order('snapshot_at', { ascending: false });
      if (clusterId) query = query.eq('cluster_id', clusterId);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordClusterHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (snapshot: {
      cluster_id: string; region: string; phase: string;
      institutions_active: number; users_active: number; capital_routed: number;
      milestone_completion_rate: number; trust_density: number;
      network_effect_strength: number; switching_cost_index: number;
    }) => {
      const { error } = await supabase.from('gadeb_cluster_health').insert([snapshot]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gadeb', 'cluster-health'] }),
  });
}

// ============================================================
// PHASE PROGRESS
// ============================================================

export function usePhaseProgress(phase?: AdoptionPhase) {
  return useQuery({
    queryKey: ['gadeb', 'phase-progress', phase],
    queryFn: async () => {
      let query = supabase.from('gadeb_phase_progress').select('*');
      if (phase) query = query.eq('phase', phase);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePhaseMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { phase: string; metric_key: string; current_value: number; target_value: number; unit: string; updated_by?: string }) => {
      const { error } = await supabase.from('gadeb_phase_progress').upsert([{
        phase: params.phase,
        metric_key: params.metric_key,
        current_value: params.current_value,
        target_value: params.target_value,
        unit: params.unit,
        last_updated_at: new Date().toISOString(),
        updated_by: params.updated_by ?? null,
      }], { onConflict: 'phase,metric_key' as any });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gadeb', 'phase-progress'] }),
  });
}

export function useAdoptionReadiness(phase: AdoptionPhase, metrics: Record<string, number>) {
  return computeAdoptionReadiness(phase, metrics);
}

// ============================================================
// NETWORK EFFECTS
// ============================================================

export function useNetworkEffects() {
  return useQuery({
    queryKey: ['gadeb', 'network-effects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_network_effect_tracking').select('*').order('measured_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// LOCK-IN METRICS
// ============================================================

export function useLockInMetrics(userId: string) {
  return useQuery({
    queryKey: ['gadeb', 'lock-in', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_lock_in_metrics').select('*').eq('user_id', userId).order('computed_at', { ascending: false }).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!userId,
  });
}

export function useComputeLockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      trustLedgerEntries: number; activeEscrowContracts: number;
      institutionalVerifications: number; yearsOnPlatform: number;
      crossBorderCompliance: number; knowledgePublications: number;
    }) => {
      const result = computeSwitchingCostIndex(params);
      await supabase.from('gadeb_lock_in_metrics').insert([{
        user_id: params.userId,
        trust_ledger_entries: params.trustLedgerEntries,
        active_escrow_contracts: params.activeEscrowContracts,
        institutional_verifications: params.institutionalVerifications,
        years_on_platform: params.yearsOnPlatform,
        cross_border_compliance: params.crossBorderCompliance,
        knowledge_publications: params.knowledgePublications,
        switching_cost_index: result.index,
        switching_cost_level: result.level,
      }]);
      return result;
    },
    onSuccess: (_, p) => qc.invalidateQueries({ queryKey: ['gadeb', 'lock-in', p.userId] }),
  });
}

// ============================================================
// CAPITAL MAGNET
// ============================================================

export function useCapitalMagnet(userId: string) {
  return useQuery({
    queryKey: ['gadeb', 'capital-magnet', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_capital_magnet').select('*').eq('user_id', userId).order('computed_at', { ascending: false }).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!userId,
  });
}

export function useComputeCapitalIncentive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; ecsScore: number }) => {
      const tier = getCapitalIncentiveTier(params.ecsScore);
      await supabase.from('gadeb_capital_magnet').insert([{
        user_id: params.userId,
        ecs_score: params.ecsScore,
        tier_name: tier.tierName,
        escrow_fee_discount: tier.escrowFeeDiscount,
        release_speed_multiplier: tier.releaseSpeedMultiplier,
        capital_matching_priority: tier.capitalMatchingPriority,
        institutional_bonus_rate: tier.institutionalBonusRate,
      }]);
      return tier;
    },
    onSuccess: (_, p) => qc.invalidateQueries({ queryKey: ['gadeb', 'capital-magnet', p.userId] }),
  });
}

// ============================================================
// PIPELINES
// ============================================================

export function useEnterprisePipeline() {
  return useQuery({
    queryKey: ['gadeb', 'enterprise-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_enterprise_pipeline').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useGovernmentPipeline() {
  return useQuery({
    queryKey: ['gadeb', 'gov-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_government_pipeline').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// ROADMAP
// ============================================================

export function useRoadmapMilestones(year?: number) {
  return useQuery({
    queryKey: ['gadeb', 'roadmap', year],
    queryFn: async () => {
      let query = supabase.from('gadeb_roadmap_milestones').select('*').order('target_date', { ascending: true });
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// ADOPTION EVENTS
// ============================================================

export function useAdoptionEvents(limit = 20) {
  return useQuery({
    queryKey: ['gadeb', 'adoption-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase.from('gadeb_adoption_events').select('*').order('occurred_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordAdoptionEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: {
      event_type: string; entity_type: string; entity_name?: string;
      phase: string; region?: string; impact_description?: string; metadata?: Record<string, unknown>;
    }) => {
      const { error } = await supabase.from('gadeb_adoption_events').insert([{
        ...event,
        metadata: (event.metadata ?? {}) as any,
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gadeb', 'adoption-events'] }),
  });
}

// ============================================================
// AGGREGATE DASHBOARD
// ============================================================

export function useGADEBDashboard(userId?: string) {
  const clusterHealth = useClusterHealth();
  const networkEffects = useNetworkEffects();
  const lockIn = useLockInMetrics(userId ?? '');
  const capitalMagnet = useCapitalMagnet(userId ?? '');
  const enterprisePipeline = useEnterprisePipeline();
  const govPipeline = useGovernmentPipeline();
  const roadmap = useRoadmapMilestones();
  const adoptionEvents = useAdoptionEvents();

  return {
    clusterHealth,
    networkEffects,
    lockIn,
    capitalMagnet,
    enterprisePipeline,
    govPipeline,
    roadmap,
    adoptionEvents,
    constants: {
      DOMINATION_PHASES,
      NETWORK_EFFECT_LOOPS,
      LOCK_IN_MECHANISMS,
      COMPETITOR_DEFENSE,
      CAPITAL_INCENTIVE_TIERS,
      ENTERPRISE_SALES_PROPOSITIONS,
      GOVERNMENT_PITCH,
      THREE_YEAR_ROADMAP,
      BRAND_FRAMEWORK,
    },
    isLoading: clusterHealth.isLoading || roadmap.isLoading,
  };
}
