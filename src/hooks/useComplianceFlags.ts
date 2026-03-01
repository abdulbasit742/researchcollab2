import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceFlag {
  id: string;
  entity_type: string;
  entity_id: string;
  flag_type: string;
  severity: string;
  description: string | null;
  institution_id: string | null;
  created_at: string;
}

export function useComplianceFlags(institutionId?: string) {
  return useQuery({
    queryKey: ["compliance-flags", institutionId],
    queryFn: async (): Promise<ComplianceFlag[]> => {
      let query = supabase
        .from("compliance_flags")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as ComplianceFlag[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
