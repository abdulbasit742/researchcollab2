/**
 * useEscrowActions — Real server-side escrow operations via atomic DB functions.
 * No client-side balance mutation. All money movement is server-validated.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// FUND ESCROW
// ============================================================
export function useFundEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      escrow_id: string;
      sponsor_id: string;
      idempotency_key?: string;
    }) => {
      const { data, error } = await supabase.rpc('fund_escrow_atomic' as any, {
        p_escrow_id: params.escrow_id,
        p_sponsor_id: params.sponsor_id,
        p_idempotency_key: params.idempotency_key ?? null,
      });
      if (error) throw new Error(error.message);
      return data as {
        status: string;
        escrow_id: string;
        amount: number;
        new_available_balance: number;
      };
    },
    onSuccess: (data) => {
      toast({ title: 'Escrow Funded', description: `PKR ${data.amount?.toLocaleString()} locked in escrow` });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['escrow'] });
      qc.invalidateQueries({ queryKey: ['seid'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Fund Failed', description: err.message, variant: 'destructive' });
    },
  });
}

// ============================================================
// SUBMIT MILESTONE
// ============================================================
export function useSubmitMilestone() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      milestone_id: string;
      executor_id: string;
      submission_notes?: string;
      deliverable_url?: string;
    }) => {
      const { data, error } = await supabase.rpc('submit_milestone_atomic' as any, {
        p_milestone_id: params.milestone_id,
        p_executor_id: params.executor_id,
        p_submission_notes: params.submission_notes ?? null,
        p_deliverable_url: params.deliverable_url ?? null,
      });
      if (error) throw new Error(error.message);
      return data as { status: string; milestone_id: string; submitted_at: string };
    },
    onSuccess: () => {
      toast({ title: 'Milestone Submitted', description: 'Awaiting sponsor approval' });
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Submission Failed', description: err.message, variant: 'destructive' });
    },
  });
}

// ============================================================
// APPROVE MILESTONE (+ release funds)
// ============================================================
export function useApproveMilestone() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      milestone_id: string;
      sponsor_id: string;
      idempotency_key?: string;
    }) => {
      const { data, error } = await supabase.rpc('approve_milestone_atomic' as any, {
        p_milestone_id: params.milestone_id,
        p_sponsor_id: params.sponsor_id,
        p_idempotency_key: params.idempotency_key ?? null,
      });
      if (error) throw new Error(error.message);
      return data as {
        status: string;
        milestone_id: string;
        gross_amount: number;
        platform_fee: number;
        net_amount: number;
        executor_id: string;
        all_milestones_complete: boolean;
      };
    },
    onSuccess: (data) => {
      toast({
        title: 'Milestone Approved',
        description: `PKR ${data.net_amount?.toLocaleString()} released to executor`,
      });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
      qc.invalidateQueries({ queryKey: ['escrow'] });
      qc.invalidateQueries({ queryKey: ['seid'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Approval Failed', description: err.message, variant: 'destructive' });
    },
  });
}

// ============================================================
// OPEN DISPUTE
// ============================================================
export function useOpenDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      milestone_id: string;
      user_id: string;
      reason: string;
      evidence_files?: unknown[];
    }) => {
      const { data, error } = await supabase.rpc('open_dispute_atomic' as any, {
        p_milestone_id: params.milestone_id,
        p_user_id: params.user_id,
        p_reason: params.reason,
        p_evidence_files: params.evidence_files ?? [],
      });
      if (error) throw new Error(error.message);
      return data as {
        status: string;
        dispute_id: string;
        milestone_id: string;
        arbitration_deadline: string;
      };
    },
    onSuccess: () => {
      toast({ title: 'Dispute Opened', description: 'Escrow funds are now frozen pending resolution' });
      qc.invalidateQueries({ queryKey: ['disputes'] });
      qc.invalidateQueries({ queryKey: ['escrow'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
      qc.invalidateQueries({ queryKey: ['seid'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Dispute Failed', description: err.message, variant: 'destructive' });
    },
  });
}

// ============================================================
// RESOLVE DISPUTE
// ============================================================
export function useResolveDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      dispute_id: string;
      resolver_id: string;
      resolution_type: 'refund' | 'release';
      resolution_notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('resolve_dispute_atomic' as any, {
        p_dispute_id: params.dispute_id,
        p_resolver_id: params.resolver_id,
        p_resolution_type: params.resolution_type,
        p_resolution_notes: params.resolution_notes ?? null,
      });
      if (error) throw new Error(error.message);
      return data as { status: string; dispute_id: string; resolution: string; amount: number };
    },
    onSuccess: (data) => {
      toast({
        title: 'Dispute Resolved',
        description: `Resolution: ${data.resolution} — PKR ${data.amount?.toLocaleString()}`,
      });
      qc.invalidateQueries({ queryKey: ['disputes'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['escrow'] });
      qc.invalidateQueries({ queryKey: ['milestones'] });
      qc.invalidateQueries({ queryKey: ['seid'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Resolution Failed', description: err.message, variant: 'destructive' });
    },
  });
}
