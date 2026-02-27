/**
 * GASIMS React Hooks — Government Adoption & Sovereign Integration Master Strategy
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  GOV_ENTRY_POINTS,
  GRANT_MANAGEMENT_CAPABILITIES,
  PROCUREMENT_CAPABILITIES,
  REGIONAL_INTELLIGENCE_METRICS,
  CORRIDOR_CAPABILITIES,
  TRANSPARENCY_DASHBOARD,
  ANTI_CORRUPTION_MEASURES,
  DATA_SOVEREIGNTY_FEATURES,
  POLITICAL_POSITIONING,
  PILOT_DEPLOYMENTS,
  GOV_RISK_FRAMEWORK,
  ECONOMIC_BENEFITS,
  EXPANSION_SEQUENCE,
  SOVEREIGN_VALUE,
  ADOPTION_OUTCOMES,
} from '@/lib/professional/governmentAdoptionEngine';

// ============================================================
// GOV PARTNERSHIPS
// ============================================================

export function useGovPartnerships(stage?: string) {
  return useQuery({
    queryKey: ['gasims', 'partnerships', stage],
    queryFn: async () => {
      let query = supabase.from('gasims_gov_partnerships').select('*').order('updated_at', { ascending: false });
      if (stage) query = query.eq('stage', stage);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useManageGovPartnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partnership: {
      entity_name: string; entity_type?: string; country_code: string;
      entry_vector: string; stage?: string; pilot_scope?: string;
      pilot_duration?: string; contact_name?: string; notes?: string;
    }) => {
      const { error } = await supabase.from('gasims_gov_partnerships').insert([partnership]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gasims', 'partnerships'] }),
  });
}

// ============================================================
// PILOT METRICS
// ============================================================

export function usePilotMetrics(partnershipId?: string) {
  return useQuery({
    queryKey: ['gasims', 'pilot-metrics', partnershipId],
    queryFn: async () => {
      let query = supabase.from('gasims_pilot_metrics').select('*').order('measured_at', { ascending: false });
      if (partnershipId) query = query.eq('partnership_id', partnershipId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordPilotMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: {
      partnership_id?: string; metric_key: string; metric_label: string;
      baseline_value?: number; current_value: number; target_value: number; unit: string;
    }) => {
      const { error } = await supabase.from('gasims_pilot_metrics').insert([metric]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gasims', 'pilot-metrics'] }),
  });
}

// ============================================================
// TRANSPARENCY REPORTS
// ============================================================

export function useTransparencyReports(isPublic?: boolean) {
  return useQuery({
    queryKey: ['gasims', 'transparency-reports', isPublic],
    queryFn: async () => {
      let query = supabase.from('gasims_transparency_reports').select('*').order('report_period_end', { ascending: false });
      if (isPublic !== undefined) query = query.eq('is_public', isPublic);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// CORRIDOR TRACKING
// ============================================================

export function useCorridorTracking(status?: string) {
  return useQuery({
    queryKey: ['gasims', 'corridors', status],
    queryFn: async () => {
      let query = supabase.from('gasims_corridor_tracking').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useManageCorridor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (corridor: {
      corridor_name: string; country_a: string; country_b: string;
      status?: string; regulatory_compatibility_score?: number; compliance_status?: string;
    }) => {
      const { error } = await supabase.from('gasims_corridor_tracking').insert([corridor]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gasims', 'corridors'] }),
  });
}

// ============================================================
// ANTI-CORRUPTION EVENTS
// ============================================================

export function useAntiCorruptionEvents(resolved?: boolean) {
  return useQuery({
    queryKey: ['gasims', 'anticorruption', resolved],
    queryFn: async () => {
      let query = supabase.from('gasims_anticorruption_events').select('*').order('detected_at', { ascending: false });
      if (resolved !== undefined) query = query.eq('resolved', resolved);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// AGGREGATE DASHBOARD
// ============================================================

export function useGASIMSDashboard() {
  const partnerships = useGovPartnerships();
  const pilotMetrics = usePilotMetrics();
  const transparencyReports = useTransparencyReports();
  const corridors = useCorridorTracking();
  const anticorruption = useAntiCorruptionEvents();

  return {
    partnerships,
    pilotMetrics,
    transparencyReports,
    corridors,
    anticorruption,
    constants: {
      GOV_ENTRY_POINTS,
      GRANT_MANAGEMENT_CAPABILITIES,
      PROCUREMENT_CAPABILITIES,
      REGIONAL_INTELLIGENCE_METRICS,
      CORRIDOR_CAPABILITIES,
      TRANSPARENCY_DASHBOARD,
      ANTI_CORRUPTION_MEASURES,
      DATA_SOVEREIGNTY_FEATURES,
      POLITICAL_POSITIONING,
      PILOT_DEPLOYMENTS,
      GOV_RISK_FRAMEWORK,
      ECONOMIC_BENEFITS,
      EXPANSION_SEQUENCE,
      SOVEREIGN_VALUE,
      ADOPTION_OUTCOMES,
    },
    isLoading: partnerships.isLoading || corridors.isLoading,
  };
}
