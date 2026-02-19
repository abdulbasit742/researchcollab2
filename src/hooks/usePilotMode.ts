import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function usePilotStatus() {
  return useQuery({
    queryKey: ["pilot-status"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("pilot-circuit-breaker", {
        body: { action: "status" },
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
}

export function usePilotActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const runIntegrity = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("pilot-circuit-breaker", {
        body: { action: "check_integrity" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-status"] });
      queryClient.invalidateQueries({ queryKey: ["pilot-incidents"] });
      if (data?.checks?.hasCriticalIssue) {
        toast({ title: "⚠️ Critical Issue Detected", description: data.checks.reason, variant: "destructive" });
      } else {
        toast({ title: "✅ Integrity Check Passed", description: "All reconciliation checks passed." });
      }
    },
  });

  const freezePilot = useMutation({
    mutationFn: async (reason?: string) => {
      const { data, error } = await supabase.functions.invoke("pilot-circuit-breaker", {
        body: { action: "freeze", reason },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-status"] });
      toast({ title: "🔒 Pilot Frozen", description: "All transactions blocked." });
    },
  });

  const unfreezePilot = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("pilot-circuit-breaker", {
        body: { action: "unfreeze" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-status"] });
      toast({ title: "🔓 Pilot Unfrozen", description: "Transactions re-enabled." });
    },
  });

  return { runIntegrity, freezePilot, unfreezePilot };
}

export function usePilotTransactionLog() {
  return useQuery({
    queryKey: ["pilot-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_transaction_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePilotPendingReviews() {
  return useQuery({
    queryKey: ["pilot-pending-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_transaction_log")
        .select("*")
        .eq("requires_manual_review", true)
        .eq("review_status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useReviewTransaction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: "approved" | "rejected"; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("pilot_transaction_log")
        .update({
          review_status: params.status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: params.notes || null,
        })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-pending-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pilot-transactions"] });
      toast({ title: `Transaction ${vars.status}` });
    },
  });
}

export function usePilotIncidents() {
  return useQuery({
    queryKey: ["pilot-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useResolveIncident() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("pilot_incidents")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: params.notes,
        })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["pilot-status"] });
      toast({ title: "Incident Resolved" });
    },
  });
}

export function usePilotParticipants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const participantsQuery = useQuery({
    queryKey: ["pilot-participants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_participants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Enrich with profile names
      const userIds = data?.map(p => p.user_id) || [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        return (data || []).map(p => ({
          ...p,
          full_name: profileMap.get(p.user_id) || "Unknown",
        }));
      }
      return data || [];
    },
  });

  const addParticipant = useMutation({
    mutationFn: async (params: { user_id: string; participant_role: string; institution_id?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("pilot_participants")
        .insert({ ...params, added_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-participants"] });
      toast({ title: "Participant Added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const updateParticipantStatus = useMutation({
    mutationFn: async (params: { id: string; status: "active" | "suspended" | "removed" }) => {
      const { error } = await supabase
        .from("pilot_participants")
        .update({ status: params.status, updated_at: new Date().toISOString() })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-participants"] });
      toast({ title: `Participant ${vars.status}` });
    },
  });

  return {
    participants: participantsQuery.data || [],
    isLoading: participantsQuery.isLoading,
    addParticipant: addParticipant.mutate,
    isAdding: addParticipant.isPending,
    updateParticipantStatus: updateParticipantStatus.mutate,
  };
}

export function usePilotUxFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const feedbackQuery = useQuery({
    queryKey: ["pilot-ux-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pilot_ux_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async (params: {
      feedback_type: string;
      description: string;
      page_context?: string;
      severity?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("pilot_ux_feedback")
        .insert({ ...params, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-ux-feedback"] });
      toast({ title: "Feedback Submitted", description: "Thank you for helping improve the pilot." });
    },
  });

  const resolveFeedback = useMutation({
    mutationFn: async (params: { id: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from("pilot_ux_feedback")
        .update({ resolved: true, admin_notes: params.admin_notes })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-ux-feedback"] });
      toast({ title: "Feedback Resolved" });
    },
  });

  return {
    feedback: feedbackQuery.data || [],
    isLoading: feedbackQuery.isLoading,
    submitFeedback: submitFeedback.mutate,
    resolveFeedback: resolveFeedback.mutate,
  };
}
