/**
 * IGITA React Hooks — Investor-Grade Infrastructure Thesis Architecture
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MACRO_PROBLEMS,
  INFRASTRUCTURE_COMPONENTS,
  TIMING_FACTORS,
  ECONOMIC_IMPACT_MODEL,
  REVENUE_STREAMS,
  DEFENSIBILITY_LAYERS,
  RISK_MITIGATIONS,
  VALUATION_METRICS,
  SCALE_PATH,
  INEVITABILITY_FACTORS,
  EXIT_SCENARIOS,
  PITCH_NARRATIVE,
  INVESTOR_DECK,
} from '@/lib/professional/investorThesisEngine';

// ============================================================
// INVESTOR PIPELINE
// ============================================================

export function useInvestorPipeline(stage?: string) {
  return useQuery({
    queryKey: ['igita', 'investor-pipeline', stage],
    queryFn: async () => {
      let query = supabase.from('igita_investor_pipeline').select('*').order('updated_at', { ascending: false });
      if (stage) query = query.eq('stage', stage);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useManageInvestor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (investor: {
      investor_name: string; investor_type?: string; stage?: string;
      thesis_alignment_score?: number; interest_areas?: string[];
      estimated_ticket_size?: number; contact_name?: string; notes?: string;
    }) => {
      const { error } = await supabase.from('igita_investor_pipeline').insert([{
        ...investor,
        investor_type: investor.investor_type ?? 'institutional',
        stage: investor.stage ?? 'prospect',
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['igita', 'investor-pipeline'] }),
  });
}

// ============================================================
// THESIS METRICS
// ============================================================

export function useThesisMetrics(category?: string) {
  return useQuery({
    queryKey: ['igita', 'thesis-metrics', category],
    queryFn: async () => {
      let query = supabase.from('igita_thesis_metrics').select('*').order('measured_at', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordThesisMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: {
      metric_id: string; metric_name: string; category: string;
      current_value: number; target_value?: number; unit: string; period: string;
    }) => {
      const { error } = await supabase.from('igita_thesis_metrics').insert([metric]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['igita', 'thesis-metrics'] }),
  });
}

// ============================================================
// ECONOMIC IMPACT TRACKING
// ============================================================

export function useEconomicImpactTracking(metricId?: string) {
  return useQuery({
    queryKey: ['igita', 'economic-impact', metricId],
    queryFn: async () => {
      let query = supabase.from('igita_economic_impact_tracking').select('*').order('measured_at', { ascending: false });
      if (metricId) query = query.eq('impact_metric_id', metricId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================
// PITCH EVENTS
// ============================================================

export function usePitchEvents() {
  return useQuery({
    queryKey: ['igita', 'pitch-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('igita_pitch_events').select('*').order('occurred_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecordPitchEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: {
      event_type: string; investor_id?: string; slide_focus?: string;
      outcome?: string; feedback?: string; follow_up_required?: boolean;
    }) => {
      const { error } = await supabase.from('igita_pitch_events').insert([event]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['igita', 'pitch-events'] }),
  });
}

// ============================================================
// AGGREGATE DASHBOARD
// ============================================================

export function useIGITADashboard() {
  const investorPipeline = useInvestorPipeline();
  const thesisMetrics = useThesisMetrics();
  const economicImpact = useEconomicImpactTracking();
  const pitchEvents = usePitchEvents();

  return {
    investorPipeline,
    thesisMetrics,
    economicImpact,
    pitchEvents,
    constants: {
      MACRO_PROBLEMS,
      INFRASTRUCTURE_COMPONENTS,
      TIMING_FACTORS,
      ECONOMIC_IMPACT_MODEL,
      REVENUE_STREAMS,
      DEFENSIBILITY_LAYERS,
      RISK_MITIGATIONS,
      VALUATION_METRICS,
      SCALE_PATH,
      INEVITABILITY_FACTORS,
      EXIT_SCENARIOS,
      PITCH_NARRATIVE,
      INVESTOR_DECK,
    },
    isLoading: investorPipeline.isLoading || thesisMetrics.isLoading,
  };
}
