import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PassportData {
  id: string;
  user_id: string;
  passport_version: number;
  trust_score_snapshot: number;
  visibility_score_snapshot: number;
  capability_summary: any;
  outcome_summary: any;
  deal_summary: any;
  institutional_affiliations: any[];
  signed_hash: string;
  issued_at: string;
  expires_at: string;
}

export function useReputationPassport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const latest = useQuery({
    queryKey: ["passport-latest", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("reputation_passports")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as PassportData | null;
    },
    enabled: !!user?.id,
  });

  const history = useQuery({
    queryKey: ["passport-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("reputation_passports")
        .select("id, passport_version, trust_score_snapshot, visibility_score_snapshot, signed_hash, issued_at, expires_at")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as PassportData[];
    },
    enabled: !!user?.id,
  });

  const generate = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("generate-reputation-passport", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passport-latest", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["passport-history", user?.id] });
      toast.success("Reputation Passport generated successfully");
    },
    onError: () => toast.error("Failed to generate passport"),
  });

  const verify = useMutation({
    mutationFn: async ({ passport_id, signed_hash }: { passport_id: string; signed_hash: string }) => {
      const { data, error } = await supabase.functions.invoke("verify-reputation-passport", {
        body: { passport_id, signed_hash },
      });
      if (error) throw error;
      return data;
    },
  });

  const logExport = useMutation({
    mutationFn: async ({ passport_id, export_type }: { passport_id: string; export_type: string }) => {
      const { error } = await supabase.from("passport_exports").insert({
        passport_id,
        export_type,
      });
      if (error) throw error;
    },
  });

  return {
    latest: latest.data,
    latestLoading: latest.isLoading,
    history: history.data ?? [],
    historyLoading: history.isLoading,
    generate: generate.mutateAsync,
    generating: generate.isPending,
    verify: verify.mutateAsync,
    verifying: verify.isPending,
    logExport: logExport.mutateAsync,
  };
}
