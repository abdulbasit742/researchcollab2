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
      return data || [];
    },
  });

  const addParticipant = useMutation({
    mutationFn: async (params: { user_id: string; participant_role: string; institution_id?: string }) => {
      const { data, error } = await supabase
        .from("pilot_participants")
        .insert(params)
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
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  return {
    participants: participantsQuery.data || [],
    isLoading: participantsQuery.isLoading,
    addParticipant: addParticipant.mutate,
  };
}
