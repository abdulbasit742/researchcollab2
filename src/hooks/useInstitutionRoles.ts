import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InstitutionRole {
  id: string;
  institution_id: string;
  role_name: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export function useInstitutionRoles(institutionId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["institution-roles", institutionId],
    queryFn: async (): Promise<InstitutionRole[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_roles")
        .select("*")
        .eq("institution_id", institutionId)
        .order("role_name");
      return (data ?? []) as InstitutionRole[];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });

  const assignRole = useMutation({
    mutationFn: async ({ targetUserId, roleName }: { targetUserId: string; roleName: string }) => {
      if (!user?.id || !institutionId) throw new Error("Missing context");
      // Log assignment audit
      await supabase.from("role_assignment_audit").insert({
        actor_id: user.id,
        target_user_id: targetUserId,
        role_assigned: roleName,
        institution_id: institutionId,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institution-roles", institutionId] }),
  });

  return { roles, isLoading, assignRole: assignRole.mutate };
}
