/**
 * React hooks for Execution Communication System.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createContextualThread,
  calculateCommunicationAnalytics,
  detectDisputeSignals,
  createNegotiationRecord,
  validateMessageContext,
  updateThreadPriority,
  COMMUNICATION_BADGES,
  type ContextualThreadRequest,
  type ThreadPriority,
  type NegotiationProposal,
} from "@/lib/professional/executionCommunication";
import { supabase } from "@/integrations/supabase/client";

export function useCommunicationAnalytics(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["communication-analytics", targetId],
    queryFn: () => calculateCommunicationAnalytics(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunicationBadges(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["communication-badges", targetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("communication_badges")
        .select("*")
        .eq("user_id", targetId!)
        .eq("is_active", true);
      return (data ?? []).map((b: any) => ({
        ...b,
        definition: COMMUNICATION_BADGES.find((cb) => cb.badgeType === b.badge_type),
      }));
    },
    enabled: !!targetId,
  });
}

export function useContextualThread() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ContextualThreadRequest) => {
      if (!user) throw new Error("Authentication required");
      const result = await createContextualThread(user.id, request);
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: (error: Error) => {
      toast({ title: "Cannot start conversation", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateThreadPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, priority }: { threadId: string; priority: ThreadPriority }) => {
      await updateThreadPriority(threadId, priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useDisputePreventionSignals(threadId?: string) {
  return useQuery({
    queryKey: ["dispute-signals", threadId],
    queryFn: () => detectDisputeSignals(threadId!),
    enabled: !!threadId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateNegotiation() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetUserId, proposal }: { targetUserId: string; proposal: NegotiationProposal }) => {
      if (!user) throw new Error("Authentication required");
      return createNegotiationRecord(user.id, targetUserId, proposal);
    },
    onSuccess: () => {
      toast({ title: "Negotiation record created", description: "All terms are logged for transparency." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useNegotiationRecords(threadId?: string) {
  return useQuery({
    queryKey: ["negotiation-records", threadId],
    queryFn: async () => {
      const { data } = await supabase
        .from("negotiation_records")
        .select("*")
        .eq("thread_id", threadId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!threadId,
  });
}

export { validateMessageContext, COMMUNICATION_BADGES };
