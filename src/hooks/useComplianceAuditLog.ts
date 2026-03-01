import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ComplianceLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  institution_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  previous_state_hash: string | null;
  new_state_hash: string | null;
  created_at: string;
}

export function useComplianceAuditLog(institutionId?: string, limit = 50) {
  return useQuery({
    queryKey: ["compliance-audit-log", institutionId, limit],
    queryFn: async (): Promise<ComplianceLogEntry[]> => {
      let query = supabase
        .from("compliance_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as ComplianceLogEntry[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useLogComplianceEvent() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (event: {
      action_type: string;
      entity_type: string;
      entity_id?: string;
      institution_id?: string;
      previous_state_hash?: string;
      new_state_hash?: string;
    }) => {
      await supabase.from("compliance_audit_log").insert({
        actor_id: user?.id,
        ...event,
      });
    },
  });
}
