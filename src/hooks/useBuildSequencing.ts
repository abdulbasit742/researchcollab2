/**
 * MPBSB React Hooks — Master Product Build Sequencing Blueprint
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BUILD_PHASES, CORE_PILLARS, SEQUENCING_RULES, PRODUCT_OBJECTIVE,
  canAdvancePhase,
  type PhaseProgress,
} from '@/lib/professional/buildSequencingEngine';

export function usePhaseStatus() {
  return useQuery({
    queryKey: ['mpbsb', 'phases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mpbsb_phase_status')
        .select('*')
        .order('phase_id', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeliverables(phaseId?: number) {
  return useQuery({
    queryKey: ['mpbsb', 'deliverables', phaseId],
    queryFn: async () => {
      let query = supabase.from('mpbsb_deliverables').select('*').order('created_at', { ascending: true });
      if (phaseId !== undefined) query = query.eq('phase_id', phaseId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateDeliverable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: string; evidence?: string }) => {
      const updates: Record<string, unknown> = { status: params.status };
      if (params.status === 'complete') updates.completed_at = new Date().toISOString();
      if (params.evidence) updates.evidence = params.evidence;
      const { error } = await supabase.from('mpbsb_deliverables').update(updates).eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpbsb'] }),
  });
}

export function useRouteMapping() {
  return useQuery({
    queryKey: ['mpbsb', 'routes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mpbsb_route_mapping').select('*').order('route_path');
      if (error) throw error;
      return data;
    },
  });
}

export function usePhaseTransitions() {
  return useQuery({
    queryKey: ['mpbsb', 'transitions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mpbsb_phase_transitions').select('*').order('transitioned_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdvancePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { fromPhase: number; toPhase: number; notes?: string }) => {
      const { error } = await supabase.from('mpbsb_phase_transitions').insert([{
        from_phase: params.fromPhase,
        to_phase: params.toPhase,
        transition_type: 'advance',
        notes: params.notes,
      }]);
      if (error) throw error;

      await supabase.from('mpbsb_phase_status')
        .update({ status: 'complete', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('phase_id', params.fromPhase);

      await supabase.from('mpbsb_phase_status')
        .update({ status: 'active', activated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('phase_id', params.toPhase);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpbsb'] }),
  });
}

export function useMPBSBDashboard() {
  const phases = usePhaseStatus();
  const deliverables = useDeliverables();
  const routes = useRouteMapping();
  const transitions = usePhaseTransitions();

  const activePhase = phases.data?.find(p => p.status === 'active');
  const completedPhases = phases.data?.filter(p => p.status === 'complete').length ?? 0;
  const totalProgress = phases.data
    ? (phases.data.reduce((sum, p) => sum + (p.completed_deliverables ?? 0), 0) /
       Math.max(phases.data.reduce((sum, p) => sum + p.total_deliverables, 0), 1)) * 100
    : 0;

  return {
    phases,
    deliverables,
    routes,
    transitions,
    activePhase,
    completedPhases,
    totalProgress,
    constants: { BUILD_PHASES, CORE_PILLARS, SEQUENCING_RULES, PRODUCT_OBJECTIVE },
    utils: { canAdvancePhase },
    isLoading: phases.isLoading,
  };
}
