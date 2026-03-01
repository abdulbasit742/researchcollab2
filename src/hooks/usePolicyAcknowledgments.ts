import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePolicyAcknowledgments() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: acknowledgments = [], isLoading } = useQuery({
    queryKey: ["policy-acknowledgments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("policy_acknowledgments")
        .select("*")
        .eq("user_id", user.id)
        .order("acknowledged_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const acknowledge = useMutation({
    mutationFn: async ({ policyVersion, institutionId }: { policyVersion: string; institutionId?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      await supabase.from("policy_acknowledgments").upsert(
        { user_id: user.id, policy_version: policyVersion, institution_id: institutionId },
        { onConflict: "user_id,policy_version" }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-acknowledgments"] }),
  });

  const hasAcknowledged = (version: string) =>
    acknowledgments.some((a: any) => a.policy_version === version);

  return { acknowledgments, isLoading, acknowledge: acknowledge.mutate, hasAcknowledged };
}
