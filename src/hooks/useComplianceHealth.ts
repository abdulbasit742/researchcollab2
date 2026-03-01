import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceHealth {
  id: string;
  institution_id: string;
  audit_completeness_score: number;
  dispute_transparency_score: number;
  review_accountability_score: number;
  role_integrity_score: number;
  data_access_traceability_score: number;
  overall_compliance_score: number;
  generated_at: string;
}

export function useComplianceHealth(institutionId?: string) {
  return useQuery({
    queryKey: ["compliance-health", institutionId],
    queryFn: async (): Promise<ComplianceHealth | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("compliance_health_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as ComplianceHealth | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}
