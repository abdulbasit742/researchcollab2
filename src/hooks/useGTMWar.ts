/**
 * FGTMW React Hooks — Full Global Go-To-Market War Strategy
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  WAR_PRINCIPLES, BATTLEFIELD_SEGMENTS, BEACHHEAD_STRATEGY, DENSITY_THRESHOLDS,
  FORTRESS_COMPONENTS, CAPITAL_ANCHORS, ENTERPRISE_TROJAN_HORSES, GOV_ENTRY_STRATEGIES,
  COMPETITOR_CONTAINMENT, NETWORK_LOOPS, PARTNERSHIP_STRATEGY, BRAND_WAR,
  EXPANSION_TIMELINE, FAILURE_CONTAINMENT, WIN_CONDITIONS,
  checkDensityReady,
} from '@/lib/professional/gtmWarEngine';

// ============================================================
// FORTRESS REGIONS
// ============================================================

export function useFortressRegions(status?: string) {
  return useQuery({
    queryKey: ['fgtmw', 'fortress', status],
    queryFn: async () => {
      let query = supabase.from('fgtmw_fortress_regions').select('*').order('density_score', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useManageFortress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fortress: {
      region_name: string; country_code: string; status?: string;
    }) => {
      const { error } = await supabase.from('fgtmw_fortress_regions').insert([fortress]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fgtmw', 'fortress'] }),
  });
}

export function useUpdateFortressMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string; active_seids?: number; funded_projects?: number;
      institutional_integrations?: number; enterprise_pilots?: number;
      public_funding_integrations?: number; milestone_punctuality?: number;
      dispute_rate?: number; capital_efficiency_gain?: number;
    }) => {
      const metrics: Record<string, number> = {};
      if (params.active_seids !== undefined) metrics['Active SEIDs'] = params.active_seids;
      if (params.funded_projects !== undefined) metrics['Funded milestone projects'] = params.funded_projects;
      if (params.institutional_integrations !== undefined) metrics['Institutional integrations'] = params.institutional_integrations;
      if (params.enterprise_pilots !== undefined) metrics['Enterprise pilots'] = params.enterprise_pilots;
      if (params.public_funding_integrations !== undefined) metrics['Public funding integrations'] = params.public_funding_integrations;
      if (params.milestone_punctuality !== undefined) metrics['Milestone punctuality'] = params.milestone_punctuality;
      if (params.dispute_rate !== undefined) metrics['Dispute rate'] = params.dispute_rate;
      if (params.capital_efficiency_gain !== undefined) metrics['Capital efficiency gain'] = params.capital_efficiency_gain;

      const density = checkDensityReady(metrics);
      const { id, ...rest } = params;
      const { error } = await supabase.from('fgtmw_fortress_regions').update({
        ...rest,
        density_score: density.score,
        density_ready: density.ready,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      return density;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fgtmw', 'fortress'] }),
  });
}

// ============================================================
// CAPITAL ANCHORS
// ============================================================

export function useCapitalAnchors(regionId?: string) {
  return useQuery({
    queryKey: ['fgtmw', 'capital-anchors', regionId],
    queryFn: async () => {
      let query = supabase.from('fgtmw_capital_anchors').select('*').order('capital_routed', { ascending: false });
      if (regionId) query = query.eq('region_id', regionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// ENTERPRISE ENTRIES
// ============================================================

export function useEnterpriseEntries(regionId?: string) {
  return useQuery({
    queryKey: ['fgtmw', 'enterprise', regionId],
    queryFn: async () => {
      let query = supabase.from('fgtmw_enterprise_entries').select('*').order('created_at', { ascending: false });
      if (regionId) query = query.eq('region_id', regionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// COMPETITOR TRACKING
// ============================================================

export function useCompetitorTracking() {
  return useQuery({
    queryKey: ['fgtmw', 'competitors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fgtmw_competitor_tracking').select('*').order('last_assessed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// FAILURE EVENTS
// ============================================================

export function useFailureEvents(regionId?: string) {
  return useQuery({
    queryKey: ['fgtmw', 'failures', regionId],
    queryFn: async () => {
      let query = supabase.from('fgtmw_failure_events').select('*').order('detected_at', { ascending: false });
      if (regionId) query = query.eq('region_id', regionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// WIN CONDITIONS
// ============================================================

export function useWinConditions() {
  return useQuery({
    queryKey: ['fgtmw', 'win-conditions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fgtmw_win_condition_tracking').select('*').order('last_assessed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// AGGREGATE DASHBOARD
// ============================================================

export function useFGTMWDashboard() {
  const fortress = useFortressRegions();
  const capitalAnchors = useCapitalAnchors();
  const enterprise = useEnterpriseEntries();
  const competitors = useCompetitorTracking();
  const failures = useFailureEvents();
  const winConditions = useWinConditions();

  return {
    fortress,
    capitalAnchors,
    enterprise,
    competitors,
    failures,
    winConditions,
    constants: {
      WAR_PRINCIPLES, BATTLEFIELD_SEGMENTS, BEACHHEAD_STRATEGY, DENSITY_THRESHOLDS,
      FORTRESS_COMPONENTS, CAPITAL_ANCHORS, ENTERPRISE_TROJAN_HORSES, GOV_ENTRY_STRATEGIES,
      COMPETITOR_CONTAINMENT, NETWORK_LOOPS, PARTNERSHIP_STRATEGY, BRAND_WAR,
      EXPANSION_TIMELINE, FAILURE_CONTAINMENT, WIN_CONDITIONS,
    },
    utils: { checkDensityReady },
    isLoading: fortress.isLoading || winConditions.isLoading,
  };
}
